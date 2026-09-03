import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatIls } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:shadow-lg hover:shadow-brand/10"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-surface-muted">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-muted text-sm">
            אין תמונה
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-2 text-sm font-medium text-ink">{product.name}</h3>
        <p className="mt-auto text-base font-semibold text-brand-dark">
          {formatIls(product.priceIls)}
        </p>
      </div>
    </Link>
  );
}
