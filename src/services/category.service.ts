import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  listAllCategories,
  listCategoriesPaginated,
  getCategoryById,
  createCategory,
  updateCategory,
  softDeleteCategory,
} from "@/repositories/categories.repository";
import { categorySchema, type CategoryInput } from "@/validations/category.schema";

export async function listCategoriesForAdmin(params: {
  search?: string;
  page: number;
  pageSize: number;
}) {
  const supabase = await createClient();
  return listCategoriesPaginated(supabase, params);
}

export async function getAllCategoriesForPicker() {
  const supabase = await createClient();
  return listAllCategories(supabase);
}

export async function getCategoryForEdit(id: string) {
  const supabase = await createClient();
  return getCategoryById(supabase, id);
}

async function assertUniqueCategorySlug(slug: string, excludeId?: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("id").eq("slug", slug).maybeSingle();
  if (data && data.id !== excludeId) return "That slug is already in use.";
  return null;
}

function toRecord(input: CategoryInput) {
  return {
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    image_url: input.imageUrl ?? null,
    parent_id: input.parentId ?? null,
    display_order: input.displayOrder,
    is_active: input.isActive,
  };
}

export async function createCategoryFromInput(raw: CategoryInput) {
  const input = categorySchema.parse(raw);
  const conflict = await assertUniqueCategorySlug(input.slug);
  if (conflict) return { error: conflict };
  const supabase = await createClient();
  const category = await createCategory(supabase, toRecord(input));
  return { category };
}

export async function updateCategoryFromInput(id: string, raw: CategoryInput) {
  const input = categorySchema.parse(raw);
  const conflict = await assertUniqueCategorySlug(input.slug, id);
  if (conflict) return { error: conflict };
  const supabase = await createClient();
  const category = await updateCategory(supabase, id, toRecord(input));
  return { category };
}

export async function deleteCategoryById(id: string) {
  const supabase = await createClient();
  await softDeleteCategory(supabase, id);
}
