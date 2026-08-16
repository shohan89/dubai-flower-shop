"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/services/authorization.service";
import { parseAddonFormData } from "@/validations/addon.schema";
import { createAddonFromInput, updateAddonFromInput, deleteAddonById } from "@/services/addon.service";

export type AddonFormState = { error?: string; success?: boolean };

export async function createAddonAction(
  _prevState: AddonFormState,
  formData: FormData,
): Promise<AddonFormState> {
  await requirePermission("products");
  const parsed = parseAddonFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const result = await createAddonFromInput(parsed.data);
  if ("error" in result) return { error: result.error };

  revalidatePath("/admin/addons");
  return { success: true };
}

export async function updateAddonAction(
  id: string,
  _prevState: AddonFormState,
  formData: FormData,
): Promise<AddonFormState> {
  await requirePermission("products");
  const parsed = parseAddonFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const result = await updateAddonFromInput(id, parsed.data);
  if ("error" in result) return { error: result.error };

  revalidatePath("/admin/addons");
  return { success: true };
}

export async function deleteAddonAction(id: string): Promise<void> {
  await requirePermission("products");
  await deleteAddonById(id);
  revalidatePath("/admin/addons");
}
