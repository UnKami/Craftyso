import { createCanvas } from "@napi-rs/canvas";
import { writeFile } from "node:fs/promises";

// Both charms are drawn as a single continuous stroke path, stroked twice —
// once thick in solid gold, once thinner with destination-out — to produce
// the same hollow gold "ribbon" look already used for the chain links in
// PersistentGoldChain.tsx. This guarantees each letter is one complete,
// closed shape (no leftover fragments from cropping the connected wordmark).

function goldGradient(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, "#fff5d0");
  g.addColorStop(0.22, "#eed3a2");
  g.addColorStop(0.55, "#d4af37");
  g.addColorStop(0.8, "#a97c2f");
  g.addColorStop(1, "#8a6423");
  return g;
}

function strokeHollow(ctx, drawPath, { outer = 26, inner = 12 } = {}) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 4;
  ctx.lineWidth = outer;
  ctx.beginPath();
  drawPath(ctx);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.lineWidth = inner;
  ctx.beginPath();
  drawPath(ctx);
  ctx.stroke();
  ctx.restore();

  // Thin specular highlight along the top edge of the ribbon
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  drawPath(ctx);
  ctx.stroke();
  ctx.restore();
}

// A solid bent-gold-wire look (no hollow punch-out) — reads far more clearly
// as a distinct charm against the chain's own thin hollow links than a
// second hollow ribbon does, since the two would otherwise blend together
// at small sizes.
function strokeSolid(ctx, drawPath, { width = 26 } = {}) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 5;
  ctx.lineWidth = width;
  ctx.beginPath();
  drawPath(ctx);
  ctx.stroke();
  ctx.restore();

  // Specular highlight running along one edge, like light catching bent wire
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = Math.max(2, width * 0.22);
  ctx.beginPath();
  drawPath(ctx);
  ctx.stroke();
  ctx.restore();
}

async function renderS() {
  const W = 200,
    H = 300;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Standard two-semicircle "S" construction: a top circle traced along its
  // right half (bulging right) meets a bottom circle traced along its left
  // half (bulging left) — the classic, reliable way to draw a monoline S.
  const cx = 100;
  const r = 45;
  const cy1 = 90; // top circle center
  const cy2 = cy1 + r * 2; // bottom circle center — tangent join, no kink

  const path = (c) => {
    // Top hook flourish (the hanging point), curling up and over into the
    // start of the S body at the top of circle 1.
    c.moveTo(138, 60);
    c.bezierCurveTo(138, 36, 118, 22, cx, cy1 - r);

    // Main S body: right half of the top circle, then left half of the
    // bottom circle — meeting tangentially at (cx, cy1 + r) = (cx, cy2 - r).
    c.arc(cx, cy1, r, -Math.PI / 2, Math.PI / 2, false);
    c.arc(cx, cy2, r, -Math.PI / 2, Math.PI / 2, true);

    // Bottom closing curl, mirroring the top hook.
    c.bezierCurveTo(cx - 18, cy2 + r + 14, cx - 38, cy2 + r + 8, cx - 34, cy2 + r - 10);
  };

  ctx.strokeStyle = goldGradient(ctx, 0, 0, W, H);
  strokeSolid(ctx, path, { width: 26 });

  const buf = canvas.toBuffer("image/png");
  await writeFile("public/logo/letter-s.png", buf);
  console.log("letter-s.png ->", W, "x", H);
}

async function renderO() {
  const W = 220,
    H = 300;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  const cx = W / 2;
  const cy = H / 2 + 6;
  const rx = 92;
  const ry = 132;

  const path = (c) => {
    c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  };

  ctx.strokeStyle = goldGradient(ctx, 0, 0, W, H);
  strokeHollow(ctx, path, { outer: 28, inner: 12 });

  const buf = canvas.toBuffer("image/png");
  await writeFile("public/logo/letter-o.png", buf);
  console.log("letter-o.png ->", W, "x", H);
}

await renderS();
await renderO();
