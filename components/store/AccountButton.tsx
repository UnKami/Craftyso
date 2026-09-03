"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";

type Status = "loading" | "guest" | "customer" | "admin";

export function AccountButton() {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus("guest");
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        setStatus(snap.exists() ? "admin" : "customer");
      } catch {
        setStatus("customer");
      }
    });
  }, []);

  const href =
    status === "admin" ? "/admin" : status === "customer" ? "/account" : "/account/login";

  return (
    <Link
      href={href}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink transition hover:border-brand hover:text-brand"
      aria-label="אזור אישי"
      title="אזור אישי"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c0-3.9 3.13-7 7-7s7 3.1 7 7" strokeLinecap="round" />
      </svg>
    </Link>
  );
}
