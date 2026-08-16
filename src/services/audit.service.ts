import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database.types";
import { insertAuditLog } from "@/repositories/audit-log.repository";

type LogAuditEventInput = {
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  metadata?: Record<string, Json>;
};

/**
 * Fire-and-forget audit logging: never throws, so a logging failure can't
 * take down the action being audited. Failures are surfaced to server
 * logs instead — acceptable for an audit trail (best-effort), not
 * acceptable for anything that must be transactionally guaranteed.
 */
export async function logAuditEvent(
  supabase: SupabaseClient<Database>,
  input: LogAuditEventInput,
): Promise<void> {
  try {
    await insertAuditLog(supabase, input);
  } catch (error) {
    console.error("[audit] failed to record event", input.action, error);
  }
}
