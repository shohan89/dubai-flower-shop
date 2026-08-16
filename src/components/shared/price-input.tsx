import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * AED-prefixed numeric input for `numeric(12,2)` money columns. Plain
 * uncontrolled field (name + defaultValue) — works with native FormData
 * in Server Actions, no client JS required.
 */
export function PriceInput({
  id,
  name,
  label,
  defaultValue,
  required,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string | number | null;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
          AED
        </span>
        <Input
          id={id}
          name={name}
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          defaultValue={defaultValue ?? undefined}
          required={required}
          className="pl-10"
        />
      </div>
    </div>
  );
}
