import { z } from "zod";
import {
  PRODUCT_TYPES,
  PRODUCT_STATUSES,
  BOUQUET_SIZES,
  INDOOR_OUTDOOR_OPTIONS,
  SUNLIGHT_OPTIONS,
  CARE_LEVELS,
} from "@/constants/product-options";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

const money = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || /^\d+(\.\d{1,2})?$/.test(v), "Enter a valid amount");

const requiredMoney = z
  .string()
  .trim()
  .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Enter a valid amount");

const intString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || /^\d+$/.test(v), "Enter a whole number");

export const productSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(200),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  description: optionalText,
  shortDescription: z.string().trim().max(300).optional().transform((v) => (v ? v : undefined)),
  sku: z.string().trim().min(1, "SKU is required").max(64),
  productType: z.enum(PRODUCT_TYPES),
  basePrice: requiredMoney,
  compareAtPrice: money,
  costPrice: money,
  stockQuantity: intString.default("0"),
  lowStockThreshold: intString.default("5"),
  status: z.enum(PRODUCT_STATUSES).default("draft"),
  featured: z.boolean().default(false),
  bestseller: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  onSale: z.boolean().default(false),
  deliveryAvailable: z.boolean().default(true),

  // Flower-specific
  flowerType: optionalText,
  flowerColor: optionalText,
  stemCount: intString,
  bouquetSize: z.enum(BOUQUET_SIZES).optional(),
  occasion: optionalText,
  fragrance: optionalText,
  freshnessInformation: optionalText,

  // Plant-specific
  plantType: optionalText,
  indoorOutdoor: z.enum(INDOOR_OUTDOOR_OPTIONS).optional(),
  heightCm: money,
  potSize: optionalText,
  sunlight: z.enum(SUNLIGHT_OPTIONS).optional(),
  wateringFrequency: optionalText,
  careLevel: z.enum(CARE_LEVELS).optional(),
  potIncluded: z.boolean().optional(),
  careInstructions: optionalText,

  categoryIds: z.array(z.string().uuid()).default([]),
  primaryCategoryId: z.string().uuid().optional(),
  collectionIds: z.array(z.string().uuid()).default([]),
  addonIds: z.array(z.string().uuid()).default([]),

  seoTitle: optionalText,
  seoDescription: optionalText,
});

export type ProductInput = z.infer<typeof productSchema>;

export function parseProductFormData(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    shortDescription: formData.get("shortDescription"),
    sku: formData.get("sku"),
    productType: formData.get("productType"),
    basePrice: formData.get("basePrice"),
    compareAtPrice: formData.get("compareAtPrice"),
    costPrice: formData.get("costPrice"),
    stockQuantity: formData.get("stockQuantity"),
    lowStockThreshold: formData.get("lowStockThreshold"),
    status: formData.get("status"),
    featured: formData.get("featured") === "on",
    bestseller: formData.get("bestseller") === "on",
    newArrival: formData.get("newArrival") === "on",
    onSale: formData.get("onSale") === "on",
    deliveryAvailable: formData.get("deliveryAvailable") === "on",
    flowerType: formData.get("flowerType"),
    flowerColor: formData.get("flowerColor"),
    stemCount: formData.get("stemCount"),
    bouquetSize: formData.get("bouquetSize") || undefined,
    occasion: formData.get("occasion"),
    fragrance: formData.get("fragrance"),
    freshnessInformation: formData.get("freshnessInformation"),
    plantType: formData.get("plantType"),
    indoorOutdoor: formData.get("indoorOutdoor") || undefined,
    heightCm: formData.get("heightCm"),
    potSize: formData.get("potSize"),
    sunlight: formData.get("sunlight") || undefined,
    wateringFrequency: formData.get("wateringFrequency"),
    careLevel: formData.get("careLevel") || undefined,
    potIncluded: formData.get("potIncluded") === "on",
    careInstructions: formData.get("careInstructions"),
    categoryIds: formData.getAll("categoryIds"),
    primaryCategoryId: formData.get("primaryCategoryId") || undefined,
    collectionIds: formData.getAll("collectionIds"),
    addonIds: formData.getAll("addonIds"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
  });
}
