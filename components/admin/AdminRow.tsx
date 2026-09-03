"use client";

import { useTransition } from "react";
import { removeAdmin, updateAdminRole } from "@/app/admin/(dashboard)/team/actions";
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

  return (
    <li className="flex items-center justify-between p-4">
      <div>
        <p className="font-medium text-ink">
          {admin.email} {isSelf && <span className="text-xs text-ink-muted">(את/ה)</span>}
        </p>
      </div>
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
    </li>
  );
}
