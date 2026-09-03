export const metadata = { title: "אודות" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="mb-6 text-2xl font-bold text-ink">אודות קראפטיסו</h1>
      <p className="leading-7 text-ink-muted">
        קראפטיסו הוא בוטיק אביזרי אופנה, סדקית ותפירה, המוביל בישראל, הפועל מרחוב לבינובסקי 9
        בתל אביב. אנו מציעים מבחר ענק של תחרה, סרטים, פאצ&apos;ים, אבזמים, כפתורים, גומיות
        וכל מה שצריך ליצירה ולתפירה — במחירים משתלמים ובזמינות גבוהה.
      </p>
    </div>
  );
}
