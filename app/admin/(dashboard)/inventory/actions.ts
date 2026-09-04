"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/require-admin";
import { adminDb } from "@/lib/firebase/admin";

export async function createRestockOrder(input: {
  inventoryItemId: string;
  itemName: string;
  quantity: number;
  supplierName: string;
  costIls: number;
  estimatedArrival?: string;
  notes?: string;
}) {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");

  const now = new Date().toISOString();
  await adminDb.collection("restocks").add({
    ...input,
    status: "ordered",
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/admin/inventory");
}

export async function receiveRestockOrder(
  restockOrderId: string,
  inventoryItemId: string,
  quantity: number
) {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");

  const now = new Date().toISOString();

  // 1. Mark restock order received
  await adminDb.collection("restocks").doc(restockOrderId).update({
    status: "received",
    receivedAt: now,
    updatedAt: now,
  });

  // 2. Increment inventory stock
  const itemDoc = await adminDb.collection("inventory").doc(inventoryItemId).get();
  if (itemDoc.exists) {
    const currentQty = Number(itemDoc.data()?.stockQty) || 0;
    await adminDb.collection("inventory").doc(inventoryItemId).update({
      stockQty: currentQty + quantity,
      lastRestockedAt: now,
      updatedAt: now,
    });
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/factory");
}

export async function updateInventoryStock(inventoryItemId: string, newStockQty: number) {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");

  await adminDb.collection("inventory").doc(inventoryItemId).update({
    stockQty: newStockQty,
    updatedAt: new Date().toISOString(),
  });

  revalidatePath("/admin/inventory");
}

export async function createInventoryItem(input: {
  name: string;
  sku: string;
  category: string;
  stockQty: number;
  minAlertQty: number;
  unit: string;
  costPriceIls: number;
  supplierName?: string;
  supplierPhone?: string;
}) {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");

  const now = new Date().toISOString();
  await adminDb.collection("inventory").add({
    ...input,
    updatedAt: now,
  });

  revalidatePath("/admin/inventory");
}
