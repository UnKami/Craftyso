"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function CartButton() {
  const { totalItems } = useCart();

  return (
    <Link
      href="/cart"
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#c59b5f]/40 text-[#dfb37c] transition-all hover:border-[#dfb37c] hover:text-white hover:bg-[#c59b5f]/10 hover:shadow-[0_0_15px_rgba(201,154,101,0.2)]"
      aria-label="עגלת קניות"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="21" r="1.4" />
        <circle cx="18" cy="21" r="1.4" />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-[#94622b] to-[#b8864e] border border-[#dfb37c]/50 text-[11px] font-bold text-white shadow-sm">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
