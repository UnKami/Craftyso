import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase/admin";

export const SESSION_COOKIE = "craftyso_session";

export type SessionUser = {
  uid: string;
  email: string;
  name?: string;
};

/** Any signed-in user (customer or admin) — no role check. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  if (!session) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return { uid: decoded.uid, email: decoded.email ?? "", name: decoded.name };
  } catch (err) {
    console.warn("[auth] session verification failed:", (err as Error).message);
    return null;
  }
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/account/login");
  return user;
}
