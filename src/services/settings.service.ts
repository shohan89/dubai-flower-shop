import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  getSiteSettings,
  saveSiteSettings,
  getStoreSettings,
  saveStoreSettings,
  getDeliverySettings,
  saveDeliverySettings,
  getPaymentSettings,
  savePaymentSettings,
  listSocialLinks,
  upsertSocialLink,
  deleteSocialLink,
} from "@/repositories/settings.repository";
import {
  siteSettingsSchema,
  storeSettingsSchema,
  deliverySettingsSchema,
  paymentSettingsSchema,
  socialLinkSchema,
  type SiteSettingsInput,
  type StoreSettingsInput,
  type DeliverySettingsInput,
  type PaymentSettingsInput,
  type SocialLinkInput,
} from "@/validations/settings.schema";

export async function getAllSettings() {
  const supabase = await createClient();
  const [site, store, delivery, payment, socialLinks] = await Promise.all([
    getSiteSettings(supabase),
    getStoreSettings(supabase),
    getDeliverySettings(supabase),
    getPaymentSettings(supabase),
    listSocialLinks(supabase),
  ]);
  return { site, store, delivery, payment, socialLinks };
}

export async function saveSiteSettingsFromInput(raw: SiteSettingsInput) {
  const input = siteSettingsSchema.parse(raw);
  const supabase = await createClient();
  return saveSiteSettings(supabase, {
    site_name: input.siteName,
    site_description: input.siteDescription ?? null,
    logo_url: input.logoUrl ?? null,
    favicon_url: input.faviconUrl ?? null,
    default_seo_title: input.defaultSeoTitle ?? null,
    default_seo_description: input.defaultSeoDescription ?? null,
    contact_email: input.contactEmail ?? null,
    contact_phone: input.contactPhone ?? null,
    maintenance_mode: input.maintenanceMode,
  });
}

export async function saveStoreSettingsFromInput(raw: StoreSettingsInput) {
  const input = storeSettingsSchema.parse(raw);
  const supabase = await createClient();
  return saveStoreSettings(supabase, {
    order_number_prefix: input.orderNumberPrefix,
    whatsapp_number: input.whatsappNumber ?? null,
    support_email: input.supportEmail ?? null,
    support_phone: input.supportPhone ?? null,
  });
}

export async function saveDeliverySettingsFromInput(raw: DeliverySettingsInput) {
  const input = deliverySettingsSchema.parse(raw);
  const supabase = await createClient();
  return saveDeliverySettings(supabase, {
    free_delivery_threshold: input.freeDeliveryThreshold ?? null,
    same_day_cutoff_time: input.sameDayCutoffTime ?? null,
    default_delivery_fee: input.defaultDeliveryFee,
  });
}

export async function savePaymentSettingsFromInput(raw: PaymentSettingsInput) {
  const input = paymentSettingsSchema.parse(raw);
  const supabase = await createClient();
  const enabledProviders = [
    input.codEnabled ? "cod" : null,
    input.cardEnabled ? "card" : null,
  ].filter((v): v is string => Boolean(v));
  return savePaymentSettings(supabase, {
    cod_enabled: input.codEnabled,
    card_enabled: input.cardEnabled,
    test_mode: input.testMode,
    enabled_providers: enabledProviders,
  });
}

export async function saveSocialLinkFromInput(raw: SocialLinkInput) {
  const input = socialLinkSchema.parse(raw);
  const supabase = await createClient();
  return upsertSocialLink(supabase, { platform: input.platform, url: input.url });
}

export async function deleteSocialLinkById(id: string) {
  const supabase = await createClient();
  await deleteSocialLink(supabase, id);
}
