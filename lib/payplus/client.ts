import "server-only";
import crypto from "crypto";

export class PayPlusNotConfiguredError extends Error {
  constructor() {
    super(
      "PayPlus payment gateway is not configured (missing PAYPLUS_API_KEY, PAYPLUS_SECRET_KEY, or PAYPLUS_PAYMENT_PAGE_UID).",
    );
    this.name = "PayPlusNotConfiguredError";
  }
}

export type PayPlusLineItem = {
  name: string;
  quantity: number;
  price: number;
};

export type CreatePayPlusLinkInput = {
  orderId: string;
  amountIls: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: PayPlusLineItem[];
  callbackUrl: string;
  successUrl: string;
  failureUrl: string;
  cancelUrl: string;
};

export type CreatePayPlusLinkResult = {
  paymentPageLink: string;
  pageRequestUid: string;
};

function getPayPlusBaseUrl(): string {
  const env = (process.env.PAYPLUS_ENV ?? "production").toLowerCase();
  return env === "sandbox" || env === "dev" || env === "staging"
    ? "https://restapidev.payplus.co.il/api/v1.0"
    : "https://restapi.payplus.co.il/api/v1.0";
}

function getCredentials() {
  const apiKey = process.env.PAYPLUS_API_KEY?.trim();
  const secretKey = process.env.PAYPLUS_SECRET_KEY?.trim();
  const paymentPageUid = process.env.PAYPLUS_PAYMENT_PAGE_UID?.trim();
  return { apiKey, secretKey, paymentPageUid };
}

export function isPayPlusConfigured(): boolean {
  const { apiKey, secretKey, paymentPageUid } = getCredentials();
  return Boolean(apiKey && secretKey && paymentPageUid);
}

/**
 * Tags every PayPlus payment with the "SO-" project prefix while respecting
 * PayPlus's 19-character cap on `more_info`.
 */
export function formatPayPlusMoreInfo(orderId: string): string {
  const trimmed = orderId.trim();
  const tagged = trimmed.startsWith("SO-") ? trimmed : `SO-${trimmed}`;
  return tagged.slice(0, 19);
}

/**
 * Generates a hosted PayPlus Israel payment page URL (v1.0 REST API).
 * Supports credit cards, Bit, Apple Pay, and Google Pay as enabled on the
 * merchant's PayPlus terminal.
 */
export async function createPayPlusPaymentLink(
  input: CreatePayPlusLinkInput,
): Promise<CreatePayPlusLinkResult> {
  const { apiKey, secretKey, paymentPageUid } = getCredentials();
  if (!apiKey || !secretKey || !paymentPageUid) {
    throw new PayPlusNotConfiguredError();
  }

  const baseUrl = getPayPlusBaseUrl();
  const payload = {
    payment_page_uid: paymentPageUid,
    charge_method: 1, // 1 = Regular charge (J4)
    amount: Math.round(input.amountIls * 100) / 100,
    currency_code: "ILS",
    sendEmailApproval: true,
    sendEmailFailure: false,
    initial_invoice: process.env.PAYPLUS_INITIAL_INVOICE !== "false",
    refURL_success: input.successUrl,
    refURL_failure: input.failureUrl,
    refURL_cancel: input.cancelUrl,
    refURL_callback: input.callbackUrl,
    send_failure_callback: true,
    more_info: formatPayPlusMoreInfo(input.orderId),
    more_info_1: input.orderId,
    customer: {
      customer_name: input.customerName,
      email: input.customerEmail,
      phone: input.customerPhone,
    },
    items: input.items.map((item) => ({
      name: item.name.slice(0, 120),
      quantity: item.quantity,
      price: Math.round(item.price * 100) / 100,
      vat_type: 0, // 0 = VAT included (standard Israeli B2C pricing)
    })),
  };

  const res = await fetch(`${baseUrl}/PaymentPages/generateLink`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "api-key": apiKey,
      "secret-key": secretKey,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`PayPlus generateLink failed (${res.status}): ${text}`);
  }

  let parsed: {
    results?: { status?: string; description?: string };
    data?: { payment_page_link?: string; page_request_uid?: string };
  };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`PayPlus generateLink returned invalid JSON: ${text.slice(0, 200)}`);
  }

  const link = parsed.data?.payment_page_link;
  const uid = parsed.data?.page_request_uid;

  if (!link || !uid) {
    throw new Error(
      `PayPlus generateLink missing payment_page_link: ${parsed.results?.description ?? text}`,
    );
  }

  return {
    paymentPageLink: link,
    pageRequestUid: uid,
  };
}

/**
 * Verifies the PayPlus webhook `hash` header (Base64 HMAC-SHA256 of the raw
 * request body signed with PAYPLUS_SECRET_KEY).
 */
export function verifyPayPlusCallbackHash(
  rawBody: string,
  hashHeader: string | null,
): boolean {
  const { secretKey } = getCredentials();
  if (!secretKey || !hashHeader) return false;

  const expected = crypto
    .createHmac("sha256", secretKey)
    .update(rawBody, "utf8")
    .digest("base64");

  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(hashHeader.trim());
  if (expectedBuf.length !== receivedBuf.length) return false;

  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

/**
 * Actively queries PayPlus IPN endpoint to confirm a transaction's status
 * directly from PayPlus servers.
 */
export async function fetchPayPlusIpn(params: {
  paymentRequestUid?: string;
  transactionUid?: string;
  moreInfo?: string;
}): Promise<Record<string, unknown> | null> {
  const { apiKey, secretKey } = getCredentials();
  if (!apiKey || !secretKey) return null;

  const baseUrl = getPayPlusBaseUrl();
  const body: Record<string, string> = {};
  if (params.paymentRequestUid) body.payment_request_uid = params.paymentRequestUid;
  if (params.transactionUid) body.transaction_uid = params.transactionUid;
  if (params.moreInfo) body.more_info = params.moreInfo;

  const res = await fetch(`${baseUrl}/PaymentPages/ipn`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "api-key": apiKey,
      "secret-key": secretKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) return null;
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}
