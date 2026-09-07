import "server-only";
import { adminDb } from "./admin";
import type { AdminUser, Campaign, ContentPage, Lead, Order, Product, Review, SocialPost } from "@/lib/types";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.warn("[firestore/admin] read failed, returning fallback:", (err as Error).message);
    return fallback;
  }
}

function withId<T>(doc: FirebaseFirestore.QueryDocumentSnapshot): T {
  return { id: doc.id, ...doc.data() } as T;
}

export async function listLeads(): Promise<Lead[]> {
  return safe(async () => {
    const snap = await adminDb.collection("leads").orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => withId<Lead>(d));
  }, []);
}

export async function listOrders(): Promise<Order[]> {
  return safe(async () => {
    const snap = await adminDb.collection("orders").orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => withId<Order>(d));
  }, []);
}

export async function listAllProducts(): Promise<Product[]> {
  return safe(async () => {
    const snap = await adminDb.collection("products").orderBy("updatedAt", "desc").get();
    return snap.docs.map((d) => withId<Product>(d));
  }, []);
}

export async function getProductById(id: string): Promise<Product | null> {
  return safe(async () => {
    const doc = await adminDb.collection("products").doc(id).get();
    if (!doc.exists) return null;
    return withId<Product>(doc as FirebaseFirestore.QueryDocumentSnapshot);
  }, null);
}

export async function listReviewsForProduct(productId: string): Promise<Review[]> {
  return safe(async () => {
    const snap = await adminDb.collection("reviews").where("productId", "==", productId).get();
    return snap.docs
      .map((d) => withId<Review>(d))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, []);
}

export async function listCampaigns(): Promise<Campaign[]> {
  return safe(async () => {
    const snap = await adminDb.collection("campaigns").orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => withId<Campaign>(d));
  }, []);
}

export async function listSocialPosts(): Promise<SocialPost[]> {
  return safe(async () => {
    const snap = await adminDb.collection("socialPosts").orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => withId<SocialPost>(d));
  }, []);
}

export async function listContentPages(): Promise<ContentPage[]> {
  return safe(async () => {
    const snap = await adminDb.collection("content").orderBy("updatedAt", "desc").limit(200).get();
    return snap.docs.map((d) => withId<ContentPage>(d));
  }, []);
}

export async function listAdmins(): Promise<AdminUser[]> {
  return safe(async () => {
    const snap = await adminDb.collection("users").get();
    return snap.docs.map((d) => d.data() as AdminUser);
  }, []);
}
