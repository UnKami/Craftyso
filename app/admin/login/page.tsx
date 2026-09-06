"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) throw new Error("session creation failed");

      router.push("/admin");
      router.refresh();
    } catch {
      setError("פרטי ההתחברות שגויים, או שהמשתמש לא הוגדר כמנהל.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm"
      >
        <Image src="/logo/so-logo.png" alt="SO" width={960} height={590} className="mb-4 h-8 w-auto" />
        <h1 className="mb-1 text-xl font-bold text-ink">כניסת מנהלים</h1>
        <p className="mb-6 text-sm text-ink-muted">לוח ניהול</p>

        <label className="mb-3 flex flex-col gap-1 text-sm text-ink-muted">
          אימייל
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-ink outline-none focus:border-brand"
          />
        </label>

        <label className="mb-5 flex flex-col gap-1 text-sm text-ink-muted">
          סיסמה
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-ink outline-none focus:border-brand"
          />
        </label>

        {error && <p className="mb-4 text-sm text-brand-dark">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "מתחבר..." : "התחברות"}
        </button>
      </form>
    </div>
  );
}
