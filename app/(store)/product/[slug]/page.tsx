import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/firebase/queries";
import { formatIls } from "@/lib/format";
import { AddToCart } from "@/components/store/AddToCart";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const image = product.images[0];

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-muted">
        {image ? (
          <Image src={image} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-muted">אין תמונה</div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-ink">{product.name}</h1>
        <p className="text-2xl font-semibold text-brand-dark">{formatIls(product.priceIls)}</p>
        {product.description && (
          <p className="whitespace-pre-line text-ink-muted">{product.description}</p>
        )}
        <AddToCart product={product} />
      </div>
    </div>
  );
}
