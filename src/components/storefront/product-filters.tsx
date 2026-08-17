import { getParam, type ListingSearchParams } from "@/lib/storefront/listing-params";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "bestselling", label: "Bestselling" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
];

export function ProductFilters({
  basePath,
  searchParams,
  categories,
  occasions,
  flowerTypes,
  plantTypes,
}: {
  basePath: string;
  searchParams: ListingSearchParams;
  categories?: { slug: string; name: string }[];
  occasions?: string[];
  flowerTypes?: string[];
  plantTypes?: string[];
}) {
  const preserved = Object.entries(searchParams).filter(
    ([key]) => !["category", "occasion", "flower_type", "plant_type", "min_price", "max_price", "available", "sort", "page"].includes(key),
  );

  return (
    <form
      action={basePath}
      method="get"
      className="flex flex-wrap items-end gap-3 border-b border-border pb-6"
    >
      {preserved.map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={Array.isArray(value) ? value[0] : value} />
      ))}

      {categories && categories.length > 0 ? (
        <Field label="Category">
          <select name="category" defaultValue={getParam(searchParams, "category") ?? ""}>
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {occasions && occasions.length > 0 ? (
        <Field label="Occasion">
          <select name="occasion" defaultValue={getParam(searchParams, "occasion") ?? ""}>
            <option value="">Any</option>
            {occasions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {flowerTypes && flowerTypes.length > 0 ? (
        <Field label="Flower type">
          <select name="flower_type" defaultValue={getParam(searchParams, "flower_type") ?? ""}>
            <option value="">Any</option>
            {flowerTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {plantTypes && plantTypes.length > 0 ? (
        <Field label="Plant type">
          <select name="plant_type" defaultValue={getParam(searchParams, "plant_type") ?? ""}>
            <option value="">Any</option>
            {plantTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      <Field label="Min price">
        <input
          type="number"
          name="min_price"
          min="0"
          defaultValue={getParam(searchParams, "min_price") ?? ""}
          className="w-24"
        />
      </Field>
      <Field label="Max price">
        <input
          type="number"
          name="max_price"
          min="0"
          defaultValue={getParam(searchParams, "max_price") ?? ""}
          className="w-24"
        />
      </Field>

      <label className="flex items-center gap-2 pb-1.5 text-sm">
        <input
          type="checkbox"
          name="available"
          value="1"
          defaultChecked={getParam(searchParams, "available") === "1"}
        />
        Deliverable now
      </label>

      <Field label="Sort by">
        <select name="sort" defaultValue={getParam(searchParams, "sort") ?? "newest"}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <button
        type="submit"
        className="h-8 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        Apply
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground [&_select]:h-8 [&_select]:rounded-lg [&_select]:border [&_select]:border-input [&_select]:bg-transparent [&_select]:px-2 [&_select]:text-sm [&_select]:text-foreground [&_input]:h-8 [&_input]:rounded-lg [&_input]:border [&_input]:border-input [&_input]:bg-transparent [&_input]:px-2 [&_input]:text-sm">
      {label}
      {children}
    </label>
  );
}
