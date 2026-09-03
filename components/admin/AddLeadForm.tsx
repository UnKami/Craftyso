"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createLead } from "@/app/admin/(dashboard)/leads/actions";

export function AddLeadForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ name: "", email: "", phone: "", note: "" });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await createLead(form);
      setForm({ name: "", email: "", phone: "", note: "" });
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        ליד חדש
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-end gap-2 rounded-2xl border border-border bg-surface p-4">
      <MiniField label="שם" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
      <MiniField label="אימייל" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
      <MiniField label="טלפון" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
      <MiniField label="הערה" value={form.note} onChange={(v) => setForm({ ...form, note: v })} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        שמירה
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-sm text-ink-muted">
        ביטול
      </button>
    </form>
  );
}

function MiniField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-ink-muted">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border px-2 py-1 text-sm text-ink"
      />
    </label>
  );
}
