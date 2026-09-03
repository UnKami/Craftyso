import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import type { AdminUser } from "@/lib/types";

const SESSION_COOKIE = "craftyso_session";

export async function getAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  if (!session) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (!userDoc.exists) return null;

    const data = userDoc.data()!;
    if (data.role !== "owner" && data.role !== "editor") return null;

    return { uid: decoded.uid, email: decoded.email ?? "", role: data.role };
  } catch (err) {
    console.warn("[auth] session verification failed:", (err as Error).message);
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

export { SESSION_COOKIE };
