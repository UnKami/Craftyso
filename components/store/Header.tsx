import Link from "next/link";
import type { Category } from "@/lib/types";
import { CartButton } from "./CartButton";
import { AccountButton } from "./AccountButton";

export function Header({ categories }: { categories: Category[] }) {
  const topCategories = categories.slice(0, 7);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-brand">Crafty.so</span>
          <span className="hidden text-xs text-ink-muted sm:inline">קראפטיסו</span>
        </Link>

        <a
          href="tel:035106888"
          className="hidden text-sm text-ink-muted transition hover:text-brand md:inline"
        >
          03-5106888
        </a>

        <div className="flex items-center gap-2">
          <AccountButton />
          <CartButton />
        </div>
      </div>

      {topCategories.length > 0 && (
        <nav className="border-t border-border">
          <div className="mx-auto flex max-w-6xl gap-5 overflow-x-auto px-4 py-2 text-sm">
            {topCategories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="whitespace-nowrap text-ink-muted transition hover:text-brand"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
