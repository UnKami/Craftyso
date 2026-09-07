"use client";

import { useEffect, useRef, useState } from "react";

const HERO_SCENES = [
  {
    video: "/videos/hero/turban-pink.mp4",
    poster: "/images/hero/triptych/turban-pink.jpg",
    alt: "טורבן משי בגוון פודרה, לובשת דוגמנית",
  },
  {
    video: "/videos/hero/patch-hearts.mp4",
    poster: "/images/hero/triptych/patch-hearts.jpg",
    alt: "פאץ' לב נצנצים מוצמד לג'קט ג'ינס",
  },
  {
    video: "/videos/hero/lace-embroidered.mp4",
    poster: "/images/hero/triptych/lace-embroidered.jpg",
    alt: "סרט תחרה רקום נתפר על קצה בד",
  },
  {
    video: "/videos/hero/buckle-gold-gems.mp4",
    poster: "/images/hero/triptych/buckle-gold-gems.jpg",
    alt: "אבזם זהב משובץ אבנים על חוט משיכה",
  },
];

// Enhanced grand dimensions for commanding editorial presence:
// Panel1 (155px) + Gap (16px) + Panel2 (220px) + Gap (16px) + Panel3 (155px) = 562px total span
const TOTAL_WIDTH = 562;
const TOTAL_HEIGHT = 580;

// All 4 clips share this native size (verified at export time).
const NATIVE_W = 1080;

// Native-pixel crop rects for the left/right panels, derived from the same
// object-cover math the original static triptych used to slice one 562x580
// virtual canvas into 3 windows (155/220/155 wide, gap 16, panel heights
// 460/580/460). Since left and right are drawn straight from the video via
// canvas (not CSS object-cover), the crop has to be computed in source
// pixels up front instead of left to the browser.
const SIDE_CROP = { sx: 0, sy: 233, sw: 298, sh: 884 }; // mirrored for the right panel
const SIDE_PANEL_W = 155;
const SIDE_PANEL_H = 460;

export function TriptychHeroVisual() {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const current = HERO_SCENES[index];

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  // All 4 clips stay mounted (preloaded) throughout — only the active one
  // plays. Advancing swaps which is visible/playing instead of tearing
  // down and re-fetching a video element every few seconds.
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === index) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [index]);

  // Mirror the currently-playing video's frames into the two side canvases,
  // cropped to their slice of the same virtual frame. This keeps all three
  // panels showing live motion from a single decode — the side panels are
  // pixel copies of the exact same frame the center is showing, so there is
  // no independent playback clock left to drift out of sync.
  useEffect(() => {
    const leftCanvas = leftCanvasRef.current;
    const rightCanvas = rightCanvasRef.current;
    const leftCtx = leftCanvas?.getContext("2d");
    const rightCtx = rightCanvas?.getContext("2d");
    if (!leftCanvas || !rightCanvas || !leftCtx || !rightCtx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    leftCanvas.width = SIDE_PANEL_W * dpr;
    leftCanvas.height = SIDE_PANEL_H * dpr;
    rightCanvas.width = SIDE_PANEL_W * dpr;
    rightCanvas.height = SIDE_PANEL_H * dpr;

    let cancelled = false;

    function draw() {
      if (cancelled) return;
      const video = videoRefs.current[indexRef.current];
      if (video && video.readyState >= 2 && leftCanvas && rightCanvas) {
        leftCtx!.drawImage(
          video,
          SIDE_CROP.sx,
          SIDE_CROP.sy,
          SIDE_CROP.sw,
          SIDE_CROP.sh,
          0,
          0,
          leftCanvas.width,
          leftCanvas.height
        );
        rightCtx!.drawImage(
          video,
          NATIVE_W - SIDE_CROP.sx - SIDE_CROP.sw,
          SIDE_CROP.sy,
          SIDE_CROP.sw,
          SIDE_CROP.sh,
          0,
          0,
          rightCanvas.width,
          rightCanvas.height
        );
      }
      requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleEnded() {
    setIndex((i) => (i + 1) % HERO_SCENES.length);
  }

  return (
    <div className="relative flex items-center justify-center select-none py-6 lg:py-8">
      {/* Ambient warm radial glow with subtle luminous pulse */}
      <div className="pointer-events-none absolute -inset-6 rounded-full bg-[radial-gradient(circle,_rgba(212,175,55,0.28)_0%,_rgba(197,155,95,0.12)_45%,_transparent_75%)] blur-3xl animate-pulse" />

      {/* Triptych Wrapper with responsive scale */}
      <div className="relative flex items-center justify-center gap-4 transform scale-[0.55] sm:scale-[0.80] md:scale-95 lg:scale-100 xl:scale-105 transition-transform duration-500">
        {/* ============================================================ */}
        {/* PANEL 1: Left Frame — live mirror of the center video's crop  */}
        {/* ============================================================ */}
        <div className="animate-triptych-left relative h-[460px] w-[155px] shrink-0 overflow-hidden rounded-sm border border-[#c59b5f]/75 bg-[#0e0906] shadow-[0_12px_40px_rgba(0,0,0,0.9)] transition-all duration-500 hover:border-[#eed3a2]">
          <canvas
            ref={leftCanvasRef}
            aria-hidden="true"
            className="animate-portrait-breathe absolute inset-0 h-full w-full"
          />

          {/* Animated Gold Sheen Sweep across left frame */}
          <div className="animate-gold-sheen pointer-events-none absolute inset-0 z-20 w-1/2 bg-gradient-to-r from-transparent via-[#fff5d0]/30 to-transparent" />

          {/* Subtle inner glass edge reflection */}
          <div className="pointer-events-none absolute inset-0 border border-white/5" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* ============================================================ */}
        {/* PANEL 2: Center Frame — 4 preloaded videos, crossfading       */}
        {/*          between them instead of remounting                  */}
        {/* ============================================================ */}
        <div className="animate-triptych-center relative z-10 h-[580px] w-[220px] shrink-0 overflow-hidden rounded-sm border-2 border-[#eed3a2] bg-[#0e0906] shadow-[0_25px_65px_rgba(0,0,0,0.98),_0_0_35px_rgba(201,154,101,0.35)] transition-all duration-500 hover:border-[#fff0c8] hover:shadow-[0_30px_80px_rgba(0,0,0,1),_0_0_45px_rgba(238,211,162,0.5)]">
          <div
            className="absolute top-0 left-[-171px] pointer-events-none origin-center"
            style={{ width: `${TOTAL_WIDTH}px`, height: `${TOTAL_HEIGHT}px` }}
          >
            {HERO_SCENES.map((s, i) => (
              <video
                key={s.video}
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                src={s.video}
                poster={s.poster}
                preload="auto"
                muted
                playsInline
                onEnded={i === index ? handleEnded : undefined}
                aria-label={i === index ? current.alt : undefined}
                aria-hidden={i === index ? undefined : "true"}
                className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
                  i === index ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
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

          {/* Sequence indicator dots */}
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
            {HERO_SCENES.map((s, i) => (
              <span
                key={s.video}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === index ? "w-4 bg-[#eed3a2]" : "w-1 bg-[#eed3a2]/35"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* PANEL 3: Right Frame — live mirror of the center video's crop */}
        {/* ============================================================ */}
        <div className="animate-triptych-right relative h-[460px] w-[155px] shrink-0 overflow-hidden rounded-sm border border-[#c59b5f]/75 bg-[#0e0906] shadow-[0_12px_40px_rgba(0,0,0,0.9)] transition-all duration-500 hover:border-[#eed3a2]">
          <canvas
            ref={rightCanvasRef}
            aria-hidden="true"
            className="animate-portrait-breathe absolute inset-0 h-full w-full"
          />

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
