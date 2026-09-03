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
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-ink">פרטי משלוח ותשלום</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="שם מלא" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Field label="אימייל" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
        <Field label="טלפון" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
        <Field label="כתובת למשלוח" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />

        <div className="mt-2 flex items-center justify-between rounded-2xl border border-border bg-surface-muted p-4">
          <span className="font-medium text-ink">סה&quot;כ לתשלום</span>
          <span className="text-lg font-semibold text-brand-dark">{formatIls(totalIls)}</span>
        </div>

        {error && <p className="text-sm text-brand-dark">{error}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
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
    <label className="flex flex-col gap-1 text-sm text-ink-muted">
      {label}
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border px-3 py-2 text-ink outline-none focus:border-brand"
      />
    </label>
  );
}
