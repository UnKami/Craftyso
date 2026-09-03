"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createSocialPost } from "@/app/admin/(dashboard)/social/actions";
import type { SocialPlatform } from "@/lib/types";

const PLATFORMS: { value: SocialPlatform; label: string }[] = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "other", label: "אחר" },
];

export function AddSocialPostForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    platform: "instagram" as SocialPlatform,
    caption: "",
    imageUrl: "",
    scheduledFor: "",
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await createSocialPost({
        platform: form.platform,
        caption: form.caption,
        imageUrl: form.imageUrl || undefined,
        scheduledFor: form.scheduledFor || undefined,
      });
      setForm({ platform: "instagram", caption: "", imageUrl: "", scheduledFor: "" });
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        פוסט חדש
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 grid gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-xs text-ink-muted">
        פלטפורמה
        <select
          value={form.platform}
          onChange={(e) => setForm({ ...form, platform: e.target.value as SocialPlatform })}
          className="rounded-lg border border-border px-2 py-1 text-sm text-ink"
        >
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-ink-muted">
        תאריך פרסום מתוכנן
        <input
          type="datetime-local"
          value={form.scheduledFor}
          onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })}
          className="rounded-lg border border-border px-2 py-1 text-sm text-ink"
        />
      </label>
      <label className="col-span-full flex flex-col gap-1 text-xs text-ink-muted">
        קישור לתמונה
        <input
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          className="rounded-lg border border-border px-2 py-1 text-sm text-ink"
        />
      </label>
      <label className="col-span-full flex flex-col gap-1 text-xs text-ink-muted">
        טקסט הפוסט
        <textarea
          value={form.caption}
          onChange={(e) => setForm({ ...form, caption: e.target.value })}
          rows={4}
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
