import { CustomProductsSection } from "@/components/store/CustomProductsSection";

export const metadata = { title: "עיצוב אישי" };

export default function CustomPage() {
  return (
    <div className="py-6">
      <CustomProductsSection />
    </div>
  );
}
