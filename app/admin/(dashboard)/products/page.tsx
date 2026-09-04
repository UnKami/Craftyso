import { listAllProducts } from "@/lib/firebase/admin-queries";
import { getCategories } from "@/lib/firebase/queries";
import { AddProductForm } from "@/components/admin/AddProductForm";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { ProductPricingRow } from "@/components/admin/ProductPricingRow";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([listAllProducts(), getCategories()]);
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));

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
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-right text-ink-muted">
              <tr>
                <th className="p-3 font-medium">שם</th>
                <th className="p-3 font-medium">קטגוריה</th>
                <th className="p-3 font-medium">מחיר יחידה ומחיר לכמות</th>
                <th className="p-3 font-medium">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-medium text-ink">{p.name}</td>
                  <td className="p-3">{categoryName.get(p.categoryId) ?? "—"}</td>
                  <td className="p-3">
                    <ProductPricingRow product={p} />
                  </td>
                  <td className="p-3">
                    <PublishToggle productId={p.id} published={p.published} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
