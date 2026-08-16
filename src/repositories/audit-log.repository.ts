import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database.types";

export type AuditLogEntry = {
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  metadata?: Record<string, Json>;
};

export async function insertAuditLog(
  supabase: SupabaseClient<Database>,
  entry: AuditLogEntry,
): Promise<void> {
  const { error } = await supabase.from("audit_logs").insert({
    actor_id: entry.actorId,
    actor_email: entry.actorEmail,
    action: entry.action,
    resource_type: entry.resourceType,
    resource_id: entry.resourceId ?? null,
    metadata: entry.metadata ?? {},
  });

  if (error) throw error;
}
