import { fieldCrewStatus as fbCrew, highRiskZones as fbRisk } from "@/data/mockData";
import { AlertTriangle, Users } from "lucide-react";
import { useDashboard } from "@/hooks/useApiData";

const crewColors = {
  success: "bg-emerald-500",
  info: "bg-blue-500",
  warning: "bg-amber-500",
};

export function FieldCrewStatus() {
  const { data } = useDashboard();
  const fieldCrewStatus = data?.fieldCrewStatus ?? fbCrew;
  const total = fieldCrewStatus.reduce((s: number, c: any) => s + c.count, 0);
  return (
    <div className="glass-panel rounded-lg p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
        <Users className="w-4 h-4" /> Field Crew Status
      </h3>
      <div className="flex gap-2 mb-3">
        {fieldCrewStatus.map((s) => (
          <div
            key={s.status}
            className="flex-1 h-3 rounded-full overflow-hidden bg-secondary"
          >
            <div
              className={`h-full ${crewColors[s.color]} rounded-full`}
              style={{ width: `${(s.count / total) * 100 * (total / Math.max(...fieldCrewStatus.map(f => f.count)))}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-xs">
        {fieldCrewStatus.map((s) => (
          <div key={s.status} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${crewColors[s.color]}`} />
            <span className="text-muted-foreground">{s.status}</span>
            <span className="font-semibold">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HighRiskZones() {
  const { data } = useDashboard();
  const highRiskZones = data?.highRiskZones ?? fbRisk;
  return (
    <div className="glass-panel rounded-lg p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-warning" /> Top 5 High Risk Pipeline Zones
      </h3>
      <div className="space-y-3">
        {highRiskZones.map((z, i) => (
          <div key={z.zone} className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{z.zone}</p>
              <p className="text-xs text-muted-foreground">{z.type}</p>
            </div>
            <div className="text-right">
              <span className={`text-sm font-semibold font-mono ${
                z.risk >= 85 ? "text-red-400" : z.risk >= 75 ? "text-amber-400" : "text-emerald-400"
              }`}>
                {z.risk}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
