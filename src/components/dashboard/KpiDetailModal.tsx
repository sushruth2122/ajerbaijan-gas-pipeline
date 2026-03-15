import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { KpiMeta } from "@/data/kpiMetadata";
import { ReactNode } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Target, ArrowDown, ArrowUp, Info } from "lucide-react";

/* ── colour helpers ── */
const statusColor = {
  safe: { text: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/40", fill: "#34d399", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  warning: { text: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/40", fill: "#fbbf24", badge: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  critical: { text: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/40", fill: "#f87171", badge: "bg-red-500/20 text-red-400 border-red-500/30" },
};

const statusLabel = { safe: "Normal", warning: "Elevated", critical: "Critical" };

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  meta: KpiMeta | null;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: ReactNode;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function KpiDetailModal({ open, onOpenChange, meta, label, value, change, trend, icon }: Props) {
  if (!meta) return null;

  const colors = statusColor[meta.status];

  // Determine trend arrow colour based on whether this trend direction is desirable
  const trendIsPositive =
    meta.desiredTrend === "neutral"
      ? true
      : trend === meta.desiredTrend;

  const trendColor = trend === "neutral"
    ? "text-muted-foreground"
    : trendIsPositive
      ? "text-emerald-400"
      : "text-red-400";

  // Gauge percent (how far current is between min→max)
  const gaugePct = Math.min(100, Math.max(0, ((meta.currentNumeric - meta.min) / (meta.max - meta.min)) * 100));
  const targetPct = Math.min(100, Math.max(0, ((meta.target - meta.min) / (meta.max - meta.min)) * 100));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-[hsl(220,18%,10%)] border-[hsl(220,15%,18%)] text-foreground">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-sm ${colors.bg} ${colors.text}`}>{icon}</div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-semibold leading-tight">{label}</DialogTitle>
              <DialogDescription className="sr-only">{meta.definition}</DialogDescription>
            </div>
            <Badge variant="outline" className={`text-[11px] ${colors.badge}`}>
              {statusLabel[meta.status]}
            </Badge>
          </div>
        </DialogHeader>

        {/* Current value + trend */}
        <div className="flex items-end justify-between mt-2">
          <div>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <div className={`flex items-center gap-1 text-xs mt-1 ${trendColor}`}>
              {trend === "up" && <TrendingUp className="w-3.5 h-3.5" />}
              {trend === "down" && <TrendingDown className="w-3.5 h-3.5" />}
              {trend === "neutral" && <Minus className="w-3.5 h-3.5" />}
              <span>{change} vs yesterday</span>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><Target className="w-3 h-3" /> Target: {fmt(meta.target)}</div>
          </div>
        </div>

        {/* Definition */}
        <div className="mt-3 p-3 rounded-sm bg-[hsl(220,15%,13%)] border border-[hsl(220,15%,18%)]">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">{meta.definition}</p>
          </div>
        </div>

        {/* Min / Max / Target gauge */}
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Range &amp; Thresholds</p>
          <div className="relative h-3 rounded-full bg-[hsl(220,15%,15%)] overflow-hidden">
            {/* threshold bands */}
            {meta.thresholds.map((t) => {
              const left = ((t.min - meta.min) / (meta.max - meta.min)) * 100;
              const width = ((t.max - t.min) / (meta.max - meta.min)) * 100;
              return (
                <div
                  key={t.label}
                  className="absolute top-0 h-full opacity-25"
                  style={{
                    left: `${Math.max(0, left)}%`,
                    width: `${Math.min(100, width)}%`,
                    backgroundColor: statusColor[t.color].fill,
                  }}
                />
              );
            })}
            {/* current value marker */}
            <div
              className="absolute top-0 h-full w-1 rounded-full"
              style={{
                left: `${gaugePct}%`,
                backgroundColor: colors.fill,
                boxShadow: `0 0 6px ${colors.fill}`,
              }}
            />
            {/* target line */}
            <div
              className="absolute top-0 h-full w-px border-l border-dashed border-white/40"
              style={{ left: `${targetPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span className="flex items-center gap-0.5"><ArrowDown className="w-3 h-3" />{fmt(meta.min)}</span>
            <span className="flex items-center gap-0.5"><ArrowUp className="w-3 h-3" />{fmt(meta.max)}</span>
          </div>
        </div>

        {/* Sparkline chart */}
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">6-Month Trend</p>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={meta.history} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                <defs>
                  <linearGradient id={`kpiGrad-${meta.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.fill} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={colors.fill} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }}
                  axisLine={{ stroke: "hsl(220,15%,18%)" }}
                  tickLine={false}
                />
                <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(220,18%,12%)",
                    border: "1px solid hsl(220,15%,18%)",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "hsl(210,20%,90%)",
                  }}
                  formatter={(v: number) => [fmt(v), meta.unit]}
                />
                <ReferenceLine y={meta.target} stroke="hsl(215,15%,35%)" strokeDasharray="4 4" />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={colors.fill}
                  fill={`url(#kpiGrad-${meta.key})`}
                  strokeWidth={2}
                  dot={{ r: 3, fill: colors.fill, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: colors.fill }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insight */}
        <div className={`mt-3 p-3 rounded-sm ${colors.bg} border ${colors.border}`}>
          <p className={`text-xs leading-relaxed ${colors.text}`}>{meta.insight}</p>
        </div>

        {/* Threshold legend */}
        <div className="flex flex-wrap gap-3 mt-3">
          {meta.thresholds.map((t) => (
            <div key={t.label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColor[t.color].fill }} />
              <span className="text-[10px] text-muted-foreground">{t.label}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
