import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatIls } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  const minQty = product.wholesaleMinQty ?? 10;
  const wholesalePrice =
    typeof product.wholesalePriceIls === "number" && product.wholesalePriceIls > 0
      ? product.wholesalePriceIls
      : Math.max(1, Math.round(product.priceIls * 0.8 * 100) / 100);
  const discountPercent = Math.round(
    ((product.priceIls - wholesalePrice) / (product.priceIls || 1)) * 100
  );

  return (
    <Link
      href={`/product/${product.slug}`}
      className="atelier-card group flex flex-col overflow-hidden rounded-xl border border-[#c59b5f]/30 transition-all duration-300 hover:border-[#dfb37c]/70 hover:shadow-[0_8px_30px_rgba(197,155,95,0.25)]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[#18110c]">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#8a7b6b] text-sm">
            אין תמונה
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#130e0b]/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {discountPercent > 0 && (
          <span className="absolute top-2 right-2 rounded-full border border-[#c59b5f]/50 bg-[#140e0b]/90 px-2 py-0.5 text-[10px] font-bold text-[#eed3a2] backdrop-blur-sm">
            הנחת כמות
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 bg-[#140e0b]/90">
        <h3 className="line-clamp-2 text-sm font-medium text-[#f3ede2] transition-colors group-hover:text-[#faebd7]">
          {product.name}
        </h3>

        {/* Pricing Area: Unit Price + Bulk Price */}
        <div className="mt-auto space-y-1.5 pt-2 border-t border-[#2d2118]">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-[#aa9c8d]">מחיר ליחידה:</span>
            <span className="text-sm font-bold text-[#fbf8f2]">
              {formatIls(product.priceIls)}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-[#1c130e] px-2.5 py-1 border border-[#c59b5f]/30">
            <span className="text-[11px] font-medium text-[#eed3a2]">
              לכמות ({minQty}+):
            </span>
            <span className="text-xs font-bold text-gold-gradient">
              {formatIls(wholesalePrice)} <span className="text-[10px] font-normal text-[#aa9c8d]">/ יח&apos;</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
