import { hasPermission, type PermissionResource } from "@/constants/permissions";
import type { Role } from "@/constants/roles";

export type AdminNavItem = {
  label: string;
  href: string;
  /** Omitted = visible to any staff role (e.g. the dashboard home). */
  resource?: PermissionResource;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Products", href: "/admin/products", resource: "products" },
  { label: "Categories", href: "/admin/categories", resource: "products" },
  { label: "Collections", href: "/admin/collections", resource: "products" },
  { label: "Add-ons", href: "/admin/addons", resource: "products" },
  { label: "Inventory", href: "/admin/inventory", resource: "inventory" },
  { label: "Orders", href: "/admin/orders", resource: "orders" },
  { label: "Customers", href: "/admin/customers", resource: "customers" },
  { label: "Reviews", href: "/admin/reviews", resource: "reviews" },
  { label: "Delivery zones", href: "/admin/delivery/zones", resource: "delivery" },
  { label: "Delivery slots", href: "/admin/delivery/slots", resource: "delivery" },
  { label: "Coupons", href: "/admin/coupons", resource: "coupons" },
  { label: "Homepage", href: "/admin/homepage", resource: "homepage" },
  { label: "Banners", href: "/admin/banners", resource: "banners" },
  { label: "Pages", href: "/admin/pages", resource: "pages" },
  { label: "Blog", href: "/admin/blog", resource: "blog" },
  { label: "FAQ", href: "/admin/faq", resource: "faq" },
  { label: "SEO", href: "/admin/seo", resource: "seo" },
  { label: "Analytics", href: "/admin/analytics", resource: "analytics" },
  { label: "Settings", href: "/admin/settings", resource: "settings" },
  { label: "Users", href: "/admin/users", resource: "users" },
];

export function getVisibleAdminNavItems(roles: readonly Role[]): AdminNavItem[] {
  return ADMIN_NAV_ITEMS.filter(
    (item) => !item.resource || hasPermission(roles, item.resource),
  );
}
