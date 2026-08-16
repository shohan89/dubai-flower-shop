"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/services/authorization.service";
import {
  parseSiteSettingsFormData,
  parseStoreSettingsFormData,
  parseDeliverySettingsFormData,
  parsePaymentSettingsFormData,
  parseSocialLinkFormData,
} from "@/validations/settings.schema";
import {
  saveSiteSettingsFromInput,
  saveStoreSettingsFromInput,
  saveDeliverySettingsFromInput,
  savePaymentSettingsFromInput,
  saveSocialLinkFromInput,
  deleteSocialLinkById,
} from "@/services/settings.service";

export type SettingsFormState = { error?: string; success?: boolean };

export async function saveSiteSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  await requirePermission("settings");
  const parsed = parseSiteSettingsFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  await saveSiteSettingsFromInput(parsed.data);
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function saveStoreSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  await requirePermission("settings");
  const parsed = parseStoreSettingsFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  await saveStoreSettingsFromInput(parsed.data);
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function saveDeliverySettingsAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  await requirePermission("settings");
  const parsed = parseDeliverySettingsFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  await saveDeliverySettingsFromInput(parsed.data);
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function savePaymentSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  await requirePermission("settings");
  const parsed = parsePaymentSettingsFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  await savePaymentSettingsFromInput(parsed.data);
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function saveSocialLinkAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  await requirePermission("settings");
  const parsed = parseSocialLinkFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  await saveSocialLinkFromInput(parsed.data);
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function deleteSocialLinkAction(id: string): Promise<void> {
  await requirePermission("settings");
  await deleteSocialLinkById(id);
  revalidatePath("/admin/settings");
}
