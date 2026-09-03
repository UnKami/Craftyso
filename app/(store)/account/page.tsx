import { requireSession } from "@/lib/auth/session";
import { getOrdersForUser } from "@/lib/firebase/queries";
import { formatIls } from "@/lib/format";
import { LogoutButton } from "@/components/store/LogoutButton";

export const metadata = { title: "האזור האישי שלי" };

const STATUS_LABEL: Record<string, string> = {
  pending: "ממתין לתשלום",
  paid: "שולם",
  failed: "נכשל",
  fulfilled: "נשלח",
  cancelled: "בוטל",
};

export default async function AccountPage() {
  const user = await requireSession();
  const orders = await getOrdersForUser(user.uid);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">האזור האישי שלי</h1>
          <p className="text-sm text-ink-muted">{user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <h2 className="mb-4 text-lg font-semibold text-ink">ההזמנות שלי</h2>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-surface-muted p-8 text-center text-sm text-ink-muted">
          עדיין לא ביצעתם הזמנות אצלנו.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => (
            <li
              key={order.id}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted">
                  {new Date(order.createdAt).toLocaleDateString("he-IL")}
                </span>
                <span className="rounded-full bg-surface-muted px-3 py-1 text-xs text-ink-muted">
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-ink">
                {order.items.length} פריטים · {formatIls(order.totalIls)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
