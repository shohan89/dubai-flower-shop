/**
 * Native <select> — submits with the rest of <TableToolbar>'s form on
 * change is NOT automatic (no JS), so it's paired with a submit button.
 * Kept as a plain select (not the Radix/Base UI Select) specifically so
 * this works inside a plain GET form with zero client JS.
 */
export function FilterSelect({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
      {label}
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
