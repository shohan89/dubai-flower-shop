"use client";

import { useId, useState } from "react";

type Point = { date: string; total: number };

const WIDTH = 640;
const HEIGHT = 220;
const PADDING = { top: 16, right: 12, bottom: 28, left: 12 };

export function SalesChart({ data }: { data: Point[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const gradientId = useId();

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No sales data yet.</p>;
  }

  const max = Math.max(...data.map((d) => d.total), 1);
  const chartWidth = WIDTH - PADDING.left - PADDING.right;
  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const points = data.map((d, i) => {
    const x = PADDING.left + (chartWidth * i) / Math.max(data.length - 1, 1);
    const y = PADDING.top + chartHeight - (chartHeight * d.total) / max;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${PADDING.top + chartHeight} L${points[0].x},${PADDING.top + chartHeight} Z`;

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Daily sales for the last 14 days"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Recessive baseline */}
        <line
          x1={PADDING.left}
          y1={PADDING.top + chartHeight}
          x2={WIDTH - PADDING.right}
          y2={PADDING.top + chartHeight}
          stroke="var(--border)"
          strokeWidth={1}
        />

        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path
          d={linePath}
          fill="none"
          stroke="var(--brand-primary)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => (
          <g key={p.date}>
            <rect
              x={p.x - chartWidth / data.length / 2}
              y={0}
              width={chartWidth / data.length}
              height={HEIGHT}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
            />
            {i === hoverIndex || i === points.length - 1 ? (
              <circle cx={p.x} cy={p.y} r={3.5} fill="var(--brand-primary)" />
            ) : null}
          </g>
        ))}
      </svg>

      {hovered ? (
        <div
          className="pointer-events-none absolute rounded-md border border-border bg-popover px-2 py-1 text-xs shadow-sm"
          style={{
            left: `${(hovered.x / WIDTH) * 100}%`,
            top: 0,
            transform: "translate(-50%, -100%)",
          }}
        >
          <p className="font-medium">AED {hovered.total.toFixed(2)}</p>
          <p className="text-muted-foreground">
            {new Date(hovered.date).toLocaleDateString("en-AE", { month: "short", day: "numeric" })}
          </p>
        </div>
      ) : null}
    </div>
  );
}
