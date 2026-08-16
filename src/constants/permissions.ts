import { type StaffRole, type Role } from "@/constants/roles";

/**
 * Admin dashboard resources a role can be granted access to. This is
 * distinct from a customer's own data (profile/addresses/orders/wishlist/
 * their own reviews), which is enforced by RLS ownership
 * (`auth.uid() = user_id`), not this resource-permission map — see
 * docs/AUTHENTICATION.md. `reviews` here means *moderating* everyone's
 * reviews (approve/reject), added in Phase 4 — the original Phase 3 spec
 * didn't assign review moderation to any role, so it's granted to
 * `admin`/`manager` here, matching how `customers` is scoped.
 */
export const PERMISSION_RESOURCES = [
  "products",
  "inventory",
  "orders",
  "customers",
  "reviews",
  "delivery",
  "coupons",
  "homepage",
  "banners",
  "pages",
  "blog",
  "faq",
  "seo",
  "analytics",
  "settings",
  "users",
] as const;

export type PermissionResource = (typeof PERMISSION_RESOURCES)[number];

const CONTENT_RESOURCES: PermissionResource[] = [
  "homepage",
  "banners",
  "pages",
  "blog",
  "faq",
  "seo",
];

/**
 * Role -> granted resources. `'all'` (super_admin only) means every
 * resource in PERMISSION_RESOURCES, including ones added later.
 */
export const ROLE_PERMISSIONS: Record<StaffRole, "all" | PermissionResource[]> = {
  super_admin: "all",
  admin: [
    "products",
    "orders",
    "customers",
    "reviews",
    "delivery",
    "coupons",
    ...CONTENT_RESOURCES,
    "analytics",
    "settings",
  ],
  manager: ["products", "orders", "inventory", "delivery", "customers", "reviews"],
  editor: [...CONTENT_RESOURCES],
  fulfillment: ["orders", "inventory", "delivery"],
};

/** True if any of the given roles grants the resource. */
export function hasPermission(
  roles: readonly Role[],
  resource: PermissionResource,
): boolean {
  return roles.some((role) => {
    if (role === "customer") return false;
    const granted = ROLE_PERMISSIONS[role];
    return granted === "all" || granted.includes(resource);
  });
}

/** True if any of the given roles is a staff role (has dashboard access at all). */
export function hasAnyStaffAccess(roles: readonly Role[]): boolean {
  return roles.some((role) => role !== "customer");
}
