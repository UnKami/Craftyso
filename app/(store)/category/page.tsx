import { CategoryCard } from "@/components/store/CategoryCard";
import { getCategories } from "@/lib/firebase/queries";

export const metadata = { title: "כל הקטגוריות" };

export default async function AllCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-ink">כל הקטגוריות</h1>
      {categories.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      ) : (
        <p className="text-ink-muted">עדיין לא הועלו קטגוריות.</p>
      )}
    </div>
  );
}
