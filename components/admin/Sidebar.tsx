"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/admin", label: "סקירה כללית" },
  { href: "/admin/factory", label: "ייצור במפעל" },
  { href: "/admin/inventory", label: "מלאי וספקים" },
  { href: "/admin/orders", label: "הזמנות" },
  { href: "/admin/leads", label: "לידים" },
  { href: "/admin/products", label: "מוצרים" },
  { href: "/admin/content", label: "תוכן" },
  { href: "/admin/campaigns", label: "קמפיינים" },
  { href: "/admin/social", label: "רשתות חברתיות" },
  { href: "/admin/team", label: "צוות" },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              active ? "bg-brand text-white" : "text-ink-muted hover:bg-surface-muted"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountFooter({ email, onLogout }: { email: string; onLogout: () => void }) {
  return (
    <div className="mt-4 border-t border-border pt-4">
      <p className="mb-2 truncate px-2 text-xs text-ink-muted">{email}</p>
      <button
        onClick={onLogout}
        className="w-full rounded-lg px-3 py-2 text-right text-sm text-ink-muted hover:bg-surface-muted"
      >
        התנתקות
      </button>
    </div>
  );
}

export function Sidebar({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-surface p-4 md:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="פתיחת תפריט ניהול"
          className="rounded-lg p-2 text-ink hover:bg-surface-muted"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
        <p className="text-lg font-bold text-brand">SO</p>
        <span className="w-9" aria-hidden="true" />
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col bg-surface p-4 shadow-xl">
            <div className="mb-6 flex items-center justify-between px-2">
              <div>
                <p className="text-lg font-bold text-brand">SO</p>
                <p className="text-xs text-ink-muted">לוח ניהול</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="סגירת תפריט"
                className="rounded-lg p-2 text-ink-muted hover:bg-surface-muted"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            <AccountFooter email={email} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-l border-border bg-surface p-4 md:flex">
        <div className="mb-6 px-2">
          <p className="text-lg font-bold text-brand">SO</p>
          <p className="text-xs text-ink-muted">לוח ניהול</p>
        </div>
        <NavLinks pathname={pathname} />
        <AccountFooter email={email} onLogout={handleLogout} />
      </aside>
    </>
  );
}
