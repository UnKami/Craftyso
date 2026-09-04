"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatIls } from "@/lib/format";
import { placeOrder } from "./actions";

export default function CheckoutPage() {
  const { lines, totalIls, clear } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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
      shippingAddress: form.address,
    });

    if (result.ok) {
      clear();
      router.push(result.paymentUrl);
      return;
    }

    setStatus("error");
    setError(result.error);
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-ink-muted">
        אין פריטים בעגלה.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 border-b border-[#2d2118] pb-5">
        <span className="text-xs font-semibold tracking-wider text-[#c59b5f] uppercase">
          השלמת הזמנה
        </span>
        <h1 className="font-serif-hebrew text-3xl font-bold text-[#fbf8f2] md:text-4xl">
          פרטי משלוח ותשלום
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="שם מלא" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Field label="אימייל" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
        <Field label="טלפון" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
        <Field label="כתובת מלאה למשלוח" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#2d2118] bg-[#140e0b] p-5">
          <span className="font-medium text-[#f3ede2]">סה&quot;כ לתשלום</span>
          <span className="text-2xl font-bold text-gold-gradient">{formatIls(totalIls)}</span>
        </div>

        {error && <p className="text-sm text-[#e87a7a]">{error}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-gold-gradient-btn mt-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {status === "loading" ? "מעבד..." : "מעבר לתשלום מאובטח"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-[#aa9c8d]">
      {label}
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-[#c59b5f]/40 bg-[#140e0b] px-4 py-2.5 text-sm text-[#f3ede2] placeholder-[#7d6f60] outline-none transition focus:border-[#dfb37c] focus:ring-1 focus:ring-[#dfb37c]"
      />
    </label>
  );
}
