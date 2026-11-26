import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import type { CustomerProfile, Order } from "@/lib/types";

export function normalizeEmail(email?: string | null): string {
  return (email ?? "").trim().toLowerCase();
}

/**
 * Normalizes Israeli and international phone numbers to a canonical digit form
 * (e.g. "050-123-4567", "0501234567", "+972 50 123 4567" -> "+972501234567").
 */
export function normalizePhone(phone?: string | null): string {
  const raw = (phone ?? "").trim();
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("972") && digits.length >= 11) {
    return `+${digits}`;
  }
  if (digits.startsWith("0") && digits.length >= 9 && digits.length <= 10) {
    return `+972${digits.slice(1)}`;
  }
  if (raw.startsWith("+")) {
    return `+${digits}`;
  }
  return digits;
}

function dedupe(values: (string | undefined | null)[]): string[] {
  return Array.from(new Set(values.map((v) => (v ?? "").trim()).filter(Boolean)));
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

/**
 * Finds or creates a unified CustomerProfile in Firestore, automatically
 * merging any profiles that share the same Firebase UID, normalized email,
 * or normalized phone number so switching login methods always reaches the
 * same customer identity and complete order history.
 */
export async function upsertAndMergeCustomerIdentity(input: {
  uid?: string | null;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  shippingAddress?: string | null;
}): Promise<CustomerProfile | null> {
  const uid = (input.uid ?? "").trim();
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);

  if (!uid && !email && !phone) return null;

  const col = adminDb.collection("customers");
  const queries: Promise<FirebaseFirestore.QuerySnapshot>[] = [];

  if (uid) queries.push(col.where("uids", "array-contains", uid).get());
  if (email) queries.push(col.where("emails", "array-contains", email).get());
  if (phone) queries.push(col.where("phones", "array-contains", phone).get());

  const snaps = await Promise.all(queries);
  const matched = new Map<string, CustomerProfile>();
  for (const snap of snaps) {
    for (const doc of snap.docs) {
      if (!matched.has(doc.id)) {
        matched.set(doc.id, { id: doc.id, ...(doc.data() as Omit<CustomerProfile, "id">) });
      }
    }
  }

  const now = new Date().toISOString();
  const profiles = Array.from(matched.values()).sort((a, b) =>
    (a.createdAt ?? "") < (b.createdAt ?? "") ? -1 : 1,
  );

  if (profiles.length === 0) {
    const newProfile: Omit<CustomerProfile, "id"> = {
      uids: dedupe([uid]),
      emails: dedupe([email]),
      phones: dedupe([phone]),
      ...(input.name?.trim() ? { name: input.name.trim() } : {}),
      ...(input.shippingAddress?.trim()
        ? { defaultShippingAddress: input.shippingAddress.trim() }
        : {}),
      createdAt: now,
      updatedAt: now,
    };
    const ref = await col.add(newProfile);
    return { id: ref.id, ...newProfile };
  }

  const primary = profiles[0]!;
  const mergedUids = dedupe([...profiles.flatMap((p) => p.uids ?? []), uid]);
  const mergedEmails = dedupe([...profiles.flatMap((p) => p.emails ?? []), email]);
  const mergedPhones = dedupe([...profiles.flatMap((p) => p.phones ?? []), phone]);
  const mergedName =
    input.name?.trim() || profiles.find((p) => p.name)?.name || undefined;
  const mergedAddress =
    input.shippingAddress?.trim() ||
    profiles.find((p) => p.defaultShippingAddress)?.defaultShippingAddress ||
    undefined;

  const updatedData: Omit<CustomerProfile, "id"> = {
    uids: mergedUids,
    emails: mergedEmails,
    phones: mergedPhones,
    ...(mergedName ? { name: mergedName } : {}),
    ...(mergedAddress ? { defaultShippingAddress: mergedAddress } : {}),
    createdAt: primary.createdAt ?? now,
    updatedAt: now,
  };

  await col.doc(primary.id).set(updatedData, { merge: true });

  // Merge duplicate profiles into primary and reassign any orders referencing them
  if (profiles.length > 1) {
    const duplicates = profiles.slice(1);
    for (const dup of duplicates) {
      const dupOrders = await adminDb
        .collection("orders")
        .where("customerId", "==", dup.id)
        .get();
      await Promise.all(
        dupOrders.docs.map((d) => d.ref.update({ customerId: primary.id })),
      );
      await col.doc(dup.id).delete();
    }
  }

  return { id: primary.id, ...updatedData };
}

/**
 * Retrieves ALL orders belonging to a unified CustomerProfile across all of
 * its linked UIDs, emails, and phone numbers (including guest orders placed
 * before the customer ever created an account). Uses single-field queries so
 * no composite Firestore index is required.
 */
export async function getOrdersForCustomerProfile(
  profile: CustomerProfile,
): Promise<Order[]> {
  const ordersCol = adminDb.collection("orders");
  const queries: Promise<FirebaseFirestore.QuerySnapshot>[] = [
    ordersCol.where("customerId", "==", profile.id).get(),
  ];

  for (const batch of chunk(profile.uids, 10)) {
    queries.push(ordersCol.where("userId", "in", batch).get());
  }
  for (const batch of chunk(profile.emails, 10)) {
    queries.push(ordersCol.where("customerEmailNormalized", "in", batch).get());
    // Legacy orders written before customerEmailNormalized was stored
    queries.push(ordersCol.where("customerEmail", "in", batch).get());
  }
  for (const batch of chunk(profile.phones, 10)) {
    queries.push(ordersCol.where("customerPhoneNormalized", "in", batch).get());
  }

  const snaps = await Promise.all(queries);
  const byId = new Map<string, Order>();
  const needsBackfill: FirebaseFirestore.DocumentReference[] = [];

  for (const snap of snaps) {
    for (const doc of snap.docs) {
      if (!byId.has(doc.id)) {
        const order = { id: doc.id, ...(doc.data() as Omit<Order, "id">) };
        byId.set(doc.id, order);
        if (order.customerId !== profile.id) {
          needsBackfill.push(doc.ref);
        }
      }
    }
  }

  // Backfill customerId on matched guest/legacy orders so future lookups are instant
  if (needsBackfill.length > 0) {
    Promise.all(
      needsBackfill.map((ref) =>
        ref.update({ customerId: profile.id }).catch(() => {}),
      ),
    ).catch(() => {});
  }

  return Array.from(byId.values()).sort((a, b) =>
    (a.createdAt ?? "") < (b.createdAt ?? "") ? 1 : -1,
  );
}
