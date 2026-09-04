import { adminDb } from "@/lib/firebase/admin";
import type { Order } from "@/lib/types";
import { FactoryOrderCard } from "@/components/admin/FactoryOrderCard";

export default async function FactoryDashboardPage() {
  let orders: Order[] = [];
  try {
    const snap = await adminDb.collection("orders").orderBy("createdAt", "desc").get();
    orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
  } catch (err) {
    console.warn("Could not fetch factory orders:", err);
  }

  // Count metrics
  const pendingCount = orders.filter(
    (o) => (o.productionStatus ?? "pending_production") === "pending_production"
  ).length;
  const inProductionCount = orders.filter((o) => o.productionStatus === "in_production").length;
  const readyCount = orders.filter((o) => o.productionStatus === "ready_to_ship").length;
  const shippedCount = orders.filter((o) => o.productionStatus === "shipped").length;
  const customItemsTotal = orders.reduce(
    (sum, o) => sum + o.items.filter((i) => Boolean(i.customArtworkUrl)).length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Title & Operational Tag */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <span className="text-xs font-semibold text-brand uppercase tracking-wider">
            מרכז שליטה ובקרה • FACTORY FLOOR
          </span>
          <h1 className="text-2xl font-bold text-ink">דשבורד ייצור במפעל והזמנות</h1>
          <p className="text-xs text-ink-muted mt-1">
            ניהול קווי הייצור, הורדת קבצי גרפיקה מקוריים של לקוחות, בקרת איכות ושיגור משלוחים.
          </p>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <span className="text-xs font-medium text-ink-muted">ממתין לייצור במפעל</span>
          <p className="mt-1 text-2xl font-bold text-amber-600">{pendingCount}</p>
          <span className="text-[11px] text-ink-muted">{customItemsTotal} פריטים מותאמים</span>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <span className="text-xs font-medium text-ink-muted">בייצור פעיל כעת</span>
          <p className="mt-1 text-2xl font-bold text-blue-600">{inProductionCount}</p>
          <span className="text-[11px] text-ink-muted">מכונות רקמה והטבעה</span>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <span className="text-xs font-medium text-ink-muted">מוכן לאיסוף שליח</span>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{readyCount}</p>
          <span className="text-[11px] text-ink-muted">נבדק בבקרת איכות</span>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <span className="text-xs font-medium text-ink-muted">משלוחים שנשלחו</span>
          <p className="mt-1 text-2xl font-bold text-gray-700">{shippedCount}</p>
          <span className="text-[11px] text-ink-muted">עם מספר מעקב</span>
        </div>
      </div>

      {/* Orders Pipeline Feed */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-ink">תור הזמנות לייצור ושיגור</h2>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-ink-muted">
            <span className="text-3xl mb-2 block">🏭</span>
            <p className="text-sm font-semibold">אין כרגע הזמנות ממתינות במפעל.</p>
            <p className="mt-1 text-xs">
              הזמנות חדשות שיוזמנו בחנות (במיוחד עם קבצי עיצוב אישי) יופיעו כאן בזמן אמת.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <FactoryOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
