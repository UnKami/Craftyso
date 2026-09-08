import type { Review } from "@/lib/types";
import { ProductReviewForm } from "./ProductReviewForm";

function Stars({ rating, size = "text-sm" }: { rating: number; size?: string }) {
  return (
    <span className={`${size} text-[#eed3a2]`} aria-hidden="true">
      {"★".repeat(Math.round(rating))}
      <span className="text-[#3d2b1f]">{"★".repeat(5 - Math.round(rating))}</span>
    </span>
  );
}

export function ProductReviews({
  reviews,
  productId,
  productSlug,
  hasSession,
  alreadyReviewed,
}: {
  reviews: Review[];
  productId: string;
  productSlug: string;
  hasSession: boolean;
  alreadyReviewed: boolean;
}) {
  const count = reviews.length;
  const average = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <section id="reviews" className="mt-16 border-t border-[#2d2118] pt-12">
      <div className="mb-8">
        <span className="text-xs font-semibold tracking-wider text-[#c59b5f] uppercase">
          מה אומרים הלקוחות
        </span>
        <h3 className="font-serif-hebrew text-2xl font-bold text-[#fbf8f2] sm:text-3xl">חוות דעת</h3>
      </div>

      <ProductReviewForm
        productId={productId}
        productSlug={productSlug}
        hasSession={hasSession}
        alreadyReviewed={alreadyReviewed}
      />

      {count === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#382a20] bg-[#140e0b]/60 p-8 text-center text-sm text-[#aa9c8d]">
          אין עדיין חוות דעת למוצר זה. היו הראשונים לשתף חוויה!
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Rating summary + distribution */}
          <div className="rounded-2xl border border-[#2d2118] bg-[#140e0b] p-6">
            <div className="text-4xl font-bold text-[#fbf8f2]">{average.toFixed(1)}</div>
            <Stars rating={average} size="text-lg" />
            <p className="mt-1 text-xs text-[#aa9c8d]">מבוסס על {count} חוות דעת</p>

            <div className="mt-4 flex flex-col gap-1.5">
              {distribution.map(({ star, count: c }) => (
                <div key={star} className="flex items-center gap-2 text-xs text-[#aa9c8d]">
                  <span className="w-3">{star}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#2d2118]">
                    <div
                      className="h-full rounded-full bg-[#c59b5f]"
                      style={{ width: count > 0 ? `${(c / count) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="w-4 text-left">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Individual reviews */}
          <ul className="flex flex-col gap-5">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-2xl border border-[#2d2118] bg-[#140e0b] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#f3ede2]">{r.authorName}</span>
                    {r.verifiedPurchase && (
                      <span className="rounded-full border border-[#7fe09b]/40 bg-[#7fe09b]/10 px-2 py-0.5 text-[10px] font-medium text-[#7fe09b]">
                        קונה מאומת
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#8a7b6b]">
                    {new Date(r.createdAt).toLocaleDateString("he-IL")}
                  </span>
                </div>
                <Stars rating={r.rating} />
                {r.title && <p className="mt-2 text-sm font-semibold text-[#f3ede2]">{r.title}</p>}
                <p className="mt-1 text-sm leading-relaxed text-[#c7b9a8]">{r.body}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
