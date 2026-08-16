import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  listAllAddons,
  getAddonById,
  createAddon,
  updateAddon,
  softDeleteAddon,
} from "@/repositories/addons.repository";
import { addonSchema, type AddonInput } from "@/validations/addon.schema";

export async function listAddonsForAdmin() {
  const supabase = await createClient();
  return listAllAddons(supabase);
}

export async function getAddonForEdit(id: string) {
  const supabase = await createClient();
  return getAddonById(supabase, id);
}

async function assertUniqueAddonSlug(slug: string, excludeId?: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("addons").select("id").eq("slug", slug).maybeSingle();
  if (data && data.id !== excludeId) return "That slug is already in use.";
  return null;
}

function toRecord(input: AddonInput) {
  return {
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    price: input.price,
    image_url: input.imageUrl ?? null,
    stock_quantity: input.stockQuantity ? Number(input.stockQuantity) : null,
    is_active: input.isActive,
  };
}

export async function createAddonFromInput(raw: AddonInput) {
  const input = addonSchema.parse(raw);
  const conflict = await assertUniqueAddonSlug(input.slug);
  if (conflict) return { error: conflict };
  const supabase = await createClient();
  const addon = await createAddon(supabase, toRecord(input));
  return { addon };
}

export async function updateAddonFromInput(id: string, raw: AddonInput) {
  const input = addonSchema.parse(raw);
  const conflict = await assertUniqueAddonSlug(input.slug, id);
  if (conflict) return { error: conflict };
  const supabase = await createClient();
  const addon = await updateAddon(supabase, id, toRecord(input));
  return { addon };
}

export async function deleteAddonById(id: string) {
  const supabase = await createClient();
  await softDeleteAddon(supabase, id);
}
