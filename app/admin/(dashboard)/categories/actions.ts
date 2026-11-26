"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase/admin";

function sanitizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u0590-\u05ff-_]/g, "");
}

export async function createCategoryAction(input: {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  order?: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getAdminUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const name = input.name.trim();
  const slug = sanitizeSlug(input.slug || name);
  if (!name || !slug) {
    return { ok: false, error: "יש להזין שם קטגוריה וכתובת (slug)." };
  }

  const existing = await adminDb
    .collection("categories")
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (!existing.empty) {
    return { ok: false, error: `קטגוריה עם הכתובת "${slug}" כבר קיימת.` };
  }

  await adminDb.collection("categories").add({
    name,
    slug,
    description: input.description?.trim() || "",
    imageUrl: input.imageUrl?.trim() || "",
    order: Number.isFinite(input.order) ? Number(input.order) : 99,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/category");
  revalidatePath("/");
  return { ok: true };
}

export async function updateCategoryAction(input: {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  order: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getAdminUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const name = input.name.trim();
  const slug = sanitizeSlug(input.slug || name);
  if (!name || !slug) {
    return { ok: false, error: "יש להזין שם וכתובת תקינים." };
  }

  await adminDb.collection("categories").doc(input.id).update({
    name,
    slug,
    description: input.description?.trim() || "",
    imageUrl: input.imageUrl?.trim() || "",
    order: Number.isFinite(input.order) ? Number(input.order) : 0,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/category");
  revalidatePath(`/category/${slug}`);
  revalidatePath("/");
  return { ok: true };
}

export async function deleteCategoryAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getAdminUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  await adminDb.collection("categories").doc(id).delete();

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/category");
  revalidatePath("/");
  return { ok: true };
}
