import Link from "next/link";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[#2d2118] bg-[#080605] text-[#f3ede2]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 md:flex-row md:justify-between">
        <div className="max-w-sm space-y-3">
          <div className="flex flex-col">
            <span dir="ltr" className="font-serif-hebrew text-2xl font-bold tracking-widest text-gold-gradient">
              SO
            </span>
            <span className="text-[10px] tracking-[0.2em] text-[#8a7a6a] uppercase">
              ATELIER & HABERDASHERY
            </span>
          </div>
          <p className="text-sm leading-relaxed text-[#aa9c8d]">
            בוטיק אביזרי אופנה, סדקית, רקמה ותפירה המוביל בישראל. איכות ללא פשרות למעצבים, יוצרים וחובבים.
          </p>
          <div className="pt-2 text-sm text-[#aa9c8d]">
            <p>רחוב לבינובסקי 9, תל אביב (קומת קרקע)</p>
            <a
              href="tel:035106888"
              className="mt-1 inline-block font-semibold text-[#dfb37c] transition hover:text-white"
            >
              03-5106888
            </a>
          </div>
        </div>

        <div className="flex gap-12 sm:gap-16">
          <div className="space-y-2.5 text-sm">
            <h3 className="font-serif-hebrew font-semibold tracking-wide text-[#eed3a2]">ניווט בחנות</h3>
            <Link href="/" className="block text-[#aa9c8d] transition hover:text-[#eed3a2]">דף הבית</Link>
            <Link href="/category" className="block text-[#aa9c8d] transition hover:text-[#eed3a2]">כל הקטגוריות</Link>
            <Link href="/category/fashion-accessories" className="block text-[#aa9c8d] transition hover:text-[#eed3a2]">אביזרי אופנה</Link>
            <Link href="/category/sewing-accessories" className="block text-[#aa9c8d] transition hover:text-[#eed3a2]">אביזרי תפירה</Link>
          </div>

          <div className="space-y-2.5 text-sm">
            <h3 className="font-serif-hebrew font-semibold tracking-wide text-[#eed3a2]">מידע ושירות</h3>
            <Link href="/about" className="block text-[#aa9c8d] transition hover:text-[#eed3a2]">אודותינו</Link>
            <Link href="/shipping" className="block text-[#aa9c8d] transition hover:text-[#eed3a2]">משלוחים והחזרות</Link>
            <Link href="/contact" className="block text-[#aa9c8d] transition hover:text-[#eed3a2]">צור קשר</Link>
          </div>
        </div>

        <div className="max-w-sm space-y-3">
          <h3 className="font-serif-hebrew font-semibold tracking-wide text-[#eed3a2]">
            הצטרפו למועדון הלקוחות
          </h3>
          <p className="text-xs text-[#aa9c8d]">
            קבלו עדכונים על קולקציות חדשות, פאצ&apos;ים בלעדיים והטבות ייחודיות.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-[#1d1612] py-5 text-center text-xs text-[#706456]">
        © {new Date().getFullYear()} SO בוטיק. כל הזכויות שמורות. עיצוב ואיכות בתפירה עילית.
      </div>
    </footer>
  );
}
