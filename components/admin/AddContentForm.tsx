"use client";

import { useState, useTransition, type FormEvent } from "react";
import { saveContentPage } from "@/app/admin/(dashboard)/content/actions";

export function AddContentForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ slug: "", title: "", body: "", type: "page" as "page" | "blog_post" });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await saveContentPage(form);
      setForm({ slug: "", title: "", body: "", type: "page" });
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        עמוד/פוסט חדש
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 grid gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-xs text-ink-muted">
        כותרת
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="rounded-lg border border-border px-2 py-1 text-sm text-ink"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-ink-muted">
        Slug (לכתובת ה-URL)
        <input
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="rounded-lg border border-border px-2 py-1 text-sm text-ink"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-ink-muted">
        סוג
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as "page" | "blog_post" })}
          className="rounded-lg border border-border px-2 py-1 text-sm text-ink"
        >
          <option value="page">עמוד</option>
          <option value="blog_post">פוסט בלוג</option>
        </select>
      </label>
      <label className="col-span-full flex flex-col gap-1 text-xs text-ink-muted">
        תוכן
        <textarea
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          rows={5}
          className="rounded-lg border border-border px-2 py-1 text-sm text-ink"
        />
      </label>
      <div className="col-span-full flex gap-2">
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
      </div>
    </form>
  );
}
