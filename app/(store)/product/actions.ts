"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { getSessionUser } from "@/lib/auth/session";
import { getOrdersForUser, hasUserReviewedProduct } from "@/lib/firebase/queries";
import type { Product } from "@/lib/types";

export type SubmitReviewResult = { ok: true } | { ok: false; error: string };

export async function submitProductReview(input: {
  productId: string;
  productSlug: string;
  rating: number;
  title: string;
  body: string;
}): Promise<SubmitReviewResult> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, error: "יש להתחבר לאזור האישי כדי להשאיר חוות דעת." };
  }

  const body = input.body.trim();
  if (!body) {
    return { ok: false, error: "נא לכתוב את תוכן חוות הדעת." };
  }
  if (body.length > 2000) {
    return { ok: false, error: "חוות הדעת ארוכה מדי (עד 2000 תווים)." };
  }

  const alreadyReviewed = await hasUserReviewedProduct(input.productId, user.uid);
  if (alreadyReviewed) {
    return { ok: false, error: "כבר שלחתם חוות דעת למוצר זה." };
  }

  const doc = await adminDb.collection("products").doc(input.productId).get();
  if (!doc.exists || (doc.data() as Product).published !== true) {
    return { ok: false, error: "המוצר אינו זמין." };
  }

  const orders = await getOrdersForUser(user.uid);
  const verifiedPurchase = orders.some(
    (o) =>
      (o.status === "paid" || o.status === "fulfilled") &&
      o.items.some((i) => i.productId === input.productId)
  );

  const rating = Math.min(5, Math.max(1, Math.round(input.rating) || 5));
  const authorName = user.name?.trim() || user.email.split("@")[0] || "לקוח/ה";

  await adminDb.collection("reviews").add({
    productId: input.productId,
    authorUid: user.uid,
    authorName,
    rating,
    title: input.title.trim().slice(0, 120),
    body,
    verifiedPurchase,
    published: true,
    createdAt: new Date().toISOString(),
  });

  revalidatePath(`/product/${input.productSlug}`);
  return { ok: true };
}
