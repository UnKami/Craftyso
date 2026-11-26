import type { MetadataRoute } from "next";
import { getCategories, getPublishedProducts } from "@/lib/firebase/queries";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://craftyso.co.il").replace(/\/+$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "",
    "/category",
    "/shop",
    "/custom",
    "/wholesale",
    "/about",
    "/shipping",
    "/contact",
    "/terms",
    "/privacy",
  ];

  const [categories, products] = await Promise.all([
    getCategories(),
    getPublishedProducts(500),
  ]);

  const now = new Date();

  return [
    ...staticPaths.map((p) => ({
      url: `${siteUrl}${p}`,
      lastModified: now,
      changeFrequency: (p === "" ? "daily" : "weekly") as "daily" | "weekly",
      priority: p === "" ? 1 : 0.7,
    })),
    ...categories.map((c) => ({
      url: `${siteUrl}/category/${encodeURIComponent(c.slug)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${siteUrl}/product/${encodeURIComponent(p.slug)}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
  ];
}
