export const metadata = {
  title: "מדיניות פרטיות",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-8 border-b border-[#2d2118] pb-5">
        <span className="text-xs font-semibold tracking-wider text-[#c59b5f] uppercase">
          שמירה על פרטיות ואבטחת מידע
        </span>
        <h1 className="font-serif-hebrew text-3xl font-bold text-[#fbf8f2] md:text-4xl">
          מדיניות פרטיות
        </h1>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-[#c7b9a8]">
        <section className="rounded-xl border border-[#2d2118] bg-[#140e0b] p-6">
          <h2 className="font-serif-hebrew mb-2 text-base font-bold text-[#eed3a2]">
            1. מידע שאנו אוספים
          </h2>
          <p>
            בעת ביצוע הזמנה או יצירת קשר באתר, אנו אוספים את הפרטים הנדרשים להשלמת ההזמנה ואספקתה:
            שם מלא, כתובת אימייל, מספר טלפון וכתובת למשלוח.
          </p>
        </section>

        <section className="rounded-xl border border-[#2d2118] bg-[#140e0b] p-6">
          <h2 className="font-serif-hebrew mb-2 text-base font-bold text-[#eed3a2]">
            2. אבטחת תשלומים
          </h2>
          <p>
            סליקת האשראי מתבצעת ישירות מול ספק הסליקה המאושר PayPlus בתקן אבטחה PCI-DSS Level 1.
            אתר SO אינו שומר או חשוף למספרי כרטיסי האשראי של הלקוחות.
          </p>
        </section>

        <section className="rounded-xl border border-[#2d2118] bg-[#140e0b] p-6">
          <h2 className="font-serif-hebrew mb-2 text-base font-bold text-[#eed3a2]">
            3. שימוש במידע ופנייה אלינו
          </h2>
          <p>
            המידע משמש אך ורק לטיפול בהזמנה, הנפקת חשבונית מס, תיאום משלוח ושירות לקוחות. איננו
            מוכרים או מעבירים פרטי לקוחות לצדדים שלישיים למעט חברות השליחויות וספק הסליקה לצורך
            ביצוע ההזמנה. לבקשת עיון, תיקון או מחיקת מידע ניתן לפנות אלינו בטלפון 03-5106888.
          </p>
        </section>
      </div>
    </div>
  );
}
