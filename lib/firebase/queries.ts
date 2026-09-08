import "server-only";
import { adminDb } from "./admin";
import type { Category, Order, Product, Review } from "@/lib/types";

// Firestore reads fail until FIREBASE_CLIENT_EMAIL/PRIVATE_KEY (or ADC) are
// configured. Swallow that here so pages render an empty state instead of
// crashing during initial setup, before the catalog has been migrated in.
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.warn("[firestore] read failed, returning fallback:", (err as Error).message);
    return fallback;
  }
}

export async function getCategories(): Promise<Category[]> {
  return safe(async () => {
    const snap = await adminDb.collection("categories").orderBy("order", "asc").get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Category);
  }, []);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return safe(async () => {
    const snap = await adminDb.collection("categories").where("slug", "==", slug).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0]!;
    return { id: doc.id, ...doc.data() } as Category;
  }, null);
}

export async function getPublishedProducts(limit = 12): Promise<Product[]> {
  return safe(async () => {
    const snap = await adminDb
      .collection("products")
      .where("published", "==", true)
      .limit(limit)
      .get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Product);
  }, []);
}

export async function getProductsByCategory(categoryId: string, limit?: number): Promise<Product[]> {
  return safe(async () => {
    let query = adminDb
      .collection("products")
      .where("categoryId", "==", categoryId)
      .where("published", "==", true) as FirebaseFirestore.Query;
    if (limit) query = query.limit(limit);
    const snap = await query.get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Product);
  }, []);
}

export async function searchProducts(query: string, limit = 60): Promise<Product[]> {
  return safe(async () => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const snap = await adminDb.collection("products").where("published", "==", true).get();
    return snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as Product)
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, limit);
  }, []);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return safe(async () => {
    const snap = await adminDb.collection("products").where("slug", "==", slug).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0]!;
    return { id: doc.id, ...doc.data() } as Product;
  }, null);
}

export async function getFeaturedProducts(excludeId: string, limit = 8): Promise<Product[]> {
  return safe(async () => {
    const snap = await adminDb
      .collection("products")
      .where("published", "==", true)
      .where("featured", "==", true)
      .limit(limit + 1)
      .get();
    return snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as Product)
      .filter((p) => p.id !== excludeId)
      .slice(0, limit);
  }, []);
}

export async function getReviewsForProduct(productId: string): Promise<Review[]> {
  return safe(async () => {
    const snap = await adminDb
      .collection("reviews")
      .where("productId", "==", productId)
      .where("published", "==", true)
      .get();
    return snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as Review)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, []);
}

export async function hasUserReviewedProduct(productId: string, uid: string): Promise<boolean> {
  return safe(async () => {
    const snap = await adminDb
      .collection("reviews")
      .where("productId", "==", productId)
      .where("authorUid", "==", uid)
      .limit(1)
      .get();
    return !snap.empty;
  }, false);
}

export async function getOrdersForUser(uid: string): Promise<Order[]> {
  return safe(async () => {
    const snap = await adminDb
      .collection("orders")
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Order);
  }, []);
}
