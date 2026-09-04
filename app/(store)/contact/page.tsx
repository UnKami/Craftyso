import { ContactForm } from "@/components/store/ContactForm";

export const metadata = { title: "צור קשר" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-8 border-b border-[#2d2118] pb-5">
        <span className="text-xs font-semibold tracking-wider text-[#c59b5f] uppercase">
          שירות לקוחות
        </span>
        <h1 className="font-serif-hebrew text-3xl font-bold text-[#fbf8f2] md:text-4xl">
          יצירת קשר
        </h1>
      </div>
      <div className="mb-8 space-y-2 rounded-xl border border-[#2d2118] bg-[#140e0b] p-5 text-sm text-[#aa9c8d]">
        <p className="font-medium text-[#f3ede2]">בוטיק SO — תל אביב</p>
        <p>רחוב לבינובסקי 9, תל אביב (קומת קרקע)</p>
        <a href="tel:035106888" className="inline-block font-semibold text-[#dfb37c] hover:text-white">
          טלפון: 03-5106888
        </a>
      </div>
      <ContactForm />
    </div>
  );
}
