import type { Metadata } from "next";
import { requireAdminAccess } from "@/services/authorization.service";
import { listAddonsForAdmin } from "@/services/addon.service";
import { AddonsClient } from "@/components/admin/addons/addons-client";

export const metadata: Metadata = {
  title: "Add-ons",
  robots: { index: false, follow: false },
};

export default async function AdminAddonsPage() {
  await requireAdminAccess("products");
  const addons = await listAddonsForAdmin();
  return <AddonsClient addons={addons} />;
}
