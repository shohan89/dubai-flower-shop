"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/services/authorization.service";
import { parseDeliveryZoneFormData } from "@/validations/delivery.schema";
import {
  createZoneFromInput,
  updateZoneFromInput,
  deleteZoneById,
  addZoneArea,
  removeZoneArea,
} from "@/services/delivery.service";

export type DeliveryZoneFormState = { error?: string; success?: boolean };

export async function createZoneAction(
  _prevState: DeliveryZoneFormState,
  formData: FormData,
): Promise<DeliveryZoneFormState> {
  await requirePermission("delivery");
  const parsed = parseDeliveryZoneFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  await createZoneFromInput(parsed.data);
  revalidatePath("/admin/delivery/zones");
  return { success: true };
}

export async function updateZoneAction(
  id: string,
  _prevState: DeliveryZoneFormState,
  formData: FormData,
): Promise<DeliveryZoneFormState> {
  await requirePermission("delivery");
  const parsed = parseDeliveryZoneFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  await updateZoneFromInput(id, parsed.data);
  revalidatePath("/admin/delivery/zones");
  return { success: true };
}

export async function deleteZoneAction(id: string): Promise<void> {
  await requirePermission("delivery");
  await deleteZoneById(id);
  revalidatePath("/admin/delivery/zones");
}

export async function addZoneAreaAction(zoneId: string, formData: FormData): Promise<void> {
  await requirePermission("delivery");
  const areaName = String(formData.get("areaName") ?? "").trim();
  const postcode = String(formData.get("postcode") ?? "").trim();
  if (!areaName) return;
  await addZoneArea(zoneId, areaName, postcode || undefined);
  revalidatePath("/admin/delivery/zones");
}

export async function removeZoneAreaAction(areaId: string): Promise<void> {
  await requirePermission("delivery");
  await removeZoneArea(areaId);
  revalidatePath("/admin/delivery/zones");
}
