import type { Metadata } from "next";
import { requireAdminAccess } from "@/services/authorization.service";
import { getAllCollectionsForPicker } from "@/services/collection.service";
import { CollectionsClient } from "@/components/admin/collections/collections-client";

export const metadata: Metadata = {
  title: "Collections",
  robots: { index: false, follow: false },
};

export default async function AdminCollectionsPage() {
  await requireAdminAccess("products");
  const collections = await getAllCollectionsForPicker();
  return <CollectionsClient collections={collections} />;
}
