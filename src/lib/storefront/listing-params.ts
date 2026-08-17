export type ListingSearchParams = Record<string, string | string[] | undefined>;

export function getParam(searchParams: ListingSearchParams, key: string): string | undefined {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

export function getPage(searchParams: ListingSearchParams): number {
  const raw = Number(getParam(searchParams, "page"));
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;
}

export function getSort(searchParams: ListingSearchParams): string | undefined {
  return getParam(searchParams, "sort");
}

function buildHref(
  basePath: string,
  searchParams: ListingSearchParams,
  overrides: Record<string, string | null>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key in overrides) continue;
    const v = Array.isArray(value) ? value[0] : value;
    if (v) params.set(key, v);
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function buildPageHref(
  basePath: string,
  searchParams: ListingSearchParams,
  page: number,
): string {
  return buildHref(basePath, searchParams, { page: page > 1 ? String(page) : null });
}

const SORT_VALUES = new Set(["newest", "price_asc", "price_desc", "name_asc", "bestselling"]);

/** Extracts the filter params every listing page shares (category, price, occasion, flower/plant type, availability, sort, page). */
export function parseListingFilters(searchParams: ListingSearchParams) {
  const sortParam = getParam(searchParams, "sort");
  const minPrice = getParam(searchParams, "min_price");
  const maxPrice = getParam(searchParams, "max_price");

  return {
    categorySlug: getParam(searchParams, "category"),
    collectionSlug: getParam(searchParams, "collection"),
    occasion: getParam(searchParams, "occasion"),
    flowerType: getParam(searchParams, "flower_type"),
    plantType: getParam(searchParams, "plant_type"),
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    availableOnly: getParam(searchParams, "available") === "1",
    sort: (sortParam && SORT_VALUES.has(sortParam) ? sortParam : "newest") as
      | "newest"
      | "price_asc"
      | "price_desc"
      | "name_asc"
      | "bestselling",
    page: getPage(searchParams),
  };
}
