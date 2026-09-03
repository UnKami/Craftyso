import { listOrders } from "@/lib/firebase/admin-queries";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { formatIls } from "@/lib/format";

export default async function OrdersPage() {
  const orders = await listOrders();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">הזמנות</h1>

      {orders.length === 0 ? (
        <p className="text-ink-muted">אין עדיין הזמנות.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-right text-ink-muted">
              <tr>
                <th className="p-3 font-medium">לקוח</th>
                <th className="p-3 font-medium">פריטים</th>
                <th className="p-3 font-medium">סה&quot;כ</th>
                <th className="p-3 font-medium">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="p-3">
                    <p>{order.customerName}</p>
                    <p className="text-xs text-ink-muted">{order.customerEmail}</p>
                  </td>
                  <td className="p-3">{order.items.length}</td>
                  <td className="p-3">{formatIls(order.totalIls)}</td>
                  <td className="p-3">
                    <OrderStatusSelect orderId={order.id} status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
