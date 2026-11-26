import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { formatIls } from "@/lib/format";
import type { Order, ShippingMethod } from "@/lib/types";

const SHIPPING_LABELS: Record<ShippingMethod, string> = {
  courier: "שליח עד הבית (1–3 ימי עסקים)",
  registered_mail: "דואר רשום (דואר ישראל)",
  pickup: "איסוף עצמי מהבוטיק — רחוב לבינובסקי 9, תל אביב",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const toRaw = process.env.FACTORY_NOTIFICATION_EMAIL?.trim();
  const from =
    process.env.EMAIL_FROM?.trim() || "SO Atelier Orders <onboarding@resend.dev>";
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://craftyso.co.il"
  ).replace(/\/+$/, "");

  const recipients = toRaw
    ? toRaw
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean)
    : [];

  return { apiKey, recipients, from, siteUrl };
}

export function isFactoryEmailConfigured(): boolean {
  const { apiKey, recipients } = getEmailConfig();
  return Boolean(apiKey && recipients.length > 0);
}

function buildOrderEmailHtml(order: Order, siteUrl: string): string {
  const shippingLabel = order.shippingMethod
    ? SHIPPING_LABELS[order.shippingMethod]
    : "שליח עד הבית";
  const hasCustom = order.items.some((i) => Boolean(i.customArtworkUrl));

  const itemRows = order.items
    .map((item) => {
      const specs = item.customSpecs
        ? `<div style="margin-top:4px;font-size:12px;color:#7a5c38;">
            🎨 עיצוב אישי: ${escapeHtml(item.customSpecs.technique ?? "")}
            ${item.customSpecs.widthCm && item.customSpecs.heightCm ? ` | ${item.customSpecs.widthCm}×${item.customSpecs.heightCm} ס"מ` : ""}
            ${item.customSpecs.baseColor ? ` | בסיס: ${escapeHtml(item.customSpecs.baseColor)}` : ""}
            ${item.customNotes ? `<br/>הערות לקוח: ${escapeHtml(item.customNotes)}` : ""}
          </div>`
        : "";

      return `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #e7dfd4;text-align:right;">
            <strong>${escapeHtml(item.name)}</strong>
            ${specs}
          </td>
          <td style="padding:10px;border-bottom:1px solid #e7dfd4;text-align:center;">${item.quantity}</td>
          <td style="padding:10px;border-bottom:1px solid #e7dfd4;text-align:left;">${formatIls(item.priceIls)}</td>
          <td style="padding:10px;border-bottom:1px solid #e7dfd4;text-align:left;font-weight:bold;">${formatIls(item.priceIls * item.quantity)}</td>
        </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:20px;background:#f7f4ef;font-family:Arial,Helvetica,sans-serif;color:#1d1612;direction:rtl;">
  <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e2d6c4;border-radius:12px;overflow:hidden;">
    <div style="background:#0c0907;color:#eed3a2;padding:20px 24px;">
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c59b5f;">SO ATELIER &amp; COUTURE • FACTORY WORK ORDER</div>
      <h1 style="margin:6px 0 0;font-size:22px;color:#fbf8f2;">הזמנה חדשה שולמה #${escapeHtml(order.id.slice(0, 8))}</h1>
      ${hasCustom ? `<div style="margin-top:8px;display:inline-block;background:#8f5823;color:#fff;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:bold;">🎨 כוללת פריטים בעיצוב אישי — יש להוריד גרפיקה בלוח המפעל</div>` : ""}
    </div>

    <div style="padding:24px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px;">
        <tr>
          <td style="width:50%;vertical-align:top;padding:12px;background:#faf7f2;border:1px solid #eee5d8;border-radius:8px;">
            <div style="font-size:12px;color:#8a6b47;font-weight:bold;margin-bottom:6px;">פרטי לקוח ומשלוח</div>
            <div><strong>שם:</strong> ${escapeHtml(order.customerName)}</div>
            <div><strong>טלפון:</strong> <a href="tel:${escapeHtml(order.customerPhone)}">${escapeHtml(order.customerPhone)}</a></div>
            <div><strong>אימייל:</strong> ${escapeHtml(order.customerEmail)}</div>
            <div style="margin-top:6px;"><strong>שיטת משלוח:</strong> ${escapeHtml(shippingLabel)}</div>
            ${order.shippingAddress ? `<div><strong>כתובת:</strong> ${escapeHtml(order.shippingAddress)}</div>` : ""}
          </td>
          <td style="width:12px;"></td>
          <td style="width:50%;vertical-align:top;padding:12px;background:#faf7f2;border:1px solid #eee5d8;border-radius:8px;">
            <div style="font-size:12px;color:#8a6b47;font-weight:bold;margin-bottom:6px;">פרטי תשלום (PayPlus)</div>
            <div><strong>סטטוס:</strong> <span style="color:#16794c;font-weight:bold;">${order.status === "paid" ? "✓ שולם ואושר" : escapeHtml(order.status)}</span></div>
            <div><strong>מספר הזמנה מלא:</strong> <span style="font-family:monospace;font-size:12px;">${escapeHtml(order.id)}</span></div>
            ${order.payplusApprovalNum ? `<div><strong>מס׳ אישור:</strong> ${escapeHtml(order.payplusApprovalNum)}</div>` : ""}
            ${order.payplusVoucherNum ? `<div><strong>מס׳ שובר:</strong> ${escapeHtml(order.payplusVoucherNum)}</div>` : ""}
            ${order.payplusTransactionUid ? `<div><strong>מזהה עסקה:</strong> <span style="font-family:monospace;font-size:11px;">${escapeHtml(order.payplusTransactionUid)}</span></div>` : ""}
            ${order.payplusInvoiceUrl ? `<div style="margin-top:6px;"><a href="${escapeHtml(order.payplusInvoiceUrl)}" style="color:#8f5823;font-weight:bold;">צפייה בחשבונית מס ←</a></div>` : ""}
          </td>
        </tr>
      </table>

      <h2 style="font-size:16px;margin:0 0 10px;color:#1d1612;">פירוט פריטים לייצור ולאריזה</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#f3ede2;color:#5a4632;">
            <th style="padding:10px;text-align:right;">פריט</th>
            <th style="padding:10px;text-align:center;">כמות</th>
            <th style="padding:10px;text-align:left;">מחיר יח׳</th>
            <th style="padding:10px;text-align:left;">סה״כ</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div style="margin-top:16px;padding:14px;background:#faf7f2;border-radius:8px;text-align:left;font-size:14px;">
        ${typeof order.subtotalIls === "number" ? `<div>סכום ביניים: <strong>${formatIls(order.subtotalIls)}</strong></div>` : ""}
        ${typeof order.shippingCostIls === "number" ? `<div>משלוח: <strong>${order.shippingCostIls === 0 ? "חינם" : formatIls(order.shippingCostIls)}</strong></div>` : ""}
        <div style="font-size:18px;margin-top:6px;color:#8f5823;">סה״כ שולם: <strong>${formatIls(order.totalIls)}</strong></div>
      </div>

      <div style="margin-top:24px;text-align:center;">
        <a href="${escapeHtml(siteUrl)}/admin/factory" style="display:inline-block;background:#8f5823;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:bold;font-size:14px;">
          פתיחת ההזמנה בדשבורד המפעל ←
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export type FactoryNotificationResult =
  | { ok: true; skipped?: boolean }
  | { ok: false; error: string };

/**
 * Sends a structured Work Order & Packing Slip email to the factory team via
 * Resend REST API, and records `factoryNotifiedAt` on the Firestore order doc.
 */
export async function sendFactoryOrderNotification(
  order: Order,
): Promise<FactoryNotificationResult> {
  const { apiKey, recipients, from, siteUrl } = getEmailConfig();
  if (!apiKey || recipients.length === 0) {
    return {
      ok: false,
      error:
        "לא הוגדרו RESEND_API_KEY או FACTORY_NOTIFICATION_EMAIL לשליחת התראות מפעל.",
    };
  }

  const subject = `הזמנה חדשה שולמה #${order.id.slice(0, 8)} — ${order.customerName} (${formatIls(order.totalIls)})`;
  const html = buildOrderEmailHtml(order, siteUrl);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      const errorMsg = `Resend API error (${res.status}): ${errText.slice(0, 200)}`;
      await adminDb.collection("orders").doc(order.id).update({
        factoryNotificationError: errorMsg,
        updatedAt: new Date().toISOString(),
      });
      return { ok: false, error: errorMsg };
    }

    const now = new Date().toISOString();
    await adminDb.collection("orders").doc(order.id).update({
      factoryNotifiedAt: now,
      factoryNotificationError: "",
      updatedAt: now,
    });

    return { ok: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown email error";
    console.error("[factory-email] Failed to send:", err);
    return { ok: false, error: errorMsg };
  }
}
