"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase/admin";

export async function saveContentPage(input: {
  id?: string;
  slug: string;
  title: string;
  body: string;
  type: "page" | "blog_post";
}) {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");

  const now = new Date().toISOString();
  if (input.id) {
    await adminDb.collection("content").doc(input.id).update({
      slug: input.slug,
      title: input.title,
      body: input.body,
      type: input.type,
      updatedAt: now,
    });
  } else {
    await adminDb.collection("content").add({
      slug: input.slug,
      title: input.title,
      body: input.body,
      type: input.type,
      published: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  revalidatePath("/admin/content");
}
