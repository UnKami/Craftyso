"use client";

import { useState, useTransition } from "react";
import type { InventoryItem, RestockOrder } from "@/lib/types";
import { formatIls } from "@/lib/format";
import {
  createRestockOrder,
  receiveRestockOrder,
  updateInventoryStock,
  createInventoryItem,
} from "@/app/admin/(dashboard)/inventory/actions";

type Props = {
  items: InventoryItem[];
  restocks: RestockOrder[];
};

const EMPTY_NEW_ITEM = {
  name: "",
  sku: "",
  category: "",
  stockQty: "0",
  minAlertQty: "0",
  unit: "יח'",
  costPriceIls: "0",
  supplierName: "",
  supplierPhone: "",
};

export function InventoryTable({ items, restocks }: Props) {
  const [pending, startTransition] = useTransition();
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState<number>(100);
  const [supplierName, setSupplierName] = useState<string>("");
  const [costIls, setCostIls] = useState<number>(0);
  const [arrivalDate, setArrivalDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState(EMPTY_NEW_ITEM);

  function openRestockModal(item: InventoryItem) {
    setActiveItem(item);
    setRestockQty(item.minAlertQty * 2);
    setSupplierName(item.supplierName ?? "");
    setCostIls(item.costPriceIls * (item.minAlertQty * 2));
    setArrivalDate("");
    setNotes("");
  }

  function handleCreateRestock() {
    if (!activeItem) return;
    startTransition(async () => {
      await createRestockOrder({
        inventoryItemId: activeItem.id,
        itemName: activeItem.name,
        quantity: restockQty,
        supplierName: supplierName || "ספק ראשי",
        costIls: costIls || 0,
        estimatedArrival: arrivalDate,
        notes,
      });
      setActiveItem(null);
    });
  }

  function handleReceiveRestock(order: RestockOrder) {
    startTransition(async () => {
      await receiveRestockOrder(order.id, order.inventoryItemId, order.quantity);
    });
  }

  function handleStockAdjust(item: InventoryItem, delta: number) {
    const next = Math.max(0, item.stockQty + delta);
    startTransition(async () => {
      await updateInventoryStock(item.id, next);
    });
  }

  function handleCreateItem() {
    if (!newItem.name.trim() || !newItem.sku.trim()) return;
    startTransition(async () => {
      await createInventoryItem({
        name: newItem.name.trim(),
        sku: newItem.sku.trim(),
        category: newItem.category.trim() || "כללי",
        stockQty: Number(newItem.stockQty) || 0,
        minAlertQty: Number(newItem.minAlertQty) || 0,
        unit: newItem.unit.trim() || "יח'",
        costPriceIls: Number(newItem.costPriceIls) || 0,
        supplierName: newItem.supplierName.trim() || undefined,
        supplierPhone: newItem.supplierPhone.trim() || undefined,
      });
      setNewItem(EMPTY_NEW_ITEM);
      setAddingItem(false);
    });
  }

  return (
    <div className="space-y-8 text-right">
      {/* Inventory Items Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-4 bg-surface-muted/30">
          <div>
            <h3 className="font-bold text-ink">רשימת חומרי גלם, אביזרים ובסיסים במפעל</h3>
            <p className="text-xs text-ink-muted">ניהול רמות מלאי שוטפות והתרעות חוסר</p>
          </div>
          <button
            onClick={() => setAddingItem(true)}
            className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark transition"
          >
            פריט חדש
          </button>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center text-xs text-ink-muted">
            אין עדיין פריטי מלאי רשומים. לחצו על &quot;פריט חדש&quot; כדי להוסיף את הפריט הראשון.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-right text-xs text-ink-muted bg-surface-muted/50">
                <tr>
                  <th className="p-3 font-semibold">מק&quot;ט / פריט</th>
                  <th className="p-3 font-semibold">קטגוריה</th>
                  <th className="p-3 font-semibold">מלאי קיים</th>
                  <th className="p-3 font-semibold">סף התרעה</th>
                  <th className="p-3 font-semibold">סטטוס</th>
                  <th className="p-3 font-semibold">ספק</th>
                  <th className="p-3 font-semibold">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => {
                  const isLow = item.stockQty <= item.minAlertQty;
                  const isOut = item.stockQty <= 0;

                  return (
                    <tr key={item.id} className="hover:bg-surface-muted/40 transition">
                      <td className="p-3">
                        <span className="font-mono text-xs text-ink-muted block">{item.sku}</span>
                        <span className="font-medium text-ink">{item.name}</span>
                      </td>
                      <td className="p-3 text-xs text-ink-muted">{item.category}</td>
                      <td className="p-3 font-bold text-ink">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStockAdjust(item, -10)}
                            disabled={pending}
                            className="h-6 w-6 rounded border border-border bg-surface text-xs hover:border-brand"
                          >
                            -
                          </button>
                          <span className="w-16 text-center">
                            {item.stockQty} {item.unit}
                          </span>
                          <button
                            onClick={() => handleStockAdjust(item, 10)}
                            disabled={pending}
                            className="h-6 w-6 rounded border border-border bg-surface text-xs hover:border-brand"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-xs text-ink-muted">
                        {item.minAlertQty} {item.unit}
                      </td>
                      <td className="p-3">
                        {isOut ? (
                          <span className="rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 text-xs font-bold text-red-600">
                            אזל מהמלאי
                          </span>
                        ) : isLow ? (
                          <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-700 animate-pulse">
                            ⚠️ מלאי נמוך
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                            ✓ מלאי תקין
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-xs text-ink-muted">
                        <span className="block font-medium text-ink">{item.supplierName ?? "—"}</span>
                        {item.supplierPhone && (
                          <span className="font-mono text-[11px]">{item.supplierPhone}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => openRestockModal(item)}
                          className="rounded-lg border border-brand/50 bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand hover:bg-brand hover:text-white transition"
                        >
                          הזמן חידוש מלאי
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Restock Orders In Flight / Log */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border p-4 bg-surface-muted/30">
          <h3 className="font-bold text-ink">הזמנות רכש וחידוש מלאי מספקים (In-Flight Restocks)</h3>
          <p className="text-xs text-ink-muted">מעקב אחר משלוחים מספקים וקליטתם למפעל</p>
        </div>

        {restocks.length === 0 ? (
          <div className="p-8 text-center text-xs text-ink-muted">
            אין כרגע הזמנות רכש פעילות בדרך למפעל.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {restocks.map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4 text-xs"
              >
                <div>
                  <span className="font-bold text-sm text-ink block">{order.itemName}</span>
                  <span className="text-ink-muted">
                    כמות: <strong className="text-ink">{order.quantity} יח&apos;</strong> • ספק:{" "}
                    <strong>{order.supplierName}</strong>
                    {order.costIls > 0 && ` • עלות: ${formatIls(order.costIls)}`}
                  </span>
                  {order.notes && (
                    <p className="text-[11px] text-ink-muted mt-0.5">הערה: {order.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-bold ${
                      order.status === "received"
                        ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                        : "bg-blue-500/15 text-blue-600 border border-blue-500/30"
                    }`}
                  >
                    {order.status === "received" ? "✓ התקבל במפעל" : "🚚 הוזמן מספק"}
                  </span>

                  {order.status !== "received" && (
                    <button
                      onClick={() => handleReceiveRestock(order)}
                      disabled={pending}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      קלוט משלוח במפעל (+{order.quantity})
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Restock Order Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h4 className="font-bold text-base text-ink">הזמנת רכש מספק: {activeItem.name}</h4>
            <p className="text-xs text-ink-muted mt-1">
              מק&quot;ט: {activeItem.sku} • מלאי נוכחי: {activeItem.stockQty} {activeItem.unit}
            </p>

            <div className="mt-4 space-y-3">
              <label className="flex flex-col gap-1 text-xs text-ink-muted">
                <span>כמות להזמנה ({activeItem.unit}):</span>
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => {
                    const q = Number(e.target.value) || 0;
                    setRestockQty(q);
                    setCostIls(q * activeItem.costPriceIls);
                  }}
                  className="rounded-lg border border-border bg-surface-muted p-2 text-sm text-ink"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs text-ink-muted">
                <span>שם הספק:</span>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="rounded-lg border border-border bg-surface-muted p-2 text-sm text-ink"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs text-ink-muted">
                <span>עלות משוערת (₪):</span>
                <input
                  type="number"
                  value={costIls}
                  onChange={(e) => setCostIls(Number(e.target.value) || 0)}
                  className="rounded-lg border border-border bg-surface-muted p-2 text-sm text-ink"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs text-ink-muted">
                <span>הערות להזמנת הרכש:</span>
                <input
                  type="text"
                  placeholder="דחיפות, גוון צבע, תנאי תשלום..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="rounded-lg border border-border bg-surface-muted p-2 text-sm text-ink"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-ink-muted hover:bg-surface-muted"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleCreateRestock}
                disabled={pending}
                className="rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white hover:bg-brand-dark transition disabled:opacity-50"
              >
                אשר הזמנת רכש מספק
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Inventory Item Modal */}
      {addingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h4 className="font-bold text-base text-ink">פריט מלאי חדש</h4>
            <p className="text-xs text-ink-muted mt-1">הוספת חומר גלם או אביזר חדש למעקב מלאי</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="col-span-2 flex flex-col gap-1 text-xs text-ink-muted">
                <span>שם הפריט:</span>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="rounded-lg border border-border bg-surface-muted p-2 text-sm text-ink"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-ink-muted">
                <span>מק&quot;ט:</span>
                <input
                  type="text"
                  value={newItem.sku}
                  onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                  className="rounded-lg border border-border bg-surface-muted p-2 text-sm text-ink"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-ink-muted">
                <span>קטגוריה:</span>
                <input
                  type="text"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="rounded-lg border border-border bg-surface-muted p-2 text-sm text-ink"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-ink-muted">
                <span>מלאי התחלתי:</span>
                <input
                  type="number"
                  min="0"
                  value={newItem.stockQty}
                  onChange={(e) => setNewItem({ ...newItem, stockQty: e.target.value })}
                  className="rounded-lg border border-border bg-surface-muted p-2 text-sm text-ink"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-ink-muted">
                <span>סף התרעה:</span>
                <input
                  type="number"
                  min="0"
                  value={newItem.minAlertQty}
                  onChange={(e) => setNewItem({ ...newItem, minAlertQty: e.target.value })}
                  className="rounded-lg border border-border bg-surface-muted p-2 text-sm text-ink"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-ink-muted">
                <span>יחידת מידה:</span>
                <input
                  type="text"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  className="rounded-lg border border-border bg-surface-muted p-2 text-sm text-ink"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-ink-muted">
                <span>עלות ליחידה (₪):</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={newItem.costPriceIls}
                  onChange={(e) => setNewItem({ ...newItem, costPriceIls: e.target.value })}
                  className="rounded-lg border border-border bg-surface-muted p-2 text-sm text-ink"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-ink-muted">
                <span>שם ספק (לא חובה):</span>
                <input
                  type="text"
                  value={newItem.supplierName}
                  onChange={(e) => setNewItem({ ...newItem, supplierName: e.target.value })}
                  className="rounded-lg border border-border bg-surface-muted p-2 text-sm text-ink"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-ink-muted">
                <span>טלפון ספק (לא חובה):</span>
                <input
                  type="text"
                  value={newItem.supplierPhone}
                  onChange={(e) => setNewItem({ ...newItem, supplierPhone: e.target.value })}
                  className="rounded-lg border border-border bg-surface-muted p-2 text-sm text-ink"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setAddingItem(false);
                  setNewItem(EMPTY_NEW_ITEM);
                }}
                className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-ink-muted hover:bg-surface-muted"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleCreateItem}
                disabled={pending || !newItem.name.trim() || !newItem.sku.trim()}
                className="rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white hover:bg-brand-dark transition disabled:opacity-50"
              >
                הוספת פריט
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
