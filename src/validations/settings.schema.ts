import { z } from "zod";

const optionalText = z.string().trim().optional().transform((v) => (v ? v : undefined));
const optionalUrl = z
  .string()
  .trim()
  .url()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined));
const optionalMoney = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || /^\d+(\.\d{1,2})?$/.test(v), "Enter a valid amount");

export const siteSettingsSchema = z.object({
  siteName: z.string().trim().min(1, "Site name is required").max(150),
  siteDescription: optionalText,
  logoUrl: optionalUrl,
  faviconUrl: optionalUrl,
  defaultSeoTitle: optionalText,
  defaultSeoDescription: optionalText,
  contactEmail: z.string().trim().email().optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  contactPhone: optionalText,
  maintenanceMode: z.boolean().default(false),
});
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

export function parseSiteSettingsFormData(formData: FormData) {
  return siteSettingsSchema.safeParse({
    siteName: formData.get("siteName"),
    siteDescription: formData.get("siteDescription"),
    logoUrl: formData.get("logoUrl"),
    faviconUrl: formData.get("faviconUrl"),
    defaultSeoTitle: formData.get("defaultSeoTitle"),
    defaultSeoDescription: formData.get("defaultSeoDescription"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    maintenanceMode: formData.get("maintenanceMode") === "on",
  });
}

export const storeSettingsSchema = z.object({
  orderNumberPrefix: z.string().trim().min(1).max(10),
  whatsappNumber: optionalText,
  supportEmail: z.string().trim().email().optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  supportPhone: optionalText,
});
export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;

export function parseStoreSettingsFormData(formData: FormData) {
  return storeSettingsSchema.safeParse({
    orderNumberPrefix: formData.get("orderNumberPrefix"),
    whatsappNumber: formData.get("whatsappNumber"),
    supportEmail: formData.get("supportEmail"),
    supportPhone: formData.get("supportPhone"),
  });
}

export const deliverySettingsSchema = z.object({
  freeDeliveryThreshold: optionalMoney,
  sameDayCutoffTime: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  defaultDeliveryFee: optionalMoney.default("0"),
});
export type DeliverySettingsInput = z.infer<typeof deliverySettingsSchema>;

export function parseDeliverySettingsFormData(formData: FormData) {
  return deliverySettingsSchema.safeParse({
    freeDeliveryThreshold: formData.get("freeDeliveryThreshold"),
    sameDayCutoffTime: formData.get("sameDayCutoffTime"),
    defaultDeliveryFee: formData.get("defaultDeliveryFee") || "0",
  });
}

export const paymentSettingsSchema = z.object({
  codEnabled: z.boolean().default(true),
  cardEnabled: z.boolean().default(true),
  testMode: z.boolean().default(true),
});
export type PaymentSettingsInput = z.infer<typeof paymentSettingsSchema>;

export function parsePaymentSettingsFormData(formData: FormData) {
  return paymentSettingsSchema.safeParse({
    codEnabled: formData.get("codEnabled") === "on",
    cardEnabled: formData.get("cardEnabled") === "on",
    testMode: formData.get("testMode") === "on",
  });
}

export const socialLinkSchema = z.object({
  platform: z.enum([
    "instagram",
    "facebook",
    "tiktok",
    "whatsapp",
    "twitter",
    "youtube",
    "pinterest",
    "snapchat",
  ]),
  url: z.string().trim().url("Enter a valid URL"),
});
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;

export function parseSocialLinkFormData(formData: FormData) {
  return socialLinkSchema.safeParse({
    platform: formData.get("platform"),
    url: formData.get("url"),
  });
}
