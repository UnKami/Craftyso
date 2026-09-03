import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { getCategories } from "@/lib/firebase/queries";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();

  return (
    <CartProvider>
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
    </CartProvider>
  );
}
