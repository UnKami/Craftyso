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

function toWhatsAppHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("972")) return `https://wa.me/${digits}`;
  if (digits.startsWith("0")) return `https://wa.me/972${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

function toMapsHref(address: string): string {
  const cleaned = address.replace(/^איסוף עצמי\s*[—-]\s*/, "").trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleaned)}`;
}

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

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-[#c59b5f]/40 bg-[#1a130f] px-4 py-2 text-xs font-semibold text-[#eed3a2] transition hover:border-[#dfb37c] hover:text-white"
          >
            🖨️ הדפסת רשימת הזמנות
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
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

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#382a20] bg-[#140e0b]/60 p-12 text-center text-sm text-[#aa9c8d]">
            אין כרגע הזמנות להצגה בסינון זה.
          </div>
        ) : (
          <div className="space-y-8">
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
  const totalUnits = order.items.reduce((s, i) => s + i.quantity, 0);
  const waHref = toWhatsAppHref(order.customerPhone);
  const mapsHref = order.shippingAddress ? toMapsHref(order.shippingAddress) : "";

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
    <article
      className={`break-inside-avoid overflow-hidden rounded-2xl border-2 bg-[#17110d] shadow-[0_14px_40px_rgba(0,0,0,0.65)] ${
        isPaid ? "border-[#c59b5f]/65" : "border-rose-500/45"
      }`}
    >
      <div
        className={`h-1.5 w-full ${
          isPaid
            ? "bg-gradient-to-l from-emerald-500 via-[#d4af37] to-[#8f5823]"
            : "bg-gradient-to-l from-rose-500/80 to-amber-500/60"
        }`}
      />

      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2d2118] pb-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-lg border border-[#c59b5f]/40 bg-[#221811] px-2.5 py-1 font-mono text-sm font-bold text-[#eed3a2]">
              #{order.id.slice(0, 8)}
            </span>
            {isPaid ? (
              <span className="rounded-full border border-emerald-500/50 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
                ✓ שולם — מאושר לייצור
              </span>
            ) : (
              <span className="rounded-full border border-rose-500/50 bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-300">
                ⚠ טרם שולם ({order.status}) — לא לייצר
              </span>
            )}
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.badge}`}
            >
              {statusInfo.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#aa9c8d]">
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
                className="rounded-xl bg-[#b8864b] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#c99a65] disabled:opacity-50 print:hidden"
              >
                {statusInfo.nextLabel}
              </button>
            )}
          </div>
        </div>

        {/* Clickable Customer + Shipping + Payment Details */}
        <div className="grid gap-3.5 text-xs md:grid-cols-3">
          <div className="rounded-xl border border-[#2d2118] bg-[#110c09] p-4 space-y-1.5">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#c59b5f]">
              פרטי לקוח
            </span>
            <p className="text-sm font-bold text-[#fbf8f2]">{order.customerName}</p>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <a
                href={`tel:${order.customerPhone}`}
                dir="ltr"
                className="inline-flex items-center gap-1 rounded-lg border border-[#c59b5f]/35 bg-[#1c140f] px-2.5 py-1 font-medium text-[#eed3a2] hover:border-[#dfb37c] hover:text-white"
              >
                📞 {order.customerPhone}
              </a>
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-300 hover:bg-emerald-500/20"
                >
                  💬 WhatsApp
                </a>
              )}
            </div>
            <div>
              <a
                href={`mailto:${order.customerEmail}`}
                dir="ltr"
                className="inline-flex items-center gap-1 text-[#dfb37c] underline decoration-[#c59b5f]/40 underline-offset-2 hover:text-white"
              >
                ✉️ {order.customerEmail}
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-[#2d2118] bg-[#110c09] p-4 space-y-1.5">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#c59b5f]">
              פרטי משלוח וכתובת
            </span>
            <p className="font-semibold text-[#fbf8f2]">
              {order.shippingMethod ? SHIPPING_LABELS[order.shippingMethod] : "שליח עד הבית"}
            </p>
            {order.shippingAddress && (
              <a
                href={mapsHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-start gap-1.5 rounded-lg border border-[#c59b5f]/35 bg-[#1c140f] px-2.5 py-1.5 text-[#eed3a2] hover:border-[#dfb37c] hover:text-white"
              >
                <span>📍</span>
                <span className="underline decoration-[#c59b5f]/40 underline-offset-2">
                  {order.shippingAddress}
                </span>
              </a>
            )}
            {order.shippingDetails?.deliveryNotes && (
              <p className="text-amber-300">
                הערות לשליח: {order.shippingDetails.deliveryNotes}
              </p>
            )}
            {order.trackingNumber && (
              <p className="font-mono font-semibold text-emerald-400">
                מס׳ מעקב: {order.trackingNumber}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[#2d2118] bg-[#110c09] p-4 space-y-1.5">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#c59b5f]">
              תשלום וסיכום
            </span>
            <p className="text-lg font-bold text-gold-gradient">{formatIls(order.totalIls)}</p>
            <p className="text-[#aa9c8d]">{totalUnits} יח&apos; סה&quot;כ</p>
            {order.payplusApprovalNum && (
              <p className="font-mono text-[#c7b9a8]">אישור PayPlus: {order.payplusApprovalNum}</p>
            )}
          </div>
        </div>

        {/* Itemized Spec Sheets */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#eed3a2]">
            פריטים בהזמנה ({totalUnits} יח&apos;)
          </h3>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div
                key={`${item.productId}-${idx}`}
                className="rounded-xl border border-[#3a2a1e] bg-[#110c09] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#241a13] pb-3">
                  <div>
                    <p className="text-base font-bold text-[#fbf8f2]">{item.name}</p>
                    <p className="mt-0.5 text-xs text-[#aa9c8d]">
                      {formatIls(item.priceIls)} ליח&apos; · סה&quot;כ{" "}
                      <strong className="text-[#eed3a2]">
                        {formatIls(item.priceIls * item.quantity)}
                      </strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg border border-[#c59b5f]/50 bg-[#241910] px-3.5 py-1.5 text-sm font-extrabold text-[#eed3a2]">
                      כמות: {item.quantity} יח&apos;
                    </span>
                    {item.customArtworkUrl && (
                      <a
                        href={item.customArtworkUrl}
                        download={`artwork-${order.id.slice(0, 6)}-${idx + 1}.png`}
                        className="rounded-lg bg-[#8f5823] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#ad7c44] print:hidden"
                      >
                        ⬇ הורד גרפיקה מקורית
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-3.5 grid gap-4 sm:grid-cols-12">
                  {item.image && (
                    <div className="sm:col-span-3">
                      <span className="mb-1.5 block text-[11px] font-semibold text-[#aa9c8d]">
                        תמונת הפריט המבוקש:
                      </span>
                      <div className="flex h-36 items-center justify-center overflow-hidden rounded-xl border border-[#2d2118] bg-[#1c140f] p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="max-h-full max-w-full rounded object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {item.customArtworkUrl && (
                    <div className={item.image ? "sm:col-span-5" : "sm:col-span-7"}>
                      <span className="mb-1.5 block text-[11px] font-semibold text-[#eed3a2]">
                        קובץ גרפיקה לרקמה / הדפסה:
                      </span>
                      <div className="flex h-36 items-center justify-center overflow-hidden rounded-xl border-2 border-[#c59b5f]/40 bg-white p-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.customArtworkUrl}
                          alt="קובץ גרפיקה"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  <div
                    className={`flex flex-col justify-center gap-2 ${
                      item.image && item.customArtworkUrl
                        ? "sm:col-span-4"
                        : item.image || item.customArtworkUrl
                          ? "sm:col-span-5"
                          : "sm:col-span-12"
                    }`}
                  >
                    {item.customSpecs && (
                      <div className="grid grid-cols-1 gap-2 rounded-xl border border-[#2d2118] bg-[#1a130f] p-3 text-xs">
                        {item.customSpecs.technique && (
                          <div className="flex justify-between gap-2">
                            <span className="text-[#aa9c8d]">טכניקה:</span>
                            <strong className="text-[#fbf8f2]">{item.customSpecs.technique}</strong>
                          </div>
                        )}
                        {item.customSpecs.widthCm && item.customSpecs.heightCm && (
                          <div className="flex justify-between gap-2">
                            <span className="text-[#aa9c8d]">מידות:</span>
                            <strong className="text-[#fbf8f2]">
                              {item.customSpecs.widthCm}×{item.customSpecs.heightCm} ס&quot;מ
                            </strong>
                          </div>
                        )}
                        {item.customSpecs.baseColor && (
                          <div className="flex justify-between gap-2">
                            <span className="text-[#aa9c8d]">צבע בסיס:</span>
                            <strong className="text-[#fbf8f2]">{item.customSpecs.baseColor}</strong>
                          </div>
                        )}
                      </div>
                    )}
                    {item.customNotes && (
                      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200">
                        <strong className="block text-amber-300">הערת לקוח:</strong>
                        {item.customNotes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Factory Tracking & Notes Controls */}
        <div className="grid gap-3 border-t border-[#2d2118] pt-4 sm:grid-cols-12 print:hidden">
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            dir="ltr"
            placeholder="מספר מעקב משלוח (שמירה תסמן כנשלח)"
            className="rounded-xl border border-[#3a2a1e] bg-[#110c09] px-3.5 py-2 text-left font-mono text-xs text-[#f3ede2] placeholder-[#7d6f60] outline-none focus:border-[#dfb37c] sm:col-span-4"
          />
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="הערות מפעל / אריזה פנימיות..."
            className="rounded-xl border border-[#3a2a1e] bg-[#110c09] px-3.5 py-2 text-xs text-[#f3ede2] placeholder-[#7d6f60] outline-none focus:border-[#dfb37c] sm:col-span-6"
          />
          <button
            type="button"
            disabled={pending}
            onClick={handleSave}
            className="rounded-xl border border-[#c59b5f]/50 bg-[#241910] px-4 py-2 text-xs font-bold text-[#eed3a2] transition hover:border-[#dfb37c] hover:text-white disabled:opacity-50 sm:col-span-2"
          >
            {saved ? "✓ נשמר" : pending ? "שומר..." : "שמור פרטים"}
          </button>
        </div>
      </div>
    </article>
  );
}
