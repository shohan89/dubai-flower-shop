import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  listProducts,
  getProductById,
  getProductBySku,
  createProduct,
  updateProduct,
  archiveProduct,
  softDeleteProduct,
  type ProductListFilters,
} from "@/repositories/products.repository";
import { listProductImages } from "@/repositories/product-images.repository";
import { listProductVariants } from "@/repositories/product-variants.repository";
import {
  getProductCategoryLinks,
  getProductCollectionIds,
  getProductAddonIds,
  setProductCategories,
  setProductCollections,
  setProductAddons,
} from "@/repositories/product-relations.repository";
import { getSeoMetadata, upsertSeoMetadata } from "@/repositories/seo-metadata.repository";
import { productSchema, type ProductInput } from "@/validations/product.schema";
import type { Database } from "@/types/database.types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export async function listProductsForAdmin(filters: ProductListFilters) {
  const supabase = await createClient();
  return listProducts(supabase, filters);
}

export async function getProductForEdit(id: string) {
  const supabase = await createClient();
  const [product, images, variants, categoryLinks, collectionIds, addonIds, seo] =
    await Promise.all([
      getProductById(supabase, id),
      listProductImages(supabase, id),
      listProductVariants(supabase, id),
      getProductCategoryLinks(supabase, id),
      getProductCollectionIds(supabase, id),
      getProductAddonIds(supabase, id),
      getSeoMetadata(supabase, "product", id),
    ]);

  if (!product) return null;
  return {
    product,
    images,
    variants,
    categoryIds: categoryLinks.categoryIds,
    primaryCategoryId: categoryLinks.primaryCategoryId,
    collectionIds,
    addonIds,
    seo,
  };
}

function toProductRecord(input: ProductInput) {
  return {
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    short_description: input.shortDescription ?? null,
    sku: input.sku,
    product_type: input.productType,
    base_price: input.basePrice,
    compare_at_price: input.compareAtPrice ?? null,
    cost_price: input.costPrice ?? null,
    stock_quantity: Number(input.stockQuantity ?? "0"),
    low_stock_threshold: Number(input.lowStockThreshold ?? "5"),
    status: input.status,
    featured: input.featured,
    bestseller: input.bestseller,
    new_arrival: input.newArrival,
    on_sale: input.onSale,
    delivery_available: input.deliveryAvailable,
    flower_type: input.flowerType ?? null,
    flower_color: input.flowerColor ?? null,
    stem_count: input.stemCount ? Number(input.stemCount) : null,
    bouquet_size: input.bouquetSize ?? null,
    occasion: input.occasion ?? null,
    fragrance: input.fragrance ?? null,
    freshness_information: input.freshnessInformation ?? null,
    plant_type: input.plantType ?? null,
    indoor_outdoor: input.indoorOutdoor ?? null,
    height_cm: input.heightCm ?? null,
    pot_size: input.potSize ?? null,
    sunlight: input.sunlight ?? null,
    watering_frequency: input.wateringFrequency ?? null,
    care_level: input.careLevel ?? null,
    pot_included: input.potIncluded ?? null,
    care_instructions: input.careInstructions ?? null,
  };
}

async function assertUniqueSlugAndSku(
  slug: string,
  sku: string,
  excludeId?: string,
): Promise<string | null> {
  const supabase = await createClient();
  const [bySlug, bySku] = await Promise.all([
    supabase.from("products").select("id").eq("slug", slug).maybeSingle(),
    getProductBySku(supabase, sku),
  ]);
  if (bySlug.data && bySlug.data.id !== excludeId) return "That slug is already in use.";
  if (bySku && bySku.id !== excludeId) return "That SKU is already in use.";
  return null;
}

async function saveRelationsAndSeo(productId: string, input: ProductInput) {
  const supabase = await createClient();
  await Promise.all([
    setProductCategories(supabase, productId, input.categoryIds, input.primaryCategoryId),
    setProductCollections(supabase, productId, input.collectionIds),
    setProductAddons(supabase, productId, input.addonIds),
    input.seoTitle || input.seoDescription
      ? upsertSeoMetadata(supabase, {
          entity_type: "product",
          entity_id: productId,
          seo_title: input.seoTitle ?? null,
          meta_description: input.seoDescription ?? null,
        })
      : Promise.resolve(),
  ]);
}

export async function createProductFromInput(
  raw: ProductInput,
): Promise<{ product: ProductRow } | { error: string }> {
  const input = productSchema.parse(raw);
  const conflict = await assertUniqueSlugAndSku(input.slug, input.sku);
  if (conflict) return { error: conflict };

  const supabase = await createClient();
  const product = await createProduct(supabase, toProductRecord(input));
  await saveRelationsAndSeo(product.id, input);
  return { product };
}

export async function updateProductFromInput(
  id: string,
  raw: ProductInput,
): Promise<{ product: ProductRow } | { error: string }> {
  const input = productSchema.parse(raw);
  const conflict = await assertUniqueSlugAndSku(input.slug, input.sku, id);
  if (conflict) return { error: conflict };

  const supabase = await createClient();
  const product = await updateProduct(supabase, id, toProductRecord(input));
  await saveRelationsAndSeo(id, input);
  return { product };
}

export async function duplicateProductById(id: string): Promise<ProductRow> {
  const data = await getProductForEdit(id);
  if (!data) throw new Error("Product not found");

  const supabase = await createClient();
  const timestamp = Date.now().toString(36);
  const { id: _id, created_at, updated_at, deleted_at, search_vector, ...rest } = data.product;
  void _id;
  void created_at;
  void updated_at;
  void deleted_at;
  void search_vector;

  const copy = await createProduct(supabase, {
    ...rest,
    name: `${data.product.name} (Copy)`,
    slug: `${data.product.slug}-copy-${timestamp}`,
    sku: `${data.product.sku}-COPY-${timestamp}`,
    status: "draft",
    featured: false,
  });

  await Promise.all([
    setProductCategories(supabase, copy.id, data.categoryIds),
    setProductCollections(supabase, copy.id, data.collectionIds),
    setProductAddons(supabase, copy.id, data.addonIds),
  ]);

  return copy;
}

export async function setProductStatus(id: string, status: "draft" | "active" | "archived") {
  const supabase = await createClient();
  return updateProduct(supabase, id, { status });
}

export async function toggleProductFlag(
  id: string,
  flag: "featured" | "bestseller" | "new_arrival" | "on_sale",
  value: boolean,
) {
  const supabase = await createClient();
  return updateProduct(supabase, id, { [flag]: value });
}

export async function archiveProductById(id: string): Promise<void> {
  const supabase = await createClient();
  await archiveProduct(supabase, id);
}

export async function deleteProductById(id: string): Promise<void> {
  const supabase = await createClient();
  await softDeleteProduct(supabase, id);
}
