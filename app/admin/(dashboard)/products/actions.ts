"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase/admin";

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
    description: input.description,
    images: input.imageUrl ? [input.imageUrl] : [],
    published: true,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/admin/products");
}
