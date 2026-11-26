"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { FREE_SHIPPING_THRESHOLD_ILS } from "@/lib/constants";
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

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD_ILS - totalIls);
  const freeShippingProgress = Math.min(100, Math.round((totalIls / FREE_SHIPPING_THRESHOLD_ILS) * 100));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="font-serif-hebrew text-3xl font-bold text-[#fbf8f2]">עגלת קניות</h1>
        <Link href="/category" className="text-xs font-medium text-[#c59b5f] hover:text-[#eed3a2]">
          המשך קנייה ←
        </Link>
      </div>

      {/* Free Shipping Progress Bar */}
      <div className="mb-6 rounded-xl border border-[#c59b5f]/30 bg-[#140e0b] p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          {remainingForFreeShipping > 0 ? (
            <span className="text-[#c7b9a8]">
              הוסיפו עוד{" "}
              <strong className="text-[#eed3a2]">{formatIls(remainingForFreeShipping)}</strong> לקבלת{" "}
              <strong className="text-[#7fe09b]">משלוח חינם עד הבית!</strong>
            </span>
          ) : (
            <span className="font-semibold text-[#7fe09b]">
              ✓ זכאים למשלוח שליח עד הבית בחינם!
            </span>
          )}
          <span className="text-[#8a7b6b]">{freeShippingProgress}%</span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-[#241a13]"
          role="progressbar"
          aria-valuenow={freeShippingProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="התקדמות למשלוח חינם"
        >
          <div
            className="h-full rounded-full bg-gradient-to-l from-[#dfb37c] to-[#8f5823] transition-all duration-500"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      <ul className="divide-y divide-[#2d2118] rounded-2xl border border-[#2d2118] bg-[#140e0b]">
        {lines.map((line, idx) => (
          <li
            key={`${line.productId}-${idx}`}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
          >
            <div className="flex items-center gap-3">
              {/* Product Blank Image */}
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#c59b5f]/30 bg-[#1a130f]">
                {line.image && (
                  <Image
                    src={line.image}
                    alt={line.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                )}
              </div>

              {/* Custom Artwork thumbnail if available */}
              {line.customArtworkUrl && (
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#c59b5f] bg-[#1a130f] p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={line.customArtworkUrl}
                    alt="קובץ גרפי"
                    className="max-h-full max-w-full object-contain"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-black/80 text-center text-[9px] text-[#eed3a2]">
                    גרפיקה
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="font-medium text-[#f3ede2]">{line.name}</p>
              <p className="text-sm font-semibold text-[#eed3a2]">
                {formatIls(line.priceIls)}{" "}
                <span className="text-xs font-normal text-[#8a7b6b]">
                  (סה&quot;כ {formatIls(line.priceIls * line.quantity)})
                </span>
              </p>

              {line.customSpecs && (
                <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] text-[#aa9c8d]">
                  <span className="rounded border border-[#2d2118] bg-[#1a130f] px-1.5 py-0.5">
                    {line.customSpecs.technique}
                  </span>
                  <span className="rounded border border-[#2d2118] bg-[#1a130f] px-1.5 py-0.5">
                    {line.customSpecs.widthCm}×{line.customSpecs.heightCm} ס&quot;מ
                  </span>
                  <span className="rounded border border-[#2d2118] bg-[#1a130f] px-1.5 py-0.5">
                    בסיס: {line.customSpecs.baseColor}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <div className="inline-flex items-center rounded-lg border border-[#c59b5f]/40 bg-[#1a130f]">
                <button
                  type="button"
                  aria-label={`הפחת כמות של ${line.name}`}
                  onClick={() =>
                    setQuantity(
                      line.productId,
                      Math.max(1, line.quantity - 1),
                      line.customArtworkUrl,
                    )
                  }
                  className="px-2.5 py-1 text-sm text-[#eed3a2] transition hover:bg-[#2a1f18] hover:text-white"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  aria-label={`כמות של ${line.name}`}
                  value={line.quantity}
                  onChange={(e) =>
                    setQuantity(
                      line.productId,
                      Math.max(1, Number(e.target.value) || 1),
                      line.customArtworkUrl,
                    )
                  }
                  className="w-12 bg-transparent py-1 text-center text-sm text-[#f3ede2] outline-none"
                />
                <button
                  type="button"
                  aria-label={`הוסף כמות של ${line.name}`}
                  onClick={() =>
                    setQuantity(line.productId, line.quantity + 1, line.customArtworkUrl)
                  }
                  className="px-2.5 py-1 text-sm text-[#eed3a2] transition hover:bg-[#2a1f18] hover:text-white"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeItem(line.productId, line.customArtworkUrl)}
                className="text-sm text-[#aa9c8d] transition hover:text-[#e87a7a]"
              >
                הסרה
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-4 border-t border-[#2d2118] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="block text-xl font-bold text-gold-gradient">
            סכום ביניים: {formatIls(totalIls)}
          </span>
          <span className="text-xs text-[#8a7b6b]">
            עלות המשלוח תיבחר ותחושב בשלב הבא (כולל איסוף עצמי חינם)
          </span>
        </div>
        <Link
          href="/checkout"
          className="bg-gold-gradient-btn rounded-full px-8 py-3.5 text-center text-sm font-semibold text-white transition hover:brightness-110"
        >
          מעבר לתשלום מאובטח
        </Link>
      </div>
    </div>
  );
}
