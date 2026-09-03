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
    return <p className="text-sm text-brand-light">תודה! נרשמתם בהצלחה למועדון הלקוחות.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm gap-2">
      <input
        type="email"
        required
        placeholder="כתובת אימייל"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="min-w-0 flex-1 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/70 outline-none focus:border-white"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-medium text-brand-dark disabled:opacity-60"
      >
        {status === "loading" ? "שולח..." : "הצטרפו"}
      </button>
      {status === "error" && (
        <span className="text-xs text-white">שגיאה, נסו שוב</span>
      )}
    </form>
  );
}
