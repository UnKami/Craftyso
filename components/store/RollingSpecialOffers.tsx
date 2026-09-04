"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatIls } from "@/lib/format";
import { useCart } from "@/lib/cart-context";

const SPECIAL_OFFERS = [
  {
    id: "offer-1",
    name: "10 סיכות ביטחון וינטג' ברונזה",
    originalPrice: 15,
    discountPrice: 6,
    discountPercent: 60,
    image: "/images/categories/sewing-accessories.jpg",
    badge: "חיסול מלאי",
    slug: "sewing-accessories",
  },
  {
    id: "offer-2",
    name: "סליל חוט תפירה מטאלי מוזהב",
    originalPrice: 18,
    discountPrice: 8,
    discountPercent: 55,
    image: "/images/craftsmanship/button-sewing.jpg",
    badge: "מבצע בזק",
    slug: "sewing-accessories",
  },
  {
    id: "offer-3",
    name: "זוג אבזמי מתכת מרובעים",
    originalPrice: 22,
    discountPrice: 9,
    discountPercent: 59,
    image: "/images/categories/buckles.jpg",
    badge: "מחיר רצפה",
    slug: "buckles",
  },
  {
    id: "offer-4",
    name: "פאץ' כוכב רקום פייטים",
    originalPrice: 24,
    discountPrice: 12,
    discountPercent: 50,
    image: "/images/craftsmanship/patch-application.jpg",
    badge: "50% הנחה",
    slug: "fashion-accessories",
  },
  {
    id: "offer-5",
    name: "חבילת 20 כפתורי חולצה פנינה",
    originalPrice: 20,
    discountPrice: 10,
    discountPercent: 50,
    image: "/images/custom/custom-button-blank.jpg",
    badge: "מבצע חודש",
    slug: "buckles",
  },
  {
    id: "offer-6",
    name: "סרט סאטן מבריק 5 מטר",
    originalPrice: 14,
    discountPrice: 7,
    discountPercent: 50,
    image: "/images/custom/custom-label-blank.jpg",
    badge: "חצי מחיר",
    slug: "fabrics",
  },
  {
    id: "offer-7",
    name: "גיר חייט מקצועי משולש",
    originalPrice: 12,
    discountPrice: 5,
    discountPercent: 58,
    image: "/images/categories/fabrics-tools.jpg",
    badge: "₪5 בלבד!",
    slug: "sewing-accessories",
  },
  {
    id: "offer-8",
    name: "פורם תפרים איכותי מפלדה",
    originalPrice: 16,
    discountPrice: 8,
    discountPercent: 50,
    image: "/images/craftsmanship/shears-cutting.jpg",
    badge: "מחיר מבצע",
    slug: "sewing-accessories",
  },
];

export function RollingSpecialOffers() {
  const { addItem } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  function handleQuickAdd(offer: (typeof SPECIAL_OFFERS)[0]) {
    addItem({
      productId: offer.id,
      slug: offer.slug,
      name: offer.name,
      priceIls: offer.discountPrice,
      image: offer.image,
    });
    setAddedId(offer.id);
    setTimeout(() => setAddedId(null), 1500);
  }

  return (
    <section
      id="special-offers"
      className="relative z-20 w-full overflow-hidden border-b border-[#2d2118] bg-gradient-to-b from-[#140e0a] via-[#100b07] to-[#0c0805] py-5 scroll-mt-20"
    >
      {/* Top Banner Control Bar */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-7 items-center gap-1.5 rounded-full bg-gradient-to-r from-red-600 via-amber-600 to-amber-700 px-3.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]">
            <span className="animate-pulse">🔥</span>
            מבצעי בזק ומציאות סדקית
          </span>
          <span className="text-xs text-[#eed3a2] hidden sm:inline font-medium">
            פריטים מוזלים במיוחד החל מ-₪5
          </span>
        </div>

        {/* Hover Pause Indicator */}
        <div className="flex items-center gap-2 text-[11px] text-[#aa9c8d]">
          <span className="inline-block h-2 w-2 rounded-full bg-[#d4af37] animate-pulse" />
          <span>מתגלגל רציף • העבירו עכבר כדי לעצור ולבחון פריט</span>
        </div>
      </div>

      {/* Edge gradient masks for seamless smooth entry and exit */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-20 bg-gradient-to-l from-[#140e0a] via-[#140e0a]/80 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-20 bg-gradient-to-r from-[#140e0a] via-[#140e0a]/80 to-transparent" />

      {/* Auto-Rolling Infinite Track (Pauses instantaneously on hover) */}
      <div className="w-full overflow-hidden py-2">
        <div className="animate-roll-offers flex gap-4">
          {[...SPECIAL_OFFERS, ...SPECIAL_OFFERS, ...SPECIAL_OFFERS].map((offer, idx) => (
            <div
              key={`${offer.id}-${idx}`}
              className="group relative flex w-60 shrink-0 flex-col overflow-hidden rounded-2xl border border-[#c59b5f]/35 bg-[#140e0b] shadow-[0_6px_20px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-[#dfb37c] hover:shadow-[0_12px_35px_rgba(197,155,95,0.35)] hover:-translate-y-1.5 hover:scale-[1.02] cursor-pointer"
            >
              {/* Product Thumbnail with Badges */}
              <Link href={`/category/${offer.slug}`} className="block">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1a120c]">
                  <Image
                    src={offer.image}
                    alt={offer.name}
                    fill
                    sizes="240px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#140e0b] via-transparent to-transparent opacity-60" />

                  {/* Discount Percentage Ribbon */}
                  <div className="absolute top-2.5 right-2.5 rounded-md bg-gradient-to-r from-red-600 to-amber-600 px-2 py-0.5 text-[11px] font-black text-white shadow-md">
                    -{offer.discountPercent}%
                  </div>

                  {/* Special Tag Badge */}
                  <div className="absolute bottom-2.5 right-2.5 rounded bg-[#0c0806]/90 px-2 py-0.5 text-[10px] font-medium text-[#eed3a2] backdrop-blur-sm border border-[#c59b5f]/30">
                    {offer.badge}
                  </div>
                </div>
              </Link>

              {/* Item Info & Pricing */}
              <div className="flex flex-1 flex-col p-3">
                <Link href={`/category/${offer.slug}`}>
                  <h4 className="line-clamp-1 text-xs font-semibold text-[#f3ede2] group-hover:text-[#eed3a2] transition-colors">
                    {offer.name}
                  </h4>
                </Link>

                {/* Pricing comparison */}
                <div className="mt-2 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-black text-gold-gradient">
                      {formatIls(offer.discountPrice)}
                    </span>
                    <span className="text-xs text-[#8a7b6c] line-through">
                      {formatIls(offer.originalPrice)}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-red-400">
                    חיסכון {formatIls(offer.originalPrice - offer.discountPrice)}
                  </span>
                </div>

                {/* Quick Add to Cart button */}
                <button
                  type="button"
                  onClick={() => handleQuickAdd(offer)}
                  className={`mt-3 flex w-full items-center justify-center rounded-lg py-1.5 text-xs font-bold transition-all ${
                    addedId === offer.id
                      ? "bg-[#7fe09b] text-[#0c0907]"
                      : "bg-[#1f1510] text-[#eed3a2] border border-[#c59b5f]/40 hover:bg-[#c59b5f] hover:text-[#0c0907]"
                  }`}
                >
                  {addedId === offer.id ? "✓ נוסף לסל!" : "+ הוספה מהירה"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
