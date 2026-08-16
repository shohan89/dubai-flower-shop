import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { Role } from "@/constants/roles";

/**
 * Two plain queries rather than an embedded `user_roles.select("roles(name)")`
 * — the hand-authored database types (see database.types.ts header) don't
 * carry FK `Relationships` metadata, which embedded selects rely on for
 * correct typing.
 */
export async function getUserRoleNames(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Role[]> {
  const { data: assignments, error: assignmentsError } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", userId);

  if (assignmentsError) throw assignmentsError;
  if (!assignments || assignments.length === 0) return [];

  const { data: roles, error: rolesError } = await supabase
    .from("roles")
    .select("name")
    .in(
      "id",
      assignments.map((row) => row.role_id),
    );

  if (rolesError) throw rolesError;

  return (roles ?? []).map((row) => row.name as Role);
}
