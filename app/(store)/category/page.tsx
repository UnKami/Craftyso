import { CategoryCard } from "@/components/store/CategoryCard";
import { getCategories } from "@/lib/firebase/queries";

export const metadata = { title: "כל הקטגוריות" };

export default async function AllCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 border-b border-[#2d2118] pb-5">
        <span className="text-xs font-semibold tracking-wider text-[#c59b5f] uppercase">
          קטלוג החנות
        </span>
        <h1 className="font-serif-hebrew text-3xl font-bold text-[#fbf8f2] md:text-4xl">
          כל הקטגוריות
        </h1>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#382a20] bg-[#140e0b]/60 p-12 text-center text-sm text-[#aa9c8d]">
          עדיין לא הועלו קטגוריות לקטלוג.
        </div>
      )}
    </div>
  );
}
