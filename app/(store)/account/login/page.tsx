"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";

export default function AccountLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const cred =
        mode === "signin"
          ? await signInWithEmailAndPassword(auth, email, password)
          : await createUserWithEmailAndPassword(auth, email, password);

      if (mode === "signup" && name) {
        await updateProfile(cred.user, { displayName: name });
      }

      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) throw new Error("session creation failed");

      const adminDoc = await getDoc(doc(db, "users", cred.user.uid));
      router.push(adminDoc.exists() ? "/admin" : "/account");
      router.refresh();
    } catch {
      setError(
        mode === "signin"
          ? "אימייל או סיסמה שגויים."
          : "לא הצלחנו ליצור חשבון. ייתכן שהאימייל כבר בשימוש.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-14">
      <div className="mb-6 flex gap-2 rounded-full bg-surface-muted p-1 text-sm">
        <button
          onClick={() => setMode("signin")}
          className={`flex-1 rounded-full py-2 font-medium transition ${
            mode === "signin" ? "bg-surface shadow-sm text-ink" : "text-ink-muted"
          }`}
        >
          התחברות
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-full py-2 font-medium transition ${
            mode === "signup" ? "bg-surface shadow-sm text-ink" : "text-ink-muted"
          }`}
        >
          הרשמה
        </button>
      </div>

      <h1 className="mb-1 text-2xl font-bold text-ink">
        {mode === "signin" ? "האזור האישי שלי" : "יצירת חשבון"}
      </h1>
      <p className="mb-6 text-sm text-ink-muted">
        {mode === "signin"
          ? "התחברו כדי לצפות בהזמנות ובפרטי החשבון שלכם."
          : "פתחו חשבון כדי לעקוב אחרי ההזמנות שלכם ולקנות מהר יותר בפעם הבאה."}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "signup" && (
          <label className="flex flex-col gap-1 text-sm text-ink-muted">
            שם מלא
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-ink outline-none focus:border-brand"
            />
          </label>
        )}
        <label className="flex flex-col gap-1 text-sm text-ink-muted">
          אימייל
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-ink outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink-muted">
          סיסמה
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-ink outline-none focus:border-brand"
          />
        </label>

        {error && <p className="text-sm text-brand-dark">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "רגע..." : mode === "signin" ? "התחברות" : "יצירת חשבון"}
        </button>
      </form>
    </div>
  );
}
