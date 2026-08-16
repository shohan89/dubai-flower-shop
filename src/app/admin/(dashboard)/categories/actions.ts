"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/services/authorization.service";
import { parseCategoryFormData } from "@/validations/category.schema";
import {
  createCategoryFromInput,
  updateCategoryFromInput,
  deleteCategoryById,
} from "@/services/category.service";

export type CategoryFormState = { error?: string; success?: boolean };

export async function createCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requirePermission("products");
  const parsed = parseCategoryFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const result = await createCategoryFromInput(parsed.data);
  if ("error" in result) return { error: result.error };

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategoryAction(
  id: string,
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requirePermission("products");
  const parsed = parseCategoryFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const result = await updateCategoryFromInput(id, parsed.data);
  if ("error" in result) return { error: result.error };

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategoryAction(id: string): Promise<void> {
  await requirePermission("products");
  await deleteCategoryById(id);
  revalidatePath("/admin/categories");
}
