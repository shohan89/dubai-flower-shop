import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminAccess } from "@/services/authorization.service";
import { getProductForEdit } from "@/services/product.service";
import { getAllCategoriesForPicker } from "@/services/category.service";
import { getAllCollectionsForPicker } from "@/services/collection.service";
import { listAddonsForAdmin } from "@/services/addon.service";
import { ProductForm } from "@/components/admin/products/product-form";
import { ProductImagesSection } from "@/components/admin/products/product-images-section";
import { ProductVariantsSection } from "@/components/admin/products/product-variants-section";
import { updateProductAction } from "@/app/admin/(dashboard)/products/actions";

export const metadata: Metadata = {
  title: "Edit product",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminAccess("products");
  const { id } = await params;

  const [data, allCategories, allCollections, allAddons] = await Promise.all([
    getProductForEdit(id),
    getAllCategoriesForPicker(),
    getAllCollectionsForPicker(),
    listAddonsForAdmin(),
  ]);

  if (!data) notFound();

  const boundAction = updateProductAction.bind(null, id);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-foreground">{data.product.name}</h1>
        <p className="font-mono text-xs text-muted-foreground">{data.product.sku}</p>
      </div>

      <ProductImagesSection productId={id} images={data.images} />
      <ProductVariantsSection productId={id} variants={data.variants} />

      <ProductForm
        product={data.product}
        seo={data.seo}
        categoryIds={data.categoryIds}
        primaryCategoryId={data.primaryCategoryId ?? undefined}
        collectionIds={data.collectionIds}
        addonIds={data.addonIds}
        allCategories={allCategories}
        allCollections={allCollections}
        allAddons={allAddons}
        action={boundAction}
      />
    </div>
  );
}
