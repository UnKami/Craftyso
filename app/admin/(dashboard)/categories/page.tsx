import { getCategories } from "@/lib/firebase/queries";
import { listAllProducts } from "@/lib/firebase/admin-queries";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export default async function CategoriesAdminPage() {
  const [categories, products] = await Promise.all([getCategories(), listAllProducts()]);

  const productCounts: Record<string, number> = {};
  for (const p of products) {
    if (p.categoryId) {
      productCounts[p.categoryId] = (productCounts[p.categoryId] ?? 0) + 1;
    }
  }

  return <CategoriesManager categories={categories} productCounts={productCounts} />;
}
