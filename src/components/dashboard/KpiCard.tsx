import { ReactNode } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: ReactNode;
  index?: number;
  /** Overall health status — drives the left-border colour */
  status?: "safe" | "warning" | "critical";
  /** Which trend direction is good for this metric? */
  desiredTrend?: "up" | "down" | "neutral";
  /** Called when the user clicks the card */
  onClick?: () => void;
}

const statusBorder = {
  safe: "border-l-emerald-500/70",
  warning: "border-l-amber-500/70",
  critical: "border-l-red-500/70",
};

const statusGlow = {
  safe: "hover:shadow-[0_0_12px_hsl(160_75%_38%/0.15)]",
  warning: "hover:shadow-[0_0_12px_hsl(40_92%_52%/0.15)]",
  critical: "hover:shadow-[0_0_12px_hsl(0_78%_52%/0.15)]",
};

export function KpiCard({
  label,
  value,
  change,
  trend,
  icon,
  index = 0,
  status = "safe",
  desiredTrend = "up",
  onClick,
}: KpiCardProps) {
  // Determine trend colour: green if the trend matches the desired direction, red if opposite
  const trendIsPositive =
    desiredTrend === "neutral" ? true : trend === desiredTrend;

  const trendColor =
    trend === "neutral"
      ? "text-muted-foreground"
      : trendIsPositive
        ? "text-emerald-400"
        : "text-red-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`glass-panel rounded-sm p-4 border-l-[3px] ${statusBorder[status]} ${statusGlow[status]} cursor-pointer transition-all duration-300 select-none scada-bracket`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(); }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-1.5 rounded-sm bg-primary/10 border border-primary/20 text-primary">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-[11px] font-mono ${trendColor}`}>
          {trend === "up" && <TrendingUp className="w-3 h-3" />}
          {trend === "down" && <TrendingDown className="w-3 h-3" />}
          {trend === "neutral" && <Minus className="w-3 h-3" />}
          <span>{change}</span>
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight font-mono tabular-nums">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-[0.1em] font-medium">{label}</p>
    </motion.div>
  );
}
