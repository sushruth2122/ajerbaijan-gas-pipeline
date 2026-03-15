import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { alerts as fallback } from "@/data/mockData";
import { useDashboard } from "@/hooks/useApiData";
import { useLiveAlerts } from "@/hooks/useLiveAlerts";

const severityConfig = {
  critical: { icon: AlertTriangle, colorClass: "text-red-400", bgClass: "bg-red-500/10", borderClass: "border-l-red-500" },
  warning: { icon: AlertCircle, colorClass: "text-amber-400", bgClass: "bg-amber-500/10", borderClass: "border-l-amber-500" },
  info: { icon: Info, colorClass: "text-blue-400", bgClass: "bg-blue-500/10", borderClass: "border-l-blue-500" },
};

export function AlertsFeed() {
  const { data } = useDashboard();
  const baseAlerts = data?.alerts ?? fallback;
  const { alerts, lastUpdated } = useLiveAlerts(baseAlerts, 30_000);

  return (
    <div className="glass-panel rounded-sm p-4 h-full scada-bracket">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="scada-label">Live Alerts</h3>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-mono">
            {lastUpdated.toLocaleTimeString()}
          </span>
          <span className="text-xs font-mono bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full status-pulse">
            {alerts.filter(a => a.severity === "critical").length} Critical
          </span>
        </div>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {alerts.map((alert) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -16, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 16, height: 0 }}
                transition={{ duration: 0.3 }}
                layout
                className={`flex items-start gap-3 p-2.5 rounded-sm border-l-2 ${config.borderClass} ${config.bgClass} cursor-pointer hover:brightness-110 transition-all`}
              >
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.colorClass}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs ${alert.time === "just now" ? "text-red-400 font-semibold" : "text-muted-foreground"}`}>{alert.time}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground truncate">{alert.source}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
