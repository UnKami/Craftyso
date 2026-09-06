"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Corner = "top-right" | "top-left" | "bottom-right" | "bottom-left" | "center";

const TRANSLATE: Record<Corner, string> = {
  "top-right": "translate(22%, -22%)",
  "top-left": "translate(-22%, -22%)",
  "bottom-right": "translate(22%, 22%)",
  "bottom-left": "translate(-22%, 22%)",
  center: "translate(-50%, -50%)",
};

const POSITION_CLASS: Record<Corner, string> = {
  "top-right": "top-0 right-0",
  "top-left": "top-0 left-0",
  "bottom-right": "bottom-0 right-0",
  "bottom-left": "bottom-0 left-0",
  center: "top-1/2 left-1/2",
};

export function LogoWatermark({
  corner = "center",
  size = 420,
  opacity = 0.14,
}: {
  corner?: Corner;
  size?: number;
  opacity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute z-0 ${POSITION_CLASS[corner]} transition-[opacity,transform] duration-[1600ms] ease-out`}
      style={{
        width: size,
        height: size * (590 / 960),
        opacity: revealed ? opacity : 0,
        transform: `${TRANSLATE[corner]} scale(${revealed ? 1 : 0.9})`,
        filter: "drop-shadow(0 0 40px rgba(212,175,55,0.18))",
      }}
    >
      <div className="animate-watermark-float relative h-full w-full">
        <Image src="/logo/so-logo.png" alt="" fill sizes={`${size}px`} className="object-contain" />
      </div>
    </div>
  );
}
