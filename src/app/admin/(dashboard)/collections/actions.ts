"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/services/authorization.service";
import { parseCollectionFormData } from "@/validations/collection.schema";
import {
  createCollectionFromInput,
  updateCollectionFromInput,
  deleteCollectionById,
} from "@/services/collection.service";

export type CollectionFormState = { error?: string; success?: boolean };

export async function createCollectionAction(
  _prevState: CollectionFormState,
  formData: FormData,
): Promise<CollectionFormState> {
  await requirePermission("products");
  const parsed = parseCollectionFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const result = await createCollectionFromInput(parsed.data);
  if ("error" in result) return { error: result.error };

  revalidatePath("/admin/collections");
  return { success: true };
}

export async function updateCollectionAction(
  id: string,
  _prevState: CollectionFormState,
  formData: FormData,
): Promise<CollectionFormState> {
  await requirePermission("products");
  const parsed = parseCollectionFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const result = await updateCollectionFromInput(id, parsed.data);
  if ("error" in result) return { error: result.error };

  revalidatePath("/admin/collections");
  return { success: true };
}

export async function deleteCollectionAction(id: string): Promise<void> {
  await requirePermission("products");
  await deleteCollectionById(id);
  revalidatePath("/admin/collections");
}
