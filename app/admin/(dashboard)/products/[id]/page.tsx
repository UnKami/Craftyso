import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, listReviewsForProduct } from "@/lib/firebase/admin-queries";
import { getCategories } from "@/lib/firebase/queries";
import { ProductImagesEditor } from "@/components/admin/ProductImagesEditor";
import { ProductDetailsForm } from "@/components/admin/ProductDetailsForm";
import { ProductPricingRow } from "@/components/admin/ProductPricingRow";
import { ProductReviewsAdmin } from "@/components/admin/ProductReviewsAdmin";
import { PublishToggle } from "@/components/admin/PublishToggle";

type Props = { params: Promise<{ id: string }> };

export default async function ProductDetailAdminPage({ params }: Props) {
  const { id } = await params;
  const [product, categories, reviews] = await Promise.all([
    getProductById(id),
    getCategories(),
    listReviewsForProduct(id),
  ]);

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/products" className="text-xs text-ink-muted hover:text-brand">
            ← חזרה למוצרים
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-ink">{product.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <PublishToggle productId={product.id} published={product.published} />
          <Link
            href={`/product/${product.slug}`}
            target="_blank"
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-ink-muted hover:border-brand hover:text-brand"
          >
            צפייה בעמוד המוצר ↗
          </Link>
        </div>
      </div>

      <ProductImagesEditor productId={product.id} images={product.images} />

      <div className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">תמחור</h2>
        <ProductPricingRow product={product} />
      </div>

      <ProductDetailsForm product={product} categories={categories} />

      <ProductReviewsAdmin productId={product.id} reviews={reviews} />
    </div>
  );
}
