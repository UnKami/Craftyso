"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ADMIN_TABS, canAccessTab } from "@/lib/auth/permissions";
import type { AdminRole, AdminTabId } from "@/lib/types";

function NavLinks({
  pathname,
  role,
  allowedTabs,
  onNavigate,
}: {
  pathname: string;
  role: AdminRole;
  allowedTabs?: AdminTabId[];
  onNavigate?: () => void;
}) {
  const visibleItems = ADMIN_TABS.filter((item) =>
    canAccessTab({ role, allowedTabs }, item.id),
  );

  return (
    <nav className="flex flex-1 flex-col gap-1">
      {visibleItems.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
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

export function Sidebar({
  email,
  role,
  allowedTabs,
}: {
  email: string;
  role: AdminRole;
  allowedTabs?: AdminTabId[];
}) {
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
        <Image src="/logo/so-logo.png" alt="SO" width={960} height={590} className="h-6 w-auto" />
        <span className="w-9" aria-hidden="true" />
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col bg-surface p-4 shadow-xl">
            <div className="mb-6 flex items-center justify-between px-2">
              <div>
                <Image src="/logo/so-logo.png" alt="SO" width={960} height={590} className="h-6 w-auto" />
                <p className="mt-1 text-xs text-ink-muted">לוח ניהול</p>
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
            <NavLinks
              pathname={pathname}
              role={role}
              allowedTabs={allowedTabs}
              onNavigate={() => setOpen(false)}
            />
            <AccountFooter email={email} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-l border-border bg-surface p-4 md:flex">
        <div className="mb-6 px-2">
          <Image src="/logo/so-logo.png" alt="SO" width={960} height={590} className="h-7 w-auto" />
          <p className="mt-1 text-xs text-ink-muted">לוח ניהול</p>
        </div>
        <NavLinks pathname={pathname} role={role} allowedTabs={allowedTabs} />
        <AccountFooter email={email} onLogout={handleLogout} />
      </aside>
    </>
  );
}
