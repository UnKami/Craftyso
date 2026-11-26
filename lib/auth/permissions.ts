import type { AdminTabId, AdminUser } from "@/lib/types";

export type AdminNavItem = {
  id: AdminTabId;
  href: string;
  label: string;
  group: "ops" | "catalog" | "marketing" | "system";
};

export const ADMIN_TABS: AdminNavItem[] = [
  { id: "overview", href: "/admin", label: "סקירה כללית", group: "system" },
  { id: "orders", href: "/admin/orders", label: "הזמנות", group: "ops" },
  { id: "factory", href: "/admin/factory", label: "ייצור במפעל", group: "ops" },
  { id: "inventory", href: "/admin/inventory", label: "מלאי וספקים", group: "ops" },
  { id: "products", href: "/admin/products", label: "מוצרים", group: "catalog" },
  { id: "categories", href: "/admin/categories", label: "קטגוריות", group: "catalog" },
  { id: "leads", href: "/admin/leads", label: "לידים", group: "marketing" },
  { id: "content", href: "/admin/content", label: "תוכן", group: "catalog" },
  { id: "campaigns", href: "/admin/campaigns", label: "קמפיינים", group: "marketing" },
  { id: "social", href: "/admin/social", label: "רשתות חברתיות", group: "marketing" },
  { id: "team", href: "/admin/team", label: "מנהלים והרשאות", group: "system" },
];

export const ALL_NON_OWNER_TABS: AdminTabId[] = ADMIN_TABS.filter((t) => t.id !== "team").map(
  (t) => t.id,
);

export type RolePreset = {
  id: string;
  label: string;
  role: "owner" | "manager";
  tabs: AdminTabId[];
};

export const ROLE_PRESETS: RolePreset[] = [
  {
    id: "orders_factory",
    label: "מנהל הזמנות ומפעל",
    role: "manager",
    tabs: ["orders", "factory"],
  },
  {
    id: "inventory_mgr",
    label: "מנהל מלאי וספקים",
    role: "manager",
    tabs: ["inventory", "orders"],
  },
  {
    id: "catalog_mgr",
    label: "מנהל קטלוג (מוצרים וקטגוריות)",
    role: "manager",
    tabs: ["products", "categories", "content"],
  },
  {
    id: "marketing_mgr",
    label: "מנהל שיווק ולידים",
    role: "manager",
    tabs: ["leads", "campaigns", "social", "content"],
  },
  {
    id: "custom",
    label: "התאמה אישית (בחירת לשוניות)",
    role: "manager",
    tabs: ["orders"],
  },
  {
    id: "owner",
    label: "בעלים (גישה מלאה להכל)",
    role: "owner",
    tabs: ADMIN_TABS.map((t) => t.id),
  },
];

export function canAccessTab(
  user: Pick<AdminUser, "role" | "allowedTabs">,
  tab: AdminTabId,
): boolean {
  if (user.role === "owner") return true;
  if (tab === "team") return false;
  if (Array.isArray(user.allowedTabs)) {
    return user.allowedTabs.includes(tab);
  }
  // Legacy editor without explicit allowedTabs gets all non-owner tabs
  return true;
}

export function getDefaultAdminRoute(user: Pick<AdminUser, "role" | "allowedTabs">): string {
  const first = ADMIN_TABS.find((t) => canAccessTab(user, t.id));
  return first ? first.href : "/admin/login";
}
