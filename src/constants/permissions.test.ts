import { describe, expect, it } from "vitest";
import {
  PERMISSION_RESOURCES,
  hasPermission,
  hasAnyStaffAccess,
  type PermissionResource,
} from "@/constants/permissions";
import { ALL_ROLES, type Role } from "@/constants/roles";

/**
 * Exhaustive role x resource matrix, mirroring the spec exactly, plus
 * `reviews` (review moderation) added in Phase 4 — not in the original
 * Phase 3 spec, granted to admin/manager matching how `customers` is
 * scoped (see the comment on ROLE_PERMISSIONS in permissions.ts):
 *   super_admin: full access
 *   admin: products, orders, customers, reviews, delivery, coupons,
 *          content (homepage/banners/pages/blog/faq/seo), analytics, settings
 *   manager: products, orders, inventory, delivery, customers, reviews
 *   editor: homepage, banners, pages, blog, faq, seo
 *   fulfillment: orders, inventory, delivery
 *   customer: none (customer data access is RLS-ownership based, not
 *             resource-permission based — see docs/AUTHENTICATION.md)
 */
const EXPECTED: Record<Role, Set<PermissionResource>> = {
  super_admin: new Set(PERMISSION_RESOURCES),
  admin: new Set([
    "products",
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
  ]),
  manager: new Set(["products", "orders", "inventory", "delivery", "customers", "reviews"]),
  editor: new Set(["homepage", "banners", "pages", "blog", "faq", "seo"]),
  fulfillment: new Set(["orders", "inventory", "delivery"]),
  customer: new Set([]),
};

describe("hasPermission", () => {
  for (const role of ALL_ROLES) {
    describe(`role: ${role}`, () => {
      for (const resource of PERMISSION_RESOURCES) {
        const expected = EXPECTED[role].has(resource);
        it(`${expected ? "grants" : "denies"} "${resource}"`, () => {
          expect(hasPermission([role], resource)).toBe(expected);
        });
      }
    });
  }

  it("grants access if ANY of a user's roles grants it", () => {
    expect(hasPermission(["customer", "editor"], "blog")).toBe(true);
    expect(hasPermission(["customer", "fulfillment"], "orders")).toBe(true);
  });

  it("denies access with no roles", () => {
    for (const resource of PERMISSION_RESOURCES) {
      expect(hasPermission([], resource)).toBe(false);
    }
  });

  it("super_admin implicitly covers resources added after this test was written", () => {
    // 'all' is a live match against PERMISSION_RESOURCES, not a frozen
    // list — this guards against the matrix silently going stale.
    expect(EXPECTED.super_admin.size).toBe(PERMISSION_RESOURCES.length);
  });
});

describe("hasAnyStaffAccess", () => {
  it("is true for every staff role", () => {
    expect(hasAnyStaffAccess(["super_admin"])).toBe(true);
    expect(hasAnyStaffAccess(["admin"])).toBe(true);
    expect(hasAnyStaffAccess(["manager"])).toBe(true);
    expect(hasAnyStaffAccess(["editor"])).toBe(true);
    expect(hasAnyStaffAccess(["fulfillment"])).toBe(true);
  });

  it("is false for customer-only or no roles", () => {
    expect(hasAnyStaffAccess(["customer"])).toBe(false);
    expect(hasAnyStaffAccess([])).toBe(false);
  });

  it("is true if a customer account also holds a staff role", () => {
    expect(hasAnyStaffAccess(["customer", "manager"])).toBe(true);
  });
});
