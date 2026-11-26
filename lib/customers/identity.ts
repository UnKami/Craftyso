import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import type { CustomerProfile, Order } from "@/lib/types";

export function normalizeEmail(email?: string | null): string {
  return (email ?? "").trim().toLowerCase();
}

/**
 * Normalizes Israeli and international phone numbers to a canonical E.164 form
 * (e.g. "050-123-4567", "0501234567", "501234567", "+972 50 123 4567" -> "+972501234567").
 */
export function normalizePhone(phone?: string | null): string {
  const raw = (phone ?? "").trim();
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("9720") && digits.length >= 12) {
    return `+972${digits.slice(4)}`;
  }
  if (digits.startsWith("972") && digits.length >= 11) {
    return `+${digits}`;
  }
  if (digits.startsWith("0") && digits.length >= 9 && digits.length <= 10) {
    return `+972${digits.slice(1)}`;
  }
  if (digits.startsWith("5") && digits.length === 9) {
    return `+972${digits}`;
  }
  if (raw.startsWith("+")) {
    return `+${digits}`;
  }
  return digits;
}

/**
 * Generates common raw string representations of a normalized phone number so
 * legacy orders stored without `customerPhoneNormalized` still match.
 */
function phoneLookupVariants(normalized: string): string[] {
  const variants = new Set<string>([normalized]);
  if (normalized.startsWith("+972") && normalized.length >= 12) {
    const rest = normalized.slice(4); // e.g. "508689077"
    const local = `0${rest}`; // e.g. "0508689077"
    variants.add(normalized.slice(1)); // "972508689077"
    variants.add(local);
    if (local.length === 10) {
      variants.add(`${local.slice(0, 3)}-${local.slice(3)}`); // "050-8689077"
      variants.add(`${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`); // "050-868-9077"
      variants.add(`${local.slice(0, 3)} ${local.slice(3)}`); // "050 8689077"
    }
  }
  return Array.from(variants);
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
  extraUids?: string[];
  extraEmails?: string[];
  extraPhones?: string[];
  extraProfileIds?: string[];
}): Promise<CustomerProfile | null> {
  const uids = dedupe([input.uid, ...(input.extraUids ?? [])]);
  const emails = dedupe([
    normalizeEmail(input.email),
    ...(input.extraEmails ?? []).map(normalizeEmail),
  ]);
  const phones = dedupe([
    normalizePhone(input.phone),
    ...(input.extraPhones ?? []).map(normalizePhone),
  ]);
  const profileIds = dedupe(input.extraProfileIds ?? []);

  if (uids.length === 0 && emails.length === 0 && phones.length === 0 && profileIds.length === 0) {
    return null;
  }

  const col = adminDb.collection("customers");
  const queries: Promise<FirebaseFirestore.QuerySnapshot>[] = [];

  for (const uid of uids) {
    queries.push(col.where("uids", "array-contains", uid).get());
  }
  for (const email of emails) {
    queries.push(col.where("emails", "array-contains", email).get());
  }
  for (const phone of phones) {
    queries.push(col.where("phones", "array-contains", phone).get());
  }

  const [snaps, directDocs] = await Promise.all([
    Promise.all(queries),
    Promise.all(profileIds.map((id) => col.doc(id).get())),
  ]);

  const matched = new Map<string, CustomerProfile>();
  for (const snap of snaps) {
    for (const doc of snap.docs) {
      if (!matched.has(doc.id)) {
        matched.set(doc.id, { id: doc.id, ...(doc.data() as Omit<CustomerProfile, "id">) });
      }
    }
  }
  for (const doc of directDocs) {
    if (doc.exists && !matched.has(doc.id)) {
      matched.set(doc.id, { id: doc.id, ...(doc.data() as Omit<CustomerProfile, "id">) });
    }
  }

  const now = new Date().toISOString();
  const profiles = Array.from(matched.values()).sort((a, b) =>
    (a.createdAt ?? "") < (b.createdAt ?? "") ? -1 : 1,
  );

  if (profiles.length === 0) {
    const newProfile: Omit<CustomerProfile, "id"> = {
      uids,
      emails,
      phones,
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
  const mergedUids = dedupe([...profiles.flatMap((p) => p.uids ?? []), ...uids]);
  const mergedEmails = dedupe([...profiles.flatMap((p) => p.emails ?? []), ...emails]);
  const mergedPhones = dedupe([...profiles.flatMap((p) => p.phones ?? []), ...phones]);
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

async function queryOrdersForProfile(profile: CustomerProfile): Promise<Map<string, Order>> {
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
  const rawPhoneVariants = dedupe(profile.phones.flatMap(phoneLookupVariants));
  for (const batch of chunk(rawPhoneVariants, 10)) {
    // Legacy orders written before customerPhoneNormalized was stored
    queries.push(ordersCol.where("customerPhone", "in", batch).get());
  }

  const snaps = await Promise.all(queries);
  const byId = new Map<string, Order>();

  for (const snap of snaps) {
    for (const doc of snap.docs) {
      if (!byId.has(doc.id)) {
        byId.set(doc.id, { id: doc.id, ...(doc.data() as Omit<Order, "id">) });
      }
    }
  }
  return byId;
}

/**
 * Retrieves ALL orders belonging to a unified CustomerProfile across all of
 * its linked UIDs, emails, and phone numbers (including legacy/guest orders),
 * absorbs any newly discovered emails/phones/profiles from matched orders so
 * accounts merge automatically across login methods, and backfills normalized
 * fields on legacy orders.
 */
export async function syncCustomerProfileWithOrders(
  initialProfile: CustomerProfile,
): Promise<{ profile: CustomerProfile; orders: Order[] }> {
  let profile = initialProfile;
  let byId = await queryOrdersForProfile(profile);

  // Absorb any emails, phones, names, or other customerIds discovered on matched
  // orders so logging in with phone automatically links previous email orders
  // (and vice versa).
  const discoveredEmails = dedupe(
    Array.from(byId.values()).map((o) => normalizeEmail(o.customerEmail)),
  );
  const discoveredPhones = dedupe(
    Array.from(byId.values()).map((o) => normalizePhone(o.customerPhone)),
  );
  const discoveredProfileIds = dedupe(
    Array.from(byId.values()).map((o) => o.customerId),
  ).filter((id) => id !== profile.id);
  const discoveredName =
    profile.name ||
    Array.from(byId.values()).find((o) => o.customerName?.trim())?.customerName?.trim();

  const existingEmails = new Set(profile.emails ?? []);
  const existingPhones = new Set(profile.phones ?? []);
  const hasNewEmail = discoveredEmails.some((e) => !existingEmails.has(e));
  const hasNewPhone = discoveredPhones.some((p) => !existingPhones.has(p));
  const hasNewProfile = discoveredProfileIds.length > 0;
  const hasNewName = Boolean(!profile.name && discoveredName);

  if (hasNewEmail || hasNewPhone || hasNewProfile || hasNewName) {
    const merged = await upsertAndMergeCustomerIdentity({
      extraProfileIds: [profile.id, ...discoveredProfileIds],
      extraUids: profile.uids,
      extraEmails: [...profile.emails, ...discoveredEmails],
      extraPhones: [...profile.phones, ...discoveredPhones],
      name: discoveredName,
    });
    if (merged) {
      profile = merged;
      // Re-query once with the expanded merged identity so any transitive orders
      // (e.g. placed with the newly linked email/phone) appear immediately.
      byId = await queryOrdersForProfile(profile);
    }
  }

  // Backfill customerId & normalized contact fields on matched legacy orders
  const ordersCol = adminDb.collection("orders");
  const backfills: Promise<unknown>[] = [];
  for (const order of byId.values()) {
    const patch: Record<string, string> = {};
    if (order.customerId !== profile.id) patch.customerId = profile.id;
    const normEmail = normalizeEmail(order.customerEmail);
    if (normEmail && order.customerEmailNormalized !== normEmail) {
      patch.customerEmailNormalized = normEmail;
    }
    const normPhone = normalizePhone(order.customerPhone);
    if (normPhone && order.customerPhoneNormalized !== normPhone) {
      patch.customerPhoneNormalized = normPhone;
    }
    if (Object.keys(patch).length > 0) {
      backfills.push(ordersCol.doc(order.id).update(patch).catch(() => {}));
    }
  }
  if (backfills.length > 0) {
    Promise.all(backfills).catch(() => {});
  }

  const orders = Array.from(byId.values()).sort((a, b) =>
    (a.createdAt ?? "") < (b.createdAt ?? "") ? 1 : -1,
  );
  return { profile, orders };
}

export async function getOrdersForCustomerProfile(
  profile: CustomerProfile,
): Promise<Order[]> {
  const { orders } = await syncCustomerProfileWithOrders(profile);
  return orders;
}
