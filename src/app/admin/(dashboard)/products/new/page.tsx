import type { Metadata } from "next";
import { requireAdminAccess } from "@/services/authorization.service";
import { getAllCategoriesForPicker } from "@/services/category.service";
import { getAllCollectionsForPicker } from "@/services/collection.service";
import { listAddonsForAdmin } from "@/services/addon.service";
import { ProductForm } from "@/components/admin/products/product-form";
import { createProductAction } from "@/app/admin/(dashboard)/products/actions";

export const metadata: Metadata = {
  title: "New product",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  await requireAdminAccess("products");

  const [allCategories, allCollections, allAddons] = await Promise.all([
    getAllCategoriesForPicker(),
    getAllCollectionsForPicker(),
    listAddonsForAdmin(),
  ]);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-foreground">New product</h1>
        <p className="text-sm text-muted-foreground">
          Images, variants, and inventory adjustments become available after you save.
        </p>
      </div>
      <ProductForm
        allCategories={allCategories}
        allCollections={allCollections}
        allAddons={allAddons}
        action={createProductAction}
      />
    </div>
  );
}
