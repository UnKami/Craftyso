"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";
import { CartButton } from "./CartButton";
import { AccountButton } from "./AccountButton";
import { MainNav } from "./MainNav";

export function Header({ categories }: { categories: Category[] }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/category?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#2d2118]/80 bg-[#0d0907]/92 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        {/* Right side (in RTL): Contact phone */}
        <div className="flex items-center gap-3">
          <a
            href="tel:035106888"
            className="flex items-center gap-1.5 text-xs font-medium text-[#c59b5f] transition hover:text-[#eed3a2] md:text-sm"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#c59b5f]"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className="hidden sm:inline text-[#aa9c8d]">צור קשר:</span>
            <span className="font-semibold tracking-wide">03-5106888</span>
          </a>
        </div>

        {/* Center: Brand Logo */}
        <div className="flex flex-col items-center">
          <Link href="/" className="group flex flex-col items-center text-center">
            <Image
              src="/logo/so-logo.png"
              alt="SO"
              width={960}
              height={590}
              priority
              className="h-9 w-auto transition duration-300 group-hover:brightness-125 md:h-11"
            />
            <span className="text-[10px] tracking-[0.25em] text-[#8a7a6a] uppercase transition group-hover:text-[#c59b5f]">
              ATELIER & COUTURE
            </span>
          </Link>
        </div>

        {/* Left side (in RTL): Search, Account, Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c59b5f]/40 text-[#dfb37c] transition-all hover:border-[#dfb37c] hover:bg-[#c59b5f]/10 hover:text-white hover:shadow-[0_0_15px_rgba(201,154,101,0.2)]"
            aria-label="חיפוש"
            title="חיפוש"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          <AccountButton />
          <CartButton />
        </div>
      </div>

      {/* Expandable Search Input */}
      {searchOpen && (
        <div className="border-t border-[#2d2118] bg-[#140e0b]/95 px-4 py-3">
          <form onSubmit={handleSearch} className="mx-auto flex max-w-xl items-center gap-2">
            <input
              type="search"
              placeholder="חיפוש אביזרים, פאצ'ים, כפתורים, בדים..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full rounded-full border border-[#c59b5f]/40 bg-[#1e1510] px-5 py-2 text-sm text-[#f3ede2] placeholder-[#8a7b6c] outline-none focus:border-[#dfb37c] focus:ring-1 focus:ring-[#dfb37c]"
            />
            <button
              type="submit"
              className="rounded-full bg-[#875422] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#a66a2e]"
            >
              חיפוש
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="px-2 text-xs text-[#aa9c8d] hover:text-white"
            >
              סגור
            </button>
          </form>
        </div>
      )}

      <MainNav categories={categories} />
    </header>
  );
}
