"use client";

import { useState, useTransition } from "react";
import { removeAdmin, resetAdminPassword, updateAdminRole } from "@/app/admin/(dashboard)/team/actions";
import type { AdminRole, AdminUser } from "@/lib/types";

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
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  function handleResetPassword() {
    setResetError(null);
    startTransition(async () => {
      const res = await resetAdminPassword(admin.email);
      if (res.ok) setResetLink(res.setPasswordLink);
      else setResetError(res.error);
    });
  }

  return (
    <li className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium text-ink">
          {admin.email} {isSelf && <span className="text-xs text-ink-muted">(את/ה)</span>}
        </p>
        <div className="flex items-center gap-2">
          {canManage ? (
            <select
              value={admin.role}
              disabled={pending || isSelf}
              onChange={(e) =>
                startTransition(() => updateAdminRole(admin.uid, e.target.value as AdminRole))
              }
              className="rounded-lg border border-border bg-surface px-2 py-1 text-sm"
            >
              <option value="editor">עורך/ת</option>
              <option value="owner">בעלים</option>
            </select>
          ) : (
            <span className="text-sm text-ink-muted">{admin.role === "owner" ? "בעלים" : "עורך/ת"}</span>
          )}
          {canManage && (
            <button
              disabled={pending}
              onClick={handleResetPassword}
              className="text-sm text-ink-muted hover:text-brand"
            >
              איפוס סיסמה
            </button>
          )}
          {canManage && !isSelf && (
            <button
              disabled={pending}
              onClick={() => startTransition(() => removeAdmin(admin.uid))}
              className="text-sm text-ink-muted hover:text-brand"
            >
              הסרה
            </button>
          )}
        </div>
      </div>

      {resetLink && (
        <div className="rounded-lg bg-surface-muted p-3">
          <p className="mb-1 text-xs text-ink">שלחו למשתמש/ת את הקישור הבא כדי לקבוע סיסמה חדשה:</p>
          <p className="break-all rounded bg-surface p-2 text-xs text-ink-muted">{resetLink}</p>
          <button onClick={() => setResetLink(null)} className="mt-1 text-xs text-brand hover:underline">
            סגירה
          </button>
        </div>
      )}
      {resetError && <p className="text-xs text-brand-dark">{resetError}</p>}
    </li>
  );
}
