"use client";

import { useState, useTransition } from "react";
import { rotateFactoryPortalTokenAction } from "@/app/admin/(dashboard)/factory/actions";

export function FactoryShareLinkCard({
  initialToken,
  siteUrl,
}: {
  initialToken: string;
  siteUrl: string;
}) {
  const [token, setToken] = useState(initialToken);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const fullUrl = token ? `${siteUrl.replace(/\/+$/, "")}/factory-portal/${token}` : "";

  async function handleCopy() {
    if (!fullUrl) return;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleRotate() {
    if (
      !window.confirm(
        "ליצור קישור סודי חדש למפעל? הקישור הקודם יפסיק לעבוד מיד ותצטרכו לשלוח למפעל את הקישור החדש.",
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await rotateFactoryPortalTokenAction();
      if (res.ok) setToken(res.token);
    });
  }

  if (!token) return null;

  return (
    <div className="rounded-2xl border border-brand/40 bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand">
            PRIVATE FACTORY LINK • קישור פרטי למפעל
          </span>
          <h2 className="text-base font-bold text-ink">
            קישור ישיר ושמור למפעל לצפייה בכל ההזמנות, פרטי המשלוח והגרפיקות
          </h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            קישור זה אינו נגיש מהאתר הציבורי וחסום למנועי חיפוש. שתפו אותו רק עם צוות המפעל.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          type="text"
          readOnly
          dir="ltr"
          value={fullUrl}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-xl border border-border bg-surface-muted px-3.5 py-2 font-mono text-xs text-ink outline-none"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-dark"
        >
          {copied ? "✓ הועתק!" : "📋 העתק קישור"}
        </button>
        <a
          href={fullUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-ink transition hover:border-brand hover:text-brand"
        >
          פתיחה בחלון חדש ↗
        </a>
        <button
          type="button"
          disabled={pending}
          onClick={handleRotate}
          className="rounded-xl border border-border px-3.5 py-2 text-xs text-ink-muted transition hover:border-rose-400 hover:text-rose-400 disabled:opacity-50"
        >
          {pending ? "מחליף..." : "🔄 החלף קישור"}
        </button>
      </div>
    </div>
  );
}
