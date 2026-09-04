"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";
import { formatIls } from "@/lib/format";

export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const minQty = product.wholesaleMinQty ?? 10;
  const wholesalePrice =
    typeof product.wholesalePriceIls === "number" && product.wholesalePriceIls > 0
      ? product.wholesalePriceIls
      : Math.max(1, Math.round(product.priceIls * 0.8 * 100) / 100);

  const isWholesaleActive = quantity >= minQty;
  const unitPrice = isWholesaleActive ? wholesalePrice : product.priceIls;
  const totalPrice = unitPrice * quantity;
  const regularTotal = product.priceIls * quantity;
  const savings = Math.max(0, regularTotal - totalPrice);

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        priceIls: unitPrice,
        image: product.images[0],
      },
      quantity,
    );
    setAdded(true);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Quantity Selector with Quick Increment Buttons */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="qty" className="text-sm font-medium text-[#c7b9a8]">
            בחר כמות:
          </label>
          <span className="text-xs text-[#eed3a2]">
            {isWholesaleActive ? (
              <span className="font-bold text-[#7fe09b]">
                ✓ הופעל מחיר כמות: {formatIls(unitPrice)} ליח&apos;
              </span>
            ) : (
              <span>
                הוסיפו עוד {minQty - quantity} יח&apos; למחיר סיטונאי (
                {formatIls(wholesalePrice)} ליח&apos;)
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-[#c59b5f]/40 bg-[#16100c]">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2 text-base font-bold text-[#eed3a2] hover:text-white"
            >
              -
            </button>
            <input
              id="qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="w-14 bg-transparent py-1.5 text-center text-base font-bold text-[#fbf8f2] outline-none"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-2 text-base font-bold text-[#eed3a2] hover:text-white"
            >
              +
            </button>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {[1, 5, 10, 20, 50].map((qty) => (
              <button
                key={qty}
                type="button"
                onClick={() => setQuantity(qty)}
                className={`rounded-lg px-2.5 py-1.5 font-medium transition ${
                  quantity === qty
                    ? "bg-[#c59b5f] text-[#0c0907] font-bold"
                    : "border border-[#2d2118] bg-[#140e0b] text-[#aa9c8d] hover:border-[#c59b5f]/50 hover:text-white"
                }`}
              >
                {qty} {qty >= minQty ? "★" : ""}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Total & Savings Banner */}
      <div className="flex items-center justify-between rounded-xl border border-[#2d2118] bg-[#140e0b] p-3.5">
        <div>
          <span className="block text-xs text-[#aa9c8d]">סה&quot;כ לתשלום:</span>
          <span className="text-xl font-bold text-gold-gradient">
            {formatIls(totalPrice)}
          </span>
        </div>
        {savings > 0 && (
          <div className="rounded-lg bg-[#7fe09b]/15 px-3 py-1 text-xs font-bold text-[#7fe09b] border border-[#7fe09b]/30">
            חסכת {formatIls(savings)}!
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          className="bg-gold-gradient-btn flex-1 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-all transform hover:-translate-y-0.5"
        >
          הוספה לסל • {formatIls(totalPrice)}
        </button>
        {added && (
          <button
            onClick={() => router.push("/cart")}
            className="rounded-full border border-[#c59b5f]/50 bg-[#1a130f] px-6 py-3.5 text-sm font-semibold text-[#eed3a2] transition hover:border-[#dfb37c] hover:text-white"
          >
            לצפייה בעגלה ←
          </button>
        )}
      </div>
    </div>
  );
}
