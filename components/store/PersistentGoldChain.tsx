"use client";

import { useEffect, useRef } from "react";

export function PersistentGoldChain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
