"use client";

import Image from "next/image";

interface TriptychHeroVisualProps {
  imageSrc?: string;
  alt?: string;
}

export function TriptychHeroVisual({
  imageSrc = "/images/hero/couture-triptych-model.jpg",
  alt = "דוגמנית קוטור עטורה בז'קט רקום ואביזרי תפירה יוקרתיים",
}: TriptychHeroVisualProps) {
  // Enhanced grand dimensions for commanding editorial presence:
  // Panel1 (155px) + Gap (16px) + Panel2 (220px) + Gap (16px) + Panel3 (155px) = 562px total span
  const totalWidth = 562;
  const totalHeight = 580;

  return (
    <div className="relative flex items-center justify-center select-none py-6 lg:py-8">
      {/* Ambient warm radial glow with subtle luminous pulse */}
      <div className="pointer-events-none absolute -inset-6 rounded-full bg-[radial-gradient(circle,_rgba(212,175,55,0.28)_0%,_rgba(197,155,95,0.12)_45%,_transparent_75%)] blur-3xl animate-pulse" />

      {/* Triptych Wrapper with responsive scale */}
      <div className="relative flex items-center justify-center gap-4 transform scale-[0.70] xs:scale-[0.80] sm:scale-[0.90] md:scale-95 lg:scale-100 xl:scale-105 transition-transform duration-500">
        
        {/* ============================================================ */}
        {/* PANEL 1: Left Frame (Height 460px, gentle organic floating) */}
        {/* ============================================================ */}
        <div className="animate-triptych-left relative h-[460px] w-[155px] shrink-0 overflow-hidden rounded-sm border border-[#c59b5f]/75 bg-[#0e0906] shadow-[0_12px_40px_rgba(0,0,0,0.9)] transition-all duration-500 hover:border-[#eed3a2]">
          {/* Continuous Sliced Image with slow Ken-Burns breathing */}
          <div
            className="animate-portrait-breathe absolute top-[-60px] left-0 pointer-events-none origin-center"
            style={{ width: `${totalWidth}px`, height: `${totalHeight}px` }}
          >
            <Image
              src={imageSrc}
              alt={alt}
              fill
              priority
              sizes="562px"
              className="object-cover object-center"
            />
          </div>

          {/* Animated Gold Sheen Sweep across left frame */}
          <div className="animate-gold-sheen pointer-events-none absolute inset-0 z-20 w-1/2 bg-gradient-to-r from-transparent via-[#fff5d0]/30 to-transparent" />

          {/* Subtle inner glass edge reflection */}
          <div className="pointer-events-none absolute inset-0 border border-white/5" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* ============================================================ */}
        {/* PANEL 2: Center Frame (Height 580px, TALL & COMMANDING)     */}
        {/* ============================================================ */}
        <div className="animate-triptych-center relative z-10 h-[580px] w-[220px] shrink-0 overflow-hidden rounded-sm border-2 border-[#eed3a2] bg-[#0e0906] shadow-[0_25px_65px_rgba(0,0,0,0.98),_0_0_35px_rgba(201,154,101,0.35)] transition-all duration-500 hover:border-[#fff0c8] hover:shadow-[0_30px_80px_rgba(0,0,0,1),_0_0_45px_rgba(238,211,162,0.5)]">
          
          {/* Continuous Sliced Image in Center */}
          <div
            className="animate-portrait-breathe absolute top-0 left-[-171px] pointer-events-none origin-center"
            style={{ width: `${totalWidth}px`, height: `${totalHeight}px` }}
          >
            <Image
              src={imageSrc}
              alt={alt}
              fill
              priority
              sizes="562px"
              className="object-cover object-center"
            />
          </div>

          {/* Animated Golden Light Sweep gliding across center frame */}
          <div
            className="animate-gold-sheen pointer-events-none absolute inset-0 z-20 w-1/2 bg-gradient-to-r from-transparent via-[#ffffff]/40 to-transparent"
            style={{ animationDelay: "1.2s" }}
          />

          {/* Couture Gold Corner Accent Brackets */}
          <div className="pointer-events-none absolute top-2 left-2 z-20 h-4 w-4 border-t-2 border-l-2 border-[#fff0c8] shadow-[0_0_8px_rgba(255,240,200,0.8)]" />
          <div className="pointer-events-none absolute top-2 right-2 z-20 h-4 w-4 border-t-2 border-r-2 border-[#fff0c8] shadow-[0_0_8px_rgba(255,240,200,0.8)]" />
          <div className="pointer-events-none absolute bottom-2 left-2 z-20 h-4 w-4 border-b-2 border-l-2 border-[#fff0c8] shadow-[0_0_8px_rgba(255,240,200,0.8)]" />
          <div className="pointer-events-none absolute bottom-2 right-2 z-20 h-4 w-4 border-b-2 border-r-2 border-[#fff0c8] shadow-[0_0_8px_rgba(255,240,200,0.8)]" />

          {/* Luminous top and bottom edge highlights */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#eed3a2]/20 via-transparent to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/65 to-transparent" />
          <div className="pointer-events-none absolute inset-0 border border-white/10" />
        </div>

        {/* ============================================================ */}
        {/* PANEL 3: Right Frame (Height 460px, counter-phase floating) */}
        {/* ============================================================ */}
        <div className="animate-triptych-right relative h-[460px] w-[155px] shrink-0 overflow-hidden rounded-sm border border-[#c59b5f]/75 bg-[#0e0906] shadow-[0_12px_40px_rgba(0,0,0,0.9)] transition-all duration-500 hover:border-[#eed3a2]">
          {/* Continuous Sliced Image with slow Ken-Burns breathing */}
          <div
            className="animate-portrait-breathe absolute top-[-60px] left-[-407px] pointer-events-none origin-center"
            style={{ width: `${totalWidth}px`, height: `${totalHeight}px` }}
          >
            <Image
              src={imageSrc}
              alt={alt}
              fill
              priority
              sizes="562px"
              className="object-cover object-center"
            />
          </div>

          {/* Animated Gold Sheen Sweep across right frame */}
          <div
            className="animate-gold-sheen pointer-events-none absolute inset-0 z-20 w-1/2 bg-gradient-to-r from-transparent via-[#fff5d0]/30 to-transparent"
            style={{ animationDelay: "2.4s" }}
          />

          {/* Subtle inner glass edge reflection */}
          <div className="pointer-events-none absolute inset-0 border border-white/5" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

      </div>
    </div>
  );
}
