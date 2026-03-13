import { cn } from "@/utils";

type BarDatum = {
  label: string;
  value: number;
};

type PieDatum = {
  label: string;
  value: number;
  color: string;
  percentage?: number;
};

type LineDatum = {
  label: string;
  value: number;
};

export function BarChart({
  data,
  formatter,
  className
}: {
  data: BarDatum[];
  formatter?: (value: number) => string;
  className?: string;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex h-48 items-end gap-3">
        {data.map((item) => (
          <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <p className="text-xs text-muted-foreground">{formatter ? formatter(item.value) : item.value}</p>
            <div className="relative h-36 w-full overflow-hidden rounded-t-lg bg-muted/60">
              <div
                className="absolute bottom-0 w-full rounded-t-lg bg-primary/90 transition-all duration-500"
                style={{ height: `${(item.value / max) * 100}%` }}
              />
            </div>
            <p className="truncate text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DonutChart({ data }: { data: PieDatum[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let angle = 0;

  const stops = data
    .map((item) => {
      const start = angle;
      angle += (item.value / total) * 360;
      return `${item.color} ${start}deg ${angle}deg`;
    })
    .join(", ");

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="relative mx-auto h-48 w-48">
        <div
          className="h-full w-full rounded-full"
          style={{
            background: `conic-gradient(${stops})`
          }}
        />
        <div className="absolute inset-5 flex items-center justify-center rounded-full bg-background/95">
          <div className="text-center">
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Projects</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
            </div>
            <span className="text-muted-foreground">{item.percentage ?? Math.round((item.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LineTrendChart({ data }: { data: LineDatum[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  const points = data
    .map((item, index) => {
      const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
      const y = 100 - (item.value / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-3">
      <div className="h-44 rounded-xl border border-white/25 bg-white/35 p-3 dark:bg-slate-900/35">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {data.map((item, index) => {
            const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
            const y = 100 - (item.value / max) * 100;
            return <circle key={item.label} cx={x} cy={y} r="2" fill="hsl(var(--primary))" />;
          })}
        </svg>
      </div>
      <div className="grid grid-cols-6 gap-2 text-center text-xs text-muted-foreground">
        {data.map((item) => (
          <div key={item.label}>
            <p>{item.label}</p>
            <p className="font-semibold text-foreground">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
