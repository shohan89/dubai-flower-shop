import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminAccess } from "@/services/authorization.service";
import { listCustomersForAdmin } from "@/services/customer.service";
import { DataTable, type DataTableColumn } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/pagination";
import { SearchInput } from "@/components/data-table/search-input";
import { TableToolbar } from "@/components/data-table/table-toolbar";
import { getParam, getPage, type TableSearchParams } from "@/lib/admin/table-params";
import type { Database } from "@/types/database.types";

export const metadata: Metadata = {
  title: "Customers",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 25;
const BASE_PATH = "/admin/customers";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<TableSearchParams>;
}) {
  await requireAdminAccess("customers");
  const params = await searchParams;
  const page = getPage(params);
  const search = getParam(params, "q");

  const { rows, totalCount } = await listCustomersForAdmin({ search, page, pageSize: PAGE_SIZE });

  const columns: DataTableColumn<ProfileRow>[] = [
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <Link href={`/admin/customers/${row.id}`} className="font-medium hover:underline">
          {row.full_name ?? "—"}
        </Link>
      ),
    },
    { key: "email", label: "Email", render: (row) => row.email },
    { key: "phone", label: "Phone", render: (row) => row.phone ?? "—" },
    {
      key: "joined",
      label: "Joined",
      render: (row) => new Date(row.created_at).toLocaleDateString("en-AE"),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl text-foreground">Customers</h1>
        <p className="text-sm text-muted-foreground">{totalCount} total</p>
      </div>

      <TableToolbar basePath={BASE_PATH} searchParams={params}>
        <SearchInput defaultValue={search} placeholder="Search name or email…" />
      </TableToolbar>

      <DataTable columns={columns} rows={rows} getRowId={(row) => row.id} emptyMessage="No customers found." />
      <DataTablePagination basePath={BASE_PATH} searchParams={params} page={page} pageSize={PAGE_SIZE} totalCount={totalCount} />
    </div>
  );
}
