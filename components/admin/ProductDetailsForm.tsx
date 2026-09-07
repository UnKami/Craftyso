"use client";

import { useState, useTransition } from "react";
import type { Category, Product, ProductSpec } from "@/lib/types";
import { updateProductDetails } from "@/app/admin/(dashboard)/products/actions";
import { DEFAULT_SHIPPING_NOTE } from "@/lib/constants";

export function ProductDetailsForm({ product, categories }: { product: Product; categories: Category[] }) {
  const [name, setName] = useState(product.name);
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [description, setDescription] = useState(product.description ?? "");
  const [specs, setSpecs] = useState<ProductSpec[]>(
    product.specs && product.specs.length > 0 ? product.specs : [{ label: "", value: "" }]
  );
  const [shippingNote, setShippingNote] = useState(product.shippingNote ?? "");
  const [featured, setFeatured] = useState(product.featured ?? false);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function updateSpec(index: number, field: "label" | "value", value: string) {
    setSpecs((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
    setSaved(false);
  }

  function removeSpec(index: number) {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
    setSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      await updateProductDetails({
        productId: product.id,
        name,
        description,
        categoryId,
        specs,
        shippingNote,
        featured,
      });
      setSaved(true);
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">פרטי מוצר, מפרט ומשלוח</h2>
        {saved && <span className="text-xs text-brand">נשמר ✓</span>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          שם המוצר
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            className="rounded-lg border border-border px-2 py-1.5 text-sm text-ink"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          קטגוריה
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setSaved(false);
            }}
            className="rounded-lg border border-border px-2 py-1.5 text-sm text-ink"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-3 flex flex-col gap-1 text-xs text-ink-muted">
        תיאור המוצר
        <textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setSaved(false);
          }}
          rows={4}
          className="rounded-lg border border-border px-2 py-1.5 text-sm text-ink"
        />
      </label>

      <div className="mt-4">
        <span className="mb-1.5 block text-xs font-medium text-ink-muted">
          מפרט המוצר (יוצג בטבלת מפרט בעמוד המוצר)
        </span>
        <div className="flex flex-col gap-2">
          {specs.map((spec, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                placeholder="שם השדה (למשל: חומר)"
                value={spec.label}
                onChange={(e) => updateSpec(i, "label", e.target.value)}
                className="w-40 rounded border border-border px-2 py-1 text-xs text-ink"
              />
              <input
                placeholder="ערך (למשל: פוליאסטר 100%)"
                value={spec.value}
                onChange={(e) => updateSpec(i, "value", e.target.value)}
                className="flex-1 rounded border border-border px-2 py-1 text-xs text-ink"
              />
              <button type="button" onClick={() => removeSpec(i)} className="text-xs text-brand-dark hover:underline">
                הסרה
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setSpecs((prev) => [...prev, { label: "", value: "" }]);
            setSaved(false);
          }}
          className="mt-2 rounded-lg border border-border px-3 py-1 text-xs text-ink-muted hover:border-brand hover:text-brand"
        >
          + הוספת שורת מפרט
        </button>
      </div>

      <label className="mt-4 flex flex-col gap-1 text-xs text-ink-muted">
        הערת משלוח ייחודית למוצר זה (לא חובה — אם ריק, יוצג מדיניות המשלוחים הכללית)
        <textarea
          value={shippingNote}
          onChange={(e) => {
            setShippingNote(e.target.value);
            setSaved(false);
          }}
          placeholder={DEFAULT_SHIPPING_NOTE}
          rows={3}
          className="rounded-lg border border-border px-2 py-1.5 text-sm text-ink"
        />
      </label>

      <label className="mt-4 flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => {
            setFeatured(e.target.checked);
            setSaved(false);
          }}
          className="h-4 w-4 rounded border-border"
        />
        הצג במדור &quot;במיוחד בשבילך&quot; בעמודי מוצר אחרים
      </label>

      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="mt-4 rounded-lg bg-brand px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "שומר..." : "שמירת פרטים"}
      </button>
    </div>
  );
}
