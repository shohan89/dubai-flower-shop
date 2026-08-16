"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/services/authorization.service";
import { createClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/services/audit.service";
import { parseProductFormData } from "@/validations/product.schema";
import type { Json } from "@/types/database.types";
import {
  createProductFromInput,
  updateProductFromInput,
  duplicateProductById,
  archiveProductById,
  deleteProductById,
  setProductStatus,
  toggleProductFlag,
} from "@/services/product.service";
import {
  addProductImage,
  deleteProductImage,
  setPrimaryProductImage,
} from "@/repositories/product-images.repository";
import {
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
} from "@/repositories/product-variants.repository";

export type ProductFormState = { error?: string };

async function auditProduct(action: string, productId: string, metadata?: Record<string, Json>) {
  const { user } = await requirePermission("products");
  const supabase = await createClient();
  await logAuditEvent(supabase, {
    actorId: user.id,
    actorEmail: user.email ?? null,
    action,
    resourceType: "product",
    resourceId: productId,
    metadata,
  });
}

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requirePermission("products");

  const parsed = parseProductFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const result = await createProductFromInput(parsed.data);
  if ("error" in result) return { error: result.error };

  await auditProduct("product_created", result.product.id, { name: result.product.name });
  revalidatePath("/admin/products");
  redirect(`/admin/products/${result.product.id}`);
}

export async function updateProductAction(
  id: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requirePermission("products");

  const parsed = parseProductFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const result = await updateProductFromInput(id, parsed.data);
  if ("error" in result) return { error: result.error };

  await auditProduct("product_updated", id);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return {};
}

export async function duplicateProductAction(id: string): Promise<void> {
  await requirePermission("products");
  const copy = await duplicateProductById(id);
  await auditProduct("product_duplicated", copy.id, { sourceId: id });
  revalidatePath("/admin/products");
  redirect(`/admin/products/${copy.id}`);
}

export async function archiveProductAction(id: string): Promise<void> {
  await requirePermission("products");
  await archiveProductById(id);
  await auditProduct("product_archived", id);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
}

export async function deleteProductAction(id: string): Promise<void> {
  await requirePermission("products");
  await deleteProductById(id);
  await auditProduct("product_deleted", id);
  revalidatePath("/admin/products");
}

export async function setProductStatusAction(
  id: string,
  status: "draft" | "active" | "archived",
): Promise<void> {
  await requirePermission("products");
  await setProductStatus(id, status);
  await auditProduct("product_status_changed", id, { status });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
}

export async function toggleProductFlagAction(
  id: string,
  flag: "featured" | "bestseller" | "new_arrival" | "on_sale",
  value: boolean,
): Promise<void> {
  await requirePermission("products");
  await toggleProductFlag(id, flag, value);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
}

// --- Images ---

export async function addProductImageAction(
  productId: string,
  input: { url: string; altText?: string; isPrimary?: boolean },
): Promise<void> {
  await requirePermission("products");
  const supabase = await createClient();
  await addProductImage(supabase, { productId, ...input });
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteProductImageAction(
  productId: string,
  imageId: string,
): Promise<void> {
  await requirePermission("products");
  const supabase = await createClient();
  await deleteProductImage(supabase, imageId);
  revalidatePath(`/admin/products/${productId}`);
}

export async function setPrimaryImageAction(
  productId: string,
  imageId: string,
): Promise<void> {
  await requirePermission("products");
  const supabase = await createClient();
  await setPrimaryProductImage(supabase, productId, imageId);
  revalidatePath(`/admin/products/${productId}`);
}

// --- Variants ---

export type VariantFormState = { error?: string };

export async function createVariantAction(
  productId: string,
  _prevState: VariantFormState,
  formData: FormData,
): Promise<VariantFormState> {
  await requirePermission("products");
  const sku = String(formData.get("sku") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!sku || !name) return { error: "SKU and name are required." };

  const supabase = await createClient();
  try {
    await createProductVariant(supabase, {
      product_id: productId,
      sku,
      name,
      price_override: formData.get("priceOverride") ? String(formData.get("priceOverride")) : null,
      stock_quantity: Number(formData.get("stockQuantity") ?? 0),
      is_default: formData.get("isDefault") === "on",
      is_active: true,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create variant" };
  }
  revalidatePath(`/admin/products/${productId}`);
  return {};
}

export async function updateVariantAction(
  productId: string,
  variantId: string,
  _prevState: VariantFormState,
  formData: FormData,
): Promise<VariantFormState> {
  await requirePermission("products");
  const supabase = await createClient();
  try {
    await updateProductVariant(supabase, variantId, productId, {
      sku: String(formData.get("sku") ?? "").trim(),
      name: String(formData.get("name") ?? "").trim(),
      price_override: formData.get("priceOverride") ? String(formData.get("priceOverride")) : null,
      stock_quantity: Number(formData.get("stockQuantity") ?? 0),
      is_default: formData.get("isDefault") === "on",
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update variant" };
  }
  revalidatePath(`/admin/products/${productId}`);
  return {};
}

export async function deleteVariantAction(productId: string, variantId: string): Promise<void> {
  await requirePermission("products");
  const supabase = await createClient();
  await deleteProductVariant(supabase, variantId);
  revalidatePath(`/admin/products/${productId}`);
}
