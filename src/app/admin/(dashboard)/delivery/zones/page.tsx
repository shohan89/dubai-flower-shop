import type { Metadata } from "next";
import { requireAdminAccess } from "@/services/authorization.service";
import { listZonesWithAreas } from "@/services/delivery.service";
import { ZonesClient } from "@/components/admin/delivery/zones-client";

export const metadata: Metadata = {
  title: "Delivery zones",
  robots: { index: false, follow: false },
};

export default async function AdminDeliveryZonesPage() {
  await requireAdminAccess("delivery");
  const zones = await listZonesWithAreas();
  return <ZonesClient zones={zones} />;
}
