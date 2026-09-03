/**
 * Seeds a handful of real categories/products (captured directly from
 * craftyso.co.il) so the storefront isn't empty while the full catalog
 * migration (scripts/scrape-catalog.ts) is being run/tested.
 *
 * Requires FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY — see .env.example.
 * Run: node --env-file=.env.local --import tsx scripts/seed-sample.ts
 */
import { adminDb } from "../lib/firebase/admin";

const CATEGORIES = [
  { slug: "iron-on-patches", name: "פאצ'ים להדבקה", order: 0 },
  { slug: "lace-ribbon", name: "תחרה", order: 1 },
  { slug: "turbans", name: "כיסויי ראש וטורבנים", order: 2 },
];

const PRODUCTS = [
  {
    slug: "prach-vradim-rakum-1169",
    name: "פץ' פרח וורדים רקום",
    description: 'את הפץ\' ניתן לחבר בתפירה או בעזרת דבק טקסטיל על כל סוגי הבדים. גודל: 48 ס"מ אורך. ריקמה עדינה בצבעים: אדום וירוק',
    categoryId: "iron-on-patches",
    priceIls: 25,
    images: ["https://www.craftyso.co.il/f-users/user_104864/website_105462/images/thumbs/W_960_il_fullxfull1203888098_pzam.jpg"],
    sourceUrl: "https://www.craftyso.co.il/he/iron-on-patches/1169",
  },
  {
    slug: "boshem-rakum-payetim-zahav-1168",
    name: "פץ' בושם רקום פייטים בזהב",
    description: "לתפירה או הדבקה על כל סוגי הבדים.",
    categoryId: "iron-on-patches",
    priceIls: 18,
    images: ["https://www.craftyso.co.il/f-users/user_104864/website_105462/images/thumbs/220x220_il_fullxfull1203891182_4wy8.jpg"],
    sourceUrl: "https://www.craftyso.co.il/he/iron-on-patches/1168",
  },
];

async function run() {
  for (const c of CATEGORIES) {
    await adminDb.collection("categories").doc(c.slug).set(c, { merge: true });
    console.log(`category: ${c.name}`);
  }

  const now = new Date().toISOString();
  for (const p of PRODUCTS) {
    await adminDb.collection("products").doc(p.slug).set(
      { ...p, published: true, createdAt: now, updatedAt: now },
      { merge: true },
    );
    console.log(`product: ${p.name}`);
  }

  console.log("\nSeed complete.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
