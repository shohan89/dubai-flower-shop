import { createClient } from "@/lib/supabase/server";
import {
  listStorefrontProducts,
  getStorefrontProductBySlug,
  getPrimaryImagesForProducts,
  listRelatedProducts,
  listDistinctOccasions,
  listDistinctFlowerTypes,
  listDistinctPlantTypes,
  type StorefrontProductFilters,
} from "@/repositories/storefront-products.repository";
import { listProductImages } from "@/repositories/product-images.repository";
import { listProductVariants } from "@/repositories/product-variants.repository";
import { getAddonById } from "@/repositories/addons.repository";
import { getProductCategoryLinks } from "@/repositories/product-relations.repository";
import { getCategoryById } from "@/repositories/categories.repository";
import type { Database } from "@/types/database.types";

export type ProductCardData = Database["public"]["Tables"]["products"]["Row"] & {
  imageUrl: string | null;
};

export async function listProductsForStorefront(
  filters: StorefrontProductFilters,
): Promise<{ rows: ProductCardData[]; totalCount: number }> {
  const supabase = await createClient();
  const { rows, totalCount } = await listStorefrontProducts(supabase, filters);
  const images = await getPrimaryImagesForProducts(
    supabase,
    rows.map((r) => r.id),
  );
  return {
    rows: rows.map((row) => ({ ...row, imageUrl: images.get(row.id) ?? null })),
    totalCount,
  };
}

export async function getProductDetail(slug: string) {
  const supabase = await createClient();
  const product = await getStorefrontProductBySlug(supabase, slug);
  if (!product) return null;

  const [images, variants, categoryLinks, related] = await Promise.all([
    listProductImages(supabase, product.id),
    listProductVariants(supabase, product.id),
    getProductCategoryLinks(supabase, product.id),
    listRelatedProducts(supabase, product, 4),
  ]);

  const { data: addonLinks } = await supabase
    .from("product_addons")
    .select("addon_id, is_default")
    .eq("product_id", product.id);

  const addons = (
    await Promise.all(
      (addonLinks ?? []).map(async (link) => ({
        addon: await getAddonById(supabase, link.addon_id),
        isDefault: link.is_default,
      })),
    )
  ).filter((a): a is { addon: NonNullable<typeof a.addon>; isDefault: boolean } => a.addon !== null);

  const primaryCategory = categoryLinks.primaryCategoryId
    ? await getCategoryById(supabase, categoryLinks.primaryCategoryId)
    : null;

  const relatedImages = await getPrimaryImagesForProducts(
    supabase,
    related.map((r) => r.id),
  );

  return {
    product,
    images,
    variants,
    addons,
    primaryCategory,
    related: related.map((r) => ({ ...r, imageUrl: relatedImages.get(r.id) ?? null })),
  };
}

export async function getStorefrontFilterOptions() {
  const supabase = await createClient();
  const [occasions, flowerTypes, plantTypes] = await Promise.all([
    listDistinctOccasions(supabase),
    listDistinctFlowerTypes(supabase),
    listDistinctPlantTypes(supabase),
  ]);
  return { occasions, flowerTypes, plantTypes };
}
