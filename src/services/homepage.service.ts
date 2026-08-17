import { createClient } from "@/lib/supabase/server";
import { listEnabledHomepageSections } from "@/repositories/homepage.repository";
import {
  listStorefrontProducts,
  getPrimaryImagesForProducts,
  listDistinctOccasions,
} from "@/repositories/storefront-products.repository";
import { listAllCategories } from "@/repositories/categories.repository";
import { listAllAddons } from "@/repositories/addons.repository";
import { listActiveFaqs } from "@/repositories/faq.repository";
import type { Database, Json } from "@/types/database.types";

type HomepageSectionRow = Database["public"]["Tables"]["homepage_sections"]["Row"];
export type ProductCardData = Database["public"]["Tables"]["products"]["Row"] & { imageUrl: string | null };

// Each member has its own single-literal `type` — deliberately not
// merging several types onto one member with a wider `type` union (e.g.
// "featured_products" | "bestsellers"), even where the payload shape is
// identical: `Extract<ResolvedSection, { type: "newsletter" }>` only
// narrows correctly when every member's `type` is a single literal. A
// wider member type is a superset of the target, which fails the
// `extends` check Extract relies on and silently resolves to `never`.
export type ResolvedSection =
  | { row: HomepageSectionRow; type: "hero"; content: { imageUrl?: string; mobileImageUrl?: string } }
  | { row: HomepageSectionRow; type: "category_grid"; categories: Database["public"]["Tables"]["categories"]["Row"][] }
  | { row: HomepageSectionRow; type: "featured_products"; products: ProductCardData[] }
  | { row: HomepageSectionRow; type: "bestsellers"; products: ProductCardData[] }
  | { row: HomepageSectionRow; type: "trending_products"; products: ProductCardData[] }
  | { row: HomepageSectionRow; type: "plant_section"; products: ProductCardData[] }
  | { row: HomepageSectionRow; type: "collection_showcase"; products: ProductCardData[] }
  | { row: HomepageSectionRow; type: "occasion"; occasions: string[] }
  | { row: HomepageSectionRow; type: "gift_addons"; addons: Database["public"]["Tables"]["addons"]["Row"][] }
  | { row: HomepageSectionRow; type: "testimonials"; testimonials: { author: string; body: string; rating: number }[] }
  | { row: HomepageSectionRow; type: "faq"; faqs: Database["public"]["Tables"]["faqs"]["Row"][] }
  | { row: HomepageSectionRow; type: "promo_banner"; content: Record<string, Json> }
  | { row: HomepageSectionRow; type: "newsletter"; content: Record<string, Json> }
  | { row: HomepageSectionRow; type: "banner_grid"; content: Record<string, Json> }
  | { row: HomepageSectionRow; type: "custom_html"; content: Record<string, Json> }
  | { row: HomepageSectionRow; type: "rich_text"; content: Record<string, Json> };

function asRecord(content: Json): Record<string, Json> {
  return content && typeof content === "object" && !Array.isArray(content)
    ? (content as Record<string, Json>)
    : {};
}

export async function getResolvedHomepageSections(): Promise<ResolvedSection[]> {
  const supabase = await createClient();
  const sections = await listEnabledHomepageSections(supabase);

  const resolved: ResolvedSection[] = [];

  for (const row of sections) {
    const content = asRecord(row.content);

    switch (row.section_type) {
      case "hero": {
        resolved.push({
          row,
          type: "hero",
          content: {
            imageUrl: typeof content.imageUrl === "string" ? content.imageUrl : undefined,
            mobileImageUrl: typeof content.mobileImageUrl === "string" ? content.mobileImageUrl : undefined,
          },
        });
        break;
      }
      case "category_grid": {
        const slugs = Array.isArray(content.category_slugs)
          ? (content.category_slugs.filter((s): s is string => typeof s === "string"))
          : [];
        const allCategories = await listAllCategories(supabase);
        const categories =
          slugs.length > 0
            ? allCategories.filter((c) => slugs.includes(c.slug))
            : allCategories.slice(0, 6);
        resolved.push({ row, type: "category_grid", categories });
        break;
      }
      case "featured_products":
      case "bestsellers":
      case "trending_products":
      case "plant_section": {
        const limit = typeof content.limit === "number" ? content.limit : 8;
        const { rows } = await listStorefrontProducts(supabase, {
          page: 1,
          pageSize: limit,
          productTypes: row.section_type === "plant_section" ? ["plant"] : undefined,
          sort:
            row.section_type === "bestsellers"
              ? "bestselling"
              : row.section_type === "trending_products"
                ? "newest"
                : undefined,
        });
        const filtered =
          row.section_type === "featured_products"
            ? rows.filter((p) => p.featured)
            : row.section_type === "bestsellers"
              ? rows.filter((p) => p.bestseller)
              : rows;
        const images = await getPrimaryImagesForProducts(supabase, filtered.map((p) => p.id));
        resolved.push({
          row,
          type: row.section_type as "featured_products" | "bestsellers" | "trending_products" | "plant_section",
          products: filtered.map((p) => ({ ...p, imageUrl: images.get(p.id) ?? null })),
        });
        break;
      }
      case "collection_showcase": {
        const collectionSlug = typeof content.collection_slug === "string" ? content.collection_slug : undefined;
        if (!collectionSlug) {
          resolved.push({ row, type: "collection_showcase", products: [] });
          break;
        }
        const limit = typeof content.limit === "number" ? content.limit : 8;
        const { rows } = await listStorefrontProducts(supabase, {
          page: 1,
          pageSize: limit,
          collectionSlug,
        });
        const images = await getPrimaryImagesForProducts(supabase, rows.map((p) => p.id));
        resolved.push({
          row,
          type: "collection_showcase",
          products: rows.map((p) => ({ ...p, imageUrl: images.get(p.id) ?? null })),
        });
        break;
      }
      case "occasion": {
        const occasions = await listDistinctOccasions(supabase);
        resolved.push({ row, type: "occasion", occasions });
        break;
      }
      case "gift_addons": {
        const addons = await listAllAddons(supabase);
        resolved.push({ row, type: "gift_addons", addons });
        break;
      }
      case "testimonials": {
        const raw = Array.isArray(content.testimonials) ? content.testimonials : [];
        const testimonials = raw
          .map((t) => (t && typeof t === "object" ? (t as Record<string, Json>) : null))
          .filter((t): t is Record<string, Json> => t !== null)
          .map((t) => ({
            author: typeof t.author === "string" ? t.author : "Customer",
            body: typeof t.body === "string" ? t.body : "",
            rating: typeof t.rating === "number" ? t.rating : 5,
          }));
        resolved.push({ row, type: "testimonials", testimonials });
        break;
      }
      case "faq": {
        const faqCategoryId = typeof content.faq_category_id === "string" ? content.faq_category_id : undefined;
        const faqs = await listActiveFaqs(supabase, faqCategoryId);
        resolved.push({ row, type: "faq", faqs });
        break;
      }
      default: {
        resolved.push({
          row,
          type: row.section_type as "promo_banner" | "newsletter" | "banner_grid" | "custom_html" | "rich_text",
          content,
        });
      }
    }
  }

  return resolved;
}
