import Link from "next/link";
import { ClearCartOnSuccess } from "@/components/store/ClearCartOnSuccess";

type Props = { searchParams: Promise<{ order?: string }> };

export const metadata = { title: "ההזמנה התקבלה" };

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order } = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <ClearCartOnSuccess />
      <div className="rounded-2xl border border-[#c59b5f]/40 bg-[#140e0b] p-8 sm:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#7fe09b]/50 bg-[#13261a] text-2xl text-[#7fe09b]">
          ✓
        </div>
        <span className="text-xs font-semibold tracking-wider text-[#c59b5f] uppercase">
          SO ATELIER & COUTURE
        </span>
        <h1 className="font-serif-hebrew mt-2 mb-3 text-3xl font-bold text-[#fbf8f2]">
          תודה על הרכישה!
        </h1>
        <p className="text-sm leading-relaxed text-[#c7b9a8]">
          ההזמנה שלכם התקבלה בהצלחה
          {order ? (
            <>
              {" "}
              (מספר הזמנה:{" "}
              <span className="font-mono font-semibold text-[#eed3a2]">{order}</span>)
            </>
          ) : (
            ""
          )}
          . אישור תשלום וחשבונית מס יישלחו אליכם למייל מיד עם אישור הסליקה.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/account"
            className="bg-gold-gradient-btn rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            צפייה בהזמנות שלי
          </Link>
          <Link
            href="/category"
            className="rounded-full border border-[#c59b5f]/40 px-6 py-2.5 text-sm font-medium text-[#eed3a2] transition hover:border-[#dfb37c] hover:text-white"
          >
            חזרה לקטלוג
          </Link>
        </div>
      </div>
    </div>
  );
}
