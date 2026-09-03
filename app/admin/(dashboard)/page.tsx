import { listCampaigns, listLeads, listOrders, listAllProducts } from "@/lib/firebase/admin-queries";

export default async function AdminOverviewPage() {
  const [leads, orders, products, campaigns] = await Promise.all([
    listLeads(),
    listOrders(),
    listAllProducts(),
    listCampaigns(),
  ]);

  const newLeads = leads.filter((l) => l.status === "new").length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">סקירה כללית</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="לידים חדשים" value={newLeads} />
        <StatCard label="הזמנות ממתינות" value={pendingOrders} />
        <StatCard label="מוצרים בקטלוג" value={products.length} />
        <StatCard label="קמפיינים פעילים" value={activeCampaigns} />
      </div>

      {products.length === 0 && (
        <p className="mt-8 text-sm text-ink-muted">
          הקטלוג עדיין ריק — יש להריץ את סקריפט ההגירה (scripts/scrape-catalog.ts) לאחר חיבור
          פרטי חשבון השירות של Firebase.
        </p>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
    </div>
  );
}
