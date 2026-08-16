import Link from "next/link";
import type { Route } from "next";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

export function SortableHeader({
  href,
  label,
  direction,
}: {
  href: string;
  label: string;
  direction: "asc" | "desc" | null;
}) {
  const Icon = direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ArrowUpDown;

  return (
    <Link
      href={href as Route}
      className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
    >
      {label}
      <Icon className="size-3.5" />
    </Link>
  );
}
