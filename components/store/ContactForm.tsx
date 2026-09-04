"use client";

import { useState, type FormEvent } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", note: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await addDoc(collection(db, "leads"), {
        ...form,
        source: "contact_form",
        status: "new",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-[#c59b5f]/40 bg-[#16100c] p-6 text-[#eed3a2]">
        תודה! קיבלנו את פנייתכם ונחזור אליכם בהקדם האפשרי.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <input
        required
        placeholder="שם מלא"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="rounded-xl border border-[#c59b5f]/40 bg-[#140e0b] px-4 py-2.5 text-sm text-[#f3ede2] placeholder-[#7d6f60] outline-none transition focus:border-[#dfb37c] focus:ring-1 focus:ring-[#dfb37c]"
      />
      <input
        required
        type="email"
        placeholder="אימייל"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="rounded-xl border border-[#c59b5f]/40 bg-[#140e0b] px-4 py-2.5 text-sm text-[#f3ede2] placeholder-[#7d6f60] outline-none transition focus:border-[#dfb37c] focus:ring-1 focus:ring-[#dfb37c]"
      />
      <input
        placeholder="טלפון"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="rounded-xl border border-[#c59b5f]/40 bg-[#140e0b] px-4 py-2.5 text-sm text-[#f3ede2] placeholder-[#7d6f60] outline-none transition focus:border-[#dfb37c] focus:ring-1 focus:ring-[#dfb37c]"
      />
      <textarea
        placeholder="תוכן הפנייה..."
        rows={4}
        value={form.note}
        onChange={(e) => setForm({ ...form, note: e.target.value })}
        className="rounded-xl border border-[#c59b5f]/40 bg-[#140e0b] px-4 py-2.5 text-sm text-[#f3ede2] placeholder-[#7d6f60] outline-none transition focus:border-[#dfb37c] focus:ring-1 focus:ring-[#dfb37c]"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-gold-gradient-btn self-start rounded-full px-8 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {status === "loading" ? "שולח..." : "שליחת הודעה"}
      </button>
      {status === "error" && <p className="text-sm text-[#e87a7a]">אירעה שגיאה, אנא נסו שוב.</p>}
    </form>
  );
}
