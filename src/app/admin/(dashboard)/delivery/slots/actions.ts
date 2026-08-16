"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/services/authorization.service";
import { parseDeliverySlotFormData } from "@/validations/delivery.schema";
import { createSlotFromInput, updateSlotFromInput, deleteSlotById } from "@/services/delivery.service";

export type DeliverySlotFormState = { error?: string; success?: boolean };

export async function createSlotAction(
  _prevState: DeliverySlotFormState,
  formData: FormData,
): Promise<DeliverySlotFormState> {
  await requirePermission("delivery");
  const parsed = parseDeliverySlotFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const result = await createSlotFromInput(parsed.data);
  if ("error" in result) return { error: result.error };

  revalidatePath("/admin/delivery/slots");
  return { success: true };
}

export async function updateSlotAction(
  id: string,
  _prevState: DeliverySlotFormState,
  formData: FormData,
): Promise<DeliverySlotFormState> {
  await requirePermission("delivery");
  const parsed = parseDeliverySlotFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const result = await updateSlotFromInput(id, parsed.data);
  if ("error" in result) return { error: result.error };

  revalidatePath("/admin/delivery/slots");
  return { success: true };
}

export async function deleteSlotAction(id: string): Promise<void> {
  await requirePermission("delivery");
  await deleteSlotById(id);
  revalidatePath("/admin/delivery/slots");
}
