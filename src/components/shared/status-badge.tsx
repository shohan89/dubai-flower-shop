import { cn } from "@/lib/utils";

const TONES = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-primary/10 text-primary",
  warning: "bg-brand-gold/15 text-[#8a6d1f]",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-brand-accent/20 text-[#8a3f2e]",
} as const;

export type StatusTone = keyof typeof TONES;

export function StatusBadge({
  label,
  tone,
  className,
}: {
  label: string;
  tone: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        TONES[tone],
        className,
      )}
    >
      {label.replace(/_/g, " ")}
    </span>
  );
}
