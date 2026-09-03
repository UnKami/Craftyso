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

export type Product = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  categoryId: string;
  priceIls: number;
  images: string[];
  variants?: ProductVariant[];
  stock?: number;
  published: boolean;
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatus = "pending" | "paid" | "failed" | "fulfilled" | "cancelled";

export type OrderItem = {
  productId: string;
  variantId?: string;
  name: string;
  priceIls: number;
  quantity: number;
};

export type Order = {
  id: string;
  items: OrderItem[];
  totalIls: number;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress?: string;
  growTransactionId?: string;
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
