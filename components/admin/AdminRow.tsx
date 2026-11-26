"use client";

import { useState, useTransition } from "react";
import {
  removeAdmin,
  resetAdminPassword,
  updateAdminPermissions,
} from "@/app/admin/(dashboard)/team/actions";
import { ADMIN_TABS, ALL_NON_OWNER_TABS } from "@/lib/auth/permissions";
import type { AdminRole, AdminTabId, AdminUser } from "@/lib/types";

const ASSIGNABLE_TABS = ADMIN_TABS.filter((t) => t.id !== "team");
const TAB_LABELS = Object.fromEntries(ADMIN_TABS.map((t) => [t.id, t.label])) as Record<
  AdminTabId,
  string
>;

export function AdminRow({
  admin,
  isSelf,
  canManage,
}: {
  admin: AdminUser;
  isSelf: boolean;
  canManage: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState<AdminRole>(admin.role);
  const [roleLabel, setRoleLabel] = useState<string>(
    admin.roleLabel ?? (admin.role === "owner" ? "בעלים" : "מנהל/ת"),
  );
  const [tabs, setTabs] = useState<AdminTabId[]>(
    admin.role === "owner"
      ? ADMIN_TABS.map((t) => t.id)
      : Array.isArray(admin.allowedTabs)
        ? admin.allowedTabs
        : ALL_NON_OWNER_TABS,
  );
  const [editError, setEditError] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  function toggleTab(tab: AdminTabId) {
    setTabs((prev) => (prev.includes(tab) ? prev.filter((t) => t !== tab) : [...prev, tab]));
  }

  function handleSavePermissions() {
    setEditError(null);
    startTransition(async () => {
      const res = await updateAdminPermissions({
        uid: admin.uid,
        role,
        roleLabel,
        allowedTabs: tabs,
      });
      if (!res.ok) {
        setEditError(res.error);
        return;
      }
      setEditing(false);
    });
  }

  function handleResetPassword() {
    setResetError(null);
    startTransition(async () => {
      const res = await resetAdminPassword(admin.email);
      if (res.ok) setResetLink(res.setPasswordLink);
      else setResetError(res.error);
    });
  }

  async function copyReset() {
    if (!resetLink) return;
    await navigator.clipboard.writeText(resetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const displayedTabs =
    admin.role === "owner"
      ? null
      : Array.isArray(admin.allowedTabs)
        ? admin.allowedTabs
        : ALL_NON_OWNER_TABS;

  return (
    <li className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-ink">{admin.email}</p>
            {isSelf && <span className="text-xs text-ink-muted">(את/ה)</span>}
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                admin.role === "owner"
                  ? "border-brand/50 bg-brand/15 text-brand"
                  : "border-border bg-surface-muted text-ink-muted"
              }`}
            >
              {admin.roleLabel || (admin.role === "owner" ? "בעלים (Owner)" : "מנהל/ת")}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {admin.role === "owner" ? (
              <span className="text-xs text-ink-muted">גישה מלאה לכל לשוניות הניהול</span>
            ) : (
              displayedTabs?.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-border bg-surface-muted px-2 py-0.5 text-[11px] text-ink-muted"
                >
                  {TAB_LABELS[t] ?? t}
                </span>
              ))
            )}
          </div>
        </div>

        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            {!isSelf && (
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setEditing((v) => !v);
                  setEditError(null);
                }}
                className="rounded-lg border border-border px-3 py-1 text-xs font-medium text-ink transition hover:border-brand hover:text-brand"
              >
                {editing ? "סגירת עריכה" : "עריכת הרשאות"}
              </button>
            )}
            <button
              type="button"
              disabled={pending}
              onClick={handleResetPassword}
              className="rounded-lg border border-border px-3 py-1 text-xs text-ink-muted transition hover:border-brand hover:text-brand"
            >
              קישור איפוס סיסמה
            </button>
            {!isSelf && (
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (window.confirm(`להסיר את ${admin.email} מצוות הניהול?`)) {
                    startTransition(() => removeAdmin(admin.uid));
                  }
                }}
                className="rounded-lg border border-border px-3 py-1 text-xs text-rose-400 transition hover:border-rose-400"
              >
                הסרה
              </button>
            )}
          </div>
        )}
      </div>

      {editing && canManage && !isSelf && (
        <div className="space-y-3 rounded-xl border border-brand/30 bg-surface-muted/60 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-ink-muted">
              סוג הרשאה
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as AdminRole)}
                className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-ink"
              >
                <option value="manager">מנהל/ת (גישה ללשוניות נבחרות)</option>
                <option value="owner">בעלים (גישה מלאה להכל)</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs text-ink-muted">
              שם תפקיד
              <input
                type="text"
                value={roleLabel}
                onChange={(e) => setRoleLabel(e.target.value)}
                className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-ink"
              />
            </label>
          </div>

          {role !== "owner" && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              {ASSIGNABLE_TABS.map((tab) => {
                const checked = tabs.includes(tab.id);
                return (
                  <label
                    key={tab.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs ${
                      checked
                        ? "border-brand bg-brand/15 text-ink"
                        : "border-border bg-surface text-ink-muted"
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
          )}

          {editError && <p className="text-xs text-rose-400">{editError}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-ink-muted"
            >
              ביטול
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleSavePermissions}
              className="rounded-lg bg-brand px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              {pending ? "שומר..." : "שמור הרשאות"}
            </button>
          </div>
        </div>
      )}

      {resetLink && (
        <div className="rounded-xl border border-border bg-surface-muted p-3">
          <p className="mb-2 text-xs text-ink">
            שלחו למשתמש/ת את הקישור הבא כדי לקבוע סיסמה חדשה:
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              readOnly
              dir="ltr"
              value={resetLink}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 font-mono text-xs text-ink-muted"
            />
            <button
              type="button"
              onClick={copyReset}
              className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white"
            >
              {copied ? "✓ הועתק" : "📋 העתק"}
            </button>
            <button
              type="button"
              onClick={() => setResetLink(null)}
              className="text-xs text-ink-muted hover:text-ink"
            >
              סגירה
            </button>
          </div>
        </div>
      )}
      {resetError && <p className="text-xs text-rose-400">{resetError}</p>}
    </li>
  );
}
