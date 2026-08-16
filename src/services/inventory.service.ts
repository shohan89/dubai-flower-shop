import "server-only";
import { createClient } from "@/lib/supabase/server";
import { listInventory, countLowStockInventory } from "@/repositories/inventory.repository";

export async function listInventoryForAdmin(params: {
  search?: string;
  lowStockOnly?: boolean;
  page: number;
  pageSize: number;
}) {
  const supabase = await createClient();
  return listInventory(supabase, params);
}

export async function getLowStockCount(): Promise<number> {
  const supabase = await createClient();
  return countLowStockInventory(supabase);
}

export async function adjustInventoryQuantity(
  inventoryId: string,
  quantityDelta: number,
  reason: "purchase_order" | "return" | "adjustment" | "damaged" | "initial_stock",
  createdBy: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("adjust_inventory", {
    _inventory_id: inventoryId,
    _quantity_delta: quantityDelta,
    _reason: reason,
    _created_by: createdBy,
  });
  if (error) throw error;
  return data;
}
