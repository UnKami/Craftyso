"use client";

import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import type { Order, ProductionStatus, ShippingMethod } from "@/lib/types";
import { formatIls } from "@/lib/format";

const STATUS_META: Record<
  ProductionStatus,
  { label: string; badge: string; next?: ProductionStatus; nextLabel?: string }
> = {
  pending_production: {
    label: "ממתין לייצור",
    badge: "border-amber-500/50 bg-amber-500/20 text-amber-200",
    next: "in_production",
    nextLabel: "העבר לפס הייצור ←",
  },
  in_production: {
    label: "בייצור במפעל",
    badge: "border-sky-500/50 bg-sky-500/20 text-sky-200",
    next: "quality_check",
    nextLabel: "העבר לבקרת איכות ←",
  },
  quality_check: {
    label: "בקרת איכות",
    badge: "border-purple-500/50 bg-purple-500/20 text-purple-200",
    next: "ready_to_ship",
    nextLabel: "אישור בקרת איכות ←",
  },
  ready_to_ship: {
    label: "מוכן למשלוח",
    badge: "border-emerald-500/50 bg-emerald-500/20 text-emerald-200",
    next: "shipped",
    nextLabel: "סמן כנשלח לשליח ←",
  },
  shipped: {
    label: "נשלח ללקוח",
    badge: "border-zinc-500/50 bg-zinc-500/20 text-zinc-200",
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

type FilterKey = "all" | "paid_active" | "shipped";

export function FactoryOrdersGrid({
  orders,
  defaultFilter = "all",
  onUpdateStatus,
  onSaveDetails,
}: {
  orders: Order[];
  defaultFilter?: FilterKey;
  onUpdateStatus: (orderId: string, status: ProductionStatus) => Promise<void>;
  onSaveDetails: (input: {
    orderId: string;
    factoryNotes: string;
    trackingNumber: string;
  }) => Promise<void>;
}) {
  const [filter, setFilter] = useState<FilterKey>(defaultFilter);
  const [search, setSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const paidActiveCount = orders.filter(
    (o) =>
      (o.status === "paid" || o.status === "fulfilled") &&
      o.productionStatus !== "shipped" &&
      o.status !== "fulfilled",
  ).length;
  const shippedCount = orders.filter(
    (o) => o.productionStatus === "shipped" || o.status === "fulfilled",
  ).length;

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
        o.customerEmail.toLowerCase().includes(q) ||
        (o.shippingAddress ?? "").toLowerCase().includes(q) ||
        o.items.some((i) => i.name.toLowerCase().includes(q))
      );
    });
  }, [orders, filter, search]);

  return (
    <div className="space-y-5">
      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("paid_active")}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === "paid_active"
                ? "border-[#dfb37c] bg-[#c59b5f]/20 text-[#eed3a2]"
                : "border-[#2d2118] bg-[#140e0b] text-[#aa9c8d] hover:text-white"
            }`}
          >
            שולם — לייצור ({paidActiveCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("shipped")}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
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
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === "all"
                ? "border-[#dfb37c] bg-[#c59b5f]/20 text-[#eed3a2]"
                : "border-[#2d2118] bg-[#140e0b] text-[#aa9c8d] hover:text-white"
            }`}
          >
            הכל ({orders.length})
          </button>
        </div>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש לפי פריט, לקוח, טלפון, כתובת או מס׳ הזמנה..."
          className="w-full rounded-xl border border-[#2d2118] bg-[#140e0b] px-4 py-2 text-xs text-[#f3ede2] placeholder-[#7d6f60] outline-none focus:border-[#dfb37c] sm:w-80"
        />
      </div>

      {/* Image-First Compact Card Grid (3 cards per row on desktop) */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#382a20] bg-[#140e0b]/60 p-12 text-center text-sm text-[#aa9c8d]">
          אין כרגע הזמנות להצגה בסינון זה.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((order) => {
            const isPaid = order.status === "paid" || order.status === "fulfilled";
            const prodStatus: ProductionStatus = order.productionStatus ?? "pending_production";
            const statusInfo = STATUS_META[prodStatus] ?? STATUS_META.pending_production;
            const primaryItem = order.items[0];
            const totalUnits = order.items.reduce((s, i) => s + i.quantity, 0);
            const extraCount = order.items.length - 1;
            const customArtwork = order.items.find((i) => i.customArtworkUrl)?.customArtworkUrl;

            return (
              <button
                key={order.id}
                type="button"
                onClick={() => setSelectedOrderId(order.id)}
                className={`group flex flex-col overflow-hidden rounded-2xl border-2 bg-[#16100c] text-right shadow-[0_10px_30px_rgba(0,0,0,0.55)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(197,155,95,0.22)] ${
                  isPaid
                    ? "border-[#c59b5f]/55 hover:border-[#eed3a2]"
                    : "border-rose-500/40 hover:border-rose-400"
                }`}
              >
                {/* Image-First Hero Area */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1e1510]">
                  {primaryItem?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={primaryItem.image}
                      alt={primaryItem.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl text-[#5a4632]">
                      🧵
                    </div>
                  )}

                  {/* Subtle dark gradient for crisp overlays */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#16100c] via-black/15 to-black/45" />

                  {/* Top Status Badges */}
                  <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-md ${
                        isPaid
                          ? "border-emerald-400/60 bg-emerald-950/85 text-emerald-300"
                          : "border-rose-400/60 bg-rose-950/85 text-rose-300"
                      }`}
                    >
                      {isPaid ? "✓ שולם" : "⚠ לא שולם"}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-md ${statusInfo.badge}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Floating Custom Artwork Thumbnail (if custom order) */}
                  {customArtwork && (
                    <div className="absolute bottom-3 left-3 flex flex-col items-center rounded-xl border-2 border-[#eed3a2] bg-white p-1.5 shadow-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={customArtwork}
                        alt="גרפיקת לקוח"
                        className="h-12 w-12 object-contain"
                      />
                      <span className="mt-0.5 text-[9px] font-bold text-[#1d1612]">גרפיקה</span>
                    </div>
                  )}

                  {/* Quantity & Order # Pill */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                    <span className="rounded-lg border border-[#c59b5f]/50 bg-[#140e0b]/90 px-2.5 py-1 text-xs font-extrabold text-[#eed3a2] backdrop-blur-md">
                      ×{totalUnits} יח&apos;
                    </span>
                    <span className="rounded-lg bg-black/75 px-2 py-1 font-mono text-[11px] text-[#c7b9a8] backdrop-blur-md">
                      #{order.id.slice(0, 6)}
                    </span>
                  </div>
                </div>

                {/* Compact Card Body */}
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="line-clamp-2 text-sm font-bold text-[#fbf8f2] group-hover:text-[#eed3a2]">
                    {primaryItem?.name ?? "הזמנה"}
                    {extraCount > 0 && (
                      <span className="mr-1.5 text-xs font-normal text-[#c59b5f]">
                        (+{extraCount} פריטים)
                      </span>
                    )}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-[#aa9c8d]">
                    <span className="truncate font-medium text-[#d8cbb9]">{order.customerName}</span>
                    <span className="shrink-0 font-bold text-gold-gradient">
                      {formatIls(order.totalIls)}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-[#2d2118] pt-2.5 text-[11px] text-[#8a7b6b]">
                    <span>
                      {new Date(order.createdAt).toLocaleString("he-IL", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="font-semibold text-[#c59b5f] group-hover:text-[#eed3a2]">
                      לפרטי ההזמנה והייצור ←
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Expanded Order Detail Dialog */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrderId(null)}
          onUpdateStatus={onUpdateStatus}
          onSaveDetails={onSaveDetails}
        />
      )}
    </div>
  );
}

function OrderDetailModal({
  order,
  onClose,
  onUpdateStatus,
  onSaveDetails,
}: {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: ProductionStatus) => Promise<void>;
  onSaveDetails: (input: {
    orderId: string;
    factoryNotes: string;
    trackingNumber: string;
  }) => Promise<void>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState(order.factoryNotes ?? "");
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [saved, setSaved] = useState(false);

  const isPaid = order.status === "paid" || order.status === "fulfilled";
  const currentStatus: ProductionStatus = order.productionStatus ?? "pending_production";
  const statusInfo = STATUS_META[currentStatus] ?? STATUS_META.pending_production;
  const totalUnits = order.items.reduce((s, i) => s + i.quantity, 0);
  const waHref = toWhatsAppHref(order.customerPhone);
  const mapsHref = order.shippingAddress ? toMapsHref(order.shippingAddress) : "";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const inside =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (!inside) dialog.close();
    };

    const needsFallback =
      typeof HTMLDialogElement !== "undefined" &&
      !("closedBy" in HTMLDialogElement.prototype);
    if (needsFallback) dialog.addEventListener("click", handleBackdropClick);

    return () => {
      dialog.removeEventListener("close", handleClose);
      if (needsFallback) dialog.removeEventListener("click", handleBackdropClick);
    };
  }, [onClose]);

  function handleAdvance(status: ProductionStatus) {
    startTransition(async () => {
      await onUpdateStatus(order.id, status);
    });
  }

  function handleSave() {
    startTransition(async () => {
      await onSaveDetails({
        orderId: order.id,
        factoryNotes: notes,
        trackingNumber: tracking,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: "any" } as Record<string, string>)}
      aria-labelledby={titleId}
      className="m-auto max-h-[92vh] w-[min(95vw,64rem)] overflow-hidden rounded-2xl border-2 border-[#c59b5f]/70 bg-[#140e0b] p-0 text-right text-[#f3ede2] shadow-[0_25px_80px_rgba(0,0,0,0.95)]"
    >
      <div className="flex max-h-[92vh] flex-col overflow-hidden">
        {/* Top Accent & Header */}
        <div
          className={`h-1.5 w-full shrink-0 ${
            isPaid
              ? "bg-gradient-to-l from-emerald-500 via-[#d4af37] to-[#8f5823]"
              : "bg-gradient-to-l from-rose-500/80 to-amber-500/60"
          }`}
        />

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#2d2118] bg-[#0e0a07] px-5 py-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2
              id={titleId}
              className="rounded-lg border border-[#c59b5f]/40 bg-[#221811] px-2.5 py-1 font-mono text-sm font-bold text-[#eed3a2]"
            >
              #{order.id.slice(0, 8)}
            </h2>
            {isPaid ? (
              <span className="rounded-full border border-emerald-500/50 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
                ✓ שולם — מאושר לייצור
              </span>
            ) : (
              <span className="rounded-full border border-rose-500/50 bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-300">
                ⚠ לא שולם ({order.status})
              </span>
            )}
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold ${statusInfo.badge}`}
            >
              {statusInfo.label}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {statusInfo.next && (
              <button
                type="button"
                disabled={pending}
                onClick={() => handleAdvance(statusInfo.next!)}
                className="rounded-xl bg-[#b8864b] px-4 py-1.5 text-xs font-bold text-white transition hover:bg-[#c99a65] disabled:opacity-50"
              >
                {statusInfo.nextLabel}
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl border border-[#2d2118] bg-[#1a130f] px-3 py-1.5 text-xs font-semibold text-[#eed3a2] hover:border-[#dfb37c]"
            >
              🖨️ הדפס
            </button>
            <button
              type="button"
              aria-label="סגירת פרטי הזמנה"
              onClick={() => dialogRef.current?.close()}
              className="rounded-full border border-[#c59b5f]/35 px-2.5 py-1 text-sm text-[#aa9c8d] hover:border-[#dfb37c] hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          {/* 3-Column Clickable Customer, Shipping & Payment */}
          <div className="grid gap-3.5 text-xs md:grid-cols-3">
            <div className="rounded-xl border border-[#2d2118] bg-[#110c09] p-4 space-y-1.5">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#c59b5f]">
                פרטי לקוח
              </span>
              <p className="text-sm font-bold text-[#fbf8f2]">{order.customerName}</p>
              <div className="flex flex-wrap gap-2 pt-0.5">
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

          {/* Itemized Production Spec Sheets */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#eed3a2]">
              פריטים לייצור ולאריזה ({order.items.length} שורות · {totalUnits} יח&apos;)
            </h3>
            {order.items.map((item, idx) => (
              <div
                key={`${item.productId}-${idx}`}
                className="rounded-xl border border-[#3a2a1e] bg-[#110c09] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#241a13] pb-3">
                  <div>
                    <p className="text-base font-bold text-[#fbf8f2]">{item.name}</p>
                    <p className="mt-0.5 text-xs text-[#aa9c8d]">
                      {formatIls(item.priceIls)} ליח&apos; · סה&quot;כ:{" "}
                      <strong className="text-[#eed3a2]">
                        {formatIls(item.priceIls * item.quantity)}
                      </strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg border border-[#c59b5f]/50 bg-[#241910] px-3.5 py-1.5 text-sm font-extrabold text-[#eed3a2]">
                      כמות: {item.quantity} יח&apos;
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

                <div className="mt-3.5 grid gap-4 sm:grid-cols-12">
                  {item.image && (
                    <div className="sm:col-span-4">
                      <span className="mb-1.5 block text-[11px] font-semibold text-[#aa9c8d]">
                        תמונת הפריט המבוקש:
                      </span>
                      <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl border border-[#2d2118] bg-[#1c140f] p-2">
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
                    <div className="sm:col-span-4">
                      <span className="mb-1.5 block text-[11px] font-semibold text-[#eed3a2]">
                        קובץ גרפיקה לרקמה / הדפסה:
                      </span>
                      <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl border-2 border-[#c59b5f]/40 bg-white p-3">
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
                          ? "sm:col-span-8"
                          : "sm:col-span-12"
                    }`}
                  >
                    {item.customSpecs && (
                      <div className="grid gap-2 rounded-xl border border-[#2d2118] bg-[#1a130f] p-3 text-xs">
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

          {/* Factory Tracking & Notes Controls */}
          <div className="grid gap-3 border-t border-[#2d2118] pt-4 md:grid-cols-12 print:hidden">
            <div className="md:col-span-5">
              <label className="mb-1 block text-[11px] font-medium text-[#aa9c8d]">
                הערות מפעל / שיבוץ מכונה:
              </label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="למשל: מכונת רקמה 4, חוט זהב 22"
                className="w-full rounded-xl border border-[#3a2a1e] bg-[#110c09] px-3.5 py-2 text-xs text-[#f3ede2] placeholder-[#7d6f60] outline-none focus:border-[#dfb37c]"
              />
            </div>

            <div className="md:col-span-4">
              <label className="mb-1 block text-[11px] font-medium text-[#aa9c8d]">
                מספר מעקב משלוח (שמירה מסמנת נשלח):
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
                onChange={(e) => handleAdvance(e.target.value as ProductionStatus)}
                aria-label="סטטוס ייצור"
                className="flex-1 rounded-xl border border-[#3a2a1e] bg-[#110c09] px-2.5 py-2 text-xs text-[#f3ede2] outline-none focus:border-[#dfb37c]"
              >
                {Object.entries(STATUS_META).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={pending}
                onClick={handleSave}
                className="rounded-xl border border-[#c59b5f]/50 bg-[#241910] px-4 py-2 text-xs font-bold text-[#eed3a2] transition hover:border-[#dfb37c] hover:text-white disabled:opacity-50"
              >
                {saved ? "✓ נשמר" : "שמור"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
