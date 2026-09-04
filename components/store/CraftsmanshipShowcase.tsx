"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const CRAFT_STEPS = [
  {
    id: "patch",
    title: "פאץ' רקום מיושם על ז'קט",
    tag: "פאצ'ים להדבקה ותפירה",
    description: "ראו כיצד מגהץ פשוט או תפר ידני הופכים ז'קט ג'ינס יומיומי לפריט אופנה יוקרתי ומעוצב.",
    image: "/images/craftsmanship/patch-application.jpg",
    alt: "תפירת פאץ' פרח רקום על ז'קט",
    link: "/category/fashion-accessories",
    buttonText: "לכל הפאצ'ים והרקמות",
  },
  {
    id: "button",
    title: "תפירת כפתור קוטור עתיק",
    tag: "כפתורים ואבזמי מתכת",
    description: "כפתורי ברונזה ומתכת עם הטבעות הרלדיות המעניקים עומק ואיכות לחולצות, מעילים וחליפות.",
    image: "/images/craftsmanship/button-sewing.jpg",
    alt: "תפירת כפתור מתכת עתיק על חולצה",
    link: "/category/buckles",
    buttonText: "לכל הכפתורים והאבזמים",
  },
  {
    id: "lace",
    title: "שילוב סרט תחרה וינטג'",
    tag: "סרטי תחרה וסדקית",
    description: "תחרה מובחרת בעיצוב עדין הנשזרת ברכות בשולי שמלות ערב, חולצות או כריות נוי.",
    image: "/images/craftsmanship/lace-stitching.jpg",
    alt: "תפירת תחרה וינטג' עדינה על בד משי",
    link: "/category/fabrics",
    buttonText: "לכל התחרות והסרטים",
  },
  {
    id: "shears",
    title: "חיתוך מדויק במספרי חייט",
    tag: "כלי עבודה וחייטות",
    description: "מספרי פלדה וברונזה כבדות המעניקות חיתוך חלק ומדויק לכל סוגי הבדים, העורות והטקסטיל.",
    image: "/images/craftsmanship/shears-cutting.jpg",
    alt: "גזירת בד במספרי חייט מפלדה וברונזה",
    link: "/category/sewing-accessories",
    buttonText: "לכלי התפירה והחייטות",
  },
];

export function CraftsmanshipShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CRAFT_STEPS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const current = CRAFT_STEPS[activeIndex];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative flex flex-col overflow-hidden rounded-2xl border border-[#c59b5f]/45 bg-[#140e0b] shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-md"
    >
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between border-b border-[#2d2118] bg-[#0f0a07] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d4af37] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c59b5f]" />
          </span>
          <span className="font-serif-hebrew text-xs font-semibold tracking-wider text-[#eed3a2]">
            מוצרי הבוטיק בפעולה • CRAFT IN ACTION
          </span>
        </div>
        <span className="text-[11px] text-[#8a7b6c]">
          {activeIndex + 1} / {CRAFT_STEPS.length}
        </span>
      </div>

      {/* Main Image Viewport with smooth crossfade */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#18110c] sm:aspect-[16/10]">
        {CRAFT_STEPS.map((step, idx) => (
          <div
            key={step.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              idx === activeIndex
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105 pointer-events-none"
            }`}
          >
            <Image
              src={step.image}
              alt={step.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority={idx === 0}
            />
            {/* Dark vignette gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#120c08] via-transparent to-black/30" />
          </div>
        ))}

        {/* Floating In-Use Product Highlight Box */}
        <div className="absolute bottom-3 inset-x-3 rounded-xl border border-[#c59b5f]/40 bg-[#120c08]/90 p-4 backdrop-blur-md transition-all sm:bottom-4 sm:inset-x-4">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-[11px] font-medium tracking-wide text-[#dfb37c] uppercase">
                {current.tag}
              </span>
              <h3 className="font-serif-hebrew text-base font-bold text-[#fbf8f2] sm:text-lg">
                {current.title}
              </h3>
              <p className="text-xs text-[#c7b9a8] line-clamp-2 max-w-md">
                {current.description}
              </p>
            </div>
            <Link
              href={current.link}
              className="mt-2 inline-flex items-center gap-1.5 self-start rounded-full border border-[#c59b5f]/50 bg-[#1e1510] px-4 py-2 text-xs font-semibold text-[#eed3a2] transition hover:border-[#dfb37c] hover:bg-[#c59b5f]/20 hover:text-white sm:mt-0 sm:self-auto shrink-0"
            >
              <span>{current.buttonText}</span>
              <span>←</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Tabs / Progress Step Selectors */}
      <div className="grid grid-cols-4 border-t border-[#2d2118] bg-[#0d0906]">
        {CRAFT_STEPS.map((step, idx) => (
          <button
            key={step.id}
            onClick={() => setActiveIndex(idx)}
            className={`relative flex flex-col items-center p-2.5 text-center transition-all ${
              idx === activeIndex
                ? "bg-[#1f1510] text-[#eed3a2]"
                : "text-[#8a7b6c] hover:bg-[#160f0b] hover:text-[#c7b9a8]"
            }`}
          >
            {/* Top gold active indicator */}
            {idx === activeIndex && (
              <span className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#c59b5f] via-[#faebd7] to-[#c59b5f]" />
            )}
            <span className="text-[11px] font-semibold line-clamp-1">
              {step.title.split(" ")[0]} {step.title.split(" ")[1]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
