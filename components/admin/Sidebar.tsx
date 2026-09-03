"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/admin", label: "סקירה כללית" },
  { href: "/admin/orders", label: "הזמנות" },
  { href: "/admin/leads", label: "לידים" },
  { href: "/admin/products", label: "מוצרים" },
  { href: "/admin/content", label: "תוכן" },
  { href: "/admin/campaigns", label: "קמפיינים" },
  { href: "/admin/social", label: "רשתות חברתיות" },
  { href: "/admin/team", label: "צוות" },
];

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-l border-border bg-surface p-4">
      <div className="mb-6 px-2">
        <p className="text-lg font-bold text-brand">Crafty.so</p>
        <p className="text-xs text-ink-muted">לוח ניהול</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                active ? "bg-brand text-white" : "text-ink-muted hover:bg-surface-muted"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-border pt-4">
        <p className="mb-2 truncate px-2 text-xs text-ink-muted">{email}</p>
        <button
          onClick={handleLogout}
          className="w-full rounded-lg px-3 py-2 text-right text-sm text-ink-muted hover:bg-surface-muted"
        >
          התנתקות
        </button>
      </div>
    </aside>
  );
}
