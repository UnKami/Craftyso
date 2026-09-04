import Image from "next/image";
import Link from "next/link";
import { CategoryCard } from "@/components/store/CategoryCard";
import { ProductCard } from "@/components/store/ProductCard";
import { getCategories, getPublishedProducts } from "@/lib/firebase/queries";

// Canonical showcase categories corresponding precisely to the design mockup
const SHOWCASE_CARDS = [
  {
    title: "אביזרים לתפירה",
    slug: "sewing-accessories",
    image: "/images/categories/sewing-accessories.jpg",
    alt: "חוטי תפירה וסלילים איכותיים",
  },
  {
    title: "אבזמים",
    slug: "buckles",
    image: "/images/categories/buckles.jpg",
    alt: "אבזמי מתכת וברונזה עתיקה",
  },
  {
    title: "אביזרי אופנה",
    slug: "fashion-accessories",
    image: "/images/categories/fashion-accessories.jpg",
    alt: "פאצ'ים רקומים, כתרים וסיכות קוטור",
  },
  {
    title: "בדים וטקסטיל",
    slug: "fabrics",
    image: "/images/categories/fabrics-tools.jpg",
    alt: "כלי חייטות, עורות ובדים מובחרים",
  },
];

import { DealsMarquee } from "@/components/store/DealsMarquee";
import { RollingSpecialOffers } from "@/components/store/RollingSpecialOffers";
import { CustomProductsSection } from "@/components/store/CustomProductsSection";
import { TriptychHeroVisual } from "@/components/store/TriptychHeroVisual";
import { HeroGoldenStreaks } from "@/components/store/HeroGoldenStreaks";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getPublishedProducts(8),
  ]);

  return (
    <div className="flex flex-col">
      {/* 1. HERO SECTION: 3-Panel Architectural Triptych on Left + Glowing Golden Streaks + Haute Couture Typography on Right */}
      <section className="relative min-h-[660px] lg:min-h-[720px] overflow-hidden border-b border-[#3d2b1f] bg-[#0c0806]">
        {/* Real dark wood atelier workbench foundation */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <Image
            src="/images/hero/hero-atelier.jpg"
            alt="SO בוטיק אטלייה לתפירה"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-45 brightness-90 contrast-120"
          />
          {/* Deep luxury vignette overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0907] via-[#0c0806]/60 to-[#0c0907]/90" />
          {/* Warm radial spotlight on the right side behind typography */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_40%,_rgba(212,175,55,0.28)_0%,_rgba(180,130,70,0.12)_45%,_transparent_75%)]" />
        </div>

        {/* Dynamic Luminous Golden Streaks weaving across hero & triptych */}
        <HeroGoldenStreaks />

        {/* Unified Hero Container: Left side is 3-Panel Triptych, Right side is Typography & CTAs */}
        <div
          dir="ltr"
          className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full min-h-[660px] lg:min-h-[720px] flex flex-col-reverse lg:flex-row items-center justify-between gap-10 lg:gap-14 py-10 lg:py-14"
        >
          {/* PHYSICAL LEFT: 3-Panel Architectural Triptych */}
          <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-start">
            <TriptychHeroVisual />
          </div>

          {/* PHYSICAL RIGHT: Typography, Storytelling & CTAs (Hebrew RTL) */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center text-right" dir="rtl">
            {/* Tagline */}
            <span className="mb-3 text-xs font-semibold tracking-wider text-[#eed3a2] drop-shadow-[0_2px_10px_rgba(201,154,101,0.3)]">
              הספק המוביל לצעירי האופנה ובתי החייטות המובילים בישראל
            </span>

            {/* Headline matching user reference */}
            <h1 className="font-serif-hebrew text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight text-[#fbf8f2]">
              כל מה שצריך ליצירה ולתפירה
              <span className="mt-2 block font-serif-hebrew text-gold-gradient drop-shadow-[0_4px_25px_rgba(212,175,55,0.5)]">
                במקום אחד
              </span>
            </h1>

            {/* Editorial storytelling copy */}
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#c7b9a8] sm:text-base md:text-lg">
              כפתורים, סרטים, פאצ&apos;ים, אבזמים, תחרות מובחרות ובדי יוקרה — מבחר עשיר במחירי יבואן ישירים, משלוח מהיר לכל הארץ.
            </p>

            {/* Action Items & Directional Impulses */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#special-offers"
                className="bg-gold-gradient-btn inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-all transform hover:-translate-y-0.5 shadow-[0_10px_30px_rgba(201,154,101,0.4)]"
              >
                <span>חקור את כל הקולקציות</span>
                <span className="text-base animate-bounce">↓</span>
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-[#c59b5f]/45 bg-[#16100c]/80 px-6 py-3.5 text-sm font-medium text-[#dfb37c] backdrop-blur-sm transition-all hover:border-[#dfb37c] hover:bg-[#1f1510] hover:text-white"
              >
                הזמנות סיטונאיות וייעוץ
              </Link>
            </div>

            {/* Atelier Trust & Prestige Counters (Matching Reference) */}
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-[#2d2118] pt-6 w-full max-w-lg">
              <div>
                <span className="font-serif-hebrew block text-2xl font-bold text-gold-gradient sm:text-3xl">
                  230+
                </span>
                <span className="text-xs text-[#aa9c8d]">חברות ובתי אופנה</span>
              </div>
              <div>
                <span className="font-serif-hebrew block text-2xl font-bold text-gold-gradient sm:text-3xl">
                  1,500+
                </span>
                <span className="text-xs text-[#aa9c8d]">אביזרי אופנה וסדקית</span>
              </div>
              <div>
                <span className="font-serif-hebrew block text-2xl font-bold text-gold-gradient sm:text-3xl">
                  24-72h
                </span>
                <span className="text-xs text-[#aa9c8d]">משלוח מהיר עד הדלת</span>
              </div>
            </div>

            {/* Teaser prompt inviting the user down to the rolling special offers */}
            <div className="mt-8 flex items-center gap-2 text-xs text-[#eed3a2]/80">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
              <span>המשיכו לגלול: פריטי סדקית נבחרים ומציאות בזק החל מ-₪5 בלבד ממש מתחת ↓</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ROLLING SPECIAL OFFERS BANNER: Cheap items marked with discount design */}
      <RollingSpecialOffers />

      {/* 3. HORIZONTAL STRIP: ROLLING DEALS TICKER (מבצעים מתגלגלים) */}
      <DealsMarquee />

      {/* 4. CUSTOM PRODUCTS SECTION: Items users can customize with their own artwork */}
      <CustomProductsSection />

      {/* 5. CATEGORIES SECTION (Placed after custom section) */}
      <section className="relative z-20 mx-auto w-full max-w-6xl px-4 pt-14 pb-8">
        <div className="mb-8 flex items-end justify-between border-b border-[#2d2118] pb-4">
          <div>
            <span className="text-xs font-semibold tracking-wider text-[#c59b5f] uppercase">
              מחלקות מובחרות וקולקציות • ATELIER DEPARTMENTS
            </span>
            <h2 className="font-serif-hebrew text-2xl font-bold text-[#fbf8f2] sm:text-3xl">
              קטגוריות ראשיות
            </h2>
            <p className="mt-1 text-xs text-[#c7b9a8] max-w-lg">
              בואו לגלות עולמות יצירה עשירים: פאצ&apos;ים רקומים, כפתורי קוטור, אבזמי וינטג&apos; ובדי חייטות מובחרים.
            </p>
          </div>
          <Link
            href="/category"
            className="text-xs font-medium text-[#eed3a2] transition hover:text-white sm:text-sm"
          >
            לכל הקטגוריות ←
          </Link>
        </div>

        {/* 4 Showcase Featured Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-5">
          {SHOWCASE_CARDS.map((card) => (
            <Link
              key={card.slug}
              href={`/category/${card.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-[#c59b5f]/45 bg-[#140e0b] shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-[#f3ce8a] hover:shadow-[0_0_25px_rgba(197,155,95,0.3)] hover:-translate-y-1.5"
            >
              {/* Inner Square Photo */}
              <div className="relative aspect-square w-full overflow-hidden bg-[#1a130f]">
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#140e0b] via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
              </div>

              {/* Card Title beneath image */}
              <div className="flex items-center justify-center p-3 text-center bg-[#140e0b] border-t border-[#2d2118]">
                <span className="font-serif-hebrew text-sm font-semibold tracking-wide text-[#eed3a2] transition-colors group-hover:text-white sm:text-base">
                  {card.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Value Proposition Trust Bar */}
      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-[#2d2118] bg-[#140e0b]/80 p-6 backdrop-blur-sm sm:grid-cols-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#c59b5f]/40 bg-[#1e1510] text-[#dfb37c]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#f3ede2] sm:text-sm">משלוח מהיר</h4>
              <p className="text-[11px] text-[#aa9c8d]">לכל חלקי הארץ</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#c59b5f]/40 bg-[#1e1510] text-[#dfb37c]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#f3ede2] sm:text-sm">איכות פרימיום</h4>
              <p className="text-[11px] text-[#aa9c8d]">פריטים נבחרים בלבד</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#c59b5f]/40 bg-[#1e1510] text-[#dfb37c]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#f3ede2] sm:text-sm">ייעוץ מקצועי</h4>
              <p className="text-[11px] text-[#aa9c8d]">למעצבים וחובבים</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#c59b5f]/40 bg-[#1e1510] text-[#dfb37c]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#f3ede2] sm:text-sm">קנייה מאובטחת</h4>
              <p className="text-[11px] text-[#aa9c8d]">בתקני אבטחה מחמירים</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between border-b border-[#2d2118] pb-4">
          <div>
            <span className="text-xs font-semibold tracking-wider text-[#c59b5f] uppercase">
              קולקציה מובחרת • ATELIER HIGHLIGHTS
            </span>
            <h2 className="font-serif-hebrew text-2xl font-bold text-[#fbf8f2] sm:text-3xl">
              מוצרים נבחרים לרכישה מהירה
            </h2>
            <p className="mt-1 text-xs text-[#c7b9a8] max-w-lg">
              מחירון שקוף ליחידים ולכמויות סיטונאיות, פריטים מובילים במלאי מיידי המוצגים במהדורת בוטיק מובחרת.
            </p>
          </div>
          <Link
            href="/category"
            className="text-xs font-medium text-[#eed3a2] transition hover:text-white sm:text-sm"
          >
            לכל הפריטים ←
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <EmptyState label="עדיין לא הועלו מוצרים לקטלוג. מוצרים שיועלו יופיעו כאן בעיצוב הבוטיק." />
        )}
      </section>

      {/* Full Categories Explorer Section */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="mb-8 flex items-end justify-between border-b border-[#2d2118] pb-4">
            <div>
              <span className="text-xs font-semibold tracking-wider text-[#c59b5f] uppercase">
                כל מחלקות החנות • FULL CATALOG
              </span>
              <h2 className="font-serif-hebrew text-2xl font-bold text-[#fbf8f2] sm:text-3xl">
                ארכיון הקטגוריות המלא
              </h2>
              <p className="mt-1 text-xs text-[#c7b9a8]">
                למעלה מ-1,500 פריטי סדקית, אופנה ותפירה מסודרים לפי מחלקות עיצוב.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        </section>
      )}

      {/* Atelier Banner / Callout */}
      <section className="border-t border-[#2d2118] bg-gradient-to-b from-[#140e0b] to-[#0c0907] py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center">
          <span className="font-serif-hebrew text-lg italic text-[#c59b5f]">
            SO Atelier & Haberdashery
          </span>
          <h3 className="mt-2 font-serif-hebrew text-2xl font-bold text-[#fbf8f2] sm:text-3xl">
            המקום שבו אופנה, יצירה ומסורת נפגשים
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#aa9c8d]">
            מבחר עשיר של פאצ&apos;ים מעוצבים, תחרות מובחרות, סרטים אלגנטיים ואביזרי תפירה למעצבים, חייטים
            ולכל מי שאוהב ליצור בעבודת יד.
          </p>
          <div className="mt-6 flex gap-4">
            <Link
              href="/about"
              className="rounded-full border border-[#c59b5f]/50 bg-[#1a130f] px-6 py-2.5 text-xs font-semibold text-[#eed3a2] transition hover:border-[#dfb37c] hover:text-white"
            >
              קראו עוד אודותינו
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#382a20] bg-[#140e0b]/60 p-12 text-center text-sm text-[#aa9c8d]">
      <p>{label}</p>
    </div>
  );
}
