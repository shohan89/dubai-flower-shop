import type { Metadata } from "next";
import { requireAdminAccess } from "@/services/authorization.service";
import { listInventoryForAdmin } from "@/services/inventory.service";
import { DataTablePagination } from "@/components/data-table/pagination";
import { TableToolbar } from "@/components/data-table/table-toolbar";
import { SearchInput } from "@/components/data-table/search-input";
import { InventoryClient } from "@/components/admin/inventory/inventory-client";
import { getParam, getPage, type TableSearchParams } from "@/lib/admin/table-params";

export const metadata: Metadata = {
  title: "Inventory",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 25;
const BASE_PATH = "/admin/inventory";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<TableSearchParams>;
}) {
  await requireAdminAccess("inventory");
  const params = await searchParams;
  const page = getPage(params);
  const search = getParam(params, "q");
  const lowStockOnly = getParam(params, "low") === "1";

  const { rows, totalCount } = await listInventoryForAdmin({
    search,
    lowStockOnly,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl text-foreground">Inventory</h1>
        <p className="text-sm text-muted-foreground">{totalCount} tracked items</p>
      </div>

      <TableToolbar basePath={BASE_PATH} searchParams={params}>
        <SearchInput defaultValue={search} placeholder="Search product or SKU…" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="low" value="1" defaultChecked={lowStockOnly} />
          Low stock only
        </label>
      </TableToolbar>

      <InventoryClient rows={rows} />
      <DataTablePagination basePath={BASE_PATH} searchParams={params} page={page} pageSize={PAGE_SIZE} totalCount={totalCount} />
    </div>
  );
}
