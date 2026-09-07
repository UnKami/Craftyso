"use client";

import { useState, useTransition } from "react";
import type { Review } from "@/lib/types";
import { addReview, deleteReview, toggleReviewPublished } from "@/app/admin/(dashboard)/products/actions";

const EMPTY = { authorName: "", rating: "5", title: "", body: "", verifiedPurchase: true, published: true };

export function ProductReviewsAdmin({ productId, reviews }: { productId: string; reviews: Review[] }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    startTransition(async () => {
      await addReview({
        productId,
        authorName: form.authorName,
        rating: Number(form.rating) || 5,
        title: form.title,
        body: form.body,
        verifiedPurchase: form.verifiedPurchase,
        published: form.published,
      });
      setForm(EMPTY);
      setAdding(false);
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">חוות דעת ({reviews.length})</h2>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="rounded-lg border border-border px-3 py-1 text-xs text-ink-muted hover:border-brand hover:text-brand"
          >
            + הוספת חוות דעת
          </button>
        )}
      </div>

      {adding && (
        <div className="mb-4 grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-2">
          <input
            placeholder="שם הכותב/ת"
            value={form.authorName}
            onChange={(e) => setForm({ ...form, authorName: e.target.value })}
            className="rounded border border-border px-2 py-1 text-xs text-ink"
          />
          <label className="flex items-center gap-2 text-xs text-ink-muted">
            דירוג:
            <select
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
              className="rounded border border-border px-2 py-1 text-xs text-ink"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} ★
                </option>
              ))}
            </select>
          </label>
          <input
            placeholder="כותרת (לא חובה)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="col-span-full rounded border border-border px-2 py-1 text-xs text-ink"
          />
          <textarea
            placeholder="תוכן חוות הדעת"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={3}
            className="col-span-full rounded border border-border px-2 py-1 text-xs text-ink"
          />
          <label className="flex items-center gap-2 text-xs text-ink-muted">
            <input
              type="checkbox"
              checked={form.verifiedPurchase}
              onChange={(e) => setForm({ ...form, verifiedPurchase: e.target.checked })}
            />
            קונה מאומת
          </label>
          <label className="flex items-center gap-2 text-xs text-ink-muted">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            מוצג באתר
          </label>
          <div className="col-span-full flex gap-2">
            <button
              onClick={handleAdd}
              disabled={pending || !form.body.trim()}
              className="rounded-lg bg-brand px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              שמירה
            </button>
            <button onClick={() => setAdding(false)} className="text-xs text-ink-muted hover:text-ink">
              ביטול
            </button>
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-xs text-ink-muted">אין עדיין חוות דעת למוצר זה.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {reviews.map((r) => (
            <ReviewRow key={r.id} review={r} productId={productId} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ReviewRow({ review, productId }: { review: Review; productId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <li className="rounded-xl border border-border p-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="font-medium text-ink">{review.authorName}</span>
          <span className="mr-2 text-xs text-brand">{"★".repeat(review.rating)}</span>
          {review.verifiedPurchase && <span className="mr-2 text-[10px] text-ink-muted">קונה מאומת</span>}
          {review.title && <p className="mt-1 text-xs font-semibold text-ink">{review.title}</p>}
          <p className="mt-1 text-xs text-ink-muted">{review.body}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            disabled={pending}
            onClick={() =>
              startTransition(() =>
                toggleReviewPublished({ reviewId: review.id, productId, published: !review.published })
              )
            }
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              review.published ? "bg-brand/10 text-brand-dark" : "bg-surface-muted text-ink-muted"
            }`}
          >
            {review.published ? "מוצג" : "מוסתר"}
          </button>
          <button
            disabled={pending}
            onClick={() => startTransition(() => deleteReview({ reviewId: review.id, productId }))}
            className="text-xs text-brand-dark hover:underline"
          >
            מחיקה
          </button>
        </div>
      </div>
    </li>
  );
}
