export const metadata = { title: "אודות" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-6 border-b border-[#2d2118] pb-4">
        <span className="text-xs font-semibold tracking-wider text-[#c59b5f] uppercase">
          הסיפור שלנו
        </span>
        <h1 className="font-serif-hebrew text-3xl font-bold text-[#fbf8f2] md:text-4xl">
          אודות SO בוטיק
        </h1>
      </div>
      <div className="space-y-4 text-base leading-relaxed text-[#c7b9a8]">
        <p>
          SO הוא בוטיק אביזרי אופנה, סדקית ותפירה עילית המוביל בישראל, הפועל מרחוב לבינובסקי 9
          בתל אביב. אנו מציעים מבחר עשיר וייחודי של תחרה, סרטים, פאצ&apos;ים מעוצבים, אבזמי ברונזה, כפתורי קוטור,
          וכל מה שמעצבי אופנה, חייטים ויוצרים צריכים במקום אחד.
        </p>
        <p>
          אנו שמים דגש על איכות חומרי גלם בלתי מתפשרת, שירות אישי ומסור לכל לקוח ומשלוח מהיר ומדויק לכל רחבי הארץ.
        </p>
      </div>
    </div>
  );
}
