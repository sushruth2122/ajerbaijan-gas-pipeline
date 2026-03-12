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
  safe: "border-l-emerald-500",
  warning: "border-l-amber-500",
  critical: "border-l-red-500",
};

const statusGlow = {
  safe: "hover:shadow-emerald-500/20",
  warning: "hover:shadow-amber-500/20",
  critical: "hover:shadow-red-500/20",
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
      className={`glass-panel rounded-lg p-4 border-l-[3px] ${statusBorder[status]} ${statusGlow[status]} hover:shadow-lg cursor-pointer transition-all duration-300 select-none`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(); }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-md bg-primary/10 text-primary">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
          {trend === "up" && <TrendingUp className="w-3 h-3" />}
          {trend === "down" && <TrendingDown className="w-3 h-3" />}
          {trend === "neutral" && <Minus className="w-3 h-3" />}
          <span>{change}</span>
        </div>
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}
