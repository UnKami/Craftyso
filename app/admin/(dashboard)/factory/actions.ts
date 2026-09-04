"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase/admin";
import type { ProductionStatus } from "@/lib/types";

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
