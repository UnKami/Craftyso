"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase/admin";
import type { SocialPlatform } from "@/lib/types";

export async function createSocialPost(input: {
  platform: SocialPlatform;
  caption: string;
  imageUrl?: string;
  scheduledFor?: string;
}) {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");

  const now = new Date().toISOString();
  await adminDb.collection("socialPosts").add({
    ...input,
    status: input.scheduledFor ? "scheduled" : "draft",
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/admin/social");
}
