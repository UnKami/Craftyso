"use client";

import { useState, useTransition } from "react";
import type { Product } from "@/lib/types";
import { formatIls } from "@/lib/format";
import { updateProductPricing } from "@/app/admin/(dashboard)/products/actions";

export function ProductPricingRow({ product }: { product: Product }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [price, setPrice] = useState(String(product.priceIls));
  const [wholesalePrice, setWholesalePrice] = useState(
    product.wholesalePriceIls !== undefined && product.wholesalePriceIls !== null
      ? String(product.wholesalePriceIls)
      : ""
  );
  const [minQty, setMinQty] = useState(String(product.wholesaleMinQty ?? 10));

  function handleSave() {
    startTransition(async () => {
      await updateProductPricing({
        productId: product.id,
        priceIls: Number(price) || 0,
        wholesalePriceIls: wholesalePrice ? Number(wholesalePrice) : null,
        wholesaleMinQty: minQty ? Number(minQty) : 10,
      });
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <div>
          <span className="font-medium text-ink">{formatIls(product.priceIls)}</span>
          {product.wholesalePriceIls ? (
            <span className="mr-2 text-xs font-semibold text-brand">
              (לכמות {product.wholesaleMinQty ?? 10}+: {formatIls(product.wholesalePriceIls)})
            </span>
          ) : (
            <span className="mr-2 text-xs text-ink-muted">(אין מחיר כמות)</span>
          )}
        </div>
        <button
          onClick={() => setEditing(true)}
          className="rounded border border-border px-2 py-0.5 text-xs text-ink-muted hover:border-brand hover:text-brand"
        >
          עריכה
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      <label className="flex items-center gap-1 text-xs text-ink-muted">
        יחידה:
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-16 rounded border border-border px-1 py-0.5 text-xs text-ink"
        />
      </label>
      <label className="flex items-center gap-1 text-xs text-ink-muted">
        כמות:
        <input
          type="number"
          placeholder="מחיר"
          value={wholesalePrice}
          onChange={(e) => setWholesalePrice(e.target.value)}
          className="w-16 rounded border border-border px-1 py-0.5 text-xs text-ink"
        />
      </label>
      <label className="flex items-center gap-1 text-xs text-ink-muted">
        מ-
        <input
          type="number"
          value={minQty}
          onChange={(e) => setMinQty(e.target.value)}
          className="w-12 rounded border border-border px-1 py-0.5 text-xs text-ink"
        />
        יח&apos;
      </label>
      <button
        onClick={handleSave}
        disabled={pending}
        className="rounded bg-brand px-2 py-0.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        שמור
      </button>
      <button
        onClick={() => setEditing(false)}
        className="text-xs text-ink-muted hover:text-ink"
      >
        ביטול
      </button>
    </div>
  );
}
