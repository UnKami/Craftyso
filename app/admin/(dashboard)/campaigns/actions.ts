"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase/admin";
import type { CampaignChannel } from "@/lib/types";

export async function createCampaign(input: {
  name: string;
  channel: CampaignChannel;
  budgetIls?: number;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}) {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");

  const now = new Date().toISOString();
  await adminDb.collection("campaigns").add({
    ...input,
    status: "planned",
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/admin/campaigns");
}
