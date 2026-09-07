"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase/admin";
import type { ProductSpec } from "@/lib/types";

export async function toggleProductPublished(productId: string, published: boolean) {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");

  await adminDb.collection("products").doc(productId).update({
    published,
    updatedAt: new Date().toISOString(),
  });

  revalidatePath("/admin/products");
}

export async function createProduct(input: {
  name: string;
  slug: string;
  categoryId: string;
  priceIls: number;
  wholesalePriceIls?: number;
  wholesaleMinQty?: number;
  description: string;
  imageUrl: string;
}) {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");

  const now = new Date().toISOString();
  await adminDb.collection("products").add({
    name: input.name,
    slug: input.slug,
    categoryId: input.categoryId,
    priceIls: input.priceIls,
    wholesalePriceIls: input.wholesalePriceIls ?? null,
    wholesaleMinQty: input.wholesaleMinQty ?? 10,
    description: input.description,
    images: input.imageUrl ? [input.imageUrl] : [],
    published: true,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function updateProductImage(input: { productId: string; imageUrl: string }) {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");

  await adminDb
    .collection("products")
    .doc(input.productId)
    .update({
      images: input.imageUrl ? [input.imageUrl] : [],
      updatedAt: new Date().toISOString(),
    });

  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function updateProductImages(input: { productId: string; images: string[] }) {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");

  const images = input.images.map((url) => url.trim()).filter(Boolean);

  await adminDb.collection("products").doc(input.productId).update({
    images,
    updatedAt: new Date().toISOString(),
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${input.productId}`);
  revalidatePath("/");
}

export async function updateProductDetails(input: {
  productId: string;
  name: string;
  description: string;
  categoryId: string;
  specs: ProductSpec[];
  shippingNote: string;
  featured: boolean;
}) {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");

  const specs = input.specs
    .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
    .filter((s) => s.label && s.value);

  await adminDb
    .collection("products")
    .doc(input.productId)
    .update({
      name: input.name.trim(),
      description: input.description.trim(),
      categoryId: input.categoryId,
      specs,
      shippingNote: input.shippingNote.trim(),
      featured: input.featured,
      updatedAt: new Date().toISOString(),
    });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${input.productId}`);
  revalidatePath("/");
}

export async function addReview(input: {
  productId: string;
  authorName: string;
  rating: number;
  title?: string;
  body: string;
  verifiedPurchase: boolean;
  published: boolean;
}) {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");

  const now = new Date().toISOString();
  await adminDb.collection("reviews").add({
    productId: input.productId,
    authorName: input.authorName.trim() || "לקוח/ה",
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    title: input.title?.trim() || "",
    body: input.body.trim(),
    verifiedPurchase: input.verifiedPurchase,
    published: input.published,
    createdAt: now,
  });

  revalidatePath(`/admin/products/${input.productId}`);
  revalidatePath("/product", "layout");
}

export async function toggleReviewPublished(input: {
  reviewId: string;
  productId: string;
  published: boolean;
}) {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");

  await adminDb.collection("reviews").doc(input.reviewId).update({ published: input.published });

  revalidatePath(`/admin/products/${input.productId}`);
  revalidatePath("/product", "layout");
}

export async function deleteReview(input: { reviewId: string; productId: string }) {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");

  await adminDb.collection("reviews").doc(input.reviewId).delete();

  revalidatePath(`/admin/products/${input.productId}`);
  revalidatePath("/product", "layout");
}

export async function updateProductPricing(input: {
  productId: string;
  priceIls: number;
  wholesalePriceIls?: number | null;
  wholesaleMinQty?: number;
}) {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");

  await adminDb.collection("products").doc(input.productId).update({
    priceIls: input.priceIls,
    wholesalePriceIls: input.wholesalePriceIls ?? null,
    wholesaleMinQty: input.wholesaleMinQty ?? 10,
    updatedAt: new Date().toISOString(),
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
}
