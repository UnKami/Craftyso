"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ReelScene {
  id: string;
  tag: string;
  badge: string;
  title: string;
  description: string;
  image: string;
}

const SCENES: ReelScene[] = [
  {
    id: "scene-1",
    tag: "01 / 04",
    badge: "קולקציית קוטור 2026",
    title: "דוגמנית עטורה באביזרי יוקרה",
    description: "ז'קט קטיפה עם פאצ'ים מוזהבים, כפתורי פליז וסיכות וינטג' בעיצוב אישי.",
    image: "/images/hero/model-accessories.jpg",
  },
  {
    id: "scene-2",
    tag: "02 / 04",
    badge: "מלאכת חייטות עילית",
    title: "תפירת כפתורי פליז בחוטי זהב",
    description: "דיוק ידני קפדני של תפירת כפתור מוטבע על גבי צמר וטוויד עשיר.",
    image: "/images/craftsmanship/button-sewing.jpg",
  },
  {
    id: "scene-3",
    tag: "03 / 04",
    badge: "התאמה אישית בקיטור",
    title: "גיהוץ פאץ' רקום על גבי דנים",
    description: "שילוב רקמת חוטי זהב צפופה שהופכת כל פריט בסיס ליצירת אמנות ייחודית.",
    image: "/images/craftsmanship/patch-application.jpg",
  },
  {
    id: "scene-4",
    tag: "04 / 04",
    badge: "שזירת תחרות ומשי",
    title: "חיבור עדין של תחרה וסרטים",
    description: "תפירת סרטי סאטן ושזירת פנינים לבגדי ערב ואריזות בוטיק יוקרתיות.",
    image: "/images/craftsmanship/lace-stitching.jpg",
  },
];

export function CinematicHeroReel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SCENES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="relative h-full min-h-[500px] w-full overflow-hidden select-none lg:min-h-[640px]">
      {/* Background Visual Layers with Ken-Burns crossfading */}
      {SCENES.map((scene, idx) => {
        const isActive = idx === activeIndex;
        return (
          <div
            key={scene.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Cinematic Image with Slow Zoom */}
            <div
              className={`relative h-full w-full transform transition-transform duration-[4800ms] ease-out ${
                isActive ? "scale-105" : "scale-100"
              }`}
            >
              <Image
                src={scene.image}
                alt={scene.title}
                fill
                priority={idx === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-center"
              />
            </div>

            {/* Subtle Vignette on image itself */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0906] via-transparent to-[#0e0906]/30 opacity-70" />
          </div>
        );
      })}

      {/* --- SEAMLESS MULTI-DIRECTIONAL FADE GRADIENTS --- */}
      {/* 1. Organic edge feathering into the RIGHT side typography (in RTL: toward the right column) */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-40 sm:w-60 bg-gradient-to-l from-[#120c08] via-[#120c08]/85 to-transparent hidden lg:block" />

      {/* 2. Top fade under header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-gradient-to-b from-[#120c08] via-[#120c08]/60 to-transparent" />

      {/* 3. Bottom fade connecting to the rolling deals banner */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-36 bg-gradient-to-t from-[#120c08] via-[#120c08]/75 to-transparent" />

      {/* 4. Far left vignette */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-[#120c08]/60 to-transparent hidden sm:block" />

      {/* Ambient warm golden glow behind scene caption */}
      <div className="pointer-events-none absolute bottom-8 left-8 z-25 h-64 w-80 rounded-full bg-[#c59b5f]/15 blur-3xl" />

      {/* Active Scene Overlay Information & Controls (Floating in lower left) */}
      <div className="absolute bottom-6 left-4 right-4 z-30 flex flex-col gap-3 sm:bottom-10 sm:left-8 sm:right-auto sm:max-w-md">
        {/* Badge & Live indicator */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#eed3a2]/40 bg-[#0c0806]/85 px-3 py-1 text-[11px] font-bold text-[#eed3a2] backdrop-blur-md shadow-lg">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37] animate-ping" />
            <span>{SCENES[activeIndex].badge}</span>
          </span>

          <span className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-mono text-[#aa9c8d] backdrop-blur-sm border border-[#2d2118]">
            {SCENES[activeIndex].tag}
          </span>
        </div>

        {/* Scene Title & Micro-story */}
        <div className="rounded-2xl border border-[#c59b5f]/30 bg-[#0e0906]/85 p-4 backdrop-blur-md shadow-2xl">
          <h3 className="font-serif-hebrew text-lg font-bold text-[#fbf8f2] sm:text-xl">
            {SCENES[activeIndex].title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[#c7b9a8]">
            {SCENES[activeIndex].description}
          </p>

          {/* Interactive Scene Switcher Progress Bars */}
          <div className="mt-3.5 flex items-center gap-2">
            {SCENES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActiveIndex(idx);
                  setIsPlaying(false);
                }}
                className="group relative flex-1 py-1.5 text-right focus:outline-none"
                aria-label={`עבור לתמונה ${idx + 1}`}
              >
                {/* Background track */}
                <div className="h-1 w-full overflow-hidden rounded-full bg-[#2a1d14]">
                  {/* Active Animated Fill */}
                  <div
                    className={`h-full bg-gradient-to-r from-[#eed3a2] to-[#c59b5f] transition-all duration-300 ${
                      idx === activeIndex
                        ? "w-full shadow-[0_0_8px_rgba(238,211,162,0.8)]"
                        : "w-0 opacity-40 group-hover:w-full"
                    }`}
                  />
                </div>
              </button>
            ))}

            {/* Play / Pause Toggle */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="mr-1 rounded-full border border-[#c59b5f]/40 bg-[#1a120c] p-1.5 text-[10px] text-[#eed3a2] transition hover:bg-[#c59b5f] hover:text-[#0c0907]"
              title={isPlaying ? "השהה סרטון" : "הפעל סרטון"}
            >
              {isPlaying ? "❚❚" : "▶"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
