import Link from "next/link";
import type { Route } from "next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildPageHref, type TableSearchParams } from "@/lib/admin/table-params";

export function DataTablePagination({
  basePath,
  searchParams,
  page,
  pageSize,
  totalCount,
}: {
  basePath: string;
  searchParams: TableSearchParams;
  page: number;
  pageSize: number;
  totalCount: number;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalPages <= 1) return null;

  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <p className="text-sm text-muted-foreground">
        {from}–{to} of {totalCount}
      </p>
      <div className="flex items-center gap-1">
        <PageLink
          disabled={page <= 1}
          href={buildPageHref(basePath, searchParams, page - 1) as Route}
          label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </PageLink>
        <span className="px-2 text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <PageLink
          disabled={page >= totalPages}
          href={buildPageHref(basePath, searchParams, page + 1) as Route}
          label="Next page"
        >
          <ChevronRight className="size-4" />
        </PageLink>
      </div>
    </div>
  );
}

function PageLink({
  disabled,
  href,
  label,
  children,
}: {
  disabled: boolean;
  href: Route;
  label: string;
  children: React.ReactNode;
}) {
  const className = cn(
    "inline-flex size-8 items-center justify-center rounded-lg border border-border text-foreground transition-colors",
    disabled
      ? "pointer-events-none opacity-40"
      : "hover:bg-muted",
  );

  if (disabled) {
    return (
      <span className={className} aria-hidden="true">
        {children}
      </span>
    );
  }

  return (
    <Link href={href} aria-label={label} className={className}>
      {children}
    </Link>
  );
}
