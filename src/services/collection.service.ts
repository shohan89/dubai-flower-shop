import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  listAllCollections,
  listCollectionsPaginated,
  getCollectionById,
  createCollection,
  updateCollection,
  softDeleteCollection,
} from "@/repositories/collections.repository";
import { collectionSchema, type CollectionInput } from "@/validations/collection.schema";

export async function listCollectionsForAdmin(params: {
  search?: string;
  page: number;
  pageSize: number;
}) {
  const supabase = await createClient();
  return listCollectionsPaginated(supabase, params);
}

export async function getAllCollectionsForPicker() {
  const supabase = await createClient();
  return listAllCollections(supabase);
}

export async function getCollectionForEdit(id: string) {
  const supabase = await createClient();
  return getCollectionById(supabase, id);
}

async function assertUniqueCollectionSlug(
  slug: string,
  excludeId?: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("collections").select("id").eq("slug", slug).maybeSingle();
  if (data && data.id !== excludeId) return "That slug is already in use.";
  return null;
}

function toRecord(input: CollectionInput) {
  return {
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    image_url: input.imageUrl ?? null,
    display_order: input.displayOrder,
    is_active: input.isActive,
  };
}

export async function createCollectionFromInput(raw: CollectionInput) {
  const input = collectionSchema.parse(raw);
  const conflict = await assertUniqueCollectionSlug(input.slug);
  if (conflict) return { error: conflict };
  const supabase = await createClient();
  const collection = await createCollection(supabase, toRecord(input));
  return { collection };
}

export async function updateCollectionFromInput(id: string, raw: CollectionInput) {
  const input = collectionSchema.parse(raw);
  const conflict = await assertUniqueCollectionSlug(input.slug, id);
  if (conflict) return { error: conflict };
  const supabase = await createClient();
  const collection = await updateCollection(supabase, id, toRecord(input));
  return { collection };
}

export async function deleteCollectionById(id: string) {
  const supabase = await createClient();
  await softDeleteCollection(supabase, id);
}
