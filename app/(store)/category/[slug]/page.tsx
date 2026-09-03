import { notFound } from "next/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/firebase/queries";

type Props = { params: Promise<{ slug: string }> };

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(category.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-ink">{category.name}</h1>
      {category.description && (
        <p className="mb-6 max-w-2xl text-ink-muted">{category.description}</p>
      )}

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="text-ink-muted">עדיין אין מוצרים בקטגוריה זו.</p>
      )}
    </div>
  );
}
