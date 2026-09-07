"use server";

import { adminDb } from "@/lib/firebase/admin";
import { getSessionUser } from "@/lib/auth/session";
import { createPaymentSession, GrowNotConfiguredError } from "@/lib/grow/client";
import type { Order, OrderItem, Product } from "@/lib/types";

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

// Re-derive price and quantity from Firestore instead of trusting the
// client — a modified cart line should never be able to set its own price.
// Custom/bespoke items (from the customizer) use a synthetic productId with
// no catalog doc behind it, so those are left as sent.
async function repriceItem(item: OrderItem): Promise<OrderItem> {
  if (item.customArtworkUrl) return item;

  const quantity = Math.max(1, Math.round(item.quantity) || 1);

  const doc = await adminDb.collection("products").doc(item.productId).get();
  if (!doc.exists) return { ...item, quantity };

  const product = doc.data() as Product;
  const wholesaleActive =
    typeof product.wholesalePriceIls === "number" &&
    product.wholesalePriceIls > 0 &&
    quantity >= (product.wholesaleMinQty ?? 10);

  return {
    ...item,
    quantity,
    name: product.name,
    priceIls: wholesaleActive ? product.wholesalePriceIls! : product.priceIls,
  };
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  if (input.items.length === 0) return { ok: false, error: "העגלה ריקה." };

  const items = await Promise.all(input.items.map(repriceItem));
  const totalIls = items.reduce((sum, i) => sum + i.priceIls * i.quantity, 0);
  const now = new Date().toISOString();
  const authSession = await getSessionUser();

  const hasCustomItems = items.some((i) => Boolean(i.customArtworkUrl));

  const order: Omit<Order, "id"> = {
    ...(authSession ? { userId: authSession.uid } : {}),
    items,
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

    const paymentSession = await createPaymentSession({
      orderId: ref.id,
      amountIls: totalIls,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      successUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/checkout/success?order=${ref.id}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/checkout?cancelled=1`,
    });

    return { ok: true, paymentUrl: paymentSession.paymentUrl };
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
