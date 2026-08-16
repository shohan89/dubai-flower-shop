"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/services/authorization.service";
import { adjustInventoryQuantity } from "@/services/inventory.service";
import { logAuditEvent } from "@/services/audit.service";
import { createClient } from "@/lib/supabase/server";

export type AdjustInventoryState = { error?: string; success?: boolean };

const REASONS = ["purchase_order", "return", "adjustment", "damaged", "initial_stock"] as const;

export async function adjustInventoryAction(
  inventoryId: string,
  _prevState: AdjustInventoryState,
  formData: FormData,
): Promise<AdjustInventoryState> {
  const { user } = await requirePermission("inventory");

  const delta = Number(formData.get("delta"));
  const reason = String(formData.get("reason") ?? "");
  if (!Number.isFinite(delta) || delta === 0) {
    return { error: "Enter a non-zero quantity change." };
  }
  if (!REASONS.includes(reason as (typeof REASONS)[number])) {
    return { error: "Select a valid reason." };
  }

  try {
    await adjustInventoryQuantity(
      inventoryId,
      delta,
      reason as (typeof REASONS)[number],
      user.id,
    );
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not adjust inventory" };
  }

  const supabase = await createClient();
  await logAuditEvent(supabase, {
    actorId: user.id,
    actorEmail: user.email ?? null,
    action: "inventory_adjusted",
    resourceType: "inventory",
    resourceId: inventoryId,
    metadata: { delta, reason },
  });

  revalidatePath("/admin/inventory");
  return { success: true };
}
