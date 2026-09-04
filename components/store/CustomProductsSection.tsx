"use client";

import { useState } from "react";
import Image from "next/image";
import { formatIls } from "@/lib/format";
import { CustomizerModal, type CustomTemplateItem } from "./CustomizerModal";

const CUSTOM_ITEMS: CustomTemplateItem[] = [
  {
    id: "custom-patch",
    name: "פאץ' רקום בעיצוב אישי",
    categoryName: "פאצ'ים ורקמות",
    basePrice: 18,
    bulkPrice: 12,
    bulkMinQty: 20,
    templateImage: "/images/custom/custom-patch-blank.jpg",
    defaultTechnique: "רקמת קוטור ממוחשבת",
    description: "ייצור פאצ'ים רקומים עם הלוגו שלכם בכל צורה וגודל, מוכנים לגיהוץ בחום או תפירה.",
  },
  {
    id: "custom-button",
    name: "כפתורי מתכת עם הטבעת לוגו / סמל",
    categoryName: "כפתורים ואבזמים",
    basePrice: 16,
    bulkPrice: 10,
    bulkMinQty: 25,
    templateImage: "/images/custom/custom-button-blank.jpg",
    defaultTechnique: "הטבעת מתכת בלחץ",
    description: "כפתורי פליז וברונזה עתיקה מוטבעים עם הסמל או הלוגו של המותג שלכם.",
  },
  {
    id: "custom-label",
    name: "תוויות בד ארוגות למעצבי אופנה",
    categoryName: "תוויות ומיתוג",
    basePrice: 8,
    bulkPrice: 4.5,
    bulkMinQty: 50,
    templateImage: "/images/custom/custom-label-blank.jpg",
    defaultTechnique: "אריגת דמשק צפופה",
    description: "תוויות צווארון ומותג איכותיות באריגת חוטים צפופה שלא מגרדת ועמידה בכביסות.",
  },
  {
    id: "custom-ribbon",
    name: "סרטי סאטן מודפסים למיתוג ואריזה",
    categoryName: "סרטים ותחרות",
    basePrice: 12,
    bulkPrice: 7,
    bulkMinQty: 30,
    templateImage: "/images/craftsmanship/lace-stitching.jpg",
    defaultTechnique: "הדפסת פויל זהב יוקרתית",
    description: "סרטי סאטן ומשי ממותגים בהטבעת פויל זהב לאריזות מתנה, שקיות בוטיק ובגדים.",
  },
];

export function CustomProductsSection() {
  const [selectedItem, setSelectedItem] = useState<CustomTemplateItem | null>(null);

  return (
    <section className="relative z-20 mx-auto w-full max-w-6xl px-4 py-16">
      {/* Section Header */}
      <div className="mb-10 flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#c59b5f]/50 bg-[#16100c]/80 px-4 py-1 text-xs font-semibold text-[#eed3a2] backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37] animate-ping" />
          ייצור אישי ומותאם • CUSTOM ATELIER
        </span>
        <h2 className="font-serif-hebrew mt-3 text-2xl font-bold text-[#fbf8f2] sm:text-3xl md:text-4xl">
          עצבו פריטים מותאמים עם הלוגו והאיור שלכם
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#c7b9a8]">
          בחרו פריט, העלו את הגרפיקה או הלוגו שלכם, צפו בהדמיה חיה צד-לצד על המוצר, ואנחנו נייצר ונשלח ישירות
          מפס הייצור של המפעל.
        </p>
      </div>

      {/* Grid of customizable items */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CUSTOM_ITEMS.map((item) => (
          <div
            key={item.id}
            className="atelier-card group flex flex-col overflow-hidden rounded-2xl border border-[#c59b5f]/40 transition-all duration-300 hover:border-[#dfb37c] hover:shadow-[0_12px_35px_rgba(197,155,95,0.25)] hover:-translate-y-1.5"
          >
            {/* Template Image with Custom Badge */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#160f0b]">
              <Image
                src={item.templateImage}
                alt={item.name}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#140e0b] via-transparent to-transparent opacity-60" />

              <span className="absolute top-3 right-3 rounded-full border border-[#c59b5f]/50 bg-[#120c08]/90 px-2.5 py-0.5 text-[10px] font-bold text-[#eed3a2] backdrop-blur-md">
                התאמה אישית
              </span>
            </div>

            {/* Content & Pricing */}
            <div className="flex flex-1 flex-col p-4">
              <span className="text-[11px] font-medium text-[#c59b5f]">{item.categoryName}</span>
              <h3 className="font-serif-hebrew mt-1 text-base font-bold text-[#fbf8f2] group-hover:text-[#eed3a2] transition-colors">
                {item.name}
              </h3>
              <p className="mt-1.5 text-xs text-[#aa9c8d] line-clamp-2 leading-relaxed">
                {item.description}
              </p>

              {/* Pricing breakdown */}
              <div className="mt-4 border-t border-[#2d2118] pt-3">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[#aa9c8d]">החל מ:</span>
                  <span className="font-bold text-[#fbf8f2]">{formatIls(item.basePrice)} ליח&apos;</span>
                </div>
                <div className="mt-1 flex items-center justify-between rounded-lg bg-[#1a120c] px-2 py-1 text-[11px]">
                  <span className="text-[#eed3a2]">לכמות ({item.bulkMinQty}+):</span>
                  <span className="font-bold text-gold-gradient">
                    {formatIls(item.bulkPrice)} ליח&apos;
                  </span>
                </div>
              </div>

              {/* Interactive Customizer Launch Button */}
              <button
                type="button"
                onClick={() => setSelectedItem(item)}
                className="bg-gold-gradient-btn mt-4 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold text-white transition hover:brightness-110 shadow-md"
              >
                <span>🎨</span>
                <span>עצב עכשיו והעלה לוגו</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Render Customizer Modal when an item is selected */}
      <CustomizerModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </section>
  );
}
