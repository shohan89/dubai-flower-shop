import type { Metadata } from "next";
import { requireAdminAccess } from "@/services/authorization.service";
import { listReviewsForAdmin } from "@/services/review.service";
import { ReviewsClient } from "@/components/admin/reviews/reviews-client";
import { TableToolbar } from "@/components/data-table/table-toolbar";
import { FilterSelect } from "@/components/data-table/filter-select";
import { DataTablePagination } from "@/components/data-table/pagination";
import { getParam, getPage, type TableSearchParams } from "@/lib/admin/table-params";

export const metadata: Metadata = {
  title: "Reviews",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;
const BASE_PATH = "/admin/reviews";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<TableSearchParams>;
}) {
  await requireAdminAccess("reviews");
  const params = await searchParams;
  const page = getPage(params);
  const status = getParam(params, "status");

  const { rows, totalCount } = await listReviewsForAdmin({ status, page, pageSize: PAGE_SIZE });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl text-foreground">Reviews</h1>
        <p className="text-sm text-muted-foreground">{totalCount} total</p>
      </div>

      <TableToolbar basePath={BASE_PATH} searchParams={params}>
        <FilterSelect
          name="status"
          label="Status"
          defaultValue={status}
          options={[
            { value: "pending", label: "pending" },
            { value: "approved", label: "approved" },
            { value: "rejected", label: "rejected" },
          ]}
        />
      </TableToolbar>

      <ReviewsClient reviews={rows} />
      <DataTablePagination basePath={BASE_PATH} searchParams={params} page={page} pageSize={PAGE_SIZE} totalCount={totalCount} />
    </div>
  );
}
