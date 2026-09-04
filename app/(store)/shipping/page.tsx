export const metadata = { title: "משלוחים והחזרות" };

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-8 border-b border-[#2d2118] pb-5">
        <span className="text-xs font-semibold tracking-wider text-[#c59b5f] uppercase">
          מדיניות הבוטיק
        </span>
        <h1 className="font-serif-hebrew text-3xl font-bold text-[#fbf8f2] md:text-4xl">
          משלוחים והחזרות
        </h1>
      </div>
      <div className="space-y-6 text-sm leading-relaxed text-[#c7b9a8]">
        <div className="rounded-xl border border-[#2d2118] bg-[#140e0b] p-6">
          <h3 className="font-serif-hebrew text-base font-bold text-[#eed3a2] mb-2">אפשרויות משלוח</h3>
          <ul className="list-disc pr-5 space-y-2">
            <li><strong>שליח עד הבית:</strong> 1-3 ימי עסקים לכל חלקי הארץ (חינם בהזמנות מעל ₪299).</li>
            <li><strong>איסוף עצמי מהבוטיק:</strong> רחוב לבינובסקי 9, תל אביב (קומת קרקע) – בתיאום מראש.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-[#2d2118] bg-[#140e0b] p-6">
          <h3 className="font-serif-hebrew text-base font-bold text-[#eed3a2] mb-2">החזרות והחלפות</h3>
          <p>
            ניתן להחזיר או להחליף פריטים שנרכשו באריזתם המקורית תוך 14 ימים מיום קבלת המשלוח, בהתאם לחוק הגנת הצרכן.
          </p>
        </div>
      </div>
    </div>
  );
}
