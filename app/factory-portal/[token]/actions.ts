"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { verifyFactoryPortalToken } from "@/lib/factory-portal/token";
import type { ProductionStatus } from "@/lib/types";

export async function portalUpdateProductionStatus(
  token: string,
  orderId: string,
  status: ProductionStatus,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const valid = await verifyFactoryPortalToken(token);
  if (!valid) return { ok: false, error: "Unauthorized" };

  await adminDb.collection("orders").doc(orderId).update({
    productionStatus: status,
    ...(status === "shipped" ? { status: "fulfilled" } : {}),
    updatedAt: new Date().toISOString(),
  });

  revalidatePath(`/factory-portal/${token}`);
  revalidatePath("/admin/factory");
  revalidatePath("/admin/orders");
  return { ok: true };
}

export async function portalUpdateOrderDetails(input: {
  token: string;
  orderId: string;
  factoryNotes: string;
  trackingNumber: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const valid = await verifyFactoryPortalToken(input.token);
  if (!valid) return { ok: false, error: "Unauthorized" };

  const tracking = input.trackingNumber.trim();
  const update: Record<string, unknown> = {
    factoryNotes: input.factoryNotes,
    trackingNumber: tracking,
    updatedAt: new Date().toISOString(),
  };

  if (tracking) {
    update.productionStatus = "shipped";
    update.status = "fulfilled";
  }

  await adminDb.collection("orders").doc(input.orderId).update(update);

  revalidatePath(`/factory-portal/${input.token}`);
  revalidatePath("/admin/factory");
  revalidatePath("/admin/orders");
  return { ok: true };
}
