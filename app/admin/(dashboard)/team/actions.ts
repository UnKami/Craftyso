"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/require-admin";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import type { AdminRole } from "@/lib/types";

export type InviteAdminResult =
  | { ok: true; setPasswordLink: string; isNewUser: boolean }
  | { ok: false; error: string };

export async function inviteAdmin(email: string, role: AdminRole): Promise<InviteAdminResult> {
  await requireOwner();

  try {
    let uid: string;
    let isNewUser = false;

    try {
      const existing = await adminAuth.getUserByEmail(email);
      uid = existing.uid;
    } catch {
      const created = await adminAuth.createUser({ email });
      uid = created.uid;
      isNewUser = true;
    }

    await adminDb.collection("users").doc(uid).set({ uid, email, role }, { merge: true });

    // No email-sending is configured yet, so hand the inviting owner a
    // set-password link to send the new admin directly.
    const setPasswordLink = await adminAuth.generatePasswordResetLink(email);

    revalidatePath("/admin/team");
    return { ok: true, setPasswordLink, isNewUser };
  } catch (err) {
    console.error("[team] inviteAdmin failed:", err);
    return { ok: false, error: "אירעה שגיאה בהוספת המנהל. נסו שוב." };
  }
}

export async function removeAdmin(uid: string) {
  const owner = await requireOwner();
  if (uid === owner.uid) throw new Error("Cannot remove yourself");

  await adminDb.collection("users").doc(uid).delete();
  revalidatePath("/admin/team");
}

export async function updateAdminRole(uid: string, role: AdminRole) {
  await requireOwner();
  await adminDb.collection("users").doc(uid).update({ role });
  revalidatePath("/admin/team");
}
