"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export function AccountButton() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setSignedIn(Boolean(user));
    });
  }, []);

  // Always route to the personal area: /account renders orders directly when a
  // session cookie exists and otherwise redirects to /account/login.
  const href = signedIn === false ? "/account/login" : "/account";

  return (
    <Link
      href={href}
      prefetch={false}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c59b5f]/40 text-[#dfb37c] transition-all hover:border-[#dfb37c] hover:text-white hover:bg-[#c59b5f]/10 hover:shadow-[0_0_15px_rgba(201,154,101,0.2)]"
      aria-label="אזור אישי"
      title="אזור אישי"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c0-3.9 3.13-7 7-7s7 3.1 7 7" strokeLinecap="round" />
      </svg>
    </Link>
  );
}
