"use client";

import { useState, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatIls } from "@/lib/format";
import { useCart } from "@/lib/cart-context";

export type CustomTemplateItem = {
  id: string;
  name: string;
  categoryName: string;
  basePrice: number;
  bulkPrice: number;
  bulkMinQty: number;
  templateImage: string;
  defaultTechnique: string;
  description: string;
};

type Props = {
  item: CustomTemplateItem | null;
  onClose: () => void;
};

export function CustomizerModal({ item, onClose }: Props) {
  const router = useRouter();
  const { addItem } = useCart();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);
  const [artworkName, setArtworkName] = useState<string>("");
  const [scale, setScale] = useState<number>(100);
  const [baseColor, setBaseColor] = useState<string>("שחור אלגנטי");
  const [technique, setTechnique] = useState<string>(item?.defaultTechnique ?? "רקמת קוטור ממוחשבת");
  const [widthCm, setWidthCm] = useState<number>(8);
  const [heightCm, setHeightCm] = useState<number>(8);
  const [quantity, setQuantity] = useState<number>(20);
  const [notes, setNotes] = useState<string>("");
  const [viewMode, setViewMode] = useState<"overlay" | "side-by-side">("overlay");
  const [added, setAdded] = useState(false);

  if (!item) return null;

  const isBulk = quantity >= item.bulkMinQty;
  const unitPrice = isBulk ? item.bulkPrice : item.basePrice;
  const totalPrice = unitPrice * quantity;
  const originalTotal = item.basePrice * quantity;
  const savings = Math.max(0, originalTotal - totalPrice);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setArtworkName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setArtworkUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleAddToCart() {
    if (!item) return;
    if (!artworkUrl) {
      alert("אנא העלו קובץ גרפי או לוגו לפני ההוספה לסל.");
      return;
    }

    addItem(
      {
        productId: `custom-${item.id}-${Date.now()}`,
        slug: item.id,
        name: `${item.name} (${artworkName || "עיצוב אישי"})`,
        priceIls: unitPrice,
        image: item.templateImage,
        customArtworkUrl: artworkUrl,
        customNotes: notes,
        customSpecs: {
          widthCm,
          heightCm,
          baseColor,
          technique,
        },
      },
      quantity
    );

    setAdded(true);
    setTimeout(() => {
      onClose();
      router.push("/cart");
    }, 800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-6 overflow-y-auto">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border-2 border-[#c59b5f]/60 bg-[#120c08] shadow-[0_25px_70px_rgba(0,0,0,0.9)] text-right">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#2d2118] bg-[#0c0805] px-6 py-4">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-[#c59b5f] uppercase">
              סטודיו ייצור והתאמה אישית • CUSTOM ATELIER
            </span>
            <h2 className="font-serif-hebrew text-xl font-bold text-[#fbf8f2] sm:text-2xl">
              {item.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-[#c59b5f]/30 p-2 text-sm text-[#aa9c8d] transition hover:border-[#dfb37c] hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Modal Body: Split Studio Layout */}
        <div className="grid flex-1 gap-6 overflow-y-auto p-4 sm:p-6 lg:grid-cols-12">
          {/* Visual Canvas Stage (Right side in RTL) */}
          <div className="flex flex-col gap-3 lg:col-span-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#eed3a2]">
                הדמיה חיה של הפריט עם הגרפיקה שלך:
              </span>
              <div className="flex rounded-lg border border-[#2d2118] bg-[#1a120c] p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("overlay")}
                  className={`rounded-md px-2.5 py-1 transition ${
                    viewMode === "overlay"
                      ? "bg-[#c59b5f] text-[#0c0907] font-bold"
                      : "text-[#aa9c8d] hover:text-white"
                  }`}
                >
                  הדמיה על המוצר
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("side-by-side")}
                  className={`rounded-md px-2.5 py-1 transition ${
                    viewMode === "side-by-side"
                      ? "bg-[#c59b5f] text-[#0c0907] font-bold"
                      : "text-[#aa9c8d] hover:text-white"
                  }`}
                >
                  צד לצד
                </button>
              </div>
            </div>

            {/* Live Canvas Viewport */}
            {viewMode === "overlay" ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[#c59b5f]/40 bg-[#18110c] shadow-inner">
                {/* Physical Product Blank Template */}
                <Image
                  src={item.templateImage}
                  alt={item.name}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />

                {/* Overlaid User Artwork Mockup */}
                {artworkUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      style={{
                        transform: `scale(${scale / 100})`,
                        transition: "transform 0.15s ease-out",
                      }}
                      className="relative max-h-[55%] max-w-[55%] drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={artworkUrl}
                        alt="גרפיקה בעיצוב אישי"
                        className="h-auto max-h-48 w-auto object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] p-6 text-center">
                    <span className="text-3xl mb-2">🎨</span>
                    <p className="text-sm font-semibold text-[#eed3a2]">
                      העלו לוגו או איור כדי לראות אותו מוטבע על גבי הפריט
                    </p>
                    <p className="mt-1 text-xs text-[#aa9c8d]">
                      תומך בקבצי PNG, JPG, SVG וקטורי
                    </p>
                  </div>
                )}

                {/* Base color badge tag */}
                <div className="absolute bottom-3 right-3 rounded-lg border border-[#c59b5f]/30 bg-[#0e0906]/85 px-2.5 py-1 text-[11px] text-[#eed3a2] backdrop-blur-sm">
                  צבע בסיס: {baseColor}
                </div>
              </div>
            ) : (
              /* Side-by-side view: Product Blank alongside uploaded artwork */
              <div className="grid aspect-square w-full grid-cols-2 gap-2 overflow-hidden rounded-2xl border border-[#c59b5f]/40 bg-[#18110c] p-2">
                <div className="relative h-full w-full overflow-hidden rounded-xl bg-[#0e0906]">
                  <Image
                    src={item.templateImage}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[10px] text-[#eed3a2]">
                    בסיס המוצר
                  </span>
                </div>
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#c59b5f]/40 bg-[#120c08] p-4">
                  {artworkUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={artworkUrl}
                      alt="הגרפיקה המקורית"
                      className="max-h-full max-w-full object-contain drop-shadow-md"
                    />
                  ) : (
                    <span className="text-xs text-[#8a7b6c] text-center">
                      טרם הועלה קובץ גרפי
                    </span>
                  )}
                  <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[10px] text-[#eed3a2]">
                    הקובץ למפעל
                  </span>
                </div>
              </div>
            )}

            {/* Artwork Scale Slider */}
            {artworkUrl && (
              <div className="flex items-center gap-3 rounded-xl border border-[#2d2118] bg-[#160f0b] p-3">
                <label className="text-xs text-[#aa9c8d] shrink-0">גודל יצירה:</label>
                <input
                  type="range"
                  min="40"
                  max="160"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="flex-1 accent-[#c59b5f]"
                />
                <span className="text-xs font-bold text-[#eed3a2] w-10 text-left">
                  {scale}%
                </span>
              </div>
            )}
          </div>

          {/* Controls & Manufacturing Specifications (Left side in RTL) */}
          <div className="flex flex-col gap-4 lg:col-span-6">
            {/* 1. Upload File Button */}
            <div className="rounded-xl border border-dashed border-[#c59b5f]/50 bg-[#16100c] p-4 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.svg,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full border border-[#c59b5f] bg-[#221710] px-5 py-2.5 text-xs font-bold text-[#eed3a2] transition hover:bg-[#c59b5f] hover:text-[#0c0907]"
              >
                <span>📁</span>
                <span>{artworkName ? "החלף קובץ גרפיקה" : "העלה לוגו או עיצוב משלך"}</span>
              </button>
              {artworkName && (
                <p className="mt-2 text-xs font-medium text-[#7fe09b]">
                  ✓ קובץ נטען: {artworkName}
                </p>
              )}
              <p className="mt-1 text-[11px] text-[#8a7b6c]">
                הקובץ יישמר ברזולוציה מלאה ויישלח ישירות למכונות המפעל
              </p>
            </div>

            {/* 2. Base Color & Technique Options */}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-xs text-[#aa9c8d]">
                <span>צבע בסיס / רקע:</span>
                <select
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="rounded-lg border border-[#2d2118] bg-[#18110c] px-2.5 py-2 text-xs text-[#fbf8f2] outline-none focus:border-[#c59b5f]"
                >
                  <option value="שחור אלגנטי">שחור אלגנטי</option>
                  <option value="זהב מטאלי">זהב מטאלי</option>
                  <option value="ברונזה עתיקה">ברונזה עתיקה</option>
                  <option value="כחול נייבי עמוק">כחול נייבי עמוק</option>
                  <option value="לבן שנהב">לבן שנהב</option>
                  <option value="בז' פשתן טבעי">בז&apos; פשתן טבעי</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs text-[#aa9c8d]">
                <span>טכניקת ייצור מבוקשת:</span>
                <select
                  value={technique}
                  onChange={(e) => setTechnique(e.target.value)}
                  className="rounded-lg border border-[#2d2118] bg-[#18110c] px-2.5 py-2 text-xs text-[#fbf8f2] outline-none focus:border-[#c59b5f]"
                >
                  <option value="רקמת קוטור ממוחשבת">רקמת קוטור ממוחשבת</option>
                  <option value="הטבעת מתכת בלחץ">הטבעת מתכת בלחץ</option>
                  <option value="אריגת דמשק צפופה">אריגת דמשק צפופה</option>
                  <option value="הדפסת משי איכותית">הדפסת משי איכותית</option>
                  <option value="חריטת לייזר מדויקת">חריטת לייזר מדויקת</option>
                </select>
              </label>
            </div>

            {/* 3. Sizing (Width & Height) */}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-xs text-[#aa9c8d]">
                <span>רוחב מבוקש (ס&quot;מ):</span>
                <input
                  type="number"
                  min="2"
                  max="40"
                  value={widthCm}
                  onChange={(e) => setWidthCm(Number(e.target.value))}
                  className="rounded-lg border border-[#2d2118] bg-[#18110c] px-2.5 py-2 text-xs text-[#fbf8f2] outline-none focus:border-[#c59b5f]"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs text-[#aa9c8d]">
                <span>גובה מבוקש (ס&quot;מ):</span>
                <input
                  type="number"
                  min="2"
                  max="40"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="rounded-lg border border-[#2d2118] bg-[#18110c] px-2.5 py-2 text-xs text-[#fbf8f2] outline-none focus:border-[#c59b5f]"
                />
              </label>
            </div>

            {/* 4. Quantity & Bulk Tier Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#aa9c8d]">כמות להזמנה:</span>
                <span className="text-[#eed3a2]">
                  {isBulk ? (
                    <span className="font-bold text-[#7fe09b]">
                      ✓ מחירון סיטונאי: {formatIls(unitPrice)} ליח&apos;
                    </span>
                  ) : (
                    <span>
                      הזמינו {item.bulkMinQty}+ יח&apos; לקבלת {formatIls(item.bulkPrice)} ליח&apos;
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-24 rounded-lg border border-[#2d2118] bg-[#18110c] p-2 text-center text-sm font-bold text-[#fbf8f2] outline-none focus:border-[#c59b5f]"
                />
                <div className="flex gap-1.5 overflow-x-auto text-xs">
                  {[10, 20, 50, 100, 200].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setQuantity(qty)}
                      className={`rounded-lg px-2.5 py-1.5 font-medium transition ${
                        quantity === qty
                          ? "bg-[#c59b5f] text-[#0c0907] font-bold"
                          : "border border-[#2d2118] bg-[#18110c] text-[#aa9c8d] hover:text-white"
                      }`}
                    >
                      {qty} {qty >= item.bulkMinQty ? "★" : ""}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Special Notes for Factory */}
            <label className="flex flex-col gap-1 text-xs text-[#aa9c8d]">
              <span>הערות מיוחדות לצוות הייצור במפעל (אופציונלי):</span>
              <textarea
                rows={2}
                placeholder="למשל: עובי חוט מסוים, צבע חוט רקע מדויק, תאריך יעד לאירוע..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-lg border border-[#2d2118] bg-[#18110c] p-2 text-xs text-[#fbf8f2] outline-none focus:border-[#c59b5f]"
              />
            </label>

            {/* Pricing Summary Box */}
            <div className="mt-auto flex items-center justify-between rounded-xl border border-[#2d2118] bg-[#160f0b] p-3.5">
              <div>
                <span className="block text-xs text-[#aa9c8d]">סה&quot;כ לפרויקט ייצור:</span>
                <span className="text-xl font-bold text-gold-gradient">
                  {formatIls(totalPrice)}
                </span>
                <span className="block text-[11px] text-[#aa9c8d]">
                  ({quantity} יח&apos; × {formatIls(unitPrice)})
                </span>
              </div>
              {savings > 0 && (
                <div className="rounded-lg bg-[#7fe09b]/15 px-3 py-1 text-xs font-bold text-[#7fe09b] border border-[#7fe09b]/30">
                  חיסכון כמות: {formatIls(savings)}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="bg-gold-gradient-btn flex-1 rounded-full py-3 text-sm font-bold text-white transition-all hover:brightness-110 shadow-lg"
              >
                {added ? "✓ נוסף לסל ההזמנות!" : "הזמן פריט זה בעיצוב אישי ←"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[#2d2118] px-5 py-3 text-xs font-medium text-[#aa9c8d] hover:text-white"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
