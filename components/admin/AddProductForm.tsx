"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createProduct } from "@/app/admin/(dashboard)/products/actions";
import type { Category } from "@/lib/types";

function slugify(input: string) {
  return input
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "");
}

export function AddProductForm({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "",
    categoryId: categories[0]?.id ?? "",
    priceIls: "",
    description: "",
    imageUrl: "",
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await createProduct({
        name: form.name,
        slug: slugify(form.name) || crypto.randomUUID(),
        categoryId: form.categoryId,
        priceIls: Number(form.priceIls) || 0,
        description: form.description,
        imageUrl: form.imageUrl,
      });
      setForm({ name: "", categoryId: categories[0]?.id ?? "", priceIls: "", description: "", imageUrl: "" });
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        מוצר חדש
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 grid gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2">
      <MiniField label="שם המוצר" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
      <label className="flex flex-col gap-1 text-xs text-ink-muted">
        קטגוריה
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          className="rounded-lg border border-border px-2 py-1 text-sm text-ink"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>
      <MiniField label="מחיר (₪)" value={form.priceIls} onChange={(v) => setForm({ ...form, priceIls: v })} />
      <MiniField label="קישור לתמונה" value={form.imageUrl} onChange={(v) => setForm({ ...form, imageUrl: v })} />
      <label className="col-span-full flex flex-col gap-1 text-xs text-ink-muted">
        תיאור
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
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
