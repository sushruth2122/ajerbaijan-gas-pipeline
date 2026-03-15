import { pipelinePressure as fallback } from "@/data/mockData";
import { useDashboard } from "@/hooks/useApiData";

const statusColors = {
  normal: { bar: "bg-emerald-500", text: "text-emerald-400" },
  warning: { bar: "bg-amber-500", text: "text-amber-400" },
  critical: { bar: "bg-red-500", text: "text-red-400" },
};

export function PressureMonitor() {
  const { data } = useDashboard();
  const pipelinePressure = data?.pipelinePressure ?? fallback;
  return (
    <div className="glass-panel rounded-sm p-4 scada-bracket">
      <h3 className="scada-label mb-4">
        Network Pressure Monitoring
      </h3>
      <div className="space-y-3">
        {pipelinePressure.map((p) => {
          const pct = (p.pressure / p.normal) * 100;
          const colors = statusColors[p.status];
          return (
            <div key={p.zone}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium font-mono text-[11px]">{p.zone}</span>
                <span className={`font-mono text-[11px] ${colors.text}`}>
                  {p.pressure} / {p.normal} bar
                </span>
              </div>
              <div className="h-2 rounded-none bg-secondary overflow-hidden border border-border/50">
                <div
                  className={`h-full rounded-none ${colors.bar} transition-all duration-500`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
