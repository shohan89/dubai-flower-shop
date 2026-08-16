import type { Metadata } from "next";
import { requireAdminAccess } from "@/services/authorization.service";
import { getAllCategoriesForPicker } from "@/services/category.service";
import { CategoriesClient } from "@/components/admin/categories/categories-client";

export const metadata: Metadata = {
  title: "Categories",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  await requireAdminAccess("products");
  const categories = await getAllCategoriesForPicker();
  return <CategoriesClient categories={categories} />;
}
