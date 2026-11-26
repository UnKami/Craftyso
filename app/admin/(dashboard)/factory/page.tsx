import { headers } from "next/headers";
import { requireTabAccess } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase/admin";
import { getOrCreateFactoryPortalToken } from "@/lib/factory-portal/token";
import { enrichOrdersWithItemImages } from "@/lib/orders/enrich-items";
import type { Order } from "@/lib/types";
import { AdminFactoryGrid } from "@/components/admin/AdminFactoryGrid";
import { FactoryShareLinkCard } from "@/components/admin/FactoryShareLinkCard";

export default async function FactoryDashboardPage() {
  await requireTabAccess("factory");
  let orders: Order[] = [];
  let portalToken = "";
  try {
    const [snap, token] = await Promise.all([
      adminDb.collection("orders").orderBy("createdAt", "desc").get(),
      getOrCreateFactoryPortalToken(),
    ]);
    const rawOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
    orders = await enrichOrdersWithItemImages(rawOrders);
    portalToken = token;
  } catch (err) {
    console.warn("Could not fetch factory orders:", err);
  }

  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "https";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (host ? `${proto}://${host}` : "https://craftyso.co.il");

  const pendingCount = orders.filter(
    (o) => (o.productionStatus ?? "pending_production") === "pending_production",
  ).length;
  const inProductionCount = orders.filter((o) => o.productionStatus === "in_production").length;
  const readyCount = orders.filter((o) => o.productionStatus === "ready_to_ship").length;
  const shippedCount = orders.filter((o) => o.productionStatus === "shipped").length;
  const customItemsTotal = orders.reduce(
    (sum, o) => sum + o.items.filter((i) => Boolean(i.customArtworkUrl)).length,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <span className="text-xs font-semibold text-brand uppercase tracking-wider">
            מרכז שליטה ובקרה • FACTORY FLOOR
          </span>
          <h1 className="text-2xl font-bold text-ink">דשבורד ייצור במפעל והזמנות</h1>
          <p className="mt-1 text-xs text-ink-muted">
            לחצו על כל כרטיס הזמנה כדי לפתוח את פרטי הייצור המלאים, קבצי הגרפיקה ופרטי המשלוח.
          </p>
        </div>
      </div>

      <FactoryShareLinkCard initialToken={portalToken} siteUrl={siteUrl} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <span className="text-xs font-medium text-ink-muted">ממתין לייצור במפעל</span>
          <p className="mt-1 text-2xl font-bold text-amber-500">{pendingCount}</p>
          <span className="text-[11px] text-ink-muted">{customItemsTotal} פריטים מותאמים</span>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <span className="text-xs font-medium text-ink-muted">בייצור פעיל כעת</span>
          <p className="mt-1 text-2xl font-bold text-sky-400">{inProductionCount}</p>
          <span className="text-[11px] text-ink-muted">מכונות רקמה והטבעה</span>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <span className="text-xs font-medium text-ink-muted">מוכן לאיסוף שליח</span>
          <p className="mt-1 text-2xl font-bold text-emerald-400">{readyCount}</p>
          <span className="text-[11px] text-ink-muted">נבדק בבקרת איכות</span>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <span className="text-xs font-medium text-ink-muted">משלוחים שנשלחו</span>
          <p className="mt-1 text-2xl font-bold text-ink-muted">{shippedCount}</p>
          <span className="text-[11px] text-ink-muted">עם מספר מעקב</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-ink">תור הזמנות לייצור ושיגור</h2>
        <AdminFactoryGrid orders={orders} />
      </div>
    </div>
  );
}
