/** Mirrors the CHECK constraints in supabase/migrations/*_products.sql. */

export const PRODUCT_TYPES = [
  "flower",
  "bouquet",
  "plant",
  "gift",
  "arrangement",
  "addon",
] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const PRODUCT_STATUSES = ["draft", "active", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const BOUQUET_SIZES = ["small", "medium", "large", "deluxe"] as const;
export const INDOOR_OUTDOOR_OPTIONS = ["indoor", "outdoor", "both"] as const;
export const SUNLIGHT_OPTIONS = ["full_sun", "partial_sun", "shade"] as const;
export const CARE_LEVELS = ["easy", "moderate", "difficult"] as const;

export const FLOWER_PRODUCT_TYPES: readonly string[] = ["flower", "bouquet", "arrangement"];
export const PLANT_PRODUCT_TYPES: readonly string[] = ["plant"];
