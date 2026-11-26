"use client";

import { Suspense, useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  isSignInWithEmailLink,
  RecaptchaVerifier,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";

const EMAIL_LINK_STORAGE_KEY = "craftyso_email_for_signin";

function toIsraeliE164(raw: string): string {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  if (trimmed.startsWith("+")) return `+${digits}`;
  if (digits.startsWith("972")) return `+${digits}`;
  if (digits.startsWith("0") && digits.length >= 9 && digits.length <= 10) {
    return `+972${digits.slice(1)}`;
  }
  return `+${digits}`;
}

export default function AccountLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4 text-sm text-[#aa9c8d]">
          טוען...
        </div>
      }
    >
      <AccountLoginContent />
    </Suspense>
  );
}

function AccountLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const destination =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/account";

  const [method, setMethod] = useState<"phone" | "email" | "password">("phone");

  // Phone SMS OTP state
  const [phoneInput, setPhoneInput] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  // Email Magic Link state
  const [emailInput, setEmailInput] = useState("");
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [needsEmailConfirmForLink, setNeedsEmailConfirmForLink] = useState(false);

  // Password fallback state
  const [passwordInput, setPasswordInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalizeSession = useCallback(
    async (user: User, extra?: { phone?: string }) => {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          phone: extra?.phone || user.phoneNumber || undefined,
        }),
      });
      if (!res.ok) throw new Error("session creation failed");
      router.push(destination);
      router.refresh();
    },
    [destination, router],
  );

  // Auto-complete Firebase Email Link sign-in when returning from inbox
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isSignInWithEmailLink(auth, window.location.href)) return;

    let active = true;
    const savedEmail = window.localStorage.getItem(EMAIL_LINK_STORAGE_KEY);

    (async () => {
      if (!savedEmail) {
        if (active) {
          setMethod("email");
          setNeedsEmailConfirmForLink(true);
        }
        return;
      }

      if (active) setLoading(true);
      try {
        const cred = await signInWithEmailLink(auth, savedEmail, window.location.href);
        window.localStorage.removeItem(EMAIL_LINK_STORAGE_KEY);
        if (active) await finalizeSession(cred.user);
      } catch {
        if (active) {
          setError("הקישור פג תוקף או כבר נוצל. הזינו את האימייל כדי לקבל קישור חדש.");
          setMethod("email");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [finalizeSession]);

  // Clean up RecaptchaVerifier on unmount
  useEffect(() => {
    return () => {
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    };
  }, []);

  async function handleSendSms(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const e164 = toIsraeliE164(phoneInput);
    if (e164.length < 11) {
      setError("יש להזין מספר טלפון נייד תקין (לדוגמה: 050-1234567).");
      return;
    }

    setLoading(true);
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
        });
      }
      const result = await signInWithPhoneNumber(auth, e164, recaptchaRef.current);
      setConfirmation(result);
    } catch (err) {
      console.error("[account/login] SMS send failed:", err);
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
      setError("לא הצלחנו לשלוח קוד SMS למספר זה. בדקו את המספר ונסו שוב.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifySms(e: FormEvent) {
    e.preventDefault();
    if (!confirmation) return;
    setError(null);
    setLoading(true);
    try {
      const cred = await confirmation.confirm(smsCode.trim());
      await finalizeSession(cred.user, { phone: toIsraeliE164(phoneInput) });
    } catch {
      setError("הקוד שגוי או פג תוקף. נסו שוב.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailLink(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const cleaned = emailInput.trim().toLowerCase();
    if (!cleaned) return;

    setLoading(true);
    try {
      if (needsEmailConfirmForLink && isSignInWithEmailLink(auth, window.location.href)) {
        const cred = await signInWithEmailLink(auth, cleaned, window.location.href);
        window.localStorage.removeItem(EMAIL_LINK_STORAGE_KEY);
        await finalizeSession(cred.user);
        return;
      }

      const actionUrl = `${window.location.origin}/account/login?next=${encodeURIComponent(destination)}`;
      await sendSignInLinkToEmail(auth, cleaned, {
        url: actionUrl,
        handleCodeInApp: true,
      });
      window.localStorage.setItem(EMAIL_LINK_STORAGE_KEY, cleaned);
      setEmailLinkSent(true);
    } catch (err) {
      console.error("[account/login] Email link send failed:", err);
      setError("לא הצלחנו לשלוח קישור אימות לאימייל זה. ודאו שהכתובת תקינה ונסו שוב.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSignIn(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
      await finalizeSession(cred.user);
    } catch {
      setError("אימייל או סיסמה שגויים. ניתן להיכנס גם ללא סיסמה עם קישור חד-פעמי למייל או SMS.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-14">
      <div id="recaptcha-container" />

      <div className="rounded-2xl border border-[#2d2118] bg-[#140e0b] p-6 sm:p-8 shadow-xl">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#c59b5f]">
          SO ATELIER • כניסה מהירה ללא סיסמה
        </span>
        <h1 className="font-serif-hebrew mt-1 text-2xl font-bold text-[#fbf8f2] sm:text-3xl">
          האזור האישי שלי
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-[#aa9c8d]">
          הזינו טלפון או אימייל — ניצור עבורכם חשבון או נתחבר אוטומטית ונציג את כל ההזמנות הקודמות
          שלכם.
        </p>

        {/* Method Tabs */}
        <div className="mt-6 flex gap-1.5 rounded-full border border-[#2d2118] bg-[#0e0906] p-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setMethod("phone");
              setError(null);
            }}
            className={`flex-1 rounded-full py-2 font-semibold transition ${
              method === "phone"
                ? "bg-[#8f5823] text-white shadow-sm"
                : "text-[#aa9c8d] hover:text-white"
            }`}
          >
            קוד ב-SMS לטלפון
          </button>
          <button
            type="button"
            onClick={() => {
              setMethod("email");
              setError(null);
            }}
            className={`flex-1 rounded-full py-2 font-semibold transition ${
              method === "email"
                ? "bg-[#8f5823] text-white shadow-sm"
                : "text-[#aa9c8d] hover:text-white"
            }`}
          >
            קישור חד-פעמי למייל
          </button>
        </div>

        {/* PHONE SMS FLOW */}
        {method === "phone" && (
          <div className="mt-6">
            {!confirmation ? (
              <form onSubmit={handleSendSms} className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5 text-sm text-[#aa9c8d]">
                  מספר טלפון נייד
                  <input
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    dir="ltr"
                    placeholder="050-1234567"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="rounded-xl border border-[#c59b5f]/40 bg-[#1a130f] px-4 py-2.5 text-left text-sm text-[#f3ede2] placeholder-[#7d6f60] outline-none focus:border-[#dfb37c]"
                  />
                </label>

                {error && <p className="text-xs text-rose-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gold-gradient-btn rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                >
                  {loading ? "שולח קוד SMS..." : "שלח קוד אימות ב-SMS"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifySms} className="flex flex-col gap-4">
                <p className="text-xs text-[#eed3a2]">
                  שלחנו קוד אימות בן 6 ספרות למספר <strong dir="ltr">{phoneInput}</strong>
                </p>
                <label className="flex flex-col gap-1.5 text-sm text-[#aa9c8d]">
                  קוד אימות (6 ספרות)
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    dir="ltr"
                    placeholder="123456"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    className="rounded-xl border border-[#c59b5f]/40 bg-[#1a130f] px-4 py-2.5 text-center font-mono text-lg tracking-[0.35em] text-[#f3ede2] outline-none focus:border-[#dfb37c]"
                  />
                </label>

                {error && <p className="text-xs text-rose-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gold-gradient-btn rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                >
                  {loading ? "מאמת..." : "אימות וכניסה לחשבון"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setConfirmation(null);
                    setSmsCode("");
                    setError(null);
                  }}
                  className="text-xs text-[#aa9c8d] hover:text-white"
                >
                  החלפת מספר טלפון
                </button>
              </form>
            )}
          </div>
        )}

        {/* EMAIL MAGIC LINK FLOW */}
        {method === "email" && (
          <div className="mt-6">
            {emailLinkSent ? (
              <div className="space-y-4 rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-4 text-center">
                <p className="text-sm font-semibold text-emerald-300">
                  ✓ קישור כניסה חד-פעמי נשלח למייל!
                </p>
                <p className="text-xs leading-relaxed text-[#c7b9a8]">
                  פתחו את תיבת המייל של <strong>{emailInput}</strong> ולחצו על קישור ההתחברות.
                  תועברו אוטומטית להזמנות שלכם.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEmailLinkSent(false);
                    setError(null);
                  }}
                  className="text-xs text-[#eed3a2] underline hover:text-white"
                >
                  שליחה חוזרת / שינוי כתובת אימייל
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmailLink} className="flex flex-col gap-4">
                {needsEmailConfirmForLink && (
                  <p className="rounded-lg border border-[#c59b5f]/40 bg-[#1e1510] p-3 text-xs text-[#eed3a2]">
                    להשלמת האימות מהקישור במייל, הזינו שוב את כתובת האימייל שלכם:
                  </p>
                )}
                <label className="flex flex-col gap-1.5 text-sm text-[#aa9c8d]">
                  כתובת אימייל
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    dir="ltr"
                    placeholder="name@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="rounded-xl border border-[#c59b5f]/40 bg-[#1a130f] px-4 py-2.5 text-left text-sm text-[#f3ede2] placeholder-[#7d6f60] outline-none focus:border-[#dfb37c]"
                  />
                </label>

                {error && <p className="text-xs text-rose-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gold-gradient-btn rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                >
                  {loading
                    ? "שולח..."
                    : needsEmailConfirmForLink
                      ? "השלם התחברות"
                      : "שלח קישור אימות חד-פעמי למייל"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* OPTIONAL PASSWORD FALLBACK */}
        {method === "password" && (
          <form onSubmit={handlePasswordSignIn} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm text-[#aa9c8d]">
              אימייל
              <input
                type="email"
                autoComplete="email"
                required
                dir="ltr"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="rounded-xl border border-[#c59b5f]/40 bg-[#1a130f] px-4 py-2.5 text-left text-sm text-[#f3ede2] outline-none focus:border-[#dfb37c]"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-[#aa9c8d]">
              סיסמה
              <input
                type="password"
                autoComplete="current-password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="rounded-xl border border-[#c59b5f]/40 bg-[#1a130f] px-4 py-2.5 text-left text-sm text-[#f3ede2] outline-none focus:border-[#dfb37c]"
              />
            </label>

            {error && <p className="text-xs text-rose-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-gold-gradient-btn rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "מתחבר..." : "התחברות עם סיסמה"}
            </button>
          </form>
        )}

        <div className="mt-6 border-t border-[#241a13] pt-4 text-center">
          {method !== "password" ? (
            <button
              type="button"
              onClick={() => {
                setMethod("password");
                setError(null);
              }}
              className="text-xs text-[#8a7b6b] transition hover:text-[#eed3a2]"
            >
              יש לך כבר סיסמה? כניסה עם אימייל וסיסמה
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMethod("phone");
                setError(null);
              }}
              className="text-xs text-[#8a7b6b] transition hover:text-[#eed3a2]"
            >
              חזרה לכניסה מהירה ללא סיסמה (SMS / מייל)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
