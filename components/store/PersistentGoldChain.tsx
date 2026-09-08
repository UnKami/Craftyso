"use client";

import { useEffect, useRef } from "react";

type Charm = {
  img: HTMLImageElement;
  loaded: boolean;
  // Pivot point as a fraction of the image's own width/height — the point
  // that stays fixed under rotation (the S's hook loop, the O's ring top).
  pivotFracX: number;
  pivotFracY: number;
  naturalAspect: number; // height / width, filled in once the image loads
  widthFrac: number; // target on-screen width as a fraction of the chain column's width
  screenYFrac: number; // fixed position down the viewport, independent of scroll/chain loop
  phase: number; // offsets the idle sway so multiple charms don't move in lockstep
  angle: number;
  angularVelocity: number;
  dropStart: number | null; // performance.now() timestamp, set on first frame
};

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function PersistentGoldChain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.clientWidth || 90);
    let height = (canvas.height = window.innerHeight);

    // Link dimensions
    const linkW = 16;
    const linkH = 32;
    const pitch = 22; // distance between link centers (links overlap & interlock)
    const cycle = pitch * 2; // two alternating links per full cycle

    let currentScrollY = window.scrollY;
    let smoothScrollY = window.scrollY;

    // --- Hanging letter charms: standalone "S"/"O" glyphs (see
    // scripts/draw_letter_charms.mjs), styled to match the logo's gold
    // ribbon look — drawn as complete closed shapes rather than cropped out
    // of the connected wordmark, which left visible leftover connector
    // fragments and an unnaturally chopped edge. Sized deliberately larger
    // than the chain's own links so each charm reads as a distinct letter
    // instead of blending into the chain's own hollow-link texture.
    const charms: Charm[] = [
      {
        img: new Image(),
        loaded: false,
        pivotFracX: 0.575,
        pivotFracY: 0.073,
        naturalAspect: 300 / 200,
        widthFrac: 0.72,
        screenYFrac: 0.52,
        phase: 0,
        angle: reducedMotion ? 0 : -0.32,
        angularVelocity: 0,
        dropStart: null,
      },
      {
        img: new Image(),
        loaded: false,
        pivotFracX: 0.455,
        pivotFracY: 0.04,
        naturalAspect: 300 / 220,
        widthFrac: 0.66,
        screenYFrac: 0.74,
        phase: 2.1,
        angle: reducedMotion ? 0 : 0.26,
        angularVelocity: 0,
        dropStart: null,
      },
    ];
    charms[0].img.src = "/logo/letter-s.png";
    charms[1].img.src = "/logo/letter-o.png";
    charms.forEach((c) => {
      c.img.onload = () => {
        c.naturalAspect = c.img.naturalHeight / c.img.naturalWidth;
        c.loaded = true;
      };
    });

    function onResize() {
      if (!canvas) return;
      width = canvas.width = canvas.clientWidth || 90;
      height = canvas.height = window.innerHeight;
    }

    function onScroll() {
      currentScrollY = window.scrollY;
    }

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    let time = 0;
    const dt = 1 / 60;

    function drawCharm(charm: Charm, xOffset: number, now: number) {
      if (!charm.loaded) return;
      if (charm.dropStart === null) charm.dropStart = now;

      const dropElapsed = (now - charm.dropStart) / 900;
      const dropT = Math.min(1, Math.max(0, dropElapsed));
      const eased = reducedMotion ? 1 : easeOutBack(dropT);

      if (!reducedMotion) {
        // Idle pendulum sway + scroll-reactive kick, spring-damped back to rest.
        const idleTarget = Math.sin(time * 0.6 + charm.phase) * 0.035;
        const scrollDiff = currentScrollY - smoothScrollY;
        const kick = Math.max(-0.5, Math.min(0.5, scrollDiff * 0.006));
        const springK = 9;
        const damping = 3.4;
        const angularAccel = (idleTarget + kick - charm.angle) * springK - charm.angularVelocity * damping;
        charm.angularVelocity += angularAccel * dt;
        charm.angle += charm.angularVelocity * dt;
      }

      const renderW = width * charm.widthFrac;
      const renderH = renderW * charm.naturalAspect;
      const pivotX = charm.pivotFracX * renderW;
      const pivotY = charm.pivotFracY * renderH;

      const restY = height * charm.screenYFrac;
      const dropOffsetY = (1 - eased) * -70;
      const y = restY + dropOffsetY;

      ctx!.save();
      ctx!.translate(xOffset, y);
      ctx!.rotate(charm.angle * eased);

      ctx!.shadowColor = "rgba(0, 0, 0, 0.55)";
      ctx!.shadowBlur = 5;
      ctx!.shadowOffsetX = 1.5;
      ctx!.shadowOffsetY = 2.5;
      ctx!.drawImage(charm.img, -pivotX, -pivotY, renderW, renderH);
      ctx!.restore();
    }

    function render() {
      time += 0.02;

      // Intelligent scroll matching: caps backlog to ~1 link so it never keeps spinning after user stops scrolling!
      let diff = currentScrollY - smoothScrollY;
      if (Math.abs(diff) > 36) {
        smoothScrollY = currentScrollY - Math.sign(diff) * 36;
        diff = currentScrollY - smoothScrollY;
      }
      smoothScrollY += diff * 0.28;

      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Seamless downward pull offset: perfectly strictly vertical, 0 side sway!
      const pullOffset = ((smoothScrollY % cycle) + cycle) % cycle;

      const anchorX = width / 2;

      ctx.save();
      // Centered strictly along vertical track with zero tilt/sway
      ctx.translate(anchorX, 0);

      // Number of links needed to fill screen from top to beyond bottom
      const totalLinks = Math.ceil(height / pitch) + 5;
      const startLinkIndex = -2;

      for (let i = startLinkIndex; i < totalLinks; i++) {
        const y = i * pitch + pullOffset;
        const isFacingFront = Math.abs(i) % 2 === 0;

        ctx.save();
        ctx.translate(0, y);

        // Subtle specular shimmer along the chain
        const shimmer = 0.85 + Math.sin(time * 2.5 + i * 0.4) * 0.15;

        if (isFacingFront) {
          // --- FRONT-FACING OVAL CURB LINK ---
          // 1. Soft drop shadow behind the link
          ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 3;

          // 2. Outer Link Body
          const grad = ctx.createLinearGradient(-linkW / 2, -linkH / 2, linkW / 2, linkH / 2);
          grad.addColorStop(0, "#ffeab0");  // Highlight gleam
          grad.addColorStop(0.25, "#d4af37"); // Pure Imperial Gold
          grad.addColorStop(0.65, "#8a6423"); // Shadow bronze
          grad.addColorStop(1, "#eed3a2");  // Reflected rim light

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.ellipse(0, 0, linkW / 2, linkH / 2, 0, 0, Math.PI * 2);
          ctx.fill();

          // 3. Inner Hole Cutout (gives true hollow interlocking link)
          ctx.shadowColor = "transparent";
          ctx.globalCompositeOperation = "destination-out";
          ctx.beginPath();
          ctx.ellipse(0, 0, linkW / 2 - 3.2, linkH / 2 - 3.8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalCompositeOperation = "source-over";

          // 4. Specular gleam arc on upper curve
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 * shimmer})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(0, -linkH / 3.8, linkW / 3.2, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();
        } else {
          // --- SIDE-PROFILE INTERLOCKING LINK (Rotated 90° into depth) ---
          ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 2;

          const sideW = 6.5;
          const sideH = linkH * 0.92;
          const sideGrad = ctx.createLinearGradient(-sideW / 2, 0, sideW / 2, 0);
          sideGrad.addColorStop(0, "#8a6423");  // Edge shadow
          sideGrad.addColorStop(0.35, "#fff0c0"); // Central specular line
          sideGrad.addColorStop(0.7, "#d4af37");  // Body gold
          sideGrad.addColorStop(1, "#6b4916");  // Deep shadow

          ctx.fillStyle = sideGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, sideW / 2, sideH / 2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Specular glint line
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * shimmer})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(0, -sideH / 2.8);
          ctx.lineTo(0, sideH / 2.8);
          ctx.stroke();
        }

        ctx.restore();
      }

      ctx.restore();

      // Hanging charms drawn on top, in their own fixed-position (non-looping)
      // coordinate space so they read as pendants dangling at a constant spot
      // on the chain rather than scrolling away with the infinite link loop.
      const now = performance.now();
      ctx.save();
      ctx.translate(anchorX, 0);
      for (const charm of charms) drawCharm(charm, 0, now);
      ctx.restore();

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 right-2 sm:right-4 md:right-7 z-30 flex w-12 sm:w-16 items-center justify-center opacity-90 transition-opacity duration-300 hover:opacity-100"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
