"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import type { Category } from "@/lib/types";

const SIMPLE_LINKS_BEFORE_CONTACT = [
  { key: "custom", label: "עיצוב אישי", href: "/custom" },
  { key: "wholesale", label: "סיטונאות למעצבים ולעסקים", href: "/wholesale" },
  { key: "shop", label: "מוצרים מוכנים לכל אחד", href: "/shop" },
];

const SIMPLE_LINKS_AFTER_CONTACT = [
  { key: "about", label: "אודות", href: "/about" },
  { key: "account", label: "האזור האישי", href: "/account" },
];

function ChevronIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

function ContactPanelContent() {
  return (
    <div className="flex flex-col gap-3 p-4 text-sm">
      <a
        href="tel:035106888"
        className="flex items-center gap-2 font-semibold text-[#eed3a2] hover:text-white"
      >
        📞 03-5106888
      </a>
      <p className="text-[#aa9c8d]">רחוב לבינובסקי 9, תל אביב (קומת קרקע)</p>
      <Link
        href="/contact"
        className="mt-1 inline-block rounded-full border border-[#c59b5f]/50 px-4 py-1.5 text-center text-xs font-semibold text-[#eed3a2] hover:border-[#dfb37c] hover:text-white"
      >
        טופס יצירת קשר ←
      </Link>
    </div>
  );
}

function DesktopDropdown({
  label,
  href,
  isOpen,
  onOpen,
  onClose,
  children,
}: {
  label: string;
  href: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <div className="flex items-center gap-1">
        <Link
          href={href}
          className="whitespace-nowrap py-2.5 text-[#bdae9e] transition hover:text-[#faebd7] font-medium"
        >
          {label}
        </Link>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={`פתיחת תפריט ${label}`}
          onClick={() => (isOpen ? onClose() : onOpen())}
          className="p-1 text-[#8a7b6b] transition hover:text-[#eed3a2]"
        >
          <ChevronIcon />
        </button>
      </div>
      {isOpen && (
        <div className="absolute right-1/2 top-full z-50 w-[min(90vw,640px)] translate-x-1/2 rounded-xl border border-[#c59b5f]/30 bg-[#140e0b] shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
          {children}
        </div>
      )}
    </div>
  );
}

function SimpleLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="whitespace-nowrap py-2.5 text-[#bdae9e] transition hover:text-[#faebd7] font-medium"
    >
      {label}
    </Link>
  );
}

function MobileAccordionItem({
  label,
  href,
  isOpen,
  onToggle,
  onNavigate,
  children,
}: {
  label: string;
  href: string;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-[#241a13]">
      <div className="flex items-center justify-between">
        <Link
          href={href}
          onClick={onNavigate}
          className="flex-1 py-3 text-sm font-medium text-[#f3ede2] hover:text-[#eed3a2]"
        >
          {label}
        </Link>
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={onToggle}
          className="p-3 text-[#8a7b6b]"
          aria-label={`הרחבת ${label}`}
        >
          <span className={`inline-block transition-transform ${isOpen ? "rotate-180" : ""}`}>
            <ChevronIcon />
          </span>
        </button>
      </div>
      {isOpen && <div className="pb-3">{children}</div>}
    </div>
  );
}

export function MainNav({ categories }: { categories: Category[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openNow(key: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenKey(key);
  }
  function closeSoon() {
    closeTimer.current = setTimeout(() => setOpenKey(null), 150);
  }
  function closeMobile() {
    setMobileOpen(false);
    setMobileAccordion(null);
  }

  return (
    <nav className="border-t border-[#241a13] bg-[#0f0b08]/80">
      {/* Desktop bar */}
      <div className="mx-auto hidden max-w-7xl items-center justify-center gap-6 px-4 text-sm md:flex md:gap-7">
        <DesktopDropdown
          label="כל הקטגוריות"
          href="/category"
          isOpen={openKey === "categories"}
          onOpen={() => openNow("categories")}
          onClose={closeSoon}
        >
          <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 p-4">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="truncate rounded-lg px-2 py-1.5 text-sm text-[#bdae9e] transition hover:bg-[#1c130e] hover:text-[#faebd7]"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </DesktopDropdown>

        {SIMPLE_LINKS_BEFORE_CONTACT.map((item) => (
          <SimpleLink key={item.key} href={item.href} label={item.label} />
        ))}

        <DesktopDropdown
          label="יצירת קשר"
          href="/contact"
          isOpen={openKey === "contact"}
          onOpen={() => openNow("contact")}
          onClose={closeSoon}
        >
          <ContactPanelContent />
        </DesktopDropdown>

        {SIMPLE_LINKS_AFTER_CONTACT.map((item) => (
          <SimpleLink key={item.key} href={item.href} label={item.label} />
        ))}
      </div>

      {/* Mobile trigger */}
      <div className="flex items-center px-4 py-2.5 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-[#eed3a2]"
        >
          <MenuIcon />
          <span>תפריט וקטגוריות</span>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={closeMobile} />
          <aside className="absolute inset-y-0 right-0 flex w-80 max-w-[88vw] flex-col overflow-y-auto bg-[#0f0b08] p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-serif-hebrew text-lg font-bold text-[#fbf8f2]">ניווט</span>
              <button
                type="button"
                onClick={closeMobile}
                aria-label="סגירת תפריט"
                className="p-1.5 text-[#aa9c8d] hover:text-white"
              >
                <CloseIcon />
              </button>
            </div>

            <MobileAccordionItem
              label="כל הקטגוריות"
              href="/category"
              isOpen={mobileAccordion === "categories"}
              onToggle={() =>
                setMobileAccordion((a) => (a === "categories" ? null : "categories"))
              }
              onNavigate={closeMobile}
            >
              <div className="grid grid-cols-2 gap-2">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    onClick={closeMobile}
                    className="truncate rounded-lg bg-[#160f0b] px-2.5 py-1.5 text-xs text-[#bdae9e] hover:text-[#faebd7]"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </MobileAccordionItem>

            {SIMPLE_LINKS_BEFORE_CONTACT.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={closeMobile}
                className="border-b border-[#241a13] py-3 text-sm font-medium text-[#f3ede2] hover:text-[#eed3a2]"
              >
                {item.label}
              </Link>
            ))}

            <MobileAccordionItem
              label="יצירת קשר"
              href="/contact"
              isOpen={mobileAccordion === "contact"}
              onToggle={() => setMobileAccordion((a) => (a === "contact" ? null : "contact"))}
              onNavigate={closeMobile}
            >
              <ContactPanelContent />
            </MobileAccordionItem>

            {SIMPLE_LINKS_AFTER_CONTACT.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={closeMobile}
                className="border-b border-[#241a13] py-3 text-sm font-medium text-[#f3ede2] hover:text-[#eed3a2] last:border-0"
              >
                {item.label}
              </Link>
            ))}
          </aside>
        </div>
      )}
    </nav>
  );
}
