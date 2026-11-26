"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import type { Order, OrderStatus, ShippingMethod } from "@/lib/types";
import { formatIls } from "@/lib/format";
import { OrderStatusSelect } from "./OrderStatusSelect";
import { sendFactoryEmailAction } from "@/app/admin/(dashboard)/factory/actions";

const STATUS_BADGE: Record<OrderStatus, { label: string; className: string }> = {
  paid: {
    label: "✓ שולם",
    className: "border-emerald-500/40 bg-emerald-500/15 text-emerald-400",
  },
  pending: {
    label: "ממתין לתשלום",
    className: "border-amber-500/40 bg-amber-500/15 text-amber-300",
  },
  fulfilled: {
    label: "נשלח / הושלם",
    className: "border-sky-500/40 bg-sky-500/15 text-sky-300",
  },
  failed: {
    label: "נכשל",
    className: "border-rose-500/40 bg-rose-500/15 text-rose-400",
  },
  cancelled: {
    label: "בוטל",
    className: "border-zinc-500/40 bg-zinc-500/15 text-zinc-400",
  },
};

const SHIPPING_LABELS: Record<ShippingMethod, string> = {
  courier: "שליח עד הבית",
  registered_mail: "דואר רשום",
  pickup: "איסוף עצמי",
};

function csvEscape(v: unknown): string {
  const s = String(v ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

export function OrdersLedger({
  orders,
  emailConfigured,
}: {
  orders: Order[];
  emailConfigured: boolean;
}) {
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ orderId: string; ok: boolean; text: string } | null>(
    null,
  );
  const [, startTransition] = useTransition();

  const metrics = useMemo(() => {
    const paidOrders = orders.filter((o) => o.status === "paid" || o.status === "fulfilled");
    const revenue = paidOrders.reduce((s, o) => s + o.totalIls, 0);
    const pendingCount = orders.filter((o) => o.status === "pending").length;
    const notifiedCount = orders.filter((o) => Boolean(o.factoryNotifiedAt)).length;
    return {
      totalCount: orders.length,
      paidCount: paidOrders.length,
      revenue,
      pendingCount,
      notifiedCount,
    };
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q) ||
        (o.payplusApprovalNum ?? "").toLowerCase().includes(q) ||
        (o.trackingNumber ?? "").toLowerCase().includes(q)
      );
    });
  }, [orders, statusFilter, search]);

  function handleExportCsv() {
    const headers = [
      "מספר הזמנה",
      "תאריך",
      "סטטוס",
      "שם לקוח",
      "טלפון",
      "אימייל",
      "שיטת משלוח",
      "כתובת משלוח",
      "מספר מעקב",
      "סכום ביניים",
      "משלוח",
      "סהכ לתשלום",
      "אישור PayPlus",
      "שובר PayPlus",
      "מזהה עסקה PayPlus",
      "נשלח למפעל",
      "פריטים",
    ];

    const rows = filtered.map((o) => [
      o.id,
      new Date(o.createdAt).toLocaleString("he-IL"),
      o.status,
      o.customerName,
      o.customerPhone,
      o.customerEmail,
      o.shippingMethod ? SHIPPING_LABELS[o.shippingMethod] : "",
      o.shippingAddress ?? "",
      o.trackingNumber ?? "",
      o.subtotalIls ?? o.totalIls,
      o.shippingCostIls ?? 0,
      o.totalIls,
      o.payplusApprovalNum ?? "",
      o.payplusVoucherNum ?? "",
      o.payplusTransactionUid ?? "",
      o.factoryNotifiedAt ? new Date(o.factoryNotifiedAt).toLocaleString("he-IL") : "לא",
      o.items.map((i) => `${i.name} x${i.quantity}`).join(" | "),
    ]);

    const csv =
      "\uFEFF" +
      [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `craftyso-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleSendFactoryEmail(orderId: string) {
    setSendingId(orderId);
    setFeedback(null);
    startTransition(async () => {
      const res = await sendFactoryEmailAction(orderId);
      setSendingId(null);
      if (res.ok) {
        setFeedback({ orderId, ok: true, text: "נשלח מייל הזמנת עבודה למפעל!" });
      } else {
        setFeedback({ orderId, ok: false, text: res.error });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand">
            ORDERS &amp; PAYMENTS LEDGER
          </span>
          <h1 className="text-2xl font-bold text-ink">יומן הזמנות, תשלומים ומשלוחים</h1>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={filtered.length === 0}
          className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-ink transition hover:border-brand hover:text-brand disabled:opacity-40"
        >
          ⬇ ייצוא לאקסל (CSV)
        </button>
      </div>

      {!emailConfigured && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
          <strong>התראות מייל למפעל עדיין לא מוגדרות:</strong> כדי לשלוח אוטומטית הזמנות עבודה למפעל עם
          כל תשלום ב-PayPlus, יש להגדיר <code>RESEND_API_KEY</code> ו-<code>FACTORY_NOTIFICATION_EMAIL</code>{" "}
          ב-Firebase App Hosting.
        </div>
      )}

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <span className="text-xs text-ink-muted">הכנסות מאושרות</span>
          <p className="mt-1 text-2xl font-bold text-emerald-400">{formatIls(metrics.revenue)}</p>
          <span className="text-[11px] text-ink-muted">{metrics.paidCount} הזמנות ששולמו</span>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <span className="text-xs text-ink-muted">סה&quot;כ הזמנות ביומן</span>
          <p className="mt-1 text-2xl font-bold text-ink">{metrics.totalCount}</p>
          <span className="text-[11px] text-ink-muted">כל הסטטוסים</span>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <span className="text-xs text-ink-muted">טיוטות / ממתין לתשלום</span>
          <p className="mt-1 text-2xl font-bold text-amber-400">{metrics.pendingCount}</p>
          <span className="text-[11px] text-ink-muted">טרם שולמו ב-PayPlus</span>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <span className="text-xs text-ink-muted">הועברו במייל למפעל</span>
          <p className="mt-1 text-2xl font-bold text-brand">{metrics.notifiedCount}</p>
          <span className="text-[11px] text-ink-muted">התראות מפעל שנשלחו</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["all", "הכל"],
              ["paid", "שולם"],
              ["pending", "ממתין"],
              ["fulfilled", "נשלח"],
              ["failed", "נכשל"],
              ["cancelled", "בוטל"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                statusFilter === key
                  ? "border-brand bg-brand/15 text-brand"
                  : "border-border bg-surface text-ink-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש לפי שם, טלפון, מספר הזמנה או אישור PayPlus..."
          className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs text-ink outline-none focus:border-brand sm:w-80"
        />
      </div>

      {/* Ledger Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-sm text-ink-muted">
          אין הזמנות התואמות לסינון הנוכחי.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="border-b border-border text-ink-muted">
              <tr>
                <th className="p-3 font-medium">הזמנה ותאריך</th>
                <th className="p-3 font-medium">לקוח</th>
                <th className="p-3 font-medium">תשלום (PayPlus)</th>
                <th className="p-3 font-medium">משלוח</th>
                <th className="p-3 font-medium">סכום</th>
                <th className="p-3 font-medium">מפעל</th>
                <th className="p-3 font-medium">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const badge = STATUS_BADGE[order.status] ?? STATUS_BADGE.pending;
                const isExpanded = expandedId === order.id;

                return (
                  <Fragment key={order.id}>
                    <tr className="border-b border-border/80 align-top transition hover:bg-surface-muted/40">
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : order.id)}
                          className="font-mono text-xs font-bold text-brand hover:underline"
                        >
                          {isExpanded ? "▾" : "▸"} #{order.id.slice(0, 8)}
                        </button>
                        <p className="mt-0.5 text-[11px] text-ink-muted">
                          {new Date(order.createdAt).toLocaleString("he-IL", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>

                      <td className="p-3">
                        <p className="font-medium text-ink">{order.customerName}</p>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="block text-[11px] text-brand hover:underline"
                        >
                          {order.customerPhone}
                        </a>
                        <p className="text-[11px] text-ink-muted">{order.customerEmail}</p>
                      </td>

                      <td className="p-3">
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                        {order.payplusApprovalNum && (
                          <p className="mt-1 font-mono text-[11px] text-ink-muted">
                            אישור: {order.payplusApprovalNum}
                          </p>
                        )}
                        {order.payplusVoucherNum && (
                          <p className="font-mono text-[11px] text-ink-muted">
                            שובר: {order.payplusVoucherNum}
                          </p>
                        )}
                        {order.payplusInvoiceUrl && (
                          <a
                            href={order.payplusInvoiceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-0.5 inline-block text-[11px] font-semibold text-brand hover:underline"
                          >
                            חשבונית PDF ↗
                          </a>
                        )}
                      </td>

                      <td className="p-3 max-w-[200px]">
                        <p className="font-medium text-ink">
                          {order.shippingMethod ? SHIPPING_LABELS[order.shippingMethod] : "שליח"}
                        </p>
                        {order.shippingAddress && (
                          <p className="truncate text-[11px] text-ink-muted" title={order.shippingAddress}>
                            {order.shippingAddress}
                          </p>
                        )}
                        {order.trackingNumber && (
                          <p className="mt-0.5 font-mono text-[11px] text-emerald-400">
                            מעקב: {order.trackingNumber}
                          </p>
                        )}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <p className="font-bold text-ink">{formatIls(order.totalIls)}</p>
                        <p className="text-[11px] text-ink-muted">
                          {order.items.reduce((s, i) => s + i.quantity, 0)} יח&apos;
                          {typeof order.shippingCostIls === "number"
                            ? ` • משלוח ${order.shippingCostIls === 0 ? "חינם" : formatIls(order.shippingCostIls)}`
                            : ""}
                        </p>
                      </td>

                      <td className="p-3">
                        {order.factoryNotifiedAt ? (
                          <span className="block text-[11px] font-semibold text-emerald-400">
                            ✓ נשלח למפעל
                          </span>
                        ) : (
                          <span className="block text-[11px] text-ink-muted">טרם נשלח</span>
                        )}
                        <button
                          type="button"
                          disabled={sendingId === order.id}
                          onClick={() => handleSendFactoryEmail(order.id)}
                          className="mt-1 rounded-lg border border-border px-2 py-1 text-[11px] text-ink-muted transition hover:border-brand hover:text-brand disabled:opacity-50"
                        >
                          {sendingId === order.id
                            ? "שולח..."
                            : order.factoryNotifiedAt
                              ? "שלח שוב למפעל"
                              : "שלח מייל למפעל"}
                        </button>
                        {feedback?.orderId === order.id && (
                          <p
                            className={`mt-1 text-[11px] ${
                              feedback.ok ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {feedback.text}
                          </p>
                        )}
                      </td>

                      <td className="p-3">
                        <OrderStatusSelect orderId={order.id} status={order.status} />
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="border-b border-border bg-surface-muted/30">
                        <td colSpan={7} className="p-4">
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-ink">
                              פירוט פריטים בהזמנה #{order.id}
                            </p>
                            <ul className="divide-y divide-border/60 rounded-xl border border-border bg-surface p-3 text-xs">
                              {order.items.map((item, idx) => (
                                <li
                                  key={`${item.productId}-${idx}`}
                                  className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
                                >
                                  <div>
                                    <span className="font-medium text-ink">{item.name}</span>
                                    {item.customSpecs && (
                                      <span className="mr-2 text-[11px] text-brand">
                                        🎨 {item.customSpecs.technique} • {item.customSpecs.widthCm}×
                                        {item.customSpecs.heightCm} ס&quot;מ •{" "}
                                        {item.customSpecs.baseColor}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-ink-muted">
                                    {item.quantity} × {formatIls(item.priceIls)} ={" "}
                                    <strong className="text-ink">
                                      {formatIls(item.priceIls * item.quantity)}
                                    </strong>
                                  </span>
                                </li>
                              ))}
                            </ul>
                            {order.payplusTransactionUid && (
                              <p className="font-mono text-[11px] text-ink-muted">
                                PayPlus Transaction UID: {order.payplusTransactionUid}
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
