"use client";

import { useTransition } from "react";
import type { LeadStatus } from "@/lib/types";
import { updateLeadStatus } from "@/app/admin/(dashboard)/leads/actions";

const OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "חדש" },
  { value: "contacted", label: "נוצר קשר" },
  { value: "qualified", label: "מתאים" },
  { value: "converted", label: "הומר ללקוח" },
  { value: "lost", label: "אבוד" },
];

export function LeadStatusSelect({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) =>
        startTransition(() => {
          void updateLeadStatus(leadId, e.target.value as LeadStatus);
        })
      }
      className="rounded-lg border border-border bg-surface px-2 py-1 text-sm"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
