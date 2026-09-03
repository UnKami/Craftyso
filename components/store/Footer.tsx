import Link from "next/link";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  return (
    <footer className="mt-16 bg-brand-dark text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:flex-row md:justify-between">
        <div className="max-w-sm space-y-2">
          <h2 className="text-lg font-bold">קראפטיסו</h2>
          <p className="text-sm text-white/80">
            בוטיק אביזרי אופנה, סדקית ותפירה, המוביל בישראל.
          </p>
          <p className="text-sm text-white/80">רחוב לבינובסקי 9, תל אביב (קומת קרקע)</p>
          <a href="tel:035106888" className="block text-sm text-white/80 hover:text-white">
            03-5106888
          </a>
        </div>

        <div className="flex gap-10">
          <div className="space-y-2 text-sm">
            <h3 className="font-semibold text-white">חנות</h3>
            <Link href="/" className="block text-white/80 hover:text-white">כל הקטגוריות</Link>
            <Link href="/about" className="block text-white/80 hover:text-white">אודות</Link>
            <Link href="/shipping" className="block text-white/80 hover:text-white">משלוחים והחזרות</Link>
            <Link href="/contact" className="block text-white/80 hover:text-white">צור קשר</Link>
          </div>
        </div>

        <div className="max-w-sm space-y-3">
          <h3 className="font-semibold">הצטרפו למועדון הלקוחות</h3>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} קראפטיסו. כל הזכויות שמורות.
      </div>
    </footer>
  );
}
