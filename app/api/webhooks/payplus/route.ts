import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyPayPlusCallbackHash } from "@/lib/payplus/client";
import { sendFactoryOrderNotification } from "@/lib/notifications/factory-email";
import type { Order } from "@/lib/types";

type PayPlusCallbackBody = {
  transaction_type?: string;
  transaction?: {
    uid?: string;
    payment_page_request_uid?: string;
    status_code?: string;
    approval_number?: string;
    voucher_number?: string;
    amount?: number;
    more_info?: string;
  };
  data?: {
    customer_email?: string;
    card_information?: Record<string, unknown>;
  };
  invoice?: {
    original_url?: string;
  };
  // Flat fallback fields in case of alternate PayPlus callback format
  transaction_uid?: string;
  payment_request_uid?: string;
  status_code?: string;
  approval_num?: string;
  voucher_num?: string;
  more_info?: string;
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const hashHeader = req.headers.get("hash") ?? req.headers.get("x-payplus-hash");

  if (!verifyPayPlusCallbackHash(rawBody, hashHeader)) {
    console.warn("[payplus/webhook] Rejected callback with invalid or missing hash signature.");
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  let body: PayPlusCallbackBody;
  try {
    body = JSON.parse(rawBody) as PayPlusCallbackBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const orderId = body.transaction?.more_info ?? body.more_info;
  if (!orderId) {
    console.warn("[payplus/webhook] Callback missing more_info (orderId).");
    return NextResponse.json({ ok: false, error: "Missing orderId" }, { status: 400 });
  }

  const statusCode = String(body.transaction?.status_code ?? body.status_code ?? "");
  const isApproved = statusCode === "000";
  const transactionUid = body.transaction?.uid ?? body.transaction_uid;
  const approvalNum = body.transaction?.approval_number ?? body.approval_num;
  const voucherNum = body.transaction?.voucher_number ?? body.voucher_num;
  const invoiceUrl = body.invoice?.original_url;
  const now = new Date().toISOString();

  try {
    const orderRef = adminDb.collection("orders").doc(orderId);
    const snap = await orderRef.get();
    if (!snap.exists) {
      console.warn(`[payplus/webhook] Order ${orderId} not found in Firestore.`);
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    const update: Record<string, unknown> = {
      status: isApproved ? "paid" : "failed",
      updatedAt: now,
    };
    if (isApproved) update.paidAt = now;
    if (transactionUid) update.payplusTransactionUid = transactionUid;
    if (approvalNum) update.payplusApprovalNum = approvalNum;
    if (voucherNum) update.payplusVoucherNum = voucherNum;
    if (invoiceUrl) update.payplusInvoiceUrl = invoiceUrl;

    await orderRef.update(update);

    // Notify factory automatically once when payment is approved (idempotent).
    const existing = snap.data() as Omit<Order, "id">;
    if (isApproved && !existing.factoryNotifiedAt) {
      const updatedOrder: Order = {
        id: orderId,
        ...existing,
        ...(update as Partial<Order>),
      };
      const notifyRes = await sendFactoryOrderNotification(updatedOrder);
      if (!notifyRes.ok) {
        console.warn(`[payplus/webhook] Factory notification skipped/failed for ${orderId}: ${notifyRes.error}`);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[payplus/webhook] Failed to update order:", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
