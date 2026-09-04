"use server";

import { adminDb } from "@/lib/firebase/admin";
import { getSessionUser } from "@/lib/auth/session";
import { createPaymentSession, GrowNotConfiguredError } from "@/lib/grow/client";
import type { Order, OrderItem } from "@/lib/types";

type PlaceOrderInput = {
  items: OrderItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress?: string;
};

export type PlaceOrderResult =
  | { ok: true; paymentUrl: string }
  | { ok: false; error: string };

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  if (input.items.length === 0) return { ok: false, error: "העגלה ריקה." };

  const totalIls = input.items.reduce((sum, i) => sum + i.priceIls * i.quantity, 0);
  const now = new Date().toISOString();
  const session = await getSessionUser();

  const hasCustomItems = input.items.some((i) => Boolean(i.customArtworkUrl));

  const order: Omit<Order, "id"> = {
    ...(session ? { userId: session.uid } : {}),
    items: input.items,
    totalIls,
    status: "pending",
    productionStatus: hasCustomItems ? "pending_production" : undefined,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    shippingAddress: input.shippingAddress,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const ref = await adminDb.collection("orders").add(order);

    const session = await createPaymentSession({
      orderId: ref.id,
      amountIls: totalIls,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      successUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/checkout/success?order=${ref.id}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/checkout?cancelled=1`,
    });

    return { ok: true, paymentUrl: session.paymentUrl };
  } catch (err) {
    if (err instanceof GrowNotConfiguredError) {
      return {
        ok: false,
        error: "התשלום עדיין לא מחובר (Grow לא מוגדר). ההזמנה נשמרה כטיוטה.",
      };
    }
    console.error("[checkout] placeOrder failed:", err);
    return { ok: false, error: "אירעה שגיאה ביצירת ההזמנה. נסו שוב." };
  }
}
