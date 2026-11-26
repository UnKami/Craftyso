"use client";

import { useState, useTransition, type FormEvent } from "react";
import { inviteAdmin } from "@/app/admin/(dashboard)/team/actions";
import { ADMIN_TABS, ROLE_PRESETS } from "@/lib/auth/permissions";
import type { AdminRole, AdminTabId } from "@/lib/types";

const ASSIGNABLE_TABS = ADMIN_TABS.filter((t) => t.id !== "team");

export function InviteAdminForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [presetId, setPresetId] = useState<string>("orders_factory");
  const [role, setRole] = useState<AdminRole>("manager");
  const [roleLabel, setRoleLabel] = useState<string>("מנהל הזמנות ומפעל");
  const [selectedTabs, setSelectedTabs] = useState<AdminTabId[]>(["orders", "factory"]);
  const [result, setResult] = useState<{ link: string; email: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyPreset(id: string) {
    setPresetId(id);
    const preset = ROLE_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setRole(preset.role);
    setRoleLabel(preset.id === "custom" ? "מנהל/ת" : preset.label);
    setSelectedTabs(preset.tabs.filter((t) => t !== "team"));
  }

  function toggleTab(tab: AdminTabId) {
    setPresetId("custom");
    setRole("manager");
    setSelectedTabs((prev) =>
      prev.includes(tab) ? prev.filter((t) => t !== tab) : [...prev, tab],
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await inviteAdmin({
        email,
        role,
        roleLabel,
        allowedTabs: role === "owner" ? ADMIN_TABS.map((t) => t.id) : selectedTabs,
      });
      if (res.ok) {
        setResult({ link: res.setPasswordLink, email });
        setEmail("");
        setOpen(false);
      } else {
        setError(res.error);
      }
    });
  }

  async function copyLink() {
    if (!result) return;
    await navigator.clipboard.writeText(result.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      {!open && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setResult(null);
            setError(null);
          }}
          className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          + הזמנת מנהל/ת חדש/ה
        </button>
      )}

      {result && (
        <div className="rounded-2xl border border-emerald-500/40 bg-surface p-5">
          <p className="mb-2 text-sm font-semibold text-ink">
            ✓ {result.email} נוסף/ה בהצלחה! שלחו לו/ה את הקישור הבא להגדרת סיסמה וכניסה ל-`/admin`:
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              readOnly
              dir="ltr"
              value={result.link}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-xl border border-border bg-surface-muted px-3 py-2 font-mono text-xs text-ink-muted"
            />
            <button
              type="button"
              onClick={copyLink}
              className="rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark"
            >
              {copied ? "✓ הועתק!" : "📋 העתק קישור"}
            </button>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="text-xs text-ink-muted hover:text-ink"
            >
              סגירה
            </button>
          </div>
        </div>
      )}

      {open && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-brand/40 bg-surface p-5"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs text-ink-muted">
              אימייל המנהל/ת *
              <input
                type="email"
                required
                placeholder="manager@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm text-ink outline-none focus:border-brand"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs text-ink-muted">
              תבנית תפקיד (Preset)
              <select
                value={presetId}
                onChange={(e) => applyPreset(e.target.value)}
                className="rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm text-ink outline-none focus:border-brand"
              >
                {ROLE_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs text-ink-muted">
              שם תפקיד (לתצוגה)
              <input
                type="text"
                value={roleLabel}
                onChange={(e) => setRoleLabel(e.target.value)}
                placeholder="לדוגמה: מנהל הזמנות"
                className="rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm text-ink outline-none focus:border-brand"
              />
            </label>
          </div>

          {role !== "owner" ? (
            <div>
              <p className="mb-2 text-xs font-semibold text-ink">
                לשוניות שהמנהל/ת יוכל/תוכל לראות ולנהל:
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                {ASSIGNABLE_TABS.map((tab) => {
                  const checked = selectedTabs.includes(tab.id);
                  return (
                    <label
                      key={tab.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                        checked
                          ? "border-brand bg-brand/15 text-ink"
                          : "border-border bg-surface-muted text-ink-muted hover:text-ink"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTab(tab.id)}
                      />
                      <span>{tab.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-brand/30 bg-brand/10 px-3 py-2 text-xs text-ink">
              לבעלים (Owner) יש גישה מלאה לכל לשוניות הניהול כולל ניהול צוות והרשאות.
            </p>
          )}

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-border px-4 py-2 text-xs text-ink-muted hover:text-ink"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-brand px-5 py-2 text-xs font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
            >
              {pending ? "יוצר הזמנה..." : "צור הזמנה וקישור כניסה"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
