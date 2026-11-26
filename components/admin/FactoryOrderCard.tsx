"use client";

import { useState, useTransition } from "react";
import type { Order, ProductionStatus, ShippingMethod } from "@/lib/types";
import { formatIls } from "@/lib/format";
import {
  updateFactoryOrder,
  updateProductionStatus,
} from "@/app/admin/(dashboard)/factory/actions";

const STATUS_LABELS: Record<
  ProductionStatus,
  { label: string; color: string; next?: ProductionStatus; nextLabel?: string }
> = {
  pending_production: {
    label: "ממתין לייצור",
    color: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    next: "in_production",
    nextLabel: "העבר לפס הייצור ←",
  },
  in_production: {
    label: "בייצור במפעל",
    color: "bg-sky-500/15 text-sky-300 border-sky-500/40",
    next: "quality_check",
    nextLabel: "העבר לבקרת איכות ←",
  },
  quality_check: {
    label: "בקרת איכות",
    color: "bg-purple-500/15 text-purple-300 border-purple-500/40",
    next: "ready_to_ship",
    nextLabel: "אישור בקרת איכות ←",
  },
  ready_to_ship: {
    label: "מוכן למשלוח",
    color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    next: "shipped",
    nextLabel: "סמן כנשלח לשליח ←",
  },
  shipped: {
    label: "נשלח ללקוח",
    color: "bg-zinc-500/15 text-zinc-300 border-zinc-500/40",
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

export function FactoryOrderCard({ order }: { order: Order }) {
  const [pending, startTransition] = useTransition();
  const currentStatus: ProductionStatus = order.productionStatus ?? "pending_production";
  const statusInfo = STATUS_LABELS[currentStatus] || STATUS_LABELS.pending_production;
  const isPaid = order.status === "paid" || order.status === "fulfilled";

  const [notes, setNotes] = useState(order.factoryNotes ?? "");
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [savedNotes, setSavedNotes] = useState(false);

  function handleStatusChange(newStatus: ProductionStatus) {
    startTransition(async () => {
      await updateProductionStatus(order.id, newStatus);
    });
  }

  function handleSaveDetails() {
    startTransition(async () => {
      await updateFactoryOrder({
        orderId: order.id,
        factoryNotes: notes,
        trackingNumber: tracking,
      });
      setSavedNotes(true);
      setTimeout(() => setSavedNotes(false), 2000);
    });
  }

  const totalUnits = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const hasCustom = order.items.some((i) => Boolean(i.customArtworkUrl));
  const waHref = toWhatsAppHref(order.customerPhone);
  const mapsHref = order.shippingAddress ? toMapsHref(order.shippingAddress) : "";

  return (
    <article
      className={`overflow-hidden rounded-2xl border-2 bg-[#17110d] text-right shadow-[0_14px_40px_rgba(0,0,0,0.65)] ${
        isPaid ? "border-[#c59b5f]/65" : "border-rose-500/45"
      }`}
    >
      {/* Top Color Accent Bar */}
      <div
        className={`h-1.5 w-full ${
          isPaid
            ? "bg-gradient-to-l from-emerald-500 via-[#d4af37] to-[#8f5823]"
            : "bg-gradient-to-l from-rose-500/80 to-amber-500/60"
        }`}
      />

      <div className="space-y-5 p-5 sm:p-6">
        {/* Header Bar */}
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
                ⚠ לא שולם ({order.status}) — לא לייצר
              </span>
            )}
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
            {hasCustom && (
              <span className="rounded-full border border-[#c59b5f]/40 bg-[#261a11] px-3 py-1 text-xs font-bold text-[#eed3a2]">
                🎨 עיצוב אישי
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-[#aa9c8d]">
              {new Date(order.createdAt).toLocaleString("he-IL", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {statusInfo.next && (
              <button
                type="button"
                onClick={() => handleStatusChange(statusInfo.next!)}
                disabled={pending}
                className="rounded-xl bg-[#b8864b] px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-[#c99a65] disabled:opacity-50"
              >
                {statusInfo.nextLabel}
              </button>
            )}
          </div>
        </div>

        {/* 3-Column Clickable Customer, Shipping & Payment Grid */}
        <div className="grid gap-3.5 md:grid-cols-3">
          {/* Customer Box */}
          <div className="rounded-xl border border-[#2d2118] bg-[#110c09] p-4 text-xs space-y-1.5">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#c59b5f]">
              פרטי לקוח
            </span>
            <p className="text-sm font-bold text-[#fbf8f2]">{order.customerName}</p>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <a
                href={`tel:${order.customerPhone}`}
                dir="ltr"
                className="inline-flex items-center gap-1 rounded-lg border border-[#c59b5f]/35 bg-[#1c140f] px-2.5 py-1 font-medium text-[#eed3a2] transition hover:border-[#dfb37c] hover:text-white"
              >
                📞 {order.customerPhone}
              </a>
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-300 transition hover:bg-emerald-500/20"
                >
                  💬 WhatsApp
                </a>
              )}
            </div>
            <div>
              <a
                href={`mailto:${order.customerEmail}`}
                dir="ltr"
                className="inline-flex items-center gap-1 text-[#dfb37c] underline decoration-[#c59b5f]/40 underline-offset-2 transition hover:text-white"
              >
                ✉️ {order.customerEmail}
              </a>
            </div>
          </div>

          {/* Shipping & Clickable Address Box */}
          <div className="rounded-xl border border-[#2d2118] bg-[#110c09] p-4 text-xs space-y-1.5">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#c59b5f]">
              משלוח וכתובת אספקה
            </span>
            <p className="font-semibold text-[#fbf8f2]">
              {order.shippingMethod ? SHIPPING_LABELS[order.shippingMethod] : "שליח עד הבית"}
            </p>
            {order.shippingAddress && (
              <a
                href={mapsHref}
                target="_blank"
                rel="noreferrer"
                title="פתיחה ב-Google Maps"
                className="inline-flex items-start gap-1.5 rounded-lg border border-[#c59b5f]/35 bg-[#1c140f] px-2.5 py-1.5 text-[#eed3a2] transition hover:border-[#dfb37c] hover:text-white"
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

          {/* Payment Summary Box */}
          <div className="rounded-xl border border-[#2d2118] bg-[#110c09] p-4 text-xs space-y-1.5">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#c59b5f]">
              סיכום ותשלום
            </span>
            <p className="text-lg font-bold text-gold-gradient">{formatIls(order.totalIls)}</p>
            <p className="text-[#aa9c8d]">
              {totalUnits} יח&apos; סה&quot;כ
              {typeof order.shippingCostIls === "number"
                ? ` · משלוח: ${order.shippingCostIls === 0 ? "חינם" : formatIls(order.shippingCostIls)}`
                : ""}
            </p>
            {order.payplusApprovalNum && (
              <p className="font-mono text-[#c7b9a8]">
                אישור PayPlus: {order.payplusApprovalNum}
              </p>
            )}
            {order.payplusInvoiceUrl && (
              <a
                href={order.payplusInvoiceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block font-semibold text-[#eed3a2] underline hover:text-white"
              >
                צפייה בחשבונית PDF ↗
              </a>
            )}
          </div>
        </div>

        {/* Full-Width Item Spec Sheets */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#eed3a2]">
            פירוט פריטים לייצור ולאריזה ({order.items.length} שורות · {totalUnits} יח&apos;)
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
                      מחיר יח&apos;: {formatIls(item.priceIls)} · סה&quot;כ שורה:{" "}
                      <strong className="text-[#eed3a2]">
                        {formatIls(item.priceIls * item.quantity)}
                      </strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-lg border border-[#c59b5f]/50 bg-[#241910] px-3.5 py-1.5 text-sm font-extrabold text-[#eed3a2]">
                      כמות לייצור: {item.quantity} יח&apos;
                    </span>
                    {item.customArtworkUrl && (
                      <a
                        href={item.customArtworkUrl}
                        download={`order-${order.id.slice(0, 6)}-artwork-${idx + 1}.png`}
                        className="rounded-lg bg-[#8f5823] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#ad7c44]"
                      >
                        ⬇ הורד קובץ גרפיקה מקורי
                      </a>
                    )}
                  </div>
                </div>

                {/* Visuals: Requested Item Image + Custom Artwork Preview */}
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
                          alt="קובץ גרפיקה של הלקוח"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Technical Production Specs */}
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
                            <span className="text-[#aa9c8d]">טכניקת ייצור:</span>
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
                        <strong className="block text-amber-300">הערות הלקוח לייצור:</strong>
                        {item.customNotes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Factory Controls Footer */}
        <div className="grid gap-3 border-t border-[#2d2118] pt-4 md:grid-cols-12">
          <div className="md:col-span-5">
            <label className="mb-1 block text-[11px] font-medium text-[#aa9c8d]">
              הערות מפעל / שיבוץ מכונה:
            </label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="למשל: נשלח למכונת רקמה 4, חוט זהב מטאלי 22"
              className="w-full rounded-xl border border-[#3a2a1e] bg-[#110c09] px-3.5 py-2 text-xs text-[#f3ede2] placeholder-[#7d6f60] outline-none focus:border-[#dfb37c]"
            />
          </div>

          <div className="md:col-span-4">
            <label className="mb-1 block text-[11px] font-medium text-[#aa9c8d]">
              מספר מעקב משלוח (שמירה מעדכנת לנשלח):
            </label>
            <input
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              dir="ltr"
              placeholder="CH-90812344IL"
              className="w-full rounded-xl border border-[#3a2a1e] bg-[#110c09] px-3.5 py-2 text-left font-mono text-xs text-[#f3ede2] placeholder-[#7d6f60] outline-none focus:border-[#dfb37c]"
            />
          </div>

          <div className="flex items-end gap-2 md:col-span-3">
            <select
              value={currentStatus}
              disabled={pending}
              onChange={(e) => handleStatusChange(e.target.value as ProductionStatus)}
              aria-label="עדכון סטטוס ייצור"
              className="flex-1 rounded-xl border border-[#3a2a1e] bg-[#110c09] px-2.5 py-2 text-xs text-[#f3ede2] outline-none focus:border-[#dfb37c]"
            >
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleSaveDetails}
              disabled={pending}
              className="rounded-xl border border-[#c59b5f]/50 bg-[#241910] px-4 py-2 text-xs font-bold text-[#eed3a2] transition hover:border-[#dfb37c] hover:text-white disabled:opacity-50"
            >
              {savedNotes ? "✓ נשמר" : "שמור"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
