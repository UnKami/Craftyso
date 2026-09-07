"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

const PAGE_SIZE = 24;

export function PaginatedProductGrid({ products }: { products: Product[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = products.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {pageItems.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3 text-sm">
          <button
            onClick={() => {
              setPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={currentPage === 1}
            className="rounded-full border border-[#c59b5f]/40 px-4 py-2 text-[#aa9c8d] transition hover:border-[#eed3a2] hover:text-white disabled:opacity-30"
          >
            הקודם
          </button>
          <span className="text-[#aa9c8d]">
            עמוד {currentPage} מתוך {totalPages}
          </span>
          <button
            onClick={() => {
              setPage((p) => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={currentPage === totalPages}
            className="rounded-full border border-[#c59b5f]/40 px-4 py-2 text-[#aa9c8d] transition hover:border-[#eed3a2] hover:text-white disabled:opacity-30"
          >
            הבא
          </button>
        </div>
      )}
    </div>
  );
}
