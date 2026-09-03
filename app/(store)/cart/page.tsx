"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatIls } from "@/lib/format";

export default function CartPage() {
  const { lines, setQuantity, removeItem, totalIls } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="mb-3 text-2xl font-bold text-ink">העגלה שלכם ריקה</h1>
        <Link href="/" className="text-brand hover:underline">חזרה לחנות</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-ink">עגלת קניות</h1>

      <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
        {lines.map((line) => (
          <li key={line.productId} className="flex items-center gap-4 p-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
              {line.image && (
                <Image src={line.image} alt={line.name} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-ink">{line.name}</p>
              <p className="text-sm text-ink-muted">{formatIls(line.priceIls)}</p>
            </div>
            <input
              type="number"
              min={1}
              value={line.quantity}
              onChange={(e) => setQuantity(line.productId, Number(e.target.value) || 1)}
              className="w-16 rounded-lg border border-border px-2 py-1 text-center"
            />
            <button
              onClick={() => removeItem(line.productId)}
              className="text-sm text-ink-muted hover:text-brand"
            >
              הסרה
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-lg font-semibold text-ink">סה&quot;כ: {formatIls(totalIls)}</span>
        <Link
          href="/checkout"
          className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          מעבר לתשלום
        </Link>
      </div>
    </div>
  );
}
