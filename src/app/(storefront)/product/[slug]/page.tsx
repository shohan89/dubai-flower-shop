import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductDetail } from "@/services/storefront-product.service";
import { getMyWishlistProductIds } from "@/services/wishlist.service";
import { StorefrontBreadcrumb } from "@/components/storefront/storefront-breadcrumb";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductPurchasePanel } from "@/components/storefront/product-purchase-panel";
import { ProductReviews } from "@/components/storefront/product-reviews";
import { ProductCarousel } from "@/components/storefront/product-carousel";
import { FLOWER_PRODUCT_TYPES, PLANT_PRODUCT_TYPES } from "@/constants/product-options";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductDetail(slug);
  if (!data) return {};
  return {
    title: data.product.name,
    description: data.product.short_description ?? data.product.description ?? undefined,
    openGraph: data.images[0] ? { images: [data.images[0].url] } : undefined,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProductDetail(slug);
  if (!data) notFound();

  const { product, images, variants, addons, primaryCategory, related } = data;
  const wishlistIds = await getMyWishlistProductIds();
  const isFlower = FLOWER_PRODUCT_TYPES.includes(product.product_type);
  const isPlant = PLANT_PRODUCT_TYPES.includes(product.product_type);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <StorefrontBreadcrumb
        items={[
          ...(primaryCategory ? [{ label: primaryCategory.name, href: `/category/${primaryCategory.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={images} productName={product.name} />
        <ProductPurchasePanel
          product={product}
          variants={variants}
          addons={addons}
          isWishlisted={wishlistIds?.has(product.id) ?? false}
        />
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-2">
        {product.description ? (
          <section>
            <h2 className="mb-3 font-heading text-xl text-foreground">Description</h2>
            <div
              className="prose-sm text-sm text-muted-foreground [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </section>
        ) : null}

        {isFlower && (product.freshness_information || product.fragrance || product.stem_count) ? (
          <section>
            <h2 className="mb-3 font-heading text-xl text-foreground">Freshness &amp; Care</h2>
            <dl className="space-y-2 text-sm">
              {product.stem_count ? <DetailRow label="Stem count" value={String(product.stem_count)} /> : null}
              {product.flower_color ? <DetailRow label="Color" value={product.flower_color} /> : null}
              {product.fragrance ? <DetailRow label="Fragrance" value={product.fragrance} /> : null}
              {product.freshness_information ? (
                <p className="pt-2 text-muted-foreground">{product.freshness_information}</p>
              ) : null}
            </dl>
          </section>
        ) : null}

        {isPlant && (product.care_instructions || product.watering_frequency || product.sunlight) ? (
          <section>
            <h2 className="mb-3 font-heading text-xl text-foreground">Plant Care</h2>
            <dl className="space-y-2 text-sm">
              {product.height_cm ? <DetailRow label="Height" value={`${product.height_cm} cm`} /> : null}
              {product.pot_size ? <DetailRow label="Pot size" value={product.pot_size} /> : null}
              {product.sunlight ? <DetailRow label="Sunlight" value={product.sunlight.replace("_", " ")} /> : null}
              {product.watering_frequency ? <DetailRow label="Watering" value={product.watering_frequency} /> : null}
              {product.care_level ? <DetailRow label="Care level" value={product.care_level} /> : null}
              {product.care_instructions ? (
                <p className="pt-2 text-muted-foreground">{product.care_instructions}</p>
              ) : null}
            </dl>
          </section>
        ) : null}
      </div>

      <div className="mt-16">
        <h2 className="mb-6 font-heading text-xl text-foreground">Reviews</h2>
        <ProductReviews productId={product.id} productSlug={product.slug} />
      </div>

      {related.length > 0 ? (
        <div className="mt-16">
          <h2 className="mb-6 font-heading text-xl text-foreground">You may also like</h2>
          <ProductCarousel products={related} />
        </div>
      ) : null}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium capitalize">{value}</dd>
    </div>
  );
}
