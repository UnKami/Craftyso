import "server-only";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase/admin";

const DOC_PATH = "settings/factoryPortal";

function generateToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

/**
 * Returns the active secret token for the private factory portal link
 * (`/factory-portal/<token>`). Automatically generates and persists one
 * in Firestore on first access so zero manual env setup is required.
 */
export async function getOrCreateFactoryPortalToken(): Promise<string> {
  const envOverride = process.env.FACTORY_PORTAL_TOKEN?.trim();
  if (envOverride) return envOverride;

  const ref = adminDb.doc(DOC_PATH);
  try {
    const snap = await ref.get();
    const existing = snap.data()?.token;
    if (typeof existing === "string" && existing.length >= 16) {
      return existing;
    }

    const token = generateToken();
    await ref.set(
      {
        token,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
    return token;
  } catch (err) {
    console.warn("[factory-portal] Failed to read/create token:", err);
    return "";
  }
}

/**
 * Generates a new secret token and overwrites the previous one in Firestore,
 * immediately invalidating any previously shared factory link.
 */
export async function rotateFactoryPortalToken(): Promise<string> {
  const token = generateToken();
  await adminDb.doc(DOC_PATH).set(
    {
      token,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
  return token;
}

/**
 * Timing-safe verification of a candidate token from `/factory-portal/[token]`.
 */
export async function verifyFactoryPortalToken(candidate: string): Promise<boolean> {
  if (!candidate || candidate.length < 16) return false;

  const envOverride = process.env.FACTORY_PORTAL_TOKEN?.trim();
  let expected = envOverride ?? "";

  if (!expected) {
    try {
      const snap = await adminDb.doc(DOC_PATH).get();
      const stored = snap.data()?.token;
      if (typeof stored === "string") expected = stored;
    } catch {
      return false;
    }
  }

  if (!expected) return false;

  const a = Buffer.from(candidate, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}
