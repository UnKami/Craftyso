import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyPayPlusCallbackHash } from "@/lib/payplus/client";
import { sendFactoryOrderNotification } from "@/lib/notifications/factory-email";
import { buildOrderItemSummary, notifyFundsWebhook } from "@/lib/funds/webhook";
import type { Order } from "@/lib/types";

type PayPlusCallbackBody = {
  transaction_type?: string;
  transaction?: {
    uid?: string;
    type?: string;
    charge_method?: number;
    payment_page_request_uid?: string;
    status_code?: string;
    approval_number?: string;
    voucher_number?: string;
    amount?: number;
    currency?: string;
    more_info?: string;
    more_info_1?: string;
  };
  data?: {
    customer_name?: string;
    customer_email?: string;
    card_information?: Record<string, unknown>;
  };
  invoice?: {
    original_url?: string;
  };
  // Flat fallback fields in case of alternate PayPlus callback format
  transaction_uid?: string;
  payment_request_uid?: string;
  charge_method?: number;
  status_code?: string;
  approval_num?: string;
  voucher_num?: string;
  amount?: number;
  more_info?: string;
  more_info_1?: string;
};

function isRefundCallback(body: PayPlusCallbackBody, rawAmount?: number): boolean {
  const txType = String(body.transaction_type ?? body.transaction?.type ?? "").toLowerCase();
  if (txType.includes("refund") || txType.includes("credit")) return true;
  const chargeMethod = body.transaction?.charge_method ?? body.charge_method;
  if (Number(chargeMethod) === 4) return true;
  if (typeof rawAmount === "number" && rawAmount < 0) return true;
  return false;
}

async function resolveOrderDoc(body: PayPlusCallbackBody) {
  const fullOrderId = body.transaction?.more_info_1 ?? body.more_info_1;
  if (fullOrderId) {
    const snap = await adminDb.collection("orders").doc(fullOrderId).get();
    if (snap.exists) return snap;
  }

  const pageRequestUid =
    body.transaction?.payment_page_request_uid ?? body.payment_request_uid;
  if (pageRequestUid) {
    const query = await adminDb
      .collection("orders")
      .where("payplusPageRequestUid", "==", pageRequestUid)
      .limit(1)
      .get();
    if (!query.empty) return query.docs[0]!;
  }

  const moreInfo = body.transaction?.more_info ?? body.more_info;
  if (moreInfo) {
    const stripped = moreInfo.startsWith("SO-") ? moreInfo.slice(3) : moreInfo;
    const snap = await adminDb.collection("orders").doc(stripped).get();
    if (snap.exists) return snap;
  }

  return null;
}

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

  const rawAmount = body.transaction?.amount ?? body.amount;
  const statusCode = String(body.transaction?.status_code ?? body.status_code ?? "");
  const isApproved = statusCode === "000";
  const isRefund = isRefundCallback(body, rawAmount);
  const transactionUid = body.transaction?.uid ?? body.transaction_uid ?? "";
  const pageRequestUid =
    body.transaction?.payment_page_request_uid ?? body.payment_request_uid ?? "";
  const approvalNum = body.transaction?.approval_number ?? body.approval_num ?? "";
  const voucherNum = body.transaction?.voucher_number ?? body.voucher_num ?? "";
  const invoiceUrl = body.invoice?.original_url;
  const now = new Date().toISOString();

  try {
    const snap = await resolveOrderDoc(body);
    if (!snap || !snap.exists) {
      console.warn("[payplus/webhook] Order not found for incoming PayPlus callback.");
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    const orderId = snap.id;
    const orderRef = snap.ref;
    const existing = snap.data() as Omit<Order, "id"> & {
      fundsNotifiedTransactionUids?: string[];
    };

    const update: Record<string, unknown> = {
      updatedAt: now,
    };

    if (isRefund) {
      if (isApproved) {
        const refundedAmount =
          typeof rawAmount === "number" && rawAmount !== 0
            ? Math.abs(rawAmount)
            : existing.totalIls;
        update.refundedAt = now;
        update.refundAmountIls = refundedAmount;
        if (refundedAmount >= existing.totalIls) {
          update.status = "cancelled";
        }
      }
    } else {
      update.status = isApproved ? "paid" : "failed";
      if (isApproved) update.paidAt = now;
      if (transactionUid) update.payplusTransactionUid = transactionUid;
      if (pageRequestUid) update.payplusPageRequestUid = pageRequestUid;
      if (approvalNum) update.payplusApprovalNum = approvalNum;
      if (voucherNum) update.payplusVoucherNum = voucherNum;
      if (invoiceUrl) update.payplusInvoiceUrl = invoiceUrl;
    }

    await orderRef.update(update);

    // After order is saved, notify Funds about completed payments and refunds.
    if (isApproved) {
      const dedupeKey = `${isRefund ? "refund" : "payment"}:${transactionUid || pageRequestUid || orderId}`;
      const alreadyNotified = existing.fundsNotifiedTransactionUids?.includes(dedupeKey) ?? false;

      if (!alreadyNotified) {
        const amount =
          typeof rawAmount === "number" && rawAmount !== 0
            ? Math.round(Math.abs(rawAmount) * 100) / 100
            : existing.totalIls;

        const delivered = await notifyFundsWebhook({
          event: isRefund ? "payment.refunded" : "payment.completed",
          project: "SO",
          amount,
          currency: "ILS",
          customer_name: body.data?.customer_name || existing.customerName,
          customer_email: body.data?.customer_email || existing.customerEmail,
          site_order_id: orderId,
          payplus_transaction_uid: transactionUid || existing.payplusTransactionUid || "",
          payplus_approval_number: approvalNum || existing.payplusApprovalNum || "",
          payplus_page_request_uid: pageRequestUid || existing.payplusPageRequestUid || "",
          paid_at: now,
          item: buildOrderItemSummary(existing.items),
        });

        if (delivered) {
          await orderRef.update({
            fundsNotifiedTransactionUids: [
              ...(existing.fundsNotifiedTransactionUids ?? []),
              dedupeKey,
            ],
          });
        }
      }
    }

    // Notify factory automatically once when payment is approved (idempotent).
    if (isApproved && !isRefund && !existing.factoryNotifiedAt) {
      const updatedOrder: Order = {
        id: orderId,
        ...existing,
        ...(update as Partial<Order>),
      };
      const notifyRes = await sendFactoryOrderNotification(updatedOrder);
      if (!notifyRes.ok) {
        console.warn(
          `[payplus/webhook] Factory notification skipped/failed for ${orderId}: ${notifyRes.error}`,
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[payplus/webhook] Failed to process callback:", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
