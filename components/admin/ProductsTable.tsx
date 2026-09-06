"use client";

import { useMemo, useState } from "react";
import type { Category, Product } from "@/lib/types";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { ProductPricingRow } from "@/components/admin/ProductPricingRow";
import { ProductImageCell } from "@/components/admin/ProductImageCell";

const PAGE_SIZE = 40;

export function ProductsTable({ products, categories }: { products: Product[]; categories: Category[] }) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [page, setPage] = useState(1);

  const categoryName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryId !== "all" && p.categoryId !== categoryId) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, query, categoryId]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleFilterChange(fn: () => void) {
    fn();
    setPage(1);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => handleFilterChange(() => setQuery(e.target.value))}
          placeholder="חיפוש מוצר לפי שם..."
          className="w-64 rounded-lg border border-border px-3 py-2 text-sm text-ink outline-none focus:border-brand"
        />
        <select
          value={categoryId}
          onChange={(e) => handleFilterChange(() => setCategoryId(e.target.value))}
          className="rounded-lg border border-border px-3 py-2 text-sm text-ink outline-none focus:border-brand"
        >
          <option value="all">כל הקטגוריות</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <span className="text-sm text-ink-muted">
          {filtered.length} מוצרים {filtered.length !== products.length && `(מתוך ${products.length})`}
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-right text-ink-muted">
            <tr>
              <th className="p-3 font-medium">תמונה</th>
              <th className="p-3 font-medium">שם</th>
              <th className="p-3 font-medium">קטגוריה</th>
              <th className="p-3 font-medium">מחיר יחידה ומחיר לכמות</th>
              <th className="p-3 font-medium">סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="p-3">
                  <ProductImageCell product={p} />
                </td>
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
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-ink-muted">
                  לא נמצאו מוצרים התואמים את החיפוש.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-border px-3 py-1.5 text-ink-muted hover:border-brand hover:text-brand disabled:opacity-40"
          >
            הקודם
          </button>
          <span className="text-ink-muted">
            עמוד {currentPage} מתוך {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-border px-3 py-1.5 text-ink-muted hover:border-brand hover:text-brand disabled:opacity-40"
          >
            הבא
          </button>
        </div>
      )}
    </div>
  );
}
