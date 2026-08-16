import type { Metadata } from "next";
import { requireAdminAccess } from "@/services/authorization.service";
import { listCouponsForAdmin } from "@/services/coupon.service";
import { CouponsClient } from "@/components/admin/coupons/coupons-client";
import { getParam, getPage, type TableSearchParams } from "@/lib/admin/table-params";

export const metadata: Metadata = {
  title: "Coupons",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 25;

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<TableSearchParams>;
}) {
  await requireAdminAccess("coupons");
  const params = await searchParams;
  const page = getPage(params);
  const search = getParam(params, "q");

  const { rows, totalCount } = await listCouponsForAdmin({ search, page, pageSize: PAGE_SIZE });

  return (
    <CouponsClient coupons={rows} page={page} pageSize={PAGE_SIZE} totalCount={totalCount} searchParams={params} />
  );
}
