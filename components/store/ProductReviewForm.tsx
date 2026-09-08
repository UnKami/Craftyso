"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitProductReview } from "@/app/(store)/product/actions";

export function ProductReviewForm({
  productId,
  productSlug,
  hasSession,
  alreadyReviewed,
}: {
  productId: string;
  productSlug: string;
  hasSession: boolean;
  alreadyReviewed: boolean;
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!hasSession) {
    return (
      <div className="mb-8 rounded-2xl border border-dashed border-[#382a20] bg-[#140e0b]/60 p-6 text-center text-sm text-[#aa9c8d]">
        <Link href="/account/login" className="text-[#eed3a2] hover:text-white hover:underline">
          התחברו לאזור האישי
        </Link>{" "}
        כדי להשאיר חוות דעת על מוצר זה.
      </div>
    );
  }

  if (alreadyReviewed || submitted) {
    return (
      <div className="mb-8 rounded-2xl border border-[#7fe09b]/30 bg-[#7fe09b]/5 p-6 text-center text-sm text-[#7fe09b]">
        תודה! חוות הדעת שלכם על מוצר זה כבר נשלחה ומוצגת באתר.
      </div>
    );
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await submitProductReview({ productId, productSlug, rating, title, body });
      if (result.ok) {
        setSubmitted(true);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mb-8 rounded-2xl border border-[#2d2118] bg-[#140e0b] p-6">
      <h4 className="font-serif-hebrew mb-4 text-lg font-bold text-[#fbf8f2]">כתבו חוות דעת</h4>

      <div className="mb-4 flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverRating(star)}
            onClick={() => setRating(star)}
            aria-label={`${star} כוכבים`}
            className="text-2xl leading-none transition-transform hover:scale-110"
          >
            <span
              className={(hoverRating || rating) >= star ? "text-[#eed3a2]" : "text-[#3d2b1f]"}
            >
              ★
            </span>
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="כותרת (לא חובה)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
        className="mb-3 w-full rounded-lg border border-[#2d2118] bg-[#0f0a07] px-3 py-2 text-sm text-[#f3ede2] outline-none focus:border-[#c59b5f]"
      />

      <textarea
        placeholder="ספרו לנו מה חשבתם על המוצר..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        maxLength={2000}
        className="mb-3 w-full rounded-lg border border-[#2d2118] bg-[#0f0a07] px-3 py-2 text-sm text-[#f3ede2] outline-none focus:border-[#c59b5f]"
      />

      {error && <p className="mb-3 text-sm text-[#e87a7a]">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={pending || !body.trim()}
        className="bg-gold-gradient-btn rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
      >
        {pending ? "שולח..." : "שליחת חוות דעת"}
      </button>
    </div>
  );
}
