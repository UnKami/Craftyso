"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";

export function ProductGallery({
  images,
  name,
  overlay,
}: {
  images: string[];
  name: string;
  overlay?: ReactNode;
}) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border-2 border-[#c59b5f]/50 bg-[#140e0b] shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_rgba(201,154,101,0.22)_0%,_transparent_70%)]" />

        {current ? (
          <Image
            key={current}
            src={current}
            alt={name}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#8a7b6b] text-base">
            אין תמונה זמינה
          </div>
        )}

        {overlay}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`זווית ${i + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                i === active
                  ? "border-[#eed3a2]"
                  : "border-[#2d2118] opacity-70 hover:opacity-100 hover:border-[#c59b5f]/60"
              }`}
            >
              <Image src={img} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
