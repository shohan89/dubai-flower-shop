import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdminAccess } from "@/services/authorization.service";
import { listProductsForAdmin } from "@/services/product.service";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/pagination";
import { SearchInput } from "@/components/data-table/search-input";
import { FilterSelect } from "@/components/data-table/filter-select";
import { TableToolbar } from "@/components/data-table/table-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProductRowActions } from "@/components/admin/products/product-row-actions";
import { productStatusTone } from "@/lib/admin/status-tones";
import { getParam, getPage, getSort, type TableSearchParams } from "@/lib/admin/table-params";
import { PRODUCT_STATUSES, PRODUCT_TYPES } from "@/constants/product-options";
import type { Database } from "@/types/database.types";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;
const BASE_PATH = "/admin/products";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<TableSearchParams>;
}) {
  await requireAdminAccess("products");
  const params = await searchParams;

  const page = getPage(params);
  const { key: sortKey, dir: sortDir } = getSort(params);
  const search = getParam(params, "q");
  const status = getParam(params, "status");
  const productType = getParam(params, "type");

  const { rows, totalCount } = await listProductsForAdmin({
    search,
    status,
    productType,
    page,
    pageSize: PAGE_SIZE,
    sortKey: sortKey ?? undefined,
    sortDir,
  });

  const columns: DataTableColumn<ProductRow>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (row) => (
        <Link href={`/admin/products/${row.id}`} className="font-medium hover:underline">
          {row.name}
        </Link>
      ),
    },
    { key: "sku", label: "SKU", render: (row) => <span className="font-mono text-xs">{row.sku}</span> },
    { key: "product_type", label: "Type", render: (row) => row.product_type },
    {
      key: "base_price",
      label: "Price",
      sortable: true,
      render: (row) => `AED ${row.base_price}`,
    },
    {
      key: "stock_quantity",
      label: "Stock",
      sortable: true,
      render: (row) => (
        <span className={row.stock_quantity <= row.low_stock_threshold ? "text-destructive" : ""}>
          {row.stock_quantity}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => <StatusBadge label={row.status} tone={productStatusTone(row.status)} />,
    },
    {
      key: "actions",
      label: "",
      className: "w-10",
      render: (row) => (
        <ProductRowActions
          id={row.id}
          status={row.status}
          featured={row.featured}
          bestseller={row.bestseller}
          newArrival={row.new_arrival}
          onSale={row.on_sale}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">{totalCount} total</p>
        </div>
        <Button
          nativeButton={false}
          render={
            <Link href="/admin/products/new">
              <Plus className="size-4" />
              New product
            </Link>
          }
        />
      </div>

      <TableToolbar basePath={BASE_PATH} searchParams={params}>
        <SearchInput defaultValue={search} placeholder="Search name, SKU, slug…" />
        <FilterSelect
          name="status"
          label="Status"
          defaultValue={status}
          options={PRODUCT_STATUSES.map((s) => ({ value: s, label: s }))}
        />
        <FilterSelect
          name="type"
          label="Type"
          defaultValue={productType}
          options={PRODUCT_TYPES.map((t) => ({ value: t, label: t }))}
        />
      </TableToolbar>

      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        basePath={BASE_PATH}
        searchParams={params}
        emptyMessage="No products found."
      />
      <DataTablePagination
        basePath={BASE_PATH}
        searchParams={params}
        page={page}
        pageSize={PAGE_SIZE}
        totalCount={totalCount}
      />
    </div>
  );
}
