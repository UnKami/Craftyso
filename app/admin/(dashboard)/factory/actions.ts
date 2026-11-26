"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase/admin";
import { rotateFactoryPortalToken } from "@/lib/factory-portal/token";
import { sendFactoryOrderNotification } from "@/lib/notifications/factory-email";
import type { Order, ProductionStatus } from "@/lib/types";

export async function updateProductionStatus(orderId: string, status: ProductionStatus) {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");

  await adminDb.collection("orders").doc(orderId).update({
    productionStatus: status,
    updatedAt: new Date().toISOString(),
  });

  revalidatePath("/admin/factory");
  revalidatePath("/admin/orders");
}

export async function updateFactoryOrder(input: {
  orderId: string;
  factoryNotes?: string;
  trackingNumber?: string;
  productionStatus?: ProductionStatus;
}) {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");

  const updateData: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (typeof input.factoryNotes === "string") {
    updateData.factoryNotes = input.factoryNotes;
  }
  if (typeof input.trackingNumber === "string") {
    updateData.trackingNumber = input.trackingNumber;
    // If tracking number is set, auto-advance to shipped
    if (input.trackingNumber.trim()) {
      updateData.productionStatus = "shipped";
    }
  }
  if (input.productionStatus) {
    updateData.productionStatus = input.productionStatus;
  }

  await adminDb.collection("orders").doc(input.orderId).update(updateData);

  revalidatePath("/admin/factory");
  revalidatePath("/admin/orders");
}

export async function sendFactoryEmailAction(
  orderId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getAdminUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const snap = await adminDb.collection("orders").doc(orderId).get();
  if (!snap.exists) return { ok: false, error: "הזמנה לא נמצאה." };

  const order: Order = { id: snap.id, ...(snap.data() as Omit<Order, "id">) };
  const res = await sendFactoryOrderNotification(order);

  revalidatePath("/admin/factory");
  revalidatePath("/admin/orders");

  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true };
}

export async function rotateFactoryPortalTokenAction(): Promise<
  { ok: true; token: string } | { ok: false; error: string }
> {
  const user = await getAdminUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const token = await rotateFactoryPortalToken();
  revalidatePath("/admin/factory");
  return { ok: true, token };
}
