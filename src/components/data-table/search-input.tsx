import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * Bare search field — no <form> of its own. Compose inside
 * <TableToolbar> alongside <FilterSelect> so search + filters submit
 * together as one GET request (forms can't nest).
 */
export function SearchInput({
  defaultValue,
  placeholder = "Search…",
  paramKey = "q",
}: {
  defaultValue?: string;
  placeholder?: string;
  paramKey?: string;
}) {
  return (
    <div className="relative w-full max-w-xs">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        name={paramKey}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="pl-8"
      />
    </div>
  );
}
