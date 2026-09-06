"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Corner = "top-right" | "top-left" | "bottom-right" | "bottom-left" | "center";

// Fully inset offsets — the emblem never straddles the section edge or gets clipped.
const POSITION_STYLE: Record<Corner, React.CSSProperties> = {
  "top-right": { top: "6%", right: "4%" },
  "top-left": { top: "6%", left: "4%" },
  "bottom-right": { bottom: "6%", right: "4%" },
  "bottom-left": { bottom: "6%", left: "4%" },
  center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
};

function useReveal() {
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

  return { ref, revealed };
}

/**
 * A low-opacity ambient logo emblem for behind a section's content.
 * Always fully inset within its container — never crosses the edge.
 */
export function LogoWatermark({
  corner = "center",
  size = 240,
  opacity = 0.07,
}: {
  corner?: Corner;
  size?: number;
  opacity?: number;
}) {
  const { ref, revealed } = useReveal();
  const isCenter = corner === "center";

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute z-0 transition-[opacity,transform] duration-[1600ms] ease-out"
      style={{
        width: size,
        height: size * (590 / 960),
        opacity: revealed ? opacity : 0,
        ...POSITION_STYLE[corner],
        transform: isCenter
          ? `translate(-50%, -50%) scale(${revealed ? 1 : 0.94})`
          : `scale(${revealed ? 1 : 0.94})`,
      }}
    >
      <div className="animate-watermark-float relative h-full w-full">
        <Image src="/logo/so-logo.png" alt="" fill sizes={`${size}px`} className="object-contain" />
      </div>
    </div>
  );
}

/**
 * A small, more visible logo mark that sits in normal document flow —
 * meant for the top edge of a section, like a couture seal or divider,
 * rather than an atmospheric background wash. Never clipped.
 */
export function LogoSeal({ opacity = 0.55, size = 64 }: { opacity?: number; size?: number }) {
  const { ref, revealed } = useReveal();

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="flex items-center justify-center gap-4 transition-[opacity,transform] duration-[1200ms] ease-out"
      style={{
        opacity: revealed ? opacity : 0,
        transform: `translateY(${revealed ? 0 : 8}px)`,
      }}
    >
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#c59b5f]/60 sm:w-20" />
      <div className="relative shrink-0" style={{ width: size, height: size * (590 / 960) }}>
        <Image src="/logo/so-logo.png" alt="SO" fill sizes={`${size}px`} className="object-contain" />
      </div>
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#c59b5f]/60 sm:w-20" />
    </div>
  );
}
