import { orderStatusTone } from "@/lib/admin/status-tones";
import type { StatusTone } from "@/components/shared/status-badge";

const BAR_COLORS: Record<StatusTone, string> = {
  neutral: "bg-muted-foreground/40",
  success: "bg-primary",
  warning: "bg-brand-gold",
  danger: "bg-destructive",
  info: "bg-brand-accent",
};

export function OrderStatusDistribution({
  data,
}: {
  data: { status: string; count: number }[];
}) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-2.5">
      {data.map((row) => (
        <div key={row.status} className="flex items-center gap-3">
          <span className="w-32 shrink-0 text-xs capitalize text-muted-foreground">
            {row.status.replace(/_/g, " ")}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${BAR_COLORS[orderStatusTone(row.status)]}`}
              style={{ width: `${(row.count / max) * 100}%` }}
            />
          </div>
          <span className="w-6 shrink-0 text-right text-xs font-medium">{row.count}</span>
        </div>
      ))}
    </div>
  );
}
