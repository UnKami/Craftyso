import { adminDb } from "@/lib/firebase/admin";
import type { InventoryItem, RestockOrder } from "@/lib/types";
import { InventoryTable } from "@/components/admin/InventoryTable";

export default async function InventoryDashboardPage() {
  let items: InventoryItem[] = [];
  let restocks: RestockOrder[] = [];

  try {
    const [invSnap, restockSnap] = await Promise.all([
      adminDb.collection("inventory").get(),
      adminDb.collection("restocks").orderBy("createdAt", "desc").get(),
    ]);

    items = invSnap.docs.map((d) => ({ id: d.id, ...d.data() } as InventoryItem));
    restocks = restockSnap.docs.map((d) => ({ id: d.id, ...d.data() } as RestockOrder));
  } catch (err) {
    console.warn("Could not fetch inventory:", err);
  }

  const lowStockCount = items.filter((i) => i.stockQty <= i.minAlertQty && i.stockQty > 0).length;
  const outOfStockCount = items.filter((i) => i.stockQty <= 0).length;
  const inFlightRestocks = restocks.filter((r) => r.status !== "received").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <span className="text-xs font-semibold text-brand uppercase tracking-wider">
            לוגיסטיקה ורכש • WAREHOUSE & LOGISTICS
          </span>
          <h1 className="text-2xl font-bold text-ink">ניהול מלאי, ספקים וחידושי רכש</h1>
          <p className="text-xs text-ink-muted mt-1">
            מעקב אחר מלאי חומרי גלם, בסיסי פאצ&apos;ים, כפתורים גולמיים, התרעות חוסר והזמנות מספקים.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <span className="text-xs font-medium text-ink-muted">סה&quot;כ מק&quot;טים מנוהלים</span>
          <p className="mt-1 text-2xl font-bold text-ink">{items.length}</p>
          <span className="text-[11px] text-ink-muted">חומרי גלם ואביזרים</span>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <span className="text-xs font-medium text-ink-muted">התרעות מלאי נמוך</span>
          <p className="mt-1 text-2xl font-bold text-amber-600">{lowStockCount}</p>
          <span className="text-[11px] text-ink-muted">מתחת לסף המינימום</span>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <span className="text-xs font-medium text-ink-muted">פריטים שאזלו</span>
          <p className="mt-1 text-2xl font-bold text-red-600">{outOfStockCount}</p>
          <span className="text-[11px] text-ink-muted">דורש רכש מיידי</span>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <span className="text-xs font-medium text-ink-muted">הזמנות רכש בדרך</span>
          <p className="mt-1 text-2xl font-bold text-blue-600">{inFlightRestocks}</p>
          <span className="text-[11px] text-ink-muted">ממתין לקליטה במפעל</span>
        </div>
      </div>

      {/* Inventory & Restocks Table */}
      <InventoryTable items={items} restocks={restocks} />
    </div>
  );
}
