import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { SESSION_COOKIE } from "@/lib/auth/session";

const EXPIRES_IN_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export async function POST(req: NextRequest) {
  const { idToken } = (await req.json()) as { idToken?: string };
  if (!idToken) return NextResponse.json({ error: "missing idToken" }, { status: 400 });

  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: EXPIRES_IN_MS,
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: EXPIRES_IN_MS / 1000,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("[auth/session] failed to create session cookie:", err);
    return NextResponse.json({ error: "invalid idToken" }, { status: 401 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
