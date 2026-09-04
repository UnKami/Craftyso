"use client";

import { useEffect, useRef } from "react";

type ParticleType = "dust" | "flake" | "sparkle";

interface CorkscrewParticle {
  progress: number;       // Vertical progress along screen (0.0 at top to 1.0 at bottom)
  speed: number;          // Downward flow velocity along Y axis
  phaseOffset: number;    // Phase offset along the corkscrew spiral
  radialSpread: number;   // Slight spread variation from the helix line
  baseSize: number;       // Visual scale
  type: ParticleType;
  color: string;
  rotation: number;
  rotationSpeed: number;
  aspectRatio: number;
  twinklePhase: number;
  twinkleSpeed: number;
  baseAlpha: number;
}

const GOLD_PALETTE = [
  "rgba(255, 235, 175, ", // Bright Leaf Gold
  "rgba(238, 211, 162, ", // Champagne Gold
  "rgba(224, 182, 85, ",  // Imperial Gold
  "rgba(201, 155, 95, ",  // Warm Bronze Gold
  "rgba(255, 248, 220, ", // Radiant Star Gold
];

export function GoldParticlesStream() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Balanced count: clearly visible and defined, yet calm and elegant
    const count = 56;
    const particles: CorkscrewParticle[] = [];

    // Scroll & Mouse reactive physics
    let lastScrollY = window.scrollY;
    let currentScrollY = window.scrollY;
    let scrollVelocity = 0;
    let targetScrollVelocity = 0;
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    // Narrow helix radius: hugs the 16px chain smoothly
    const baseHelixRadius = 14;

    function createParticle(initialProgress?: number): CorkscrewParticle {
      const typeRand = Math.random();
      let type: ParticleType = "dust";
      // Refined sizes with clear, distinct presence
      let baseSize = 0.9 + Math.random() * 0.8;

      if (typeRand > 0.72) {
        type = "flake";
        baseSize = 2.0 + Math.random() * 1.0; // Delicate gold leaf flakes
      } else if (typeRand > 0.55) {
        type = "sparkle";
        baseSize = 1.6 + Math.random() * 0.9; // Noticeable, graceful star glints
      }

      // Narrow, clean spread (tightly follows the helix with zero chaotic jitter)
      const radialSpread = (Math.random() - 0.5) * 3.5;
      const progress = initialProgress !== undefined ? initialProgress : Math.random();

      return {
        progress,
        speed: 0.0005 + Math.random() * 0.0007, // graceful, calm downward flow
        phaseOffset: (Math.random() - 0.5) * 0.25,
        radialSpread,
        baseSize,
        type,
        color: GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.018, // calm, slow rotation
        aspectRatio: 0.4 + Math.random() * 0.5,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.025 + Math.random() * 0.035, // soft, pleasant twinkling
        baseAlpha: 0.28 + Math.random() * 0.35, // clearly visible luminescence
      };
    }

    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }

    function onResize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function onScroll() {
      currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
      targetScrollVelocity = Math.max(-0.0015, Math.min(0.0015, delta * 0.00008));
    }

    function onMouseMove(e: MouseEvent) {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    }

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    let time = 0;

    function render() {
      time += 0.012; // tranquil, gentle time progression

      scrollVelocity += (targetScrollVelocity - scrollVelocity) * 0.15;
      targetScrollVelocity *= 0.8;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Chain anchor X on the right side
      const rightMargin = width < 640 ? 32 : width < 768 ? 48 : 60;
      const chainCenterX = width - rightMargin;

      const fov = 450;
      const centerX = width / 2;
      const centerY = height / 2;
      const mouseParallaxX = (mouseX - centerX) * 0.01;
      const mouseParallaxY = (mouseY - centerY) * 0.01;

      // Spiral revolutions
      const spiralRevolutions = 9;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Smooth downward progress
        p.progress += p.speed + scrollVelocity;
        if (p.progress > 1) p.progress -= 1;
        if (p.progress < 0) p.progress += 1;

        p.rotation += p.rotationSpeed;
        p.twinklePhase += p.twinkleSpeed;

        // --- GENTLE CORKSCREW HELIX EQUATIONS ---
        // Slower, graceful winding around the chain (time * 0.55 instead of fast spinning)
        const helixAngle =
          p.progress * (Math.PI * 2 * spiralRevolutions) + time * 0.55 + p.phaseOffset;
        const currentHelixRadius = baseHelixRadius + p.radialSpread;

        const px = chainCenterX + Math.cos(helixAngle) * currentHelixRadius;
        const pz = Math.sin(helixAngle) * currentHelixRadius;
        const py = -20 + p.progress * (height + 40);

        // Perspective 3D projection
        const scale = fov / (fov + pz);
        if (scale <= 0) continue;

        const screenX = centerX + (px - centerX) * scale - mouseParallaxX * scale;
        const screenY = centerY + (py - centerY) * scale - mouseParallaxY * scale;
        const size = Math.max(0.5, p.baseSize * scale);

        // Subtle depth alpha: in front (pz > 0) slightly clearer, back (pz < 0) dimmer
        const depthAlpha = 0.55 + (pz / currentHelixRadius) * 0.45;
        const edgeFade = Math.sin(p.progress * Math.PI); // fade at extreme top & bottom edges
        const twinkle = 0.8 + Math.sin(p.twinklePhase) * 0.2;

        const alpha = Math.min(1, p.baseAlpha * depthAlpha * edgeFade * twinkle);
        if (alpha <= 0.015) continue;

        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(p.rotation);

        if (p.type === "flake") {
          // Delicate rotating gold leaf flake
          ctx.fillStyle = `${p.color}${alpha})`;
          ctx.beginPath();
          const r = size * 1.2;
          ctx.ellipse(0, 0, r, r * p.aspectRatio, p.rotation, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "sparkle") {
          // Soft star sparkle
          ctx.fillStyle = `${p.color}${alpha})`;
          ctx.beginPath();
          const s = size * 1.8;
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.fill();
        } else {
          // Fine glowing stardust dot
          ctx.fillStyle = `${p.color}${alpha})`;
          ctx.beginPath();
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-35 h-full w-full opacity-80"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
