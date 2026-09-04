"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatIls } from "@/lib/format";

export default function CartPage() {
  const { lines, setQuantity, removeItem, totalIls } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="rounded-2xl border border-dashed border-[#382a20] bg-[#140e0b]/60 p-12">
          <h1 className="font-serif-hebrew mb-3 text-2xl font-bold text-[#fbf8f2]">העגלה שלכם ריקה</h1>
          <p className="mb-6 text-sm text-[#aa9c8d]">הוסיפו פריטים נבחרים מהקטלוג והם יופיעו כאן.</p>
          <Link
            href="/category"
            className="bg-gold-gradient-btn inline-block rounded-full px-6 py-2.5 text-sm font-semibold text-white"
          >
            חזרה לקטלוג
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif-hebrew mb-6 text-3xl font-bold text-[#fbf8f2]">עגלת קניות</h1>

      <ul className="divide-y divide-[#2d2118] rounded-2xl border border-[#2d2118] bg-[#140e0b]">
        {lines.map((line, idx) => (
          <li key={`${line.productId}-${idx}`} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <div className="flex items-center gap-3">
              {/* Product Blank Image */}
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#c59b5f]/30 bg-[#1a130f]">
                {line.image && (
                  <Image src={line.image} alt={line.name} fill className="object-cover" />
                )}
              </div>

              {/* Custom Artwork thumbnail if available */}
              {line.customArtworkUrl && (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-dashed border-[#c59b5f] bg-[#1a130f] p-1 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={line.customArtworkUrl}
                    alt="קובץ גרפי"
                    className="max-h-full max-w-full object-contain"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] text-center text-[#eed3a2]">
                    גרפיקה
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="font-medium text-[#f3ede2]">{line.name}</p>
              <p className="text-sm font-semibold text-[#eed3a2]">{formatIls(line.priceIls)}</p>

              {line.customSpecs && (
                <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] text-[#aa9c8d]">
                  <span className="rounded bg-[#1a130f] px-1.5 py-0.5 border border-[#2d2118]">
                    {line.customSpecs.technique}
                  </span>
                  <span className="rounded bg-[#1a130f] px-1.5 py-0.5 border border-[#2d2118]">
                    {line.customSpecs.widthCm}×{line.customSpecs.heightCm} ס&quot;מ
                  </span>
                  <span className="rounded bg-[#1a130f] px-1.5 py-0.5 border border-[#2d2118]">
                    בסיס: {line.customSpecs.baseColor}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <input
                type="number"
                min={1}
                value={line.quantity}
                onChange={(e) =>
                  setQuantity(line.productId, Number(e.target.value) || 1, line.customArtworkUrl)
                }
                className="w-16 rounded-lg border border-[#c59b5f]/40 bg-[#1a130f] px-2 py-1 text-center text-[#f3ede2] outline-none focus:border-[#dfb37c]"
              />
              <button
                onClick={() => removeItem(line.productId, line.customArtworkUrl)}
                className="text-sm text-[#aa9c8d] transition hover:text-[#e87a7a]"
              >
                הסרה
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-between border-t border-[#2d2118] pt-6">
        <span className="text-xl font-bold text-gold-gradient">סה&quot;כ: {formatIls(totalIls)}</span>
        <Link
          href="/checkout"
          className="bg-gold-gradient-btn rounded-full px-8 py-3.5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          מעבר לתשלום
        </Link>
      </div>
    </div>
  );
}
