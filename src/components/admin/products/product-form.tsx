"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/shared/form-field";
import { PriceInput } from "@/components/shared/price-input";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { SubmitButton } from "@/components/shared/submit-button";
import {
  PRODUCT_TYPES,
  PRODUCT_STATUSES,
  BOUQUET_SIZES,
  INDOOR_OUTDOOR_OPTIONS,
  SUNLIGHT_OPTIONS,
  CARE_LEVELS,
  FLOWER_PRODUCT_TYPES,
  PLANT_PRODUCT_TYPES,
} from "@/constants/product-options";
import type { Database } from "@/types/database.types";
import type { ProductFormState } from "@/app/admin/(dashboard)/products/actions";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type CollectionRow = Database["public"]["Tables"]["collections"]["Row"];
type AddonRow = Database["public"]["Tables"]["addons"]["Row"];

export function ProductForm({
  product,
  seo,
  categoryIds = [],
  primaryCategoryId,
  collectionIds = [],
  addonIds = [],
  allCategories,
  allCollections,
  allAddons,
  action,
}: {
  product?: ProductRow;
  seo?: { seo_title: string | null; meta_description: string | null } | null;
  categoryIds?: string[];
  primaryCategoryId?: string;
  collectionIds?: string[];
  addonIds?: string[];
  allCategories: CategoryRow[];
  allCollections: CollectionRow[];
  allAddons: AddonRow[];
  action: (prevState: ProductFormState, formData: FormData) => Promise<ProductFormState>;
}) {
  const [state, formAction] = useActionState(action, {});
  const [productType, setProductType] = useState(product?.product_type ?? "bouquet");
  const isFlower = FLOWER_PRODUCT_TYPES.includes(productType);
  const isPlant = PLANT_PRODUCT_TYPES.includes(productType);

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField id="name" label="Name" required>
            <Input id="name" name="name" defaultValue={product?.name} required />
          </FormField>
          <FormField id="slug" label="Slug" required>
            <Input id="slug" name="slug" defaultValue={product?.slug} required />
          </FormField>
          <FormField id="sku" label="SKU" required>
            <Input id="sku" name="sku" defaultValue={product?.sku} required />
          </FormField>
          <FormField id="productType" label="Product type" required>
            <select
              id="productType"
              name="productType"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {PRODUCT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="status" label="Status">
            <select
              id="status"
              name="status"
              defaultValue={product?.status ?? "draft"}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {PRODUCT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="shortDescription" label="Short description">
            <Textarea
              id="shortDescription"
              name="shortDescription"
              defaultValue={product?.short_description ?? ""}
              rows={2}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            id="description"
            name="description"
            label="Full description"
            defaultValue={product?.description}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing &amp; stock</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <PriceInput id="basePrice" name="basePrice" label="Base price" defaultValue={product?.base_price} required />
          <PriceInput
            id="compareAtPrice"
            name="compareAtPrice"
            label="Compare-at price"
            defaultValue={product?.compare_at_price}
          />
          <PriceInput id="costPrice" name="costPrice" label="Cost price" defaultValue={product?.cost_price} />
          <FormField id="stockQuantity" label="Stock quantity">
            <Input
              id="stockQuantity"
              name="stockQuantity"
              type="number"
              min="0"
              defaultValue={product?.stock_quantity ?? 0}
            />
          </FormField>
          <FormField id="lowStockThreshold" label="Low stock threshold">
            <Input
              id="lowStockThreshold"
              name="lowStockThreshold"
              type="number"
              min="0"
              defaultValue={product?.low_stock_threshold ?? 5}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visibility</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <SwitchField name="featured" label="Featured" defaultChecked={product?.featured} />
          <SwitchField name="bestseller" label="Bestseller" defaultChecked={product?.bestseller} />
          <SwitchField name="newArrival" label="New arrival" defaultChecked={product?.new_arrival} />
          <SwitchField name="onSale" label="On sale" defaultChecked={product?.on_sale} />
          <SwitchField
            name="deliveryAvailable"
            label="Delivery available"
            defaultChecked={product?.delivery_available ?? true}
          />
        </CardContent>
      </Card>

      {isFlower ? (
        <Card>
          <CardHeader>
            <CardTitle>Flower details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField id="flowerType" label="Flower type">
              <Input id="flowerType" name="flowerType" defaultValue={product?.flower_type ?? ""} />
            </FormField>
            <FormField id="flowerColor" label="Color">
              <Input id="flowerColor" name="flowerColor" defaultValue={product?.flower_color ?? ""} />
            </FormField>
            <FormField id="stemCount" label="Stem count">
              <Input
                id="stemCount"
                name="stemCount"
                type="number"
                min="0"
                defaultValue={product?.stem_count ?? ""}
              />
            </FormField>
            <FormField id="bouquetSize" label="Bouquet size">
              <select
                id="bouquetSize"
                name="bouquetSize"
                defaultValue={product?.bouquet_size ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
              >
                <option value="">—</option>
                {BOUQUET_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField id="occasion" label="Occasion">
              <Input id="occasion" name="occasion" defaultValue={product?.occasion ?? ""} />
            </FormField>
            <FormField id="fragrance" label="Fragrance">
              <Input id="fragrance" name="fragrance" defaultValue={product?.fragrance ?? ""} />
            </FormField>
            <FormField id="freshnessInformation" label="Freshness information" required={false}>
              <Textarea
                id="freshnessInformation"
                name="freshnessInformation"
                defaultValue={product?.freshness_information ?? ""}
                rows={2}
              />
            </FormField>
          </CardContent>
        </Card>
      ) : null}

      {isPlant ? (
        <Card>
          <CardHeader>
            <CardTitle>Plant details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField id="plantType" label="Plant type">
              <Input id="plantType" name="plantType" defaultValue={product?.plant_type ?? ""} />
            </FormField>
            <FormField id="indoorOutdoor" label="Indoor / outdoor">
              <select
                id="indoorOutdoor"
                name="indoorOutdoor"
                defaultValue={product?.indoor_outdoor ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
              >
                <option value="">—</option>
                {INDOOR_OUTDOOR_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField id="heightCm" label="Height (cm)">
              <Input id="heightCm" name="heightCm" type="number" step="0.1" min="0" defaultValue={product?.height_cm ?? ""} />
            </FormField>
            <FormField id="potSize" label="Pot size">
              <Input id="potSize" name="potSize" defaultValue={product?.pot_size ?? ""} />
            </FormField>
            <FormField id="sunlight" label="Sunlight">
              <select
                id="sunlight"
                name="sunlight"
                defaultValue={product?.sunlight ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
              >
                <option value="">—</option>
                {SUNLIGHT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.replace("_", " ")}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField id="wateringFrequency" label="Watering frequency">
              <Input id="wateringFrequency" name="wateringFrequency" defaultValue={product?.watering_frequency ?? ""} />
            </FormField>
            <FormField id="careLevel" label="Care level">
              <select
                id="careLevel"
                name="careLevel"
                defaultValue={product?.care_level ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
              >
                <option value="">—</option>
                {CARE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </FormField>
            <SwitchField name="potIncluded" label="Pot included" defaultChecked={product?.pot_included ?? false} />
            <FormField id="careInstructions" label="Care instructions">
              <Textarea id="careInstructions" name="careInstructions" defaultValue={product?.care_instructions ?? ""} rows={2} />
            </FormField>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Categories, collections &amp; add-ons</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-medium">Categories</p>
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {allCategories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="categoryIds"
                    value={category.id}
                    defaultChecked={categoryIds.includes(category.id)}
                  />
                  {category.name}
                </label>
              ))}
            </div>
            <FormField id="primaryCategoryId" label="Primary category">
              <select
                id="primaryCategoryId"
                name="primaryCategoryId"
                defaultValue={primaryCategoryId ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
              >
                <option value="">—</option>
                {allCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Collections</p>
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {allCollections.map((collection) => (
                <label key={collection.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="collectionIds"
                    value={collection.id}
                    defaultChecked={collectionIds.includes(collection.id)}
                  />
                  {collection.name}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Add-ons offered</p>
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {allAddons.map((addon) => (
                <label key={addon.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="addonIds"
                    value={addon.id}
                    defaultChecked={addonIds.includes(addon.id)}
                  />
                  {addon.name}
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField id="seoTitle" label="SEO title">
            <Input id="seoTitle" name="seoTitle" defaultValue={seo?.seo_title ?? ""} />
          </FormField>
          <FormField id="seoDescription" label="Meta description">
            <Textarea id="seoDescription" name="seoDescription" defaultValue={seo?.meta_description ?? ""} rows={2} />
          </FormField>
        </CardContent>
      </Card>

      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <SubmitButton>{product ? "Save changes" : "Create product"}</SubmitButton>
    </form>
  );
}

function SwitchField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean | null;
}) {
  const [checked, setChecked] = useState(Boolean(defaultChecked));
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
      <Label htmlFor={name} className="text-sm font-normal">
        {label}
      </Label>
      <Switch id={name} checked={checked} onCheckedChange={setChecked} />
      <input type="checkbox" name={name} checked={checked} readOnly hidden />
    </div>
  );
}
