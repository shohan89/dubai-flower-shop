import "server-only";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { createClient } from "@/lib/supabase/server";
import { getUserRoleNames } from "@/repositories/user-roles.repository";
import { logAuditEvent } from "@/services/audit.service";
import {
  hasPermission,
  type PermissionResource,
} from "@/constants/permissions";
import { STAFF_ROLES, type Role } from "@/constants/roles";

/**
 * Authorization core. Used by every Server Action and Route Handler that
 * needs to verify who's calling and what they're allowed to do —
 * middleware only does a cheap "is there a session" pre-check for UX,
 * it is never the authorization decision (see docs/AUTHENTICATION.md).
 */

export class AuthError extends Error {
  readonly status: 401 | 403;

  constructor(message: string, status: 401 | 403) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export type AuthContext = {
  user: User;
  roles: Role[];
};

async function loadContext(): Promise<{
  supabase: SupabaseClient<Database>;
  context: AuthContext | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return { supabase, context: null };

  const roles = await getUserRoleNames(supabase, user.id);
  return { supabase, context: { user, roles } };
}

/** Returns the current session, or `null` if signed out. Never throws. */
export async function getCurrentUser(): Promise<AuthContext | null> {
  const { context } = await loadContext();
  return context;
}

/** Throws `AuthError(401)` if signed out. */
export async function requireAuth(): Promise<AuthContext> {
  const { context } = await loadContext();
  if (!context) {
    throw new AuthError("You must be signed in to do that.", 401);
  }
  return context;
}

/** Throws `AuthError(401/403)`. Denials are audit-logged. */
export async function requireRole(
  allowedRoles: readonly Role[],
): Promise<AuthContext> {
  const { supabase, context } = await loadContext();
  if (!context) {
    throw new AuthError("You must be signed in to do that.", 401);
  }
  if (!allowedRoles.some((role) => context.roles.includes(role))) {
    await logAuditEvent(supabase, {
      actorId: context.user.id,
      actorEmail: context.user.email ?? null,
      action: "authorization_denied",
      resourceType: "role",
      metadata: { allowedRoles: [...allowedRoles], actualRoles: context.roles },
    });
    throw new AuthError("You don't have permission to do that.", 403);
  }
  return context;
}

/**
 * Throws `AuthError(401/403)` unless one of the caller's roles grants
 * `resource` per `ROLE_PERMISSIONS`. Denials are audit-logged.
 */
export async function requirePermission(
  resource: PermissionResource,
): Promise<AuthContext> {
  const { supabase, context } = await loadContext();
  if (!context) {
    throw new AuthError("You must be signed in to do that.", 401);
  }
  if (!hasPermission(context.roles, resource)) {
    await logAuditEvent(supabase, {
      actorId: context.user.id,
      actorEmail: context.user.email ?? null,
      action: "authorization_denied",
      resourceType: "permission",
      resourceId: resource,
      metadata: { actualRoles: context.roles },
    });
    throw new AuthError("You don't have permission to do that.", 403);
  }
  return context;
}

/**
 * Page/layout convenience wrapper: redirects instead of throwing.
 * `resource` omitted = "any staff role is enough" (used by the admin
 * shell layout itself); pass a resource for section-level gating.
 */
export async function requireAdminAccess(
  resource?: PermissionResource,
): Promise<AuthContext> {
  try {
    return resource
      ? await requirePermission(resource)
      : await requireRole(STAFF_ROLES);
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(error.status === 401 ? "/admin/login" : "/forbidden");
    }
    throw error;
  }
}

/** Page/layout convenience wrapper for customer-only pages (e.g. /account). */
export async function requireCustomerAccess(): Promise<AuthContext> {
  try {
    return await requireAuth();
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login");
    }
    throw error;
  }
}
