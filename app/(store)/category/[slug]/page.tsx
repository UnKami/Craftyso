import { notFound } from "next/navigation";
import { PaginatedProductGrid } from "@/components/store/PaginatedProductGrid";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/firebase/queries";

type Props = { params: Promise<{ slug: string }> };

export default async function CategoryPage({ params }: Props) {
  const rawParams = await params;
  const decodedSlug = decodeURIComponent(rawParams.slug);
  const category =
    (await getCategoryBySlug(decodedSlug)) || (await getCategoryBySlug(rawParams.slug));
  if (!category) notFound();

  const products = await getProductsByCategory(category.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 border-b border-[#2d2118] pb-5">
        <span className="text-xs font-semibold tracking-wider text-[#c59b5f] uppercase">
          מחלקת
        </span>
        <h1 className="font-serif-hebrew text-3xl font-bold text-[#fbf8f2] md:text-4xl">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#aa9c8d]">
            {category.description}
          </p>
        )}
      </div>

      {products.length > 0 ? (
        <PaginatedProductGrid products={products} />
      ) : (
        <div className="rounded-2xl border border-dashed border-[#382a20] bg-[#140e0b]/60 p-12 text-center text-sm text-[#aa9c8d]">
          עדיין אין מוצרים זמינים בקטגוריה זו.
        </div>
      )}
    </div>
  );
}
