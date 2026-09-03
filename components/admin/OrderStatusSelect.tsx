"use client";

import { useTransition } from "react";
import type { OrderStatus } from "@/lib/types";
import { updateOrderStatus } from "@/app/admin/(dashboard)/orders/actions";

const OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "ממתין לתשלום" },
  { value: "paid", label: "שולם" },
  { value: "failed", label: "נכשל" },
  { value: "fulfilled", label: "נשלח" },
  { value: "cancelled", label: "בוטל" },
];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) =>
        startTransition(() => {
          void updateOrderStatus(orderId, e.target.value as OrderStatus);
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
