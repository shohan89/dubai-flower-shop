import type { Metadata } from "next";
import { requireAdminAccess } from "@/services/authorization.service";
import { listSlotsForAdmin } from "@/services/delivery.service";
import { SlotsClient } from "@/components/admin/delivery/slots-client";

export const metadata: Metadata = {
  title: "Delivery slots",
  robots: { index: false, follow: false },
};

export default async function AdminDeliverySlotsPage() {
  await requireAdminAccess("delivery");
  const slots = await listSlotsForAdmin();
  return <SlotsClient slots={slots} />;
}
