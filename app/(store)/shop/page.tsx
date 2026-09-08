import Link from "next/link";
import { PaginatedProductGrid } from "@/components/store/PaginatedProductGrid";
import { getPublishedProducts } from "@/lib/firebase/queries";

export const metadata = { title: "מוצרים מוכנים לכל אחד" };

export default async function ShopPage() {
  const products = await getPublishedProducts(200);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 border-b border-[#2d2118] pb-5">
        <span className="text-xs font-semibold tracking-wider text-[#c59b5f] uppercase">
          לרכישה מיידית
        </span>
        <h1 className="font-serif-hebrew text-3xl font-bold text-[#fbf8f2] md:text-4xl">
          מוצרים מוכנים לכל אחד
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#aa9c8d]">
          פריטים מהמדף, ללא צורך בעיצוב אישי או בכמות מינימלית — לחובבי יצירה, תפירה ביתית ומי
          שרוצה פשוט לרכוש פריט בודד. מחפשים משהו מותאם אישית?{" "}
          <Link href="/custom" className="text-[#eed3a2] hover:text-white hover:underline">
            עברו לסטודיו העיצוב האישי
          </Link>
          .
        </p>
      </div>

      {products.length > 0 ? (
        <PaginatedProductGrid products={products} />
      ) : (
        <div className="rounded-2xl border border-dashed border-[#382a20] bg-[#140e0b]/60 p-12 text-center text-sm text-[#aa9c8d]">
          עדיין לא הועלו מוצרים לקטלוג.
        </div>
      )}
    </div>
  );
}
