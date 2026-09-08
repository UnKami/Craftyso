export type Category = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null;
  order: number;
};

export type ProductVariant = {
  id: string;
  label: string;
  priceIls: number;
  sku?: string;
  stock?: number;
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  categoryId: string;
  priceIls: number;
  wholesalePriceIls?: number;
  wholesaleMinQty?: number;
  images: string[];
  specs?: ProductSpec[];
  shippingNote?: string;
  featured?: boolean;
  variants?: ProductVariant[];
  stock?: number;
  published: boolean;
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type Review = {
  id: string;
  productId: string;
  authorUid?: string;
  authorName: string;
  rating: number;
  title?: string;
  body: string;
  verifiedPurchase?: boolean;
  published: boolean;
  createdAt: string;
};

export type OrderStatus = "pending" | "paid" | "failed" | "fulfilled" | "cancelled";

export type ProductionStatus =
  | "pending_production"
  | "in_production"
  | "quality_check"
  | "ready_to_ship"
  | "shipped";

export type OrderItem = {
  productId: string;
  variantId?: string;
  name: string;
  priceIls: number;
  quantity: number;
  customArtworkUrl?: string;
  customNotes?: string;
  customSpecs?: {
    widthCm?: number;
    heightCm?: number;
    baseColor?: string;
    technique?: string;
  };
};

export type Order = {
  id: string;
  userId?: string;
  items: OrderItem[];
  totalIls: number;
  status: OrderStatus;
  productionStatus?: ProductionStatus;
  factoryNotes?: string;
  trackingNumber?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress?: string;
  growTransactionId?: string;
  createdAt: string;
  updatedAt: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  stockQty: number;
  minAlertQty: number;
  unit: string;
  costPriceIls: number;
  supplierName?: string;
  supplierPhone?: string;
  lastRestockedAt?: string;
  updatedAt: string;
};

export type RestockOrder = {
  id: string;
  inventoryItemId: string;
  itemName: string;
  quantity: number;
  supplierName: string;
  status: "ordered" | "received" | "cancelled";
  estimatedArrival?: string;
  costIls: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

export type Lead = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  source: "newsletter" | "contact_form" | "manual" | "other";
  status: LeadStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type CampaignChannel = "google_ads" | "meta_ads" | "email" | "social" | "other";

export type Campaign = {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: "planned" | "active" | "paused" | "completed";
  budgetIls?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type ContentPage = {
  id: string;
  slug: string;
  title: string;
  body: string;
  type: "page" | "blog_post";
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SocialPlatform = "facebook" | "instagram" | "tiktok" | "other";

export type SocialPost = {
  id: string;
  platform: SocialPlatform;
  caption: string;
  imageUrl?: string;
  scheduledFor?: string;
  status: "draft" | "scheduled" | "posted";
  createdAt: string;
  updatedAt: string;
};

export type AdminRole = "owner" | "editor";

export type AdminUser = {
  uid: string;
  email: string;
  role: AdminRole;
};
