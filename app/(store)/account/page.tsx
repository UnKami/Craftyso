import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import {
  getOrdersForCustomerProfile,
  upsertAndMergeCustomerIdentity,
} from "@/lib/customers/identity";
import { formatIls } from "@/lib/format";
import { LogoutButton } from "@/components/store/LogoutButton";
import { LinkContactForm } from "@/components/store/LinkContactForm";
import type { Order, ShippingMethod } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "האזור האישי שלי" };

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  paid: {
    label: "✓ שולם",
    className: "border-emerald-500/40 bg-emerald-500/15 text-emerald-400",
  },
  pending: {
    label: "ממתין לתשלום",
    className: "border-amber-500/40 bg-amber-500/15 text-amber-300",
  },
  failed: {
    label: "נכשל",
    className: "border-rose-500/40 bg-rose-500/15 text-rose-400",
  },
  fulfilled: {
    label: "נשלח",
    className: "border-sky-500/40 bg-sky-500/15 text-sky-300",
  },
  cancelled: {
    label: "בוטל",
    className: "border-zinc-500/40 bg-zinc-500/15 text-zinc-400",
  },
};

const SHIPPING_LABEL: Record<ShippingMethod, string> = {
  courier: "שליח עד הבית",
  registered_mail: "דואר רשום",
  pickup: "איסוף עצמי (תל אביב)",
};

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/account/login?next=/account");

  const profile = await upsertAndMergeCustomerIdentity({
    uid: user.uid,
    email: user.email,
  }).catch(() => null);

  const orders: Order[] = profile
    ? await getOrdersForCustomerProfile(profile).catch(() => [])
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#2d2118] pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#c59b5f]">
            SO ATELIER • PERSONAL ACCOUNT
          </span>
          <h1 className="font-serif-hebrew text-3xl font-bold text-[#fbf8f2]">
            האזור האישי שלי
          </h1>
          <p className="mt-1 text-sm text-[#aa9c8d]">
            {profile?.name ? `${profile.name} · ` : ""}
            {user.email}
          </p>
        </div>
        <LogoutButton />
      </div>

      <h2 className="font-serif-hebrew mb-4 text-xl font-bold text-[#eed3a2]">
        ההזמנות שלי ({orders.length})
      </h2>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#382a20] bg-[#140e0b]/60 p-10 text-center text-sm text-[#aa9c8d]">
          <p>עדיין לא נמצאו הזמנות המשויכות לאימייל או למספר הטלפון שלך.</p>
          <Link
            href="/category"
            className="bg-gold-gradient-btn mt-5 inline-block rounded-full px-6 py-2.5 text-xs font-semibold text-white"
          >
            מעבר לקטלוג
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => {
            const st = STATUS_LABEL[order.status] ?? {
              label: order.status,
              className: "border-[#2d2118] bg-[#1a130f] text-[#aa9c8d]",
            };
            return (
              <li
                key={order.id}
                className="rounded-2xl border border-[#2d2118] bg-[#140e0b] p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#241a13] pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#eed3a2]">
                      #{order.id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-[#8a7b6b]">
                      {new Date(order.createdAt).toLocaleString("he-IL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${st.className}`}
                  >
                    {st.label}
                  </span>
                </div>

                <ul className="mt-3 divide-y divide-[#241a13] text-sm">
                  {order.items.map((item, idx) => (
                    <li
                      key={`${item.productId}-${idx}`}
                      className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                    >
                      <span className="text-[#f3ede2]">
                        {item.name}{" "}
                        <span className="text-xs text-[#8a7b6b]">×{item.quantity}</span>
                      </span>
                      <span className="text-[#eed3a2]">
                        {formatIls(item.priceIls * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#241a13] pt-3 text-xs text-[#aa9c8d]">
                  <div className="flex flex-wrap items-center gap-3">
                    {order.shippingMethod && (
                      <span>משלוח: {SHIPPING_LABEL[order.shippingMethod]}</span>
                    )}
                    {order.trackingNumber && (
                      <span className="font-mono text-emerald-400">
                        מס׳ מעקב: {order.trackingNumber}
                      </span>
                    )}
                    {order.payplusInvoiceUrl && (
                      <a
                        href={order.payplusInvoiceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-[#eed3a2] underline hover:text-white"
                      >
                        חשבונית PDF ↗
                      </a>
                    )}
                  </div>
                  <span className="text-base font-bold text-gold-gradient">
                    סה&quot;כ: {formatIls(order.totalIls)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <LinkContactForm
        emails={profile?.emails ?? (user.email ? [user.email] : [])}
        phones={profile?.phones ?? []}
      />
    </div>
  );
}
