import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Each settings table is a DB-enforced singleton (unique index on a
 * constant expression — see docs/DATABASE.md). "Get" returns the one row
 * if it exists; "save" updates it when a row already exists, inserts
 * otherwise — there's no natural conflict target to upsert on for a
 * `(true)`-expression unique index via the client, so we branch instead.
 *
 * Deliberately NOT a single generic helper over `keyof Tables`: the
 * Supabase client's `.from()` overloads don't narrow through a generic
 * table-name parameter, so a generic version doesn't type-check. Four
 * short concrete implementations are simpler than fighting that.
 */

export async function getSiteSettings(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.from("site_settings").select("*").maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveSiteSettings(
  supabase: SupabaseClient<Database>,
  patch: Database["public"]["Tables"]["site_settings"]["Update"],
) {
  const existing = await getSiteSettings(supabase);
  const query = existing
    ? supabase.from("site_settings").update(patch).eq("id", existing.id)
    : supabase.from("site_settings").insert(patch);
  const { data, error } = await query.select("*").single();
  if (error) throw error;
  return data;
}

export async function getStoreSettings(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.from("store_settings").select("*").maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveStoreSettings(
  supabase: SupabaseClient<Database>,
  patch: Database["public"]["Tables"]["store_settings"]["Update"],
) {
  const existing = await getStoreSettings(supabase);
  const query = existing
    ? supabase.from("store_settings").update(patch).eq("id", existing.id)
    : supabase.from("store_settings").insert(patch);
  const { data, error } = await query.select("*").single();
  if (error) throw error;
  return data;
}

export async function getDeliverySettings(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.from("delivery_settings").select("*").maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveDeliverySettings(
  supabase: SupabaseClient<Database>,
  patch: Database["public"]["Tables"]["delivery_settings"]["Update"],
) {
  const existing = await getDeliverySettings(supabase);
  const query = existing
    ? supabase.from("delivery_settings").update(patch).eq("id", existing.id)
    : supabase.from("delivery_settings").insert(patch);
  const { data, error } = await query.select("*").single();
  if (error) throw error;
  return data;
}

export async function getPaymentSettings(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.from("payment_settings").select("*").maybeSingle();
  if (error) throw error;
  return data;
}

export async function savePaymentSettings(
  supabase: SupabaseClient<Database>,
  patch: Database["public"]["Tables"]["payment_settings"]["Update"],
) {
  const existing = await getPaymentSettings(supabase);
  const query = existing
    ? supabase.from("payment_settings").update(patch).eq("id", existing.id)
    : supabase.from("payment_settings").insert(patch);
  const { data, error } = await query.select("*").single();
  if (error) throw error;
  return data;
}

export async function listSocialLinks(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function upsertSocialLink(
  supabase: SupabaseClient<Database>,
  input: Database["public"]["Tables"]["social_links"]["Insert"],
) {
  const { data, error } = await supabase
    .from("social_links")
    .upsert(input, { onConflict: "platform" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSocialLink(supabase: SupabaseClient<Database>, id: string) {
  const { error } = await supabase.from("social_links").delete().eq("id", id);
  if (error) throw error;
}
