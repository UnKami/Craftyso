import Link from "next/link";
import { CategoryCard } from "@/components/store/CategoryCard";
import { ProductCard } from "@/components/store/ProductCard";
import { getCategories, getPublishedProducts } from "@/lib/firebase/queries";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getPublishedProducts(8),
  ]);

  return (
    <div>
      <section className="bg-gradient-to-b from-surface-muted to-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-16 text-center">
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand-dark">
            הבוטיק המוביל לאביזרי אופנה וסדקית בישראל
          </span>
          <h1 className="text-3xl font-bold text-ink sm:text-4xl md:text-5xl">
            כל מה שצריך ליצירה ולתפירה,
            <br className="hidden sm:block" /> במקום אחד
          </h1>
          <p className="max-w-xl text-ink-muted">
            תחרה, סרטים, פאצ&apos;ים, אבזמים, כפתורים וסדקית — מבחר ענק במחירים משתלמים,
            עם משלוח מהיר לכל הארץ.
          </p>
          <Link
            href="/category"
            className="mt-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            לכל הקטגוריות
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="mb-6 text-xl font-bold text-ink">קטגוריות</h2>
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        ) : (
          <EmptyState label="עדיין לא הועלו קטגוריות. חברו את קטלוג המוצרים דרך לוח הניהול." />
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="mb-6 text-xl font-bold text-ink">מוצרים נבחרים</h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <EmptyState label="עדיין לא הועלו מוצרים." />
        )}
      </section>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface-muted p-10 text-center text-sm text-ink-muted">
      {label}
    </div>
  );
}
