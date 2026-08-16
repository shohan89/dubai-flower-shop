"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/services/authorization.service";
import { transitionOrderStatus, updateOrderNotesById } from "@/services/order.service";
import { logAuditEvent } from "@/services/audit.service";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/constants/order-status";

export type OrderActionState = { error?: string; success?: boolean };

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
): Promise<OrderActionState> {
  const { user } = await requirePermission("orders");

  const result = await transitionOrderStatus(orderId, newStatus);
  if ("error" in result) return { error: result.error };

  const supabase = await createClient();
  await logAuditEvent(supabase, {
    actorId: user.id,
    actorEmail: user.email ?? null,
    action: "order_status_changed",
    resourceType: "order",
    resourceId: orderId,
    metadata: { newStatus },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function updateOrderNotesAction(
  orderId: string,
  _prevState: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  await requirePermission("orders");
  const notes = String(formData.get("notes") ?? "");
  await updateOrderNotesById(orderId, notes);
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}
