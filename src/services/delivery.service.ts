import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  listZones,
  createZone,
  updateZone,
  softDeleteZone,
  listAreasForZone,
  addAreaToZone,
  removeArea,
  listSlots,
  createSlot,
  updateSlot,
  deleteSlot,
} from "@/repositories/delivery.repository";
import {
  deliveryZoneSchema,
  deliverySlotSchema,
  type DeliveryZoneInput,
  type DeliverySlotInput,
} from "@/validations/delivery.schema";

// --- Zones ---

export async function listZonesForAdmin() {
  const supabase = await createClient();
  return listZones(supabase);
}

export async function listZonesWithAreas() {
  const supabase = await createClient();
  const zones = await listZones(supabase);
  const areasByZone = await Promise.all(zones.map((zone) => listAreasForZone(supabase, zone.id)));
  return zones.map((zone, index) => ({ zone, areas: areasByZone[index] }));
}

function zoneRecord(input: DeliveryZoneInput) {
  return {
    name: input.name,
    description: input.description ?? null,
    base_delivery_fee: input.baseDeliveryFee,
    minimum_order_amount: input.minimumOrderAmount,
    same_day_available: input.sameDayAvailable,
    is_active: input.isActive,
  };
}

export async function createZoneFromInput(raw: DeliveryZoneInput) {
  const input = deliveryZoneSchema.parse(raw);
  const supabase = await createClient();
  return createZone(supabase, zoneRecord(input));
}

export async function updateZoneFromInput(id: string, raw: DeliveryZoneInput) {
  const input = deliveryZoneSchema.parse(raw);
  const supabase = await createClient();
  return updateZone(supabase, id, zoneRecord(input));
}

export async function deleteZoneById(id: string) {
  const supabase = await createClient();
  await softDeleteZone(supabase, id);
}

export async function addZoneArea(zoneId: string, areaName: string, postcode?: string) {
  const supabase = await createClient();
  return addAreaToZone(supabase, zoneId, areaName, postcode);
}

export async function removeZoneArea(areaId: string) {
  const supabase = await createClient();
  await removeArea(supabase, areaId);
}

// --- Slots ---

export async function listSlotsForAdmin() {
  const supabase = await createClient();
  return listSlots(supabase);
}

function slotRecord(input: DeliverySlotInput) {
  return {
    label: input.label,
    start_time: input.startTime,
    end_time: input.endTime,
    is_same_day: input.isSameDay,
    extra_fee: input.extraFee,
    display_order: input.displayOrder,
    is_active: input.isActive,
  };
}

export async function createSlotFromInput(raw: DeliverySlotInput) {
  const input = deliverySlotSchema.parse(raw);
  if (input.endTime <= input.startTime) return { error: "End time must be after start time." };
  const supabase = await createClient();
  const slot = await createSlot(supabase, slotRecord(input));
  return { slot };
}

export async function updateSlotFromInput(id: string, raw: DeliverySlotInput) {
  const input = deliverySlotSchema.parse(raw);
  if (input.endTime <= input.startTime) return { error: "End time must be after start time." };
  const supabase = await createClient();
  const slot = await updateSlot(supabase, id, slotRecord(input));
  return { slot };
}

export async function deleteSlotById(id: string) {
  const supabase = await createClient();
  await deleteSlot(supabase, id);
}
