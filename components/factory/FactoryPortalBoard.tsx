"use client";

import { useMemo, useState, useTransition } from "react";
import type { Order, ProductionStatus, ShippingMethod } from "@/lib/types";
import { formatIls } from "@/lib/format";
import {
  portalUpdateOrderDetails,
  portalUpdateProductionStatus,
} from "@/app/factory-portal/[token]/actions";

const PROD_STATUS: Record<
  ProductionStatus,
  { label: string; badge: string; next?: ProductionStatus; nextLabel?: string }
> = {
  pending_production: {
    label: "ממתין לייצור",
    badge: "border-amber-500/40 bg-amber-500/15 text-amber-300",
    next: "in_production",
    nextLabel: "התחל ייצור ←",
  },
  in_production: {
    label: "בייצור",
    badge: "border-sky-500/40 bg-sky-500/15 text-sky-300",
    next: "quality_check",
    nextLabel: "העבר לבקרת איכות ←",
  },
  quality_check: {
    label: "בקרת איכות",
    badge: "border-purple-500/40 bg-purple-500/15 text-purple-300",
    next: "ready_to_ship",
    nextLabel: "אושר — מוכן למשלוח ←",
  },
  ready_to_ship: {
    label: "מוכן למשלוח",
    badge: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
    next: "shipped",
    nextLabel: "סמן כנשלח ←",
  },
  shipped: {
    label: "נשלח ללקוח",
    badge: "border-zinc-500/40 bg-zinc-500/15 text-zinc-300",
  },
};

const SHIPPING_LABELS: Record<ShippingMethod, string> = {
  courier: "שליח עד הבית (1–3 ימי עסקים)",
  registered_mail: "דואר רשום (דואר ישראל)",
  pickup: "איסוף עצמי מהבוטיק — רחוב לבינובסקי 9, תל אביב",
};

type FilterKey = "paid_active" | "shipped" | "all";

export function FactoryPortalBoard({
  token,
  orders,
}: {
  token: string;
  orders: Order[];
}) {
  const [filter, setFilter] = useState<FilterKey>("paid_active");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const isPaid = o.status === "paid" || o.status === "fulfilled";
      const isShipped = o.productionStatus === "shipped" || o.status === "fulfilled";

      if (filter === "paid_active" && (!isPaid || isShipped)) return false;
      if (filter === "shipped" && !isShipped) return false;

      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q) ||
        (o.shippingAddress ?? "").toLowerCase().includes(q) ||
        (o.trackingNumber ?? "").toLowerCase().includes(q)
      );
    });
  }, [orders, filter, search]);

  const paidActiveCount = orders.filter(
    (o) =>
      (o.status === "paid" || o.status === "fulfilled") &&
      o.productionStatus !== "shipped" &&
      o.status !== "fulfilled",
  ).length;
  const shippedCount = orders.filter(
    (o) => o.productionStatus === "shipped" || o.status === "fulfilled",
  ).length;

  return (
    <div className="min-h-screen bg-[#0c0907] text-[#f3ede2]">
      <header className="sticky top-0 z-30 border-b border-[#2d2118] bg-[#120c08]/95 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#c59b5f]">
              SO ATELIER • PRIVATE FACTORY PORTAL
            </span>
            <h1 className="font-serif-hebrew text-xl font-bold text-[#fbf8f2] sm:text-2xl">
              פורטל הזמנות לייצור ומשלוח
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl border border-[#c59b5f]/40 bg-[#1a130f] px-4 py-2 text-xs font-semibold text-[#eed3a2] transition hover:border-[#dfb37c] hover:text-white"
            >
              🖨️ הדפסת רשימת הזמנות
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter("paid_active")}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                filter === "paid_active"
                  ? "border-[#dfb37c] bg-[#c59b5f]/20 text-[#eed3a2]"
                  : "border-[#2d2118] bg-[#140e0b] text-[#aa9c8d] hover:text-white"
              }`}
            >
              שולם — לייצור ומשלוח ({paidActiveCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("shipped")}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                filter === "shipped"
                  ? "border-[#dfb37c] bg-[#c59b5f]/20 text-[#eed3a2]"
                  : "border-[#2d2118] bg-[#140e0b] text-[#aa9c8d] hover:text-white"
              }`}
            >
              נשלחו ({shippedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                filter === "all"
                  ? "border-[#dfb37c] bg-[#c59b5f]/20 text-[#eed3a2]"
                  : "border-[#2d2118] bg-[#140e0b] text-[#aa9c8d] hover:text-white"
              }`}
            >
              כל ההזמנות כולל טיוטות ({orders.length})
            </button>
          </div>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם לקוח, טלפון, כתובת או מס׳ הזמנה..."
            className="w-full rounded-xl border border-[#2d2118] bg-[#140e0b] px-4 py-2 text-xs text-[#f3ede2] placeholder-[#7d6f60] outline-none focus:border-[#dfb37c] sm:w-80"
          />
        </div>

        {/* Orders List */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#382a20] bg-[#140e0b]/60 p-12 text-center text-sm text-[#aa9c8d]">
            אין כרגע הזמנות להצגה בסינון זה.
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((order) => (
              <PortalOrderCard key={order.id} token={token} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function PortalOrderCard({ token, order }: { token: string; order: Order }) {
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState(order.factoryNotes ?? "");
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [saved, setSaved] = useState(false);

  const prodStatus: ProductionStatus = order.productionStatus ?? "pending_production";
  const statusInfo = PROD_STATUS[prodStatus] ?? PROD_STATUS.pending_production;
  const isPaid = order.status === "paid" || order.status === "fulfilled";

  function handleAdvance(nextStatus: ProductionStatus) {
    startTransition(async () => {
      await portalUpdateProductionStatus(token, order.id, nextStatus);
    });
  }

  function handleSave() {
    startTransition(async () => {
      const res = await portalUpdateOrderDetails({
        token,
        orderId: order.id,
        factoryNotes: notes,
        trackingNumber: tracking,
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <article className="break-inside-avoid rounded-2xl border border-[#2d2118] bg-[#140e0b] p-5 shadow-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2d2118] pb-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-sm font-bold text-[#eed3a2]">
            #{order.id.slice(0, 8)}
          </span>
          {isPaid ? (
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
              ✓ שולם — מאושר לייצור
            </span>
          ) : (
            <span className="rounded-full border border-rose-500/40 bg-rose-500/15 px-2.5 py-0.5 text-xs font-bold text-rose-400">
              ⚠ טרם שולם ({order.status}) — לא לייצר
            </span>
          )}
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusInfo.badge}`}
          >
            {statusInfo.label}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#8a7b6b]">
            {new Date(order.createdAt).toLocaleString("he-IL", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {statusInfo.next && isPaid && (
            <button
              type="button"
              disabled={pending}
              onClick={() => handleAdvance(statusInfo.next!)}
              className="rounded-lg bg-[#8f5823] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#ad7c44] disabled:opacity-50 print:hidden"
            >
              {statusInfo.nextLabel}
            </button>
          )}
        </div>
      </div>

      {/* Customer + Shipping + Payment Details */}
      <div className="mt-4 grid gap-3 rounded-xl border border-[#241a13] bg-[#1a130f] p-4 text-xs sm:grid-cols-3">
        <div className="space-y-1">
          <span className="block font-semibold text-[#c59b5f]">פרטי לקוח</span>
          <p className="text-sm font-bold text-[#fbf8f2]">{order.customerName}</p>
          <a href={`tel:${order.customerPhone}`} className="block text-[#eed3a2] hover:underline">
            📞 {order.customerPhone}
          </a>
          <p className="text-[#aa9c8d]">{order.customerEmail}</p>
        </div>

        <div className="space-y-1">
          <span className="block font-semibold text-[#c59b5f]">פרטי משלוח</span>
          <p className="font-semibold text-[#fbf8f2]">
            {order.shippingMethod ? SHIPPING_LABELS[order.shippingMethod] : "שליח עד הבית"}
          </p>
          {order.shippingAddress && <p className="text-[#c7b9a8]">{order.shippingAddress}</p>}
          {order.trackingNumber && (
            <p className="font-mono text-emerald-400">מס׳ מעקב: {order.trackingNumber}</p>
          )}
        </div>

        <div className="space-y-1">
          <span className="block font-semibold text-[#c59b5f]">תשלום וסיכום</span>
          <p className="text-base font-bold text-gold-gradient">{formatIls(order.totalIls)}</p>
          {order.payplusApprovalNum && (
            <p className="font-mono text-[#aa9c8d]">אישור PayPlus: {order.payplusApprovalNum}</p>
          )}
          {order.payplusVoucherNum && (
            <p className="font-mono text-[#aa9c8d]">שובר: {order.payplusVoucherNum}</p>
          )}
        </div>
      </div>

      {/* Itemized Products */}
      <div className="mt-4 space-y-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#aa9c8d]">
          פריטים בהזמנה ({order.items.reduce((s, i) => s + i.quantity, 0)} יח&apos;)
        </h3>
        <div className="divide-y divide-[#241a13] rounded-xl border border-[#241a13] bg-[#120c08]">
          {order.items.map((item, idx) => (
            <div
              key={`${item.productId}-${idx}`}
              className="flex flex-wrap items-center justify-between gap-4 p-3.5 text-sm"
            >
              <div className="flex items-start gap-3">
                {item.customArtworkUrl && (
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-[#c59b5f]/50 bg-[#1a130f] p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.customArtworkUrl}
                        alt="קובץ גרפיקה"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <a
                      href={item.customArtworkUrl}
                      download={`artwork-${order.id.slice(0, 6)}-${idx + 1}.png`}
                      className="text-[11px] font-semibold text-[#eed3a2] underline hover:text-white print:hidden"
                    >
                      ⬇ הורד גרפיקה
                    </a>
                  </div>
                )}

                <div>
                  <p className="font-semibold text-[#fbf8f2]">{item.name}</p>
                  {item.customSpecs && (
                    <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-[#eed3a2]">
                      {item.customSpecs.technique && (
                        <span className="rounded border border-[#c59b5f]/40 bg-[#1e1510] px-2 py-0.5">
                          {item.customSpecs.technique}
                        </span>
                      )}
                      {item.customSpecs.widthCm && item.customSpecs.heightCm && (
                        <span className="rounded border border-[#c59b5f]/40 bg-[#1e1510] px-2 py-0.5">
                          {item.customSpecs.widthCm}×{item.customSpecs.heightCm} ס&quot;מ
                        </span>
                      )}
                      {item.customSpecs.baseColor && (
                        <span className="rounded border border-[#c59b5f]/40 bg-[#1e1510] px-2 py-0.5">
                          בסיס: {item.customSpecs.baseColor}
                        </span>
                      )}
                    </div>
                  )}
                  {item.customNotes && (
                    <p className="mt-1 text-xs text-amber-300">הערת לקוח: {item.customNotes}</p>
                  )}
                </div>
              </div>

              <div className="text-left">
                <span className="inline-block rounded-lg border border-[#c59b5f]/40 bg-[#1e1510] px-3 py-1 text-sm font-bold text-[#eed3a2]">
                  כמות: {item.quantity}
                </span>
                <p className="mt-1 text-xs text-[#8a7b6b]">
                  {formatIls(item.priceIls)} ליח&apos; • סה&quot;כ {formatIls(item.priceIls * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Factory Tracking & Notes Controls */}
      <div className="mt-4 grid gap-3 border-t border-[#2d2118] pt-4 sm:grid-cols-12 print:hidden">
        <input
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="מספר מעקב משלוח (שמירה תסמן כנשלח)"
          className="rounded-xl border border-[#2d2118] bg-[#1a130f] px-3.5 py-2 text-xs text-[#f3ede2] placeholder-[#7d6f60] outline-none focus:border-[#dfb37c] sm:col-span-4"
        />
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="הערות מפעל / אריזה פנימיות..."
          className="rounded-xl border border-[#2d2118] bg-[#1a130f] px-3.5 py-2 text-xs text-[#f3ede2] placeholder-[#7d6f60] outline-none focus:border-[#dfb37c] sm:col-span-6"
        />
        <button
          type="button"
          disabled={pending}
          onClick={handleSave}
          className="rounded-xl border border-[#c59b5f]/50 bg-[#1e1510] px-4 py-2 text-xs font-semibold text-[#eed3a2] transition hover:border-[#dfb37c] hover:text-white disabled:opacity-50 sm:col-span-2"
        >
          {saved ? "✓ נשמר" : pending ? "שומר..." : "שמור פרטים"}
        </button>
      </div>
    </article>
  );
}
