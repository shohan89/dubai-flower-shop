import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type InventoryRow = Database["public"]["Tables"]["inventory"]["Row"];

export type InventoryListItem = InventoryRow & {
  productName: string;
  productSku: string;
  variantName: string | null;
};

export async function listInventory(
  supabase: SupabaseClient<Database>,
  { search, lowStockOnly, page, pageSize }: { search?: string; lowStockOnly?: boolean; page: number; pageSize: number },
): Promise<{ rows: InventoryListItem[]; totalCount: number }> {
  let query = supabase.from("inventory").select("*", { count: "exact" });
  query = query.order("updated_at", { ascending: false });

  const from = (page - 1) * pageSize;
  const { data: invRows, error, count } = await query.range(from, from + pageSize - 1);
  if (error) throw error;

  const productIds = Array.from(new Set((invRows ?? []).map((row) => row.product_id)));
  const variantIds = Array.from(
    new Set((invRows ?? []).map((row) => row.variant_id).filter((id): id is string => Boolean(id))),
  );

  const [{ data: products, error: productsError }, { data: variants, error: variantsError }] =
    await Promise.all([
      productIds.length
        ? supabase.from("products").select("id, name, sku").in("id", productIds)
        : Promise.resolve({ data: [], error: null }),
      variantIds.length
        ? supabase.from("product_variants").select("id, name").in("id", variantIds)
        : Promise.resolve({ data: [], error: null }),
    ]);
  if (productsError) throw productsError;
  if (variantsError) throw variantsError;

  const productMap = new Map((products ?? []).map((p) => [p.id, p]));
  const variantMap = new Map((variants ?? []).map((v) => [v.id, v]));

  let rows: InventoryListItem[] = (invRows ?? []).map((row) => ({
    ...row,
    productName: productMap.get(row.product_id)?.name ?? "Unknown product",
    productSku: productMap.get(row.product_id)?.sku ?? "",
    variantName: row.variant_id ? (variantMap.get(row.variant_id)?.name ?? null) : null,
  }));

  if (search) {
    const term = search.toLowerCase();
    rows = rows.filter(
      (row) =>
        row.productName.toLowerCase().includes(term) || row.productSku.toLowerCase().includes(term),
    );
  }
  if (lowStockOnly) {
    rows = rows.filter((row) => row.quantity_available <= row.low_stock_threshold);
  }

  return { rows, totalCount: count ?? 0 };
}

export async function countLowStockInventory(supabase: SupabaseClient<Database>): Promise<number> {
  const { data, error } = await supabase
    .from("inventory")
    .select("quantity_on_hand, quantity_reserved, low_stock_threshold");
  if (error) throw error;
  return (data ?? []).filter((row) => row.quantity_on_hand - row.quantity_reserved <= row.low_stock_threshold)
    .length;
}
