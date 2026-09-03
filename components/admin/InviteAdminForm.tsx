"use client";

import { useState, useTransition, type FormEvent } from "react";
import { inviteAdmin } from "@/app/admin/(dashboard)/team/actions";
import type { AdminRole } from "@/lib/types";

export function InviteAdminForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("editor");
  const [result, setResult] = useState<{ link: string; email: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await inviteAdmin(email, role);
      if (res.ok) {
        setResult({ link: res.setPasswordLink, email });
        setEmail("");
      } else {
        setError(res.error);
      }
    });
  }

  if (result) {
    return (
      <div className="mb-6 rounded-2xl border border-border bg-surface p-4">
        <p className="mb-2 text-sm text-ink">
          {result.email} נוסף/ה כמנהל/ת. שלחו לו/ה את הקישור הבא כדי להגדיר סיסמה:
        </p>
        <p className="mb-3 break-all rounded-lg bg-surface-muted p-2 text-xs text-ink-muted">
          {result.link}
        </p>
        <button
          onClick={() => setResult(null)}
          className="text-sm text-brand hover:underline"
        >
          סגירה
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        הוספת מנהל/ת
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-end gap-2 rounded-2xl border border-border bg-surface p-4">
      <label className="flex flex-col gap-1 text-xs text-ink-muted">
        אימייל
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-border px-2 py-1 text-sm text-ink"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-ink-muted">
        הרשאה
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as AdminRole)}
          className="rounded-lg border border-border px-2 py-1 text-sm text-ink"
        >
          <option value="editor">עורך/ת (Editor)</option>
          <option value="owner">בעלים (Owner)</option>
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "מוסיף..." : "הוספה"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-sm text-ink-muted">
        ביטול
      </button>
      {error && <p className="w-full text-sm text-brand-dark">{error}</p>}
    </form>
  );
}
