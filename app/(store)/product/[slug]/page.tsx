import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getProductsByCategory } from "@/lib/firebase/queries";
import { formatIls } from "@/lib/format";
import { AddToCart } from "@/components/store/AddToCart";
import { ProductTabs } from "@/components/store/ProductTabs";
import { ProductCard } from "@/components/store/ProductCard";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const rawParams = await params;
  const decodedSlug = decodeURIComponent(rawParams.slug);
  const product =
    (await getProductBySlug(decodedSlug)) || (await getProductBySlug(rawParams.slug));
  if (!product) notFound();

  const relatedProducts = await getProductsByCategory(product.categoryId);
  const filteredRelated = relatedProducts.filter((p) => p.id !== product.id).slice(0, 4);

  const image = product.images[0];
  const minQty = product.wholesaleMinQty ?? 10;
  const wholesalePrice =
    typeof product.wholesalePriceIls === "number" && product.wholesalePriceIls > 0
      ? product.wholesalePriceIls
      : Math.max(1, Math.round(product.priceIls * 0.8 * 100) / 100);

  const discountPercent = Math.round(
    ((product.priceIls - wholesalePrice) / (product.priceIls || 1)) * 100
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-[#aa9c8d]">
        <Link href="/" className="hover:text-[#eed3a2] transition">
          דף הבית
        </Link>
        <span>/</span>
        <Link href="/category" className="hover:text-[#eed3a2] transition">
          קטלוג
        </Link>
        <span>/</span>
        <span className="text-[#eed3a2] line-clamp-1">{product.name}</span>
      </nav>

      {/* Main Spotlight Product Presentation Grid */}
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
        {/* Left Column (in RTL): Spotlight Image Stage */}
        <div className="lg:col-span-6">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border-2 border-[#c59b5f]/50 bg-[#140e0b] shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
            {/* Ambient gold spotlight radial halo */}
            <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_rgba(201,154,101,0.22)_0%,_transparent_70%)]" />

            {image ? (
              <Image
                src={image}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[#8a7b6b] text-base">
                אין תמונה זמינה
              </div>
            )}

            {/* Corner Couture Accent Badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <span className="rounded-full border border-[#c59b5f]/60 bg-[#120c08]/90 px-3 py-1 text-xs font-bold text-[#eed3a2] backdrop-blur-md shadow-md">
                ✦ איכות קוטור
              </span>
              <span className="rounded-full border border-[#7fe09b]/40 bg-[#120c08]/90 px-3 py-1 text-xs font-semibold text-[#7fe09b] backdrop-blur-md">
                ✓ זמין במלאי למשלוח מיידי
              </span>
            </div>

            {discountPercent > 0 && (
              <div className="absolute bottom-4 left-4 rounded-xl border border-[#c59b5f]/50 bg-[#1f1510]/95 px-3 py-1.5 text-xs font-bold text-gold-gradient backdrop-blur-md">
                מחירון כמויות: חיסכון של {discountPercent}%!
              </div>
            )}
          </div>
        </div>

        {/* Right Column (in RTL): Product Information & Volume Pricing Box */}
        <div className="flex flex-col gap-6 lg:col-span-6">
          <div>
            <span className="text-xs font-semibold tracking-wider text-[#c59b5f] uppercase">
              פריט בוטיק מובחר
            </span>
            <h1 className="font-serif-hebrew mt-1 text-2xl font-bold leading-snug text-[#fbf8f2] sm:text-3xl md:text-4xl">
              {product.name}
            </h1>
          </div>

          {/* Dual Volume Tier Pricing Box (Highlighted) */}
          <div className="rounded-2xl border-2 border-[#c59b5f]/40 bg-gradient-to-br from-[#1b130e] via-[#140e0b] to-[#110b08] p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#2d2118] pb-3.5">
              <div>
                <span className="text-xs text-[#aa9c8d] block">מחיר ליחידה בודדת:</span>
                <span className="text-2xl font-bold text-[#fbf8f2]">
                  {formatIls(product.priceIls)}
                </span>
              </div>

              <div className="text-left">
                <span className="text-xs text-[#eed3a2] block font-semibold">
                  מחיר מיוחד לכמות ({minQty}+ יח&apos;):
                </span>
                <span className="text-3xl font-bold text-gold-gradient">
                  {formatIls(wholesalePrice)}
                  <span className="text-sm font-normal text-[#aa9c8d]"> / יח&apos;</span>
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-[#c7b9a8]">
              <span>💡 חוסכים ברכישת כמויות למעצבים, יוצרים וחייטים!</span>
              {discountPercent > 0 && (
                <span className="font-bold text-[#7fe09b]">
                  חיסכון של {discountPercent}% ליחידה
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="text-sm leading-relaxed text-[#c7b9a8]">
              <p className="whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {/* Interactive AddToCart with Volume Tier Calculator */}
          <div className="pt-2">
            <AddToCart product={product} />
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 border-t border-[#2d2118] pt-4 text-center text-xs text-[#aa9c8d]">
            <div className="p-2 rounded-xl bg-[#140e0b] border border-[#2d2118]">
              <span className="block text-[#eed3a2] font-semibold mb-0.5">משלוח מהיר</span>
              <span>1-3 ימי עסקים</span>
            </div>
            <div className="p-2 rounded-xl bg-[#140e0b] border border-[#2d2118]">
              <span className="block text-[#eed3a2] font-semibold mb-0.5">איסוף עצמי</span>
              <span>תל אביב, לבינובסקי 9</span>
            </div>
            <div className="p-2 rounded-xl bg-[#140e0b] border border-[#2d2118]">
              <span className="block text-[#eed3a2] font-semibold mb-0.5">החלפות והחזרות</span>
              <span>עד 14 ימים</span>
            </div>
          </div>
        </div>
      </div>

      {/* Craftsmanship Application Tabs */}
      <ProductTabs description={product.description} />

      {/* Complementary & Related Items Grid */}
      {filteredRelated.length > 0 && (
        <section className="mt-20 border-t border-[#2d2118] pt-12">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold tracking-wider text-[#c59b5f] uppercase">
                השלימו את העיצוב
              </span>
              <h3 className="font-serif-hebrew text-2xl font-bold text-[#fbf8f2] sm:text-3xl">
                פריטים משלימים שמתאימים לפריט זה
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredRelated.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
