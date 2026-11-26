"use client";

import { Suspense, useEffect, useId, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import {
  COURIER_PRICE_ILS,
  FREE_SHIPPING_THRESHOLD_ILS,
  REGISTERED_MAIL_PRICE_ILS,
} from "@/lib/constants";
import { formatIls } from "@/lib/format";
import type { ShippingMethod } from "@/lib/types";
import { placeOrder } from "./actions";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-20 text-center text-sm text-[#aa9c8d]">
          טוען את עמוד התשלום...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const { lines, totalIls: subtotalIls } = useCart();
  const searchParams = useSearchParams();
  const wasCancelled = searchParams.get("cancelled") === "1";
  const wasFailed = searchParams.get("failed") === "1";

  const formRef = useRef<HTMLFormElement>(null);
  const announcerRef = useRef<HTMLDivElement>(null);
  const idPrefix = useId();

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("courier");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const freeShippingEarned = subtotalIls >= FREE_SHIPPING_THRESHOLD_ILS;
  const shippingCostIls =
    shippingMethod === "pickup"
      ? 0
      : freeShippingEarned
        ? 0
        : shippingMethod === "registered_mail"
          ? REGISTERED_MAIL_PRICE_ILS
          : COURIER_PRICE_ILS;
  const grandTotalIls = Math.round((subtotalIls + shippingCostIls) * 100) / 100;

  // Synchronize aria-invalid & aria-describedby with native :user-invalid state
  // (per accessible-error-announcement guidance) so screen readers only hear
  // errors after user interaction, never prematurely on page load.
  useEffect(() => {
    const formEl = formRef.current;
    const announcer = announcerRef.current;
    if (!formEl) return;

    const flagged = new WeakSet<Element>();
    const announced = new WeakSet<Element>();
    let announceTimer: ReturnType<typeof setTimeout> | undefined;
    let announcedField: Element | null = null;

    const linkError = (el: HTMLElement, shown: boolean) => {
      const errorId = el.dataset.error;
      if (!errorId) return;
      const ids = (el.getAttribute("aria-describedby") || "")
        .split(/\s+/)
        .filter((id) => id && id !== errorId);
      if (shown) ids.push(errorId);
      if (ids.length) el.setAttribute("aria-describedby", ids.join(" "));
      else el.removeAttribute("aria-describedby");
    };

    const announceError = (el: HTMLElement) => {
      if (!announcer || !el.dataset.error) return;
      const errNode = document.getElementById(el.dataset.error);
      if (!errNode) return;
      const msg = errNode.textContent?.replace(/\s+/g, " ").trim() ?? "";
      if (!msg) return;
      clearTimeout(announceTimer);
      announcer.textContent = "";
      announcedField = el;
      announceTimer = setTimeout(() => {
        if (announcer) announcer.textContent = msg;
      }, 450);
    };

    const syncAria = (target: EventTarget | null, announce = false) => {
      if (!(target instanceof HTMLElement)) return;
      if (!target.matches("input, select, textarea")) return;
      const invalid = target.matches(":user-invalid");
      if (invalid) {
        if (announce && !announced.has(target)) {
          announceError(target);
          announced.add(target);
        }
        target.setAttribute("aria-invalid", "true");
        linkError(target, true);
        flagged.add(target);
      } else if (flagged.has(target) || target.getAttribute("aria-invalid") !== "true") {
        target.setAttribute("aria-invalid", "false");
        linkError(target, false);
        flagged.delete(target);
        announced.delete(target);
        if (announcedField === target && announcer) {
          clearTimeout(announceTimer);
          announcer.textContent = "";
        }
      }
    };

    formEl
      .querySelectorAll("input, select, textarea")
      .forEach((el) => syncAria(el));

    const onBlur = (e: Event) => syncAria(e.target, true);
    const onInput = (e: Event) => {
      if (e.target instanceof HTMLElement && e.target.hasAttribute("aria-invalid")) {
        syncAria(e.target);
      }
    };
    const onChange = (e: Event) => syncAria(e.target, true);
    const onInvalid = (e: Event) => {
      if (e.target instanceof Element) announced.add(e.target);
      syncAria(e.target);
    };

    formEl.addEventListener("blur", onBlur, true);
    formEl.addEventListener("input", onInput);
    formEl.addEventListener("change", onChange, true);
    formEl.addEventListener("invalid", onInvalid, true);

    return () => {
      clearTimeout(announceTimer);
      formEl.removeEventListener("blur", onBlur, true);
      formEl.removeEventListener("input", onInput);
      formEl.removeEventListener("change", onChange, true);
      formEl.removeEventListener("invalid", onInvalid, true);
    };
  }, [shippingMethod]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!acceptedTerms) {
      setError("יש לאשר את תקנון האתר ומדיניות הפרטיות לפני המעבר לתשלום.");
      return;
    }

    setStatus("loading");
    setError(null);

    const result = await placeOrder({
      items: lines.map((l) => ({
        productId: l.productId,
        name: l.name,
        priceIls: l.priceIls,
        quantity: l.quantity,
        customArtworkUrl: l.customArtworkUrl,
        customNotes: l.customNotes,
        customSpecs: l.customSpecs,
      })),
      customerName: form.name,
      customerEmail: form.email,
      customerPhone: form.phone,
      shippingMethod,
      shippingAddress: shippingMethod === "pickup" ? undefined : form.address,
    });

    if (result.ok) {
      // Redirect to PayPlus hosted checkout page. Do NOT clear the cart here —
      // cart is cleared on /checkout/success so cancelled payments keep items.
      window.location.assign(result.paymentUrl);
      return;
    }

    setStatus("error");
    setError(result.error);
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="rounded-2xl border border-dashed border-[#382a20] bg-[#140e0b]/60 p-12">
          <h1 className="font-serif-hebrew mb-3 text-2xl font-bold text-[#fbf8f2]">
            אין פריטים בעגלה
          </h1>
          <p className="mb-6 text-sm text-[#aa9c8d]">
            הוסיפו פריטים מהקטלוג כדי להמשיך להשלמת ההזמנה.
          </p>
          <Link
            href="/category"
            className="bg-gold-gradient-btn inline-block rounded-full px-6 py-2.5 text-sm font-semibold text-white"
          >
            מעבר לקטלוג
          </Link>
        </div>
      </div>
    );
  }

  const nameId = `${idPrefix}-name`;
  const emailId = `${idPrefix}-email`;
  const phoneId = `${idPrefix}-phone`;
  const addressId = `${idPrefix}-address`;
  const termsId = `${idPrefix}-terms`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div ref={announcerRef} aria-live="polite" className="visually-hidden" />

      <div className="mb-8 border-b border-[#2d2118] pb-5">
        <span className="text-xs font-semibold tracking-wider text-[#c59b5f] uppercase">
          השלמת הזמנה • תשלום מאובטח
        </span>
        <h1 className="font-serif-hebrew text-3xl font-bold text-[#fbf8f2] md:text-4xl">
          פרטי משלוח ותשלום
        </h1>
      </div>

      {(wasCancelled || wasFailed) && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-[#e87a7a]/40 bg-[#2a1414]/80 px-5 py-4 text-sm text-[#f5b4b4]"
        >
          {wasFailed
            ? "התשלום לא אושר על ידי חברת האשראי. הפריטים שלכם נשמרו בעגלה — ניתן לנסות שוב."
            : "התשלום בוטל. הפריטים שלכם עדיין מחכים בעגלה ותוכלו להמשיך בכל עת."}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Main Form Column */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 lg:col-span-7"
        >
          {/* Customer Details */}
          <section className="rounded-2xl border border-[#2d2118] bg-[#140e0b] p-5 sm:p-6">
            <h2 className="font-serif-hebrew mb-4 text-lg font-bold text-[#eed3a2]">
              1. פרטי המזמין
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor={nameId} className="text-sm text-[#aa9c8d]">
                  שם מלא <span className="text-[#c59b5f]">*</span>
                </label>
                <input
                  id={nameId}
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  data-error={`${nameId}-error`}
                  aria-invalid="false"
                  className="atelier-field rounded-xl border border-[#c59b5f]/40 bg-[#1a130f] px-4 py-2.5 text-sm text-[#f3ede2] placeholder-[#7d6f60] outline-none transition focus:border-[#dfb37c] focus:ring-1 focus:ring-[#dfb37c]"
                />
                <span id={`${nameId}-error`} className="atelier-field-error">
                  יש להזין שם מלא (לפחות 2 תווים).
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={emailId} className="text-sm text-[#aa9c8d]">
                    אימייל (למשלוח חשבונית ואישור) <span className="text-[#c59b5f]">*</span>
                  </label>
                  <input
                    id={emailId}
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    data-error={`${emailId}-error`}
                    aria-invalid="false"
                    className="atelier-field rounded-xl border border-[#c59b5f]/40 bg-[#1a130f] px-4 py-2.5 text-sm text-[#f3ede2] placeholder-[#7d6f60] outline-none transition focus:border-[#dfb37c] focus:ring-1 focus:ring-[#dfb37c]"
                  />
                  <span id={`${emailId}-error`} className="atelier-field-error">
                    יש להזין כתובת אימייל תקינה (לדוגמה: name@example.com).
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor={phoneId} className="text-sm text-[#aa9c8d]">
                    טלפון נייד (לתיאום משלוח) <span className="text-[#c59b5f]">*</span>
                  </label>
                  <input
                    id={phoneId}
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    minLength={9}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    data-error={`${phoneId}-error`}
                    aria-invalid="false"
                    className="atelier-field rounded-xl border border-[#c59b5f]/40 bg-[#1a130f] px-4 py-2.5 text-sm text-[#f3ede2] placeholder-[#7d6f60] outline-none transition focus:border-[#dfb37c] focus:ring-1 focus:ring-[#dfb37c]"
                  />
                  <span id={`${phoneId}-error`} className="atelier-field-error">
                    יש להזין מספר טלפון תקין (לפחות 9 ספרות).
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Shipping Method Selection */}
          <section className="rounded-2xl border border-[#2d2118] bg-[#140e0b] p-5 sm:p-6">
            <h2 className="font-serif-hebrew mb-4 text-lg font-bold text-[#eed3a2]">
              2. שיטת משלוח
            </h2>
            <div className="flex flex-col gap-3" role="radiogroup" aria-label="בחירת שיטת משלוח">
              <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-[#2d2118] bg-[#1a130f]/80 p-4 transition has-[:checked]:border-[#dfb37c] has-[:checked]:bg-[#221811]">
                <span className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="courier"
                    checked={shippingMethod === "courier"}
                    onChange={() => setShippingMethod("courier")}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-[#fbf8f2]">
                      שליח עד הבית (1–3 ימי עסקים)
                    </span>
                    <span className="block text-xs text-[#aa9c8d]">
                      משלוח מהיר לכל חלקי הארץ • חינם בהזמנות מעל {formatIls(FREE_SHIPPING_THRESHOLD_ILS)}
                    </span>
                  </span>
                </span>
                <span className="shrink-0 text-sm font-bold text-[#eed3a2]">
                  {freeShippingEarned ? "חינם!" : formatIls(COURIER_PRICE_ILS)}
                </span>
              </label>

              <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-[#2d2118] bg-[#1a130f]/80 p-4 transition has-[:checked]:border-[#dfb37c] has-[:checked]:bg-[#221811]">
                <span className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="registered_mail"
                    checked={shippingMethod === "registered_mail"}
                    onChange={() => setShippingMethod("registered_mail")}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-[#fbf8f2]">
                      דואר רשום (דואר ישראל)
                    </span>
                    <span className="block text-xs text-[#aa9c8d]">
                      איסוף מסניף הדואר הקרוב • 4–7 ימי עסקים
                    </span>
                  </span>
                </span>
                <span className="shrink-0 text-sm font-bold text-[#eed3a2]">
                  {freeShippingEarned ? "חינם!" : formatIls(REGISTERED_MAIL_PRICE_ILS)}
                </span>
              </label>

              <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-[#2d2118] bg-[#1a130f]/80 p-4 transition has-[:checked]:border-[#dfb37c] has-[:checked]:bg-[#221811]">
                <span className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="pickup"
                    checked={shippingMethod === "pickup"}
                    onChange={() => setShippingMethod("pickup")}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-[#fbf8f2]">
                      איסוף עצמי מהבוטיק
                    </span>
                    <span className="block text-xs text-[#aa9c8d]">
                      רחוב לבינובסקי 9, תל אביב (קומת קרקע) – בתיאום מראש
                    </span>
                  </span>
                </span>
                <span className="shrink-0 text-sm font-bold text-[#7fe09b]">חינם</span>
              </label>
            </div>

            {shippingMethod !== "pickup" && (
              <div className="mt-4 flex flex-col gap-1.5">
                <label htmlFor={addressId} className="text-sm text-[#aa9c8d]">
                  כתובת מלאה למשלוח (עיר, רחוב, מספר בית, דירה/קומה) <span className="text-[#c59b5f]">*</span>
                </label>
                <textarea
                  id={addressId}
                  name="address"
                  rows={2}
                  autoComplete="street-address"
                  required
                  minLength={5}
                  placeholder="לדוגמה: תל אביב, דיזנגוף 100, דירה 4"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  data-error={`${addressId}-error`}
                  aria-invalid="false"
                  className="atelier-field resize-y rounded-xl border border-[#c59b5f]/40 bg-[#1a130f] px-4 py-2.5 text-sm text-[#f3ede2] placeholder-[#7d6f60] outline-none transition focus:border-[#dfb37c] focus:ring-1 focus:ring-[#dfb37c]"
                />
                <span id={`${addressId}-error`} className="atelier-field-error">
                  יש להזין כתובת מלאה למשלוח (עיר, רחוב ומספר בית).
                </span>
              </div>
            )}
          </section>

          {/* Terms Consent & Submit */}
          <div className="flex flex-col gap-4">
            <label htmlFor={termsId} className="flex cursor-pointer items-start gap-2.5 text-xs text-[#aa9c8d]">
              <input
                id={termsId}
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                required
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              <span>
                קראתי ואני מסכים/ה ל
                <Link href="/terms" className="text-[#eed3a2] underline hover:text-white">
                  תקנון האתר ומדיניות הביטולים
                </Link>{" "}
                ול
                <Link href="/privacy" className="text-[#eed3a2] underline hover:text-white">
                  מדיניות הפרטיות
                </Link>
                .
              </span>
            </label>

            {error && (
              <p role="alert" className="rounded-xl border border-[#e87a7a]/40 bg-[#2a1414]/80 px-4 py-3 text-sm text-[#f5b4b4]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-gold-gradient-btn rounded-full px-8 py-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {status === "loading"
                ? "מעביר לדף התשלום המאובטח של PayPlus..."
                : `מעבר לתשלום מאובטח (${formatIls(grandTotalIls)})`}
            </button>

            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#8a7b6b]">
              <span>🔒 סליקה מאובטחת בתקן PCI-DSS באמצעות PayPlus</span>
              <span>•</span>
              <span>אשראי / Bit / Apple Pay / Google Pay</span>
            </div>
          </div>
        </form>

        {/* Order Summary Sidebar */}
        <aside className="lg:col-span-5">
          <div className="sticky top-28 rounded-2xl border border-[#c59b5f]/35 bg-[#140e0b] p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-[#2d2118] pb-3">
              <h2 className="font-serif-hebrew text-lg font-bold text-[#eed3a2]">
                סיכום הזמנה ({lines.reduce((s, l) => s + l.quantity, 0)} פריטים)
              </h2>
              <Link href="/cart" className="text-xs text-[#c59b5f] hover:text-[#eed3a2]">
                עריכת עגלה
              </Link>
            </div>

            <ul className="max-h-72 divide-y divide-[#2d2118] overflow-y-auto pr-1">
              {lines.map((line, idx) => (
                <li key={`${line.productId}-${idx}`} className="flex items-center gap-3 py-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#2d2118] bg-[#1a130f]">
                    {line.image && (
                      <Image
                        src={line.image}
                        alt={line.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#f3ede2]">{line.name}</p>
                    <p className="text-xs text-[#aa9c8d]">
                      {line.quantity} × {formatIls(line.priceIls)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-[#eed3a2]">
                    {formatIls(line.priceIls * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2 border-t border-[#2d2118] pt-4 text-sm">
              <div className="flex justify-between text-[#aa9c8d]">
                <span>סכום ביניים</span>
                <span>{formatIls(subtotalIls)}</span>
              </div>
              <div className="flex justify-between text-[#aa9c8d]">
                <span>משלוח</span>
                <span className={shippingCostIls === 0 ? "font-semibold text-[#7fe09b]" : ""}>
                  {shippingCostIls === 0 ? "חינם" : formatIls(shippingCostIls)}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-t border-[#2d2118] pt-3">
                <span className="font-semibold text-[#fbf8f2]">סה&quot;כ לתשלום (כולל מע&quot;מ)</span>
                <span className="text-2xl font-bold text-gold-gradient">
                  {formatIls(grandTotalIls)}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
