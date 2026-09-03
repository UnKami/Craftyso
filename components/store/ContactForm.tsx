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
    return <p className="text-brand-dark">תודה, קיבלנו את פנייתכם ונחזור אליכם בהקדם.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-3">
      <input
        required
        placeholder="שם מלא"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="rounded-lg border border-border px-3 py-2 outline-none focus:border-brand"
      />
      <input
        required
        type="email"
        placeholder="אימייל"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="rounded-lg border border-border px-3 py-2 outline-none focus:border-brand"
      />
      <input
        placeholder="טלפון"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="rounded-lg border border-border px-3 py-2 outline-none focus:border-brand"
      />
      <textarea
        placeholder="הודעה"
        rows={4}
        value={form.note}
        onChange={(e) => setForm({ ...form, note: e.target.value })}
        className="rounded-lg border border-border px-3 py-2 outline-none focus:border-brand"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="self-start rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {status === "loading" ? "שולח..." : "שליחה"}
      </button>
      {status === "error" && <p className="text-sm text-brand-dark">אירעה שגיאה, נסו שוב.</p>}
    </form>
  );
}
