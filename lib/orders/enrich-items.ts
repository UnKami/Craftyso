import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import type { Order, OrderItem, Product } from "@/lib/types";

const KNOWN_ITEM_IMAGES: Record<string, string> = {
  "custom-patch": "/images/custom/custom-patch-blank.jpg",
  "custom-button": "/images/custom/custom-button-blank.jpg",
  "custom-label": "/images/custom/custom-label-blank.jpg",
  "custom-ribbon": "/images/craftsmanship/lace-stitching.jpg",
  "offer-1": "/images/categories/sewing-accessories.jpg",
  "offer-2": "/images/craftsmanship/button-sewing.jpg",
  "offer-3": "/images/categories/buckles.jpg",
  "offer-4": "/images/craftsmanship/patch-application.jpg",
  "offer-5": "/images/custom/custom-button-blank.jpg",
  "offer-6": "/images/custom/custom-label-blank.jpg",
  "offer-7": "/images/categories/fabrics-tools.jpg",
  "offer-8": "/images/craftsmanship/shears-cutting.jpg",
};

function resolveKnownImage(item: OrderItem): string | undefined {
  if (item.image) return item.image;
  if (item.slug && KNOWN_ITEM_IMAGES[item.slug]) return KNOWN_ITEM_IMAGES[item.slug];
  if (KNOWN_ITEM_IMAGES[item.productId]) return KNOWN_ITEM_IMAGES[item.productId];

  for (const [key, img] of Object.entries(KNOWN_ITEM_IMAGES)) {
    if (item.productId.includes(key)) return img;
  }

  // Fallback heuristic by Hebrew item name for older custom orders
  const n = item.name || "";
  if (n.includes("תוויות")) return "/images/custom/custom-label-blank.jpg";
  if (n.includes("פאץ")) return "/images/custom/custom-patch-blank.jpg";
  if (n.includes("כפתור")) return "/images/custom/custom-button-blank.jpg";
  if (n.includes("סרט")) return "/images/craftsmanship/lace-stitching.jpg";

  return undefined;
}

/**
 * Ensures every OrderItem on a list of orders has its requested product/blank
 * `image` populated — even for historical orders placed before `image` was
 * stored directly on the order line.
 */
export async function enrichOrdersWithItemImages(orders: Order[]): Promise<Order[]> {
  const missingProductIds = new Set<string>();

  for (const order of orders) {
    for (const item of order.items) {
      if (!resolveKnownImage(item) && item.productId && !item.productId.startsWith("custom-")) {
        missingProductIds.add(item.productId);
      }
    }
  }

  const productImages = new Map<string, string>();
  if (missingProductIds.size > 0) {
    const refs = Array.from(missingProductIds).map((id) =>
      adminDb.collection("products").doc(id),
    );
    try {
      const snaps = await adminDb.getAll(...refs);
      for (const snap of snaps) {
        if (snap.exists) {
          const data = snap.data() as Product;
          if (data.images?.[0]) productImages.set(snap.id, data.images[0]);
        }
      }
    } catch (err) {
      console.warn("[orders/enrich] Failed to batch fetch product images:", err);
    }
  }

  return orders.map((order) => ({
    ...order,
    items: order.items.map((item) => {
      const image = resolveKnownImage(item) ?? productImages.get(item.productId);
      return image ? { ...item, image } : item;
    }),
  }));
}
