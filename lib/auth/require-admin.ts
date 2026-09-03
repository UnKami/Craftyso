import "server-only";
import { redirect } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { getSessionUser } from "./session";
import type { AdminUser } from "@/lib/types";

export async function getAdminUser(): Promise<AdminUser | null> {
  const session = await getSessionUser();
  if (!session) return null;

  try {
    const userDoc = await adminDb.collection("users").doc(session.uid).get();
    if (!userDoc.exists) return null;

    const data = userDoc.data()!;
    if (data.role !== "owner" && data.role !== "editor") return null;

    return { uid: session.uid, email: session.email, role: data.role };
  } catch (err) {
    console.warn("[auth] admin role lookup failed:", (err as Error).message);
    return null;
  }
}

export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireOwner(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user || user.role !== "owner") throw new Error("Unauthorized: owner role required");
  return user;
}
