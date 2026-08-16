/**
 * Server-driven table state (search, filters, sort, pagination) — all via
 * URL query params, so list pages stay Server Components with zero
 * client JS for sorting/pagination/filtering. Widely shareable/bookmarkable
 * too.
 */
export type TableSearchParams = Record<string, string | string[] | undefined>;

export function getParam(searchParams: TableSearchParams, key: string): string | undefined {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

export function getPage(searchParams: TableSearchParams): number {
  const raw = Number(getParam(searchParams, "page"));
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;
}

export function getSort(
  searchParams: TableSearchParams,
): { key: string | null; dir: "asc" | "desc" } {
  const key = getParam(searchParams, "sort") ?? null;
  const dir = getParam(searchParams, "dir") === "desc" ? "desc" : "asc";
  return { key, dir };
}

function buildHref(
  basePath: string,
  searchParams: TableSearchParams,
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

export function buildSortHref(
  basePath: string,
  searchParams: TableSearchParams,
  key: string,
): { href: string; direction: "asc" | "desc" | null } {
  const current = getSort(searchParams);
  const isActive = current.key === key;
  const nextDir: "asc" | "desc" = isActive && current.dir === "asc" ? "desc" : "asc";
  return {
    href: buildHref(basePath, searchParams, { sort: key, dir: nextDir, page: null }),
    direction: isActive ? current.dir : null,
  };
}

export function buildPageHref(
  basePath: string,
  searchParams: TableSearchParams,
  page: number,
): string {
  return buildHref(basePath, searchParams, { page: page > 1 ? String(page) : null });
}

export function buildFilterHref(
  basePath: string,
  searchParams: TableSearchParams,
  key: string,
  value: string | null,
): string {
  return buildHref(basePath, searchParams, { [key]: value, page: null });
}
