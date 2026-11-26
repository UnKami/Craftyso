"use server";

import { headers } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import { getSessionUser } from "@/lib/auth/session";
import {
  normalizeEmail,
  normalizePhone,
  upsertAndMergeCustomerIdentity,
} from "@/lib/customers/identity";
import {
  COURIER_PRICE_ILS,
  FREE_SHIPPING_THRESHOLD_ILS,
  REGISTERED_MAIL_PRICE_ILS,
} from "@/lib/constants";
import {
  createPayPlusPaymentLink,
  PayPlusNotConfiguredError,
} from "@/lib/payplus/client";
import type { Order, OrderItem, Product, ShippingDetails, ShippingMethod } from "@/lib/types";

type PlaceOrderInput = {
  items: OrderItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingMethod: ShippingMethod;
  shippingAddress?: string;
  shippingDetails?: ShippingDetails;
};

export type PlaceOrderResult =
  | { ok: true; paymentUrl: string }
  | { ok: false; error: string };

const SHIPPING_LABELS: Record<ShippingMethod, string> = {
  courier: "משלוח שליח עד הבית",
  registered_mail: "דואר רשום",
  pickup: "איסוף עצמי מהבוטיק (תל אביב)",
};

function computeShippingCost(method: ShippingMethod, subtotalIls: number): number {
  if (method === "pickup") return 0;
  if (subtotalIls >= FREE_SHIPPING_THRESHOLD_ILS) return 0;
  if (method === "registered_mail") return REGISTERED_MAIL_PRICE_ILS;
  return COURIER_PRICE_ILS;
}

async function resolveSiteUrl(): Promise<string> {
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;

  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  return "https://craftyso.co.il";
}

function formatShippingAddress(details?: ShippingDetails, fallback?: string): string {
  if (details && (details.city.trim() || details.street.trim())) {
    const parts = [
      details.street.trim(),
      details.apartment?.trim() ? `דירה/קומה: ${details.apartment.trim()}` : "",
      details.city.trim(),
      details.postalCode?.trim() ? `מיקוד ${details.postalCode.trim()}` : "",
    ].filter(Boolean);
    return parts.join(", ");
  }
  return fallback?.trim() ?? "";
}

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
    slug: product.slug,
    image: item.image || product.images[0],
    priceIls: wholesaleActive ? product.wholesalePriceIls! : product.priceIls,
  };
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  if (input.items.length === 0) return { ok: false, error: "העגלה ריקה." };

  const customerName = input.customerName.trim();
  const customerEmail = input.customerEmail.trim();
  const customerPhone = input.customerPhone.trim();
  const shippingAddress = formatShippingAddress(input.shippingDetails, input.shippingAddress);

  if (!customerName || !customerEmail || !customerPhone) {
    return { ok: false, error: "יש למלא שם מלא, אימייל וטלפון." };
  }

  if (input.shippingMethod !== "pickup" && !shippingAddress) {
    return { ok: false, error: "יש להזין עיר ורחוב מלאים למשלוח." };
  }

  const items = await Promise.all(input.items.map(repriceItem));
  const subtotalIls = items.reduce((sum, i) => sum + i.priceIls * i.quantity, 0);
  const shippingCostIls = computeShippingCost(input.shippingMethod, subtotalIls);
  const totalIls = Math.round((subtotalIls + shippingCostIls) * 100) / 100;

  const now = new Date().toISOString();
  const authSession = await getSessionUser();
  const hasCustomItems = items.some((i) => Boolean(i.customArtworkUrl));
  const resolvedAddress =
    input.shippingMethod === "pickup"
      ? "איסוף עצמי — רחוב לבינובסקי 9, תל אביב"
      : shippingAddress;

  const cleanedDetails: ShippingDetails | undefined =
    input.shippingMethod !== "pickup" && input.shippingDetails
      ? {
          city: input.shippingDetails.city.trim(),
          street: input.shippingDetails.street.trim(),
          ...(input.shippingDetails.apartment?.trim()
            ? { apartment: input.shippingDetails.apartment.trim() }
            : {}),
          ...(input.shippingDetails.postalCode?.trim()
            ? { postalCode: input.shippingDetails.postalCode.trim() }
            : {}),
          ...(input.shippingDetails.deliveryNotes?.trim()
            ? { deliveryNotes: input.shippingDetails.deliveryNotes.trim() }
            : {}),
        }
      : undefined;

  // Aggregate customer identity by UID, email, and phone so past & future
  // orders stay linked even if the customer checks out as a guest or switches
  // login methods later.
  const customerProfile = await upsertAndMergeCustomerIdentity({
    uid: authSession?.uid,
    email: customerEmail,
    phone: customerPhone,
    name: customerName,
    shippingAddress: input.shippingMethod === "pickup" ? undefined : shippingAddress,
  }).catch((err) => {
    console.warn("[checkout] customer identity upsert failed:", err);
    return null;
  });

  const order: Omit<Order, "id"> = {
    ...(authSession ? { userId: authSession.uid } : {}),
    ...(customerProfile ? { customerId: customerProfile.id } : {}),
    customerEmailNormalized: normalizeEmail(customerEmail),
    customerPhoneNormalized: normalizePhone(customerPhone),
    items,
    subtotalIls,
    shippingMethod: input.shippingMethod,
    shippingCostIls,
    totalIls,
    status: "pending",
    productionStatus: hasCustomItems ? "pending_production" : undefined,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress: resolvedAddress,
    ...(cleanedDetails ? { shippingDetails: cleanedDetails } : {}),
    createdAt: now,
    updatedAt: now,
  };

  try {
    const ref = await adminDb.collection("orders").add(order);
    const siteUrl = await resolveSiteUrl();

    const payplusItems = items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.priceIls,
    }));

    if (shippingCostIls > 0) {
      payplusItems.push({
        name: SHIPPING_LABELS[input.shippingMethod],
        quantity: 1,
        price: shippingCostIls,
      });
    }

    const payment = await createPayPlusPaymentLink({
      orderId: ref.id,
      amountIls: totalIls,
      customerName,
      customerEmail,
      customerPhone,
      items: payplusItems,
      callbackUrl: `${siteUrl}/api/webhooks/payplus`,
      successUrl: `${siteUrl}/checkout/success?order=${ref.id}`,
      failureUrl: `${siteUrl}/checkout?failed=1&order=${ref.id}`,
      cancelUrl: `${siteUrl}/checkout?cancelled=1&order=${ref.id}`,
    });

    await ref.update({
      payplusPageRequestUid: payment.pageRequestUid,
      updatedAt: new Date().toISOString(),
    });

    return { ok: true, paymentUrl: payment.paymentPageLink };
  } catch (err) {
    if (err instanceof PayPlusNotConfiguredError) {
      return {
        ok: false,
        error:
          "התשלום דרך PayPlus עדיין לא מוגדר (חסרים מפתחות API). ההזמנה נשמרה כטיוטה — פנו אלינו להשלמה.",
      };
    }
    console.error("[checkout] placeOrder failed:", err);
    return { ok: false, error: "אירעה שגיאה ביצירת דף התשלום. נסו שוב או צרו קשר." };
  }
}
