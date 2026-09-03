/**
 * One-off migration: scrapes the live Folyou-hosted craftyso.co.il catalog
 * (categories + products + images) and writes it into Firestore/Storage.
 *
 * Requires FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY (service account) to
 * be set — see .env.example. Run via:
 *
 *   npm run scrape:catalog                      # everything
 *   npm run scrape:catalog -- --category=iron-on-patches   # one category
 *   npm run scrape:catalog -- --dry-run          # parse only, no writes
 */
import * as cheerio from "cheerio";
import { adminDb, adminStorage } from "../lib/firebase/admin";

const SITE_ORIGIN = "https://www.craftyso.co.il";
const REQUEST_DELAY_MS = 200;

const CATEGORIES = [
  { slug: "masks", name: "מסכות", sourcePath: "/he/124" },
  { slug: "buckles", name: "אבזמים", sourcePath: "/he/אבזמים" },
  { slug: "fashion-accessories", name: "אביזרי אופנה", sourcePath: "/he/אביזרי-אופנה" },
  { slug: "sewing-accessories", name: "אביזרים לתפירה", sourcePath: "/he/תפירה" },
  { slug: "fabrics", name: "בדים", sourcePath: "/he/fabrics" },
  { slug: "elastic-ribbons", name: "גומי וסרטים נמתחים", sourcePath: "/he/סרטי-גומי" },
  { slug: "beach-hats", name: "כובעי חוף", sourcePath: "/he/hats" },
  { slug: "turbans", name: "כיסויי ראש וטורבנים", sourcePath: "/he/turbans" },
  { slug: "buttons", name: "כפתורים", sourcePath: "/he/כפתורים" },
  { slug: "necklaces", name: "ליביות", sourcePath: "/he/necklace" },
  { slug: "heat-transfer-studs", name: "ניטים להדבקה", sourcePath: "/he/ניטים" },
  { slug: "satin-ribbon", name: "סרטי סטן", sourcePath: "/he/סרטי-סטן" },
  { slug: "braided-ribbon", name: "סרטי צמה ודמוי עור", sourcePath: "/he/סרטי-צמה" },
  { slug: "crochet-ribbon", name: "סרטי קרושה", sourcePath: "/he/crochet-ribbon" },
  { slug: "lacing-cord-ribbon", name: "סרטי שרוך", sourcePath: "/he/סרטי-שרוך" },
  { slug: "ribbons", name: "סרטים", sourcePath: "/he/סרטים" },
  { slug: "iron-on-patches", name: "פאצ'ים להדבקה", sourcePath: "/he/iron-on-patches" },
  { slug: "chains", name: "שרשראות", sourcePath: "/he/chains" },
  { slug: "lace-ribbon", name: "תחרה", sourcePath: "/he/lace-ribbon" },
] as const;

type ScrapedProduct = {
  sourceId: string;
  sourceUrl: string;
  name: string;
  priceIls: number;
  description: string;
  thumbUrl: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugify(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, "-")
    .replace(/['"׳״]/g, "")
    .replace(/[^\p{L}\p{N}-]/gu, "");
}

async function fetchHtml(path: string): Promise<cheerio.CheerioAPI> {
  const url = path.startsWith("http") ? path : `${SITE_ORIGIN}${path}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; CraftysoMigration/1.0)" } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  const html = await res.text();
  return cheerio.load(html);
}

function parseCategoryListing($: cheerio.CheerioAPI): ScrapedProduct[] {
  const products: ScrapedProduct[] = [];

  $("li.element").each((_, el) => {
    const $el = $(el);
    const href = $el.find("a").first().attr("href") ?? "";
    const match = href.match(/\/(\d+)$/);
    if (!match) return;

    const name = $el.find("[itemprop=name]").first().text().trim();
    const priceAttr = $el.find("[itemprop=price]").first().attr("content");
    const priceIls = Number(priceAttr ?? $el.find("[itemprop=price]").first().text().replace(/[^\d.]/g, ""));
    const description = $el.find("meta[itemprop=description]").first().attr("content") ?? "";
    const thumbUrl = $el.find("img").first().attr("src") ?? "";

    if (!name || !href || name === "ללא שם") return;

    products.push({
      sourceId: match[1]!,
      sourceUrl: href,
      name,
      priceIls: Number.isFinite(priceIls) ? priceIls : 0,
      description,
      thumbUrl,
    });
  });

  return products;
}

async function fetchFullResImage(sourceUrl: string, fallback: string): Promise<string> {
  try {
    const $ = await fetchHtml(sourceUrl);
    const og = $('meta[property="og:image"]').attr("content");
    return og || fallback;
  } catch (err) {
    console.warn(`  ! failed to load product page for full-res image: ${(err as Error).message}`);
    return fallback;
  }
}

async function uploadImage(imageUrl: string, storagePath: string, dryRun: boolean): Promise<string | null> {
  if (!imageUrl || !/^https?:\/\//.test(imageUrl)) return null;
  if (dryRun) return imageUrl;

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") ?? "image/jpeg";

    const bucket = adminStorage.bucket();
    const file = bucket.file(storagePath);
    await file.save(buffer, { metadata: { contentType } });

    const bucketName = bucket.name;
    return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(storagePath)}?alt=media`;
  } catch (err) {
    console.warn(`  ! image upload failed: ${(err as Error).message}`);
    return null;
  }
}

async function run() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const onlyCategory = args.find((a) => a.startsWith("--category="))?.split("=")[1];

  const categories = onlyCategory ? CATEGORIES.filter((c) => c.slug === onlyCategory) : CATEGORIES;
  if (categories.length === 0) {
    console.error(`No category matches "${onlyCategory}"`);
    process.exit(1);
  }

  for (const [i, category] of categories.entries()) {
    console.log(`\n[${i + 1}/${categories.length}] Category: ${category.name} (${category.slug})`);

    if (!dryRun) {
      await adminDb.collection("categories").doc(category.slug).set({
        slug: category.slug,
        name: category.name,
        order: i,
      }, { merge: true });
    }

    const $ = await fetchHtml(category.sourcePath);
    const products = parseCategoryListing($);
    console.log(`  found ${products.length} products`);

    for (const p of products) {
      try {
        const productSlug = `${slugify(p.name)}-${p.sourceId}`;
        const fullResUrl = await fetchFullResImage(p.sourceUrl, p.thumbUrl);
        await sleep(REQUEST_DELAY_MS);

        const storagePath = `products/${category.slug}/${p.sourceId}.jpg`;
        const imageUrl = await uploadImage(fullResUrl, storagePath, dryRun);

        console.log(`  - ${p.name} (${p.priceIls}₪)${imageUrl ? "" : " [no image]"}`);

        if (!dryRun) {
          const now = new Date().toISOString();
          await adminDb.collection("products").doc(productSlug).set(
            {
              slug: productSlug,
              name: p.name,
              description: p.description,
              categoryId: category.slug,
              priceIls: p.priceIls,
              images: imageUrl ? [imageUrl] : [],
              published: true,
              sourceUrl: p.sourceUrl,
              createdAt: now,
              updatedAt: now,
            },
            { merge: true },
          );
        }
      } catch (err) {
        console.warn(`  ! skipped "${p.name}" after error: ${(err as Error).message}`);
      }

      await sleep(REQUEST_DELAY_MS);
    }
  }

  console.log(dryRun ? "\nDry run complete — nothing was written." : "\nMigration complete.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
