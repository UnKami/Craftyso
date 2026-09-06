"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { updateProductImage } from "@/app/admin/(dashboard)/products/actions";

export function ProductImageCell({ product }: { product: Product }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState(product.images[0] ?? "");
  const currentImage = product.images[0];

  function handleSave() {
    startTransition(async () => {
      await updateProductImage({ productId: product.id, imageUrl: imageUrl.trim() });
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        {currentImage ? (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted">
            <Image src={currentImage} alt={product.name} fill className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-[10px] text-ink-muted">
            אין תמונה
          </div>
        )}
        <button
          onClick={() => setEditing(true)}
          className="rounded border border-border px-2 py-0.5 text-xs text-ink-muted hover:border-brand hover:text-brand"
        >
          {currentImage ? "החלפה" : "הוספה"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 py-1">
      <input
        type="text"
        placeholder="קישור לתמונה (URL)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="w-48 rounded border border-border px-2 py-1 text-xs text-ink"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={pending}
          className="rounded bg-brand px-2 py-0.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          שמור
        </button>
        <button onClick={() => setEditing(false)} className="text-xs text-ink-muted hover:text-ink">
          ביטול
        </button>
      </div>
    </div>
  );
}
