"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { updateProductImages } from "@/app/admin/(dashboard)/products/actions";

export function ProductImagesEditor({ productId, images }: { productId: string; images: string[] }) {
  const [urls, setUrls] = useState<string[]>(images.length > 0 ? images : [""]);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function updateAt(index: number, value: string) {
    setUrls((prev) => prev.map((u, i) => (i === index ? value : u)));
    setSaved(false);
  }

  function removeAt(index: number) {
    setUrls((prev) => prev.filter((_, i) => i !== index));
    setSaved(false);
  }

  function moveTo(index: number, direction: -1 | 1) {
    setUrls((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
    setSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      await updateProductImages({ productId, images: urls });
      setSaved(true);
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">תמונות מוצר (מספר זוויות)</h2>
        {saved && <span className="text-xs text-brand">נשמר ✓</span>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {urls.map((url, i) => (
          <div key={i} className="flex items-start gap-2 rounded-xl border border-border p-2">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted">
              {url ? (
                <Image src={url} alt="" fill className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full items-center justify-center text-[9px] text-ink-muted">
                  אין תמונה
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <input
                type="text"
                placeholder="קישור לתמונה (URL)"
                value={url}
                onChange={(e) => updateAt(i, e.target.value)}
                className="w-full rounded border border-border px-2 py-1 text-xs text-ink"
              />
              <div className="flex items-center gap-2 text-[11px] text-ink-muted">
                <span>{i === 0 ? "תמונה ראשית" : `זווית ${i + 1}`}</span>
                <button type="button" onClick={() => moveTo(i, -1)} disabled={i === 0} className="hover:text-brand disabled:opacity-30">
                  ↑
                </button>
                <button type="button" onClick={() => moveTo(i, 1)} disabled={i === urls.length - 1} className="hover:text-brand disabled:opacity-30">
                  ↓
                </button>
                <button type="button" onClick={() => removeAt(i)} className="mr-auto text-brand-dark hover:underline">
                  הסרה
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setUrls((prev) => [...prev, ""])}
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-ink-muted hover:border-brand hover:text-brand"
        >
          + הוספת זווית תמונה
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="rounded-lg bg-brand px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "שומר..." : "שמירת תמונות"}
        </button>
      </div>
    </div>
  );
}
