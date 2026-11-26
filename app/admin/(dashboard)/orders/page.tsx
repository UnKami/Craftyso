import { requireTabAccess } from "@/lib/auth/require-admin";
import { listOrders } from "@/lib/firebase/admin-queries";
import { isFactoryEmailConfigured } from "@/lib/notifications/factory-email";
import { OrdersLedger } from "@/components/admin/OrdersLedger";

export default async function OrdersPage() {
  await requireTabAccess("orders");
  const orders = await listOrders();
  const emailConfigured = isFactoryEmailConfigured();

  return <OrdersLedger orders={orders} emailConfigured={emailConfigured} />;
}
