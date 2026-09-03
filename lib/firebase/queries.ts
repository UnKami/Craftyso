import "server-only";
import { adminDb } from "./admin";
import type { Category, Order, Product } from "@/lib/types";

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

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  return safe(async () => {
    const snap = await adminDb
      .collection("products")
      .where("categoryId", "==", categoryId)
      .where("published", "==", true)
      .get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Product);
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
