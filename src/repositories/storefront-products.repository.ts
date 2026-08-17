import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export type StorefrontProductFilters = {
  search?: string;
  categorySlug?: string;
  collectionSlug?: string;
  productTypes?: string[];
  occasion?: string;
  flowerType?: string;
  plantType?: string;
  minPrice?: number;
  maxPrice?: number;
  availableOnly?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "name_asc" | "bestselling";
  page: number;
  pageSize: number;
};

async function resolveProductIdsForCategory(
  supabase: SupabaseClient<Database>,
  categorySlug: string,
): Promise<string[] | null> {
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle();
  if (categoryError) throw categoryError;
  if (!category) return [];

  const { data: links, error: linksError } = await supabase
    .from("product_categories")
    .select("product_id")
    .eq("category_id", category.id);
  if (linksError) throw linksError;
  return (links ?? []).map((l) => l.product_id);
}

async function resolveProductIdsForCollection(
  supabase: SupabaseClient<Database>,
  collectionSlug: string,
): Promise<string[] | null> {
  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .select("id")
    .eq("slug", collectionSlug)
    .maybeSingle();
  if (collectionError) throw collectionError;
  if (!collection) return [];

  const { data: links, error: linksError } = await supabase
    .from("collection_products")
    .select("product_id")
    .eq("collection_id", collection.id);
  if (linksError) throw linksError;
  return (links ?? []).map((l) => l.product_id);
}

export async function listStorefrontProducts(
  supabase: SupabaseClient<Database>,
  filters: StorefrontProductFilters,
): Promise<{ rows: ProductRow[]; totalCount: number }> {
  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("status", "active")
    .is("deleted_at", null);

  if (filters.search) {
    // Matches the 'english' config products.search_vector was built with
    // (see supabase/migrations/*_products.sql).
    query = query.textSearch("search_vector", filters.search, {
      type: "websearch",
      config: "english",
    });
  }
  if (filters.productTypes && filters.productTypes.length > 0) {
    query = query.in("product_type", filters.productTypes);
  }
  if (filters.occasion) query = query.eq("occasion", filters.occasion);
  if (filters.flowerType) query = query.eq("flower_type", filters.flowerType);
  if (filters.plantType) query = query.eq("plant_type", filters.plantType);
  if (filters.minPrice !== undefined) query = query.gte("base_price", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("base_price", filters.maxPrice);
  if (filters.availableOnly) query = query.eq("delivery_available", true);

  if (filters.categorySlug) {
    const ids = await resolveProductIdsForCategory(supabase, filters.categorySlug);
    if (!ids || ids.length === 0) return { rows: [], totalCount: 0 };
    query = query.in("id", ids);
  }
  if (filters.collectionSlug) {
    const ids = await resolveProductIdsForCollection(supabase, filters.collectionSlug);
    if (!ids || ids.length === 0) return { rows: [], totalCount: 0 };
    query = query.in("id", ids);
  }

  switch (filters.sort) {
    case "price_asc":
      query = query.order("base_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("base_price", { ascending: false });
      break;
    case "name_asc":
      query = query.order("name", { ascending: true });
      break;
    case "bestselling":
      query = query.order("bestseller", { ascending: false }).order("created_at", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (filters.page - 1) * filters.pageSize;
  query = query.range(from, from + filters.pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: data ?? [], totalCount: count ?? 0 };
}

export async function getStorefrontProductBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<ProductRow | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listDistinctOccasions(supabase: SupabaseClient<Database>): Promise<string[]> {
  const { data, error } = await supabase
    .from("products")
    .select("occasion")
    .eq("status", "active")
    .is("deleted_at", null)
    .not("occasion", "is", null);
  if (error) throw error;
  const values = new Set((data ?? []).map((row) => row.occasion).filter((v): v is string => Boolean(v)));
  return Array.from(values).sort();
}

export async function listDistinctFlowerTypes(supabase: SupabaseClient<Database>): Promise<string[]> {
  const { data, error } = await supabase
    .from("products")
    .select("flower_type")
    .eq("status", "active")
    .is("deleted_at", null)
    .not("flower_type", "is", null);
  if (error) throw error;
  const values = new Set((data ?? []).map((row) => row.flower_type).filter((v): v is string => Boolean(v)));
  return Array.from(values).sort();
}

export async function listDistinctPlantTypes(supabase: SupabaseClient<Database>): Promise<string[]> {
  const { data, error } = await supabase
    .from("products")
    .select("plant_type")
    .eq("status", "active")
    .is("deleted_at", null)
    .not("plant_type", "is", null);
  if (error) throw error;
  const values = new Set((data ?? []).map((row) => row.plant_type).filter((v): v is string => Boolean(v)));
  return Array.from(values).sort();
}

export async function getPrimaryImagesForProducts(
  supabase: SupabaseClient<Database>,
  productIds: string[],
): Promise<Map<string, string>> {
  if (productIds.length === 0) return new Map();
  const { data, error } = await supabase
    .from("product_images")
    .select("product_id, url")
    .in("product_id", productIds)
    .is("variant_id", null)
    .eq("is_primary", true);
  if (error) throw error;
  return new Map((data ?? []).map((row) => [row.product_id, row.url]));
}

export async function listRelatedProducts(
  supabase: SupabaseClient<Database>,
  product: ProductRow,
  limit: number,
): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .is("deleted_at", null)
    .eq("product_type", product.product_type)
    .neq("id", product.id)
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
