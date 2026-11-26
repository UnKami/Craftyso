"use client";

import { useState, useTransition, type FormEvent } from "react";
import { linkCustomerContactAction } from "@/app/(store)/account/actions";

export function LinkContactForm({
  emails,
  phones,
}: {
  emails: string[];
  phones: string[];
}) {
  const [pending, startTransition] = useTransition();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await linkCustomerContactAction({ phone, email });
      if (res.ok) {
        setPhone("");
        setEmail("");
        setMessage({
          ok: true,
          text: "הפרטים שויכו לחשבון — הזמנות קודמות תחת פרטים אלו מופיעות כעת ברשימה.",
        });
      } else {
        setMessage({ ok: false, text: res.error });
      }
    });
  }

  return (
    <section className="mt-8 rounded-2xl border border-[#2d2118] bg-[#140e0b] p-5">
      <h2 className="font-serif-hebrew text-base font-bold text-[#eed3a2]">
        אימיילים ומספרי טלפון המקושרים לחשבון
      </h2>
      <p className="mt-1 text-xs text-[#aa9c8d]">
        הזמנתם בעבר עם מספר טלפון או אימייל אחר? הוסיפו אותם כאן כדי לאחד את כל ההזמנות לאותו
        חשבון.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {emails.map((e) => (
          <span
            key={e}
            className="rounded-full border border-[#c59b5f]/35 bg-[#1a130f] px-3 py-1 text-xs text-[#f3ede2]"
          >
            ✉ {e}
          </span>
        ))}
        {phones.map((p) => (
          <span
            key={p}
            dir="ltr"
            className="rounded-full border border-[#c59b5f]/35 bg-[#1a130f] px-3 py-1 text-xs text-[#f3ede2]"
          >
            📞 {p}
          </span>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap gap-2">
        <input
          type="tel"
          inputMode="tel"
          placeholder="הוספת מספר טלפון (לדוגמה 050-1234567)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="min-w-[200px] flex-1 rounded-xl border border-[#2d2118] bg-[#1a130f] px-3.5 py-2 text-xs text-[#f3ede2] placeholder-[#7d6f60] outline-none focus:border-[#dfb37c]"
        />
        <input
          type="email"
          placeholder="או אימייל נוסף"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-w-[200px] flex-1 rounded-xl border border-[#2d2118] bg-[#1a130f] px-3.5 py-2 text-xs text-[#f3ede2] placeholder-[#7d6f60] outline-none focus:border-[#dfb37c]"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-[#8f5823] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#ad7c44] disabled:opacity-50"
        >
          {pending ? "מאחד..." : "שיוך לחשבון"}
        </button>
      </form>

      {message && (
        <p className={`mt-2 text-xs ${message.ok ? "text-emerald-400" : "text-rose-400"}`}>
          {message.text}
        </p>
      )}
    </section>
  );
}
