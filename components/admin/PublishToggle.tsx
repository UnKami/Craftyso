"use client";

import { useTransition } from "react";
import { toggleProductPublished } from "@/app/admin/(dashboard)/products/actions";

export function PublishToggle({ productId, published }: { productId: string; published: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => toggleProductPublished(productId, !published))}
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        published ? "bg-brand/10 text-brand-dark" : "bg-surface-muted text-ink-muted"
      }`}
    >
      {published ? "פורסם" : "טיוטה"}
    </button>
  );
}
