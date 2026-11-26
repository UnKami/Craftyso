"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/require-admin";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { ADMIN_TABS } from "@/lib/auth/permissions";
import type { AdminRole, AdminTabId } from "@/lib/types";

const VALID_TABS = new Set<string>(ADMIN_TABS.map((t) => t.id));

function sanitizeTabs(role: AdminRole, tabs?: AdminTabId[]): AdminTabId[] {
  if (role === "owner") return ADMIN_TABS.map((t) => t.id);
  const cleaned = (tabs ?? []).filter((t): t is AdminTabId => VALID_TABS.has(t) && t !== "team");
  return Array.from(new Set(cleaned));
}

export type InviteAdminResult =
  | { ok: true; setPasswordLink: string; isNewUser: boolean }
  | { ok: false; error: string };

export async function inviteAdmin(input: {
  email: string;
  role: AdminRole;
  roleLabel?: string;
  allowedTabs?: AdminTabId[];
}): Promise<InviteAdminResult> {
  await requireOwner();

  const email = input.email.trim().toLowerCase();
  if (!email) return { ok: false, error: "יש להזין כתובת אימייל תקינה." };

  const allowedTabs = sanitizeTabs(input.role, input.allowedTabs);
  if (input.role !== "owner" && allowedTabs.length === 0) {
    return { ok: false, error: "יש לבחור לפחות לשונית אחת עבור המנהל/ת." };
  }

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

    await adminDb
      .collection("users")
      .doc(uid)
      .set(
        {
          uid,
          email,
          role: input.role,
          roleLabel: input.roleLabel?.trim() || (input.role === "owner" ? "בעלים" : "מנהל/ת"),
          allowedTabs,
        },
        { merge: true },
      );

    const setPasswordLink = await adminAuth.generatePasswordResetLink(email);

    revalidatePath("/admin/team");
    return { ok: true, setPasswordLink, isNewUser };
  } catch (err) {
    console.error("[team] inviteAdmin failed:", err);
    return { ok: false, error: "אירעה שגיאה בהוספת המנהל. נסו שוב." };
  }
}

export type ResetPasswordResult =
  | { ok: true; setPasswordLink: string }
  | { ok: false; error: string };

export async function resetAdminPassword(email: string): Promise<ResetPasswordResult> {
  await requireOwner();

  try {
    const setPasswordLink = await adminAuth.generatePasswordResetLink(email);
    return { ok: true, setPasswordLink };
  } catch (err) {
    console.error("[team] resetAdminPassword failed:", err);
    return { ok: false, error: "אירעה שגיאה ביצירת קישור לאיפוס סיסמה." };
  }
}

export async function removeAdmin(uid: string) {
  const owner = await requireOwner();
  if (uid === owner.uid) throw new Error("Cannot remove yourself");

  await adminDb.collection("users").doc(uid).delete();
  revalidatePath("/admin/team");
}

export async function updateAdminPermissions(input: {
  uid: string;
  role: AdminRole;
  roleLabel?: string;
  allowedTabs: AdminTabId[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const owner = await requireOwner();
  if (input.uid === owner.uid && input.role !== "owner") {
    return { ok: false, error: "לא ניתן להסיר לעצמך הרשאת בעלים." };
  }

  const allowedTabs = sanitizeTabs(input.role, input.allowedTabs);
  if (input.role !== "owner" && allowedTabs.length === 0) {
    return { ok: false, error: "יש לבחור לפחות לשונית אחת." };
  }

  await adminDb
    .collection("users")
    .doc(input.uid)
    .update({
      role: input.role,
      roleLabel: input.roleLabel?.trim() || (input.role === "owner" ? "בעלים" : "מנהל/ת"),
      allowedTabs,
    });

  revalidatePath("/admin/team");
  return { ok: true };
}
