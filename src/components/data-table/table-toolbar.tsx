import { Button } from "@/components/ui/button";
import type { TableSearchParams } from "@/lib/admin/table-params";

/**
 * Single <form method="get"> wrapping search + filters (see
 * <SearchInput>/<FilterSelect>) so they submit together. Preserves the
 * current sort but drops `page` (a new search/filter should land on
 * page 1).
 */
export function TableToolbar({
  basePath,
  searchParams,
  children,
}: {
  basePath: string;
  searchParams: TableSearchParams;
  children: React.ReactNode;
}) {
  const sort = searchParams.sort;
  const dir = searchParams.dir;

  return (
    <form
      action={basePath}
      method="get"
      className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-3"
    >
      {typeof sort === "string" && sort ? (
        <input type="hidden" name="sort" value={sort} />
      ) : null}
      {typeof dir === "string" && dir ? <input type="hidden" name="dir" value={dir} /> : null}
      {children}
      <Button type="submit" size="sm" variant="secondary">
        Apply
      </Button>
    </form>
  );
}
