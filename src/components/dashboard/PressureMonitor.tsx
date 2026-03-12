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
    <div className="glass-panel rounded-lg p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Network Pressure Monitoring
      </h3>
      <div className="space-y-3">
        {pipelinePressure.map((p) => {
          const pct = (p.pressure / p.normal) * 100;
          const colors = statusColors[p.status];
          return (
            <div key={p.zone}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium">{p.zone}</span>
                <span className={colors.text}>
                  {p.pressure} / {p.normal} bar
                </span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full ${colors.bar} transition-all duration-500`}
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
