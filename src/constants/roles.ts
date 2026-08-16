/**
 * The fixed role set, matching the seeded rows in `public.roles`
 * (see supabase/migrations/*_rbac.sql). Adding a role means adding both
 * a migration seed row and an entry here — kept in sync by hand since
 * roles are structural, not admin-editable content.
 */
export const STAFF_ROLES = [
  "super_admin",
  "admin",
  "manager",
  "editor",
  "fulfillment",
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export const ALL_ROLES = [...STAFF_ROLES, "customer"] as const;

export type Role = (typeof ALL_ROLES)[number];

export function isStaffRole(role: Role): role is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(role);
}
