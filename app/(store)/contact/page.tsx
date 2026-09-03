import { ContactForm } from "@/components/store/ContactForm";

export const metadata = { title: "צור קשר" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="mb-6 text-2xl font-bold text-ink">צור קשר</h1>
      <div className="mb-8 space-y-1 text-ink-muted">
        <p>רחוב לבינובסקי 9, תל אביב (קומת קרקע)</p>
        <p>03-5106888</p>
      </div>
      <ContactForm />
    </div>
  );
}
