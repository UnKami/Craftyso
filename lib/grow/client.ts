import "server-only";

export class GrowNotConfiguredError extends Error {
  constructor() {
    super("Grow payment gateway is not configured (missing GROW_API_KEY / GROW_TERMINAL_ID).");
    this.name = "GrowNotConfiguredError";
  }
}

type CreatePaymentSessionInput = {
  orderId: string;
  amountIls: number;
  customerName: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
};

type CreatePaymentSessionResult = {
  paymentUrl: string;
};

function isConfigured() {
  return Boolean(process.env.GROW_API_KEY && process.env.GROW_TERMINAL_ID);
}

/**
 * Creates a hosted Grow (יאסטרפיי) payment page for the given order and
 * returns the URL to redirect the customer to.
 *
 * UNVERIFIED PLACEHOLDER: the endpoint/request shape below has not been
 * checked against Grow's actual API docs (no merchant account exists yet).
 * Before going live, replace this with the real "Create Payment Page"
 * request from Grow's merchant dashboard / API reference.
 */
export async function createPaymentSession(
  input: CreatePaymentSessionInput,
): Promise<CreatePaymentSessionResult> {
  if (!isConfigured()) throw new GrowNotConfiguredError();

  const res = await fetch("https://api.grow.link/v1/paymentPages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROW_API_KEY}`,
    },
    body: JSON.stringify({
      terminalId: process.env.GROW_TERMINAL_ID,
      amount: input.amountIls,
      currency: "ILS",
      orderId: input.orderId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    }),
  });

  if (!res.ok) {
    throw new Error(`Grow payment session creation failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { url: string };
  return { paymentUrl: data.url };
}

/**
 * Verifies an incoming Grow webhook signature. Implement against Grow's
 * documented webhook signing scheme once GROW_WEBHOOK_SECRET is set.
 */
export function verifyWebhookSignature(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- signature not yet implemented, see TODO below
  rawBody: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- signature not yet implemented, see TODO below
  signatureHeader: string | null,
): boolean {
  if (!process.env.GROW_WEBHOOK_SECRET) return false;
  // TODO: implement Grow's actual signature verification once documented
  // credentials are available.
  return false;
}
