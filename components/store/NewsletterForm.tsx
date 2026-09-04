"use client";

import { useState, type FormEvent } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      await addDoc(collection(db, "leads"), {
        email,
        source: "newsletter",
        status: "new",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return <p className="text-sm font-medium text-[#eed3a2]">תודה! נרשמתם בהצלחה למועדון הלקוחות.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm gap-2">
      <input
        type="email"
        required
        placeholder="כתובת אימייל"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="min-w-0 flex-1 rounded-full border border-[#c59b5f]/40 bg-[#140e0b] px-4 py-2.5 text-sm text-[#f3ede2] placeholder-[#7d6f60] outline-none transition focus:border-[#dfb37c] focus:ring-1 focus:ring-[#dfb37c]"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 rounded-full bg-gold-gradient-btn px-5 py-2.5 text-xs font-semibold text-white transition disabled:opacity-60"
      >
        {status === "loading" ? "שולח..." : "הצטרפו"}
      </button>
      {status === "error" && (
        <span className="text-xs text-[#e87a7a]">שגיאה, נסו שוב</span>
      )}
    </form>
  );
}
