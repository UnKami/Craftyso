"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";

export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        priceIls: product.priceIls,
        image: product.images[0],
      },
      quantity,
    );
    setAdded(true);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <label htmlFor="qty" className="text-sm text-ink-muted">כמות</label>
        <input
          id="qty"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          className="w-16 rounded-lg border border-border px-2 py-1 text-center"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          className="flex-1 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          הוספה לסל
        </button>
        {added && (
          <button
            onClick={() => router.push("/cart")}
            className="rounded-full border border-brand px-6 py-3 text-sm font-semibold text-brand-dark"
          >
            לצפייה בעגלה
          </button>
        )}
      </div>
    </div>
  );
}
