import Link from "next/link";

export const metadata = { title: "סיטונאות למעצבים ולעסקים" };

export default function WholesalePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-8 border-b border-[#2d2118] pb-5">
        <span className="text-xs font-semibold tracking-wider text-[#c59b5f] uppercase">
          עבור בתי אופנה, מעצבים וחייטים
        </span>
        <h1 className="font-serif-hebrew text-3xl font-bold text-[#fbf8f2] md:text-4xl">
          מכירה סיטונאית לעסקים
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#aa9c8d]">
          SO הוא הספק המוביל לצעירי האופנה ובתי החייטות המובילים בישראל — מעל 230 חברות ובתי אופנה
          כבר רוכשים אצלנו במחירי יבואן ישירים. כל מוצר בקטלוג שלנו מגיע עם מדרגת מחיר לכמות,
          המוצגת ישירות בעמוד המוצר.
        </p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#2d2118] bg-[#140e0b] p-5 text-center">
          <span className="font-serif-hebrew block text-2xl font-bold text-gold-gradient">230+</span>
          <span className="text-xs text-[#aa9c8d]">חברות ובתי אופנה</span>
        </div>
        <div className="rounded-xl border border-[#2d2118] bg-[#140e0b] p-5 text-center">
          <span className="font-serif-hebrew block text-2xl font-bold text-gold-gradient">1,500+</span>
          <span className="text-xs text-[#aa9c8d]">אביזרי אופנה וסדקית</span>
        </div>
        <div className="rounded-xl border border-[#2d2118] bg-[#140e0b] p-5 text-center">
          <span className="font-serif-hebrew block text-2xl font-bold text-gold-gradient">24-72h</span>
          <span className="text-xs text-[#aa9c8d]">משלוח מהיר עד הדלת</span>
        </div>
      </div>

      <div className="mb-10 space-y-4 text-sm leading-relaxed text-[#c7b9a8]">
        <h2 className="font-serif-hebrew text-xl font-bold text-[#fbf8f2]">איך זה עובד</h2>
        <ul className="list-disc space-y-2 pr-5">
          <li>
            כל מוצר בקטלוג מציג מחיר ליחידה בודדת לצד מחיר מיוחד לכמות, ומעדכן את הסכום הכולל בזמן
            אמת בעמוד המוצר.
          </li>
          <li>ניתן לשלב מוצרים מהקטלוג הקיים עם פריטים בהתאמה אישית (לוגו, רקמה, הטבעה).</li>
          <li>
            להזמנות גדולות, מארזים מותאמים או ייעוץ אישי — נשמח לחזור אליכם דרך טופס יצירת הקשר או
            בטלפון.
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link
          href="/category"
          className="bg-gold-gradient-btn rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
        >
          עיינו בקטלוג המלא
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-[#c59b5f]/50 bg-[#1a130f] px-6 py-3 text-sm font-semibold text-[#eed3a2] transition hover:border-[#dfb37c] hover:text-white"
        >
          הזמנות סיטונאיות וייעוץ
        </Link>
      </div>
    </div>
  );
}
