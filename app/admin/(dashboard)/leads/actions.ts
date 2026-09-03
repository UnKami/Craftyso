"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase/admin";
import type { LeadStatus } from "@/lib/types";

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");

  await adminDb.collection("leads").doc(leadId).update({
    status,
    updatedAt: new Date().toISOString(),
  });

  revalidatePath("/admin/leads");
}

export async function createLead(input: { name: string; email: string; phone: string; note: string }) {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");

  const now = new Date().toISOString();
  await adminDb.collection("leads").add({
    ...input,
    source: "manual",
    status: "new",
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/admin/leads");
}
