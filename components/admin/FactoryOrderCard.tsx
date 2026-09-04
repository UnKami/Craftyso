"use client";

import { useState, useTransition } from "react";
import type { Order, ProductionStatus } from "@/lib/types";
import { formatIls } from "@/lib/format";
import { updateProductionStatus, updateFactoryOrder } from "@/app/admin/(dashboard)/factory/actions";

const STATUS_LABELS: Record<ProductionStatus, { label: string; color: string; next?: ProductionStatus; nextLabel?: string }> = {
  pending_production: {
    label: "ממתין לייצור",
    color: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    next: "in_production",
    nextLabel: "העבר לפס הייצור ←",
  },
  in_production: {
    label: "בייצור במפעל",
    color: "bg-blue-500/15 text-blue-600 border-blue-500/30",
    next: "quality_check",
    nextLabel: "העבר לבקרת איכות ←",
  },
  quality_check: {
    label: "בקרת איכות",
    color: "bg-purple-500/15 text-purple-600 border-purple-500/30",
    next: "ready_to_ship",
    nextLabel: "אישור בקרת איכות ←",
  },
  ready_to_ship: {
    label: "מוכן למשלוח",
    color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    next: "shipped",
    nextLabel: "סמן כנשלח לשליח ←",
  },
  shipped: {
    label: "נשלח ללקוח",
    color: "bg-gray-500/15 text-gray-600 border-gray-500/30",
  },
};

export function FactoryOrderCard({ order }: { order: Order }) {
  const [pending, startTransition] = useTransition();
  const currentStatus: ProductionStatus = order.productionStatus ?? "pending_production";
  const statusInfo = STATUS_LABELS[currentStatus] || STATUS_LABELS.pending_production;

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

  const customItems = order.items.filter((i) => Boolean(i.customArtworkUrl));
  const standardItems = order.items.filter((i) => !i.customArtworkUrl);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm text-right">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3.5">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-ink-muted">
            #{order.id.slice(0, 8)}
          </span>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
          {customItems.length > 0 && (
            <span className="rounded-full bg-brand/10 border border-brand/30 px-2.5 py-0.5 text-xs font-bold text-brand">
              🎨 פריט בעיצוב אישי
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted">
            {new Date(order.createdAt).toLocaleDateString("he-IL", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {statusInfo.next && (
            <button
              onClick={() => handleStatusChange(statusInfo.next!)}
              disabled={pending}
              className="rounded-lg bg-brand px-3 py-1 text-xs font-semibold text-white hover:bg-brand-dark transition disabled:opacity-50"
            >
              {statusInfo.nextLabel}
            </button>
          )}
        </div>
      </div>

      {/* Customer Info Strip */}
      <div className="mt-3 flex flex-wrap items-center gap-6 rounded-xl bg-surface-muted p-3 text-xs text-ink-muted">
        <div>
          <span className="font-semibold text-ink">{order.customerName}</span>
        </div>
        <div>
          <span>טלפון: </span>
          <a href={`tel:${order.customerPhone}`} className="text-brand font-medium hover:underline">
            {order.customerPhone}
          </a>
        </div>
        {order.customerEmail && (
          <div>
            <span>אימייל: </span>
            <span className="font-mono">{order.customerEmail}</span>
          </div>
        )}
        {order.shippingAddress && (
          <div>
            <span>כתובת אספקה: </span>
            <span className="font-medium text-ink">{order.shippingAddress}</span>
          </div>
        )}
      </div>

      {/* Custom Items with Artwork Downloads */}
      {customItems.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand">
            פריטי ייצור מותאמים (קבצי גרפיקה להורדה):
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {customItems.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-3 rounded-xl border border-brand/20 bg-surface-muted/60 p-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-ink text-sm">{item.name}</h5>
                    <p className="text-xs text-ink-muted mt-0.5">
                      כמות לייצור: <span className="font-bold text-ink">{item.quantity} יח&apos;</span>
                    </p>
                  </div>

                  {item.customArtworkUrl && (
                    <a
                      href={item.customArtworkUrl}
                      download={`factory-order-${order.id.slice(0, 6)}-item-${idx + 1}`}
                      className="shrink-0 rounded-lg border border-brand bg-surface px-2.5 py-1 text-[11px] font-bold text-brand hover:bg-brand hover:text-white transition shadow-sm"
                      title="הורדת קובץ גרפי מקורי ברזולוציה מלאה למכונות המפעל"
                    >
                      ⬇ הורד קובץ מקורי
                    </a>
                  )}
                </div>

                {/* Artwork Preview Thumbnail */}
                {item.customArtworkUrl && (
                  <div className="relative h-28 w-full overflow-hidden rounded-lg border border-border bg-white p-2 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.customArtworkUrl}
                      alt="גרפיקה לייצור"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}

                {/* Specifications & Notes */}
                {item.customSpecs && (
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-surface p-2 rounded-lg border border-border">
                    <div>
                      <span className="text-ink-muted">מידות: </span>
                      <span className="font-semibold text-ink">
                        {item.customSpecs.widthCm}×{item.customSpecs.heightCm} ס&quot;מ
                      </span>
                    </div>
                    <div>
                      <span className="text-ink-muted">טכניקה: </span>
                      <span className="font-semibold text-ink">{item.customSpecs.technique}</span>
                    </div>
                    <div>
                      <span className="text-ink-muted">צבע בסיס: </span>
                      <span className="font-semibold text-ink">{item.customSpecs.baseColor}</span>
                    </div>
                  </div>
                )}

                {item.customNotes && (
                  <p className="rounded-lg bg-amber-500/10 p-2 text-[11px] text-amber-800 border border-amber-500/20">
                    <strong>הערת לקוח:</strong> {item.customNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standard Items if any */}
      {standardItems.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-bold text-ink-muted mb-1.5">פריטי מדף להרכבה באריזה:</h4>
          <ul className="divide-y divide-border rounded-xl border border-border bg-surface-muted/40 p-2 text-xs">
            {standardItems.map((item, idx) => (
              <li key={idx} className="flex justify-between py-1 px-2">
                <span>{item.name}</span>
                <span className="font-bold">{item.quantity} יח&apos;</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Factory Controls & Tracking Strip */}
      <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          <span>הערות מפעל / שיבוץ מכונה:</span>
          <input
            type="text"
            placeholder="למשל: נשלח למכונת רקמה 4, חוט זהב מטאלי 22"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-ink"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          <span>מספר מעקב משלוח (הזנת מספר מעדכנת לנשלח):</span>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="למשל: CH-90812344IL"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-ink"
            />
            <button
              onClick={handleSaveDetails}
              disabled={pending}
              className="rounded-lg bg-surface-muted border border-border px-3 py-1.5 text-xs font-medium text-ink hover:border-brand hover:text-brand transition"
            >
              {savedNotes ? "✓ נשמר" : "שמור"}
            </button>
          </div>
        </label>
      </div>

      {/* Direct Status Selector Dropdown */}
      <div className="mt-3 flex items-center justify-between text-xs border-t border-border pt-2 text-ink-muted">
        <label className="flex items-center gap-2">
          <span>עדכון סטטוס ידני:</span>
          <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value as ProductionStatus)}
            disabled={pending}
            className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-ink"
          >
            <option value="pending_production">ממתין לייצור</option>
            <option value="in_production">בייצור במפעל</option>
            <option value="quality_check">בקרת איכות</option>
            <option value="ready_to_ship">מוכן למשלוח</option>
            <option value="shipped">נשלח ללקוח</option>
          </select>
        </label>

        <div className="text-left font-bold text-ink">
          סה&quot;כ הזמנה: {formatIls(order.totalIls)}
        </div>
      </div>
    </div>
  );
}
