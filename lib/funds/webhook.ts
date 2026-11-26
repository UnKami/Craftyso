import "server-only";
import type { OrderItem } from "@/lib/types";

const FUNDS_WEBHOOK_URL =
  "https://api2.cursor.sh/automations/webhook/57c935e4-c650-56a5-b411-8ae1d5e51cb6";
const REQUEST_TIMEOUT_MS = 5000;
const RETRY_DELAY_MS = 500;

export type FundsEvent = "payment.completed" | "payment.refunded";

export type FundsWebhookPayload = {
  event: FundsEvent;
  project: "SO";
  amount: number;
  currency: "ILS";
  customer_name: string;
  customer_email: string;
  site_order_id: string;
  payplus_transaction_uid: string;
  payplus_approval_number: string;
  payplus_page_request_uid: string;
  paid_at: string;
  item: string;
};

export function buildOrderItemSummary(items: OrderItem[]): string {
  if (!items || items.length === 0) return "SO order";
  const summary = items
    .map((i) => (i.quantity > 1 ? `${i.name} ×${i.quantity}` : i.name))
    .join(", ");
  return summary.length > 200 ? `${summary.slice(0, 197)}...` : summary;
}

function shouldRetryStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Notifies Yonatan's Funds income tracker about a completed PayPlus payment
 * or refund. Reads FUNDS_WEBHOOK_SECRET from Firebase Secret Manager (bound
 * via apphosting.yaml at runtime). Never throws or logs the secret.
 */
export async function notifyFundsWebhook(
  payload: FundsWebhookPayload,
): Promise<boolean> {
  const secret = process.env.FUNDS_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.warn(
      `[funds/webhook] FUNDS_WEBHOOK_SECRET is not set; skipping ${payload.event} for order ${payload.site_order_id}.`,
    );
    return false;
  }

  const body = JSON.stringify(payload);

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(FUNDS_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (res.ok) return true;

      const status = res.status;
      if (attempt === 1 && shouldRetryStatus(status)) {
        await delay(RETRY_DELAY_MS);
        continue;
      }

      console.error(
        `[funds/webhook] Failed to deliver ${payload.event} for order ${payload.site_order_id} (HTTP ${status}, attempt ${attempt}).`,
      );
      return false;
    } catch (err) {
      const reason = err instanceof Error ? err.message : "unknown network error";
      if (attempt === 1) {
        await delay(RETRY_DELAY_MS);
        continue;
      }
      console.error(
        `[funds/webhook] Error delivering ${payload.event} for order ${payload.site_order_id} (attempt ${attempt}): ${reason}`,
      );
      return false;
    }
  }

  return false;
}
