import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminAccess } from "@/services/authorization.service";
import { listOrdersForAdmin } from "@/services/order.service";
import { DataTable, type DataTableColumn } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/pagination";
import { SearchInput } from "@/components/data-table/search-input";
import { FilterSelect } from "@/components/data-table/filter-select";
import { TableToolbar } from "@/components/data-table/table-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { orderStatusTone, paymentStatusTone } from "@/lib/admin/status-tones";
import { getParam, getPage, getSort, type TableSearchParams } from "@/lib/admin/table-params";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/constants/order-status";
import type { Database } from "@/types/database.types";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;
const BASE_PATH = "/admin/orders";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<TableSearchParams>;
}) {
  await requireAdminAccess("orders");
  const params = await searchParams;

  const page = getPage(params);
  const { key: sortKey, dir: sortDir } = getSort(params);
  const search = getParam(params, "q");
  const status = getParam(params, "status");
  const paymentStatus = getParam(params, "payment");

  const { rows, totalCount } = await listOrdersForAdmin({
    search,
    status,
    paymentStatus,
    page,
    pageSize: PAGE_SIZE,
    sortKey: sortKey ?? undefined,
    sortDir,
  });

  const columns: DataTableColumn<OrderRow>[] = [
    {
      key: "order_number",
      label: "Order",
      sortable: true,
      render: (row) => (
        <Link href={`/admin/orders/${row.id}`} className="font-mono text-xs font-medium hover:underline">
          {row.order_number}
        </Link>
      ),
    },
    { key: "customer_name", label: "Customer", render: (row) => row.customer_name },
    {
      key: "placed_at",
      label: "Placed",
      sortable: true,
      render: (row) => new Date(row.placed_at).toLocaleString("en-AE"),
    },
    { key: "total", label: "Total", sortable: true, render: (row) => `AED ${row.total}` },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => <StatusBadge label={row.status} tone={orderStatusTone(row.status)} />,
    },
    {
      key: "payment_status",
      label: "Payment",
      sortable: true,
      render: (row) => <StatusBadge label={row.payment_status} tone={paymentStatusTone(row.payment_status)} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground">{totalCount} total</p>
      </div>

      <TableToolbar basePath={BASE_PATH} searchParams={params}>
        <SearchInput defaultValue={search} placeholder="Order #, customer name, email…" />
        <FilterSelect
          name="status"
          label="Status"
          defaultValue={status}
          options={ORDER_STATUSES.map((s) => ({ value: s, label: s }))}
        />
        <FilterSelect
          name="payment"
          label="Payment"
          defaultValue={paymentStatus}
          options={PAYMENT_STATUSES.map((s) => ({ value: s, label: s }))}
        />
      </TableToolbar>

      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        basePath={BASE_PATH}
        searchParams={params}
        emptyMessage="No orders found."
      />
      <DataTablePagination basePath={BASE_PATH} searchParams={params} page={page} pageSize={PAGE_SIZE} totalCount={totalCount} />
    </div>
  );
}
