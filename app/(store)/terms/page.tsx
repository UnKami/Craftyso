import {
  COURIER_PRICE_ILS,
  FREE_SHIPPING_THRESHOLD_ILS,
  REGISTERED_MAIL_PRICE_ILS,
  RETURN_WINDOW_DAYS,
} from "@/lib/constants";

export const metadata = {
  title: "תקנון האתר ומדיניות ביטולים",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-8 border-b border-[#2d2118] pb-5">
        <span className="text-xs font-semibold tracking-wider text-[#c59b5f] uppercase">
          תנאי שימוש ורכישה
        </span>
        <h1 className="font-serif-hebrew text-3xl font-bold text-[#fbf8f2] md:text-4xl">
          תקנון האתר ומדיניות ביטולים
        </h1>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-[#c7b9a8]">
        <section className="rounded-xl border border-[#2d2118] bg-[#140e0b] p-6">
          <h2 className="font-serif-hebrew mb-2 text-base font-bold text-[#eed3a2]">
            1. כללי
          </h2>
          <p>
            ברוכים הבאים לאתר SO Atelier &amp; Couture (craftyso.co.il), המופעל מרחוב לבינובסקי 9,
            תל אביב (טלפון: 03-5106888). השימוש באתר והרכישה בו כפופים לתנאים המפורטים בתקנון זה.
          </p>
        </section>

        <section className="rounded-xl border border-[#2d2118] bg-[#140e0b] p-6">
          <h2 className="font-serif-hebrew mb-2 text-base font-bold text-[#eed3a2]">
            2. מחירים ותשלום מאובטח
          </h2>
          <p>
            כל המחירים המוצגים באתר כוללים מע&quot;מ כדין ונקובים בשקלים חדשים (₪). התשלום מתבצע
            באמצעות מערכת סליקה מאובטחת בתקן PCI-DSS (PayPlus). פרטי כרטיס האשראי אינם נשמרים
            בשרתי האתר.
          </p>
        </section>

        <section className="rounded-xl border border-[#2d2118] bg-[#140e0b] p-6">
          <h2 className="font-serif-hebrew mb-2 text-base font-bold text-[#eed3a2]">
            3. אספקה ומשלוחים
          </h2>
          <ul className="list-disc space-y-1.5 pr-5">
            <li>
              שליח עד הבית: 1–3 ימי עסקים (₪{COURIER_PRICE_ILS}, חינם בהזמנות מעל ₪
              {FREE_SHIPPING_THRESHOLD_ILS}).
            </li>
            <li>דואר רשום: 4–7 ימי עסקים (₪{REGISTERED_MAIL_PRICE_ILS}).</li>
            <li>איסוף עצמי מהבוטיק ברחוב לבינובסקי 9, תל אביב — חינם בתיאום מראש.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-[#2d2118] bg-[#140e0b] p-6">
          <h2 className="font-serif-hebrew mb-2 text-base font-bold text-[#eed3a2]">
            4. ביטול עסקה והחזרת מוצרים
          </h2>
          <p>
            בהתאם לחוק הגנת הצרכן, התשמ&quot;א-1981, ניתן לבטל עסקה תוך {RETURN_WINDOW_DAYS} ימים
            מיום קבלת המוצר, ובלבד שהמוצר הוחזר באריזתו המקורית, ללא שימוש וללא פגם. מוצרים שיוצרו
            בהזמנה אישית (עיצוב אישי / הדפסה / רקמה מותאמת) וכן בדים או סרטים שנחתכו לפי מידה אינם
            ניתנים לביטול לאחר תחילת הייצור או החיתוך, למעט במקרה של פגם בייצור.
          </p>
        </section>
      </div>
    </div>
  );
}
