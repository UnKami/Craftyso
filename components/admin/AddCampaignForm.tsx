"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { createCampaign } from "@/app/admin/(dashboard)/campaigns/actions";
import type { CampaignChannel } from "@/lib/types";

const CHANNELS: { value: CampaignChannel; label: string }[] = [
  { value: "google_ads", label: "Google Ads" },
  { value: "meta_ads", label: "Meta Ads (Facebook/Instagram)" },
  { value: "email", label: "אימייל" },
  { value: "social", label: "רשתות חברתיות (אורגני)" },
  { value: "other", label: "אחר" },
];

export function AddCampaignForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "",
    channel: "google_ads" as CampaignChannel,
    budgetIls: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
  });

  const trackedUrl = useMemo(() => {
    if (!form.utmCampaign) return "";
    const params = new URLSearchParams({
      utm_source: form.utmSource || "direct",
      utm_medium: form.utmMedium || "none",
      utm_campaign: form.utmCampaign,
    });
    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://craftyso.co.il";
    return `${base}/?${params.toString()}`;
  }, [form.utmSource, form.utmMedium, form.utmCampaign]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await createCampaign({
        name: form.name,
        channel: form.channel,
        budgetIls: form.budgetIls ? Number(form.budgetIls) : undefined,
        utmSource: form.utmSource,
        utmMedium: form.utmMedium,
        utmCampaign: form.utmCampaign,
      });
      setForm({ name: "", channel: "google_ads", budgetIls: "", utmSource: "", utmMedium: "", utmCampaign: "" });
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        קמפיין חדש
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 grid gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2">
      <MiniField label="שם הקמפיין" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
      <label className="flex flex-col gap-1 text-xs text-ink-muted">
        ערוץ
        <select
          value={form.channel}
          onChange={(e) => setForm({ ...form, channel: e.target.value as CampaignChannel })}
          className="rounded-lg border border-border px-2 py-1 text-sm text-ink"
        >
          {CHANNELS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </label>
      <MiniField label="תקציב (₪)" value={form.budgetIls} onChange={(v) => setForm({ ...form, budgetIls: v })} />
      <MiniField label="utm_source" value={form.utmSource} onChange={(v) => setForm({ ...form, utmSource: v })} />
      <MiniField label="utm_medium" value={form.utmMedium} onChange={(v) => setForm({ ...form, utmMedium: v })} />
      <MiniField label="utm_campaign" value={form.utmCampaign} onChange={(v) => setForm({ ...form, utmCampaign: v })} />

      {trackedUrl && (
        <p className="col-span-full break-all rounded-lg bg-surface-muted p-2 text-xs text-ink-muted">
          {trackedUrl}
        </p>
      )}

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
