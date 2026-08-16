import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type ZoneRow = Database["public"]["Tables"]["delivery_zones"]["Row"];
type ZoneInsert = Database["public"]["Tables"]["delivery_zones"]["Insert"];
type ZoneUpdate = Database["public"]["Tables"]["delivery_zones"]["Update"];
type AreaRow = Database["public"]["Tables"]["delivery_zone_areas"]["Row"];
type SlotRow = Database["public"]["Tables"]["delivery_slots"]["Row"];
type SlotInsert = Database["public"]["Tables"]["delivery_slots"]["Insert"];
type SlotUpdate = Database["public"]["Tables"]["delivery_slots"]["Update"];

// --- Zones ---

export async function listZones(supabase: SupabaseClient<Database>): Promise<ZoneRow[]> {
  const { data, error } = await supabase
    .from("delivery_zones")
    .select("*")
    .is("deleted_at", null)
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createZone(
  supabase: SupabaseClient<Database>,
  input: ZoneInsert,
): Promise<ZoneRow> {
  const { data, error } = await supabase.from("delivery_zones").insert(input).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateZone(
  supabase: SupabaseClient<Database>,
  id: string,
  patch: ZoneUpdate,
): Promise<ZoneRow> {
  const { data, error } = await supabase
    .from("delivery_zones")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function softDeleteZone(supabase: SupabaseClient<Database>, id: string): Promise<void> {
  const { error } = await supabase
    .from("delivery_zones")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", id);
  if (error) throw error;
}

// --- Zone areas ---

export async function listAreasForZone(
  supabase: SupabaseClient<Database>,
  zoneId: string,
): Promise<AreaRow[]> {
  const { data, error } = await supabase
    .from("delivery_zone_areas")
    .select("*")
    .eq("delivery_zone_id", zoneId)
    .order("area_name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addAreaToZone(
  supabase: SupabaseClient<Database>,
  zoneId: string,
  areaName: string,
  postcode?: string,
): Promise<AreaRow> {
  const { data, error } = await supabase
    .from("delivery_zone_areas")
    .insert({ delivery_zone_id: zoneId, area_name: areaName, postcode: postcode ?? null })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function removeArea(supabase: SupabaseClient<Database>, areaId: string): Promise<void> {
  const { error } = await supabase.from("delivery_zone_areas").delete().eq("id", areaId);
  if (error) throw error;
}

// --- Slots ---

export async function listSlots(supabase: SupabaseClient<Database>): Promise<SlotRow[]> {
  const { data, error } = await supabase
    .from("delivery_slots")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createSlot(
  supabase: SupabaseClient<Database>,
  input: SlotInsert,
): Promise<SlotRow> {
  const { data, error } = await supabase.from("delivery_slots").insert(input).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateSlot(
  supabase: SupabaseClient<Database>,
  id: string,
  patch: SlotUpdate,
): Promise<SlotRow> {
  const { data, error } = await supabase
    .from("delivery_slots")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSlot(supabase: SupabaseClient<Database>, id: string): Promise<void> {
  const { error } = await supabase.from("delivery_slots").delete().eq("id", id);
  if (error) throw error;
}
