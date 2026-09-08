import sharp from "sharp";

const SRC = "public/logo/so-logo.png";
const OUT_DIR = "public/logo";
const SPLIT_X = 472; // empirically found lowest-ink column between S and O

const meta = await sharp(SRC).metadata();
const { width, height } = meta;

async function extract(name, left, width_) {
  const buf = await sharp(SRC)
    .extract({ left, top: 0, width: width_, height })
    .trim({ threshold: 10 })
    .png()
    .toBuffer();
  const outPath = `${OUT_DIR}/${name}.png`;
  await sharp(buf).toFile(outPath);
  const m = await sharp(buf).metadata();
  console.log(name, "->", outPath, m.width, "x", m.height);
}

await extract("letter-s", 0, SPLIT_X);
await extract("letter-o", SPLIT_X, width - SPLIT_X);
