import { listAllProducts } from "@/lib/firebase/admin-queries";
import { getCategories } from "@/lib/firebase/queries";
import { AddProductForm } from "@/components/admin/AddProductForm";
import { ProductsTable } from "@/components/admin/ProductsTable";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([listAllProducts(), getCategories()]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">מוצרים ומחירים</h1>
        <AddProductForm categories={categories} />
      </div>

      {products.length === 0 ? (
        <p className="text-ink-muted">
          אין עדיין מוצרים. הוסיפו מוצר ידנית, או הריצו את סקריפט ההגירה מהאתר הישן.
        </p>
      ) : (
        <ProductsTable products={products} categories={categories} />
      )}
    </div>
  );
}
