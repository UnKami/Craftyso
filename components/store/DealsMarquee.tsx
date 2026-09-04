"use client";

import Link from "next/link";

const DEALS = [
  {
    icon: "✨",
    highlight: "מבצע החודש:",
    text: "20% הנחה על כל הפאצ'ים והרקמות לקראת עונת האירועים",
    href: "/category/fashion-accessories",
  },
  {
    icon: "🚚",
    highlight: "משלוח חינם:",
    text: "בהזמנה מעל ₪299 עד פתח הבית בכל רחבי הארץ",
    href: "/shipping",
  },
  {
    icon: "🏷️",
    highlight: "מחירים סיטונאיים:",
    text: "הנחות מיוחדות ברכישת כמויות ומארזים למעצבים וחייטים",
    href: "/category",
  },
  {
    icon: "💎",
    highlight: "קולקציה חדשה:",
    text: "אבזמי וינטג' וברונזה עתיקה נחתו בבוטיק",
    href: "/category/buckles",
  },
  {
    icon: "✂️",
    highlight: "איכות קוטור:",
    text: "כל מה שצריך ליצירה ולתפירה עילית במקום אחד",
    href: "/about",
  },
];

export function DealsMarquee() {
  return (
    <div className="relative z-30 w-full overflow-hidden border-y border-[#3d2b1f] bg-gradient-to-r from-[#120c08] via-[#1a120c] to-[#120c08] py-2.5 shadow-inner">
      {/* Subtle gold edge gradients for smooth marquee fade */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#120c08] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#120c08] to-transparent" />

      <div className="animate-marquee flex items-center gap-12 whitespace-nowrap">
        {[...DEALS, ...DEALS].map((deal, idx) => (
          <Link
            key={idx}
            href={deal.href}
            className="group inline-flex items-center gap-2 text-xs font-medium transition hover:brightness-125 sm:text-sm"
          >
            <span className="text-sm">{deal.icon}</span>
            <span className="font-bold text-[#eed3a2] group-hover:text-white transition-colors">
              {deal.highlight}
            </span>
            <span className="text-[#c7b9a8]">{deal.text}</span>
            <span className="mx-4 text-[#5a4231]">✦</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
