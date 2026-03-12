import { useState } from "react";
import {
  Gauge, Users, Flame, Banknote, AlertTriangle, MessageSquareWarning, HardHat, Wrench
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { KpiDetailModal } from "@/components/dashboard/KpiDetailModal";
import { AiAdvisory, CriticalAiAlerts } from "@/components/dashboard/AiAdvisory";
import { AlertsFeed } from "@/components/dashboard/AlertsFeed";
import { ConsumptionChart } from "@/components/dashboard/ConsumptionChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ComplaintsChart } from "@/components/dashboard/ComplaintsChart";
import { PressureMonitor } from "@/components/dashboard/PressureMonitor";
import { FieldCrewStatus, HighRiskZones } from "@/components/dashboard/StatusWidgets";
import { kpiData as fallbackKpiData } from "@/data/mockData";
import { kpiMetadata } from "@/data/kpiMetadata";
import { useDashboardKpis } from "@/hooks/useApiData";
import type { AiInsight, CriticalAiAlert } from "@/components/dashboard/AiAdvisory";

const dashboardInsights: AiInsight[] = [
  { type: "info", text: "Network operating at 91 % efficiency. All critical subsystems nominal. 8 emergency response teams on standby." },
  { type: "trend", text: "Gas consumption is 3.2 % above seasonal baseline — driven by industrial demand in the East and South zones." },
  { type: "warning", text: "Revenue leakage gap widening to AZN 4.2 M. 5 suspected tampering cases flagged by anomaly detection models." },
  { type: "recommendation", text: "Shift 15 % of preventive maintenance crews to corrective duty in North zone to address rising incident backlog." },
];

const dashboardCriticalAlerts: CriticalAiAlert[] = [
  { id: "D-01", message: "Pipeline P-204 gas leak in North zone — methane at 3× safe threshold. Emergency shutoff recommended.", subsystem: "Safety", severity: "critical" },
  { id: "D-02", message: "C1 regulator station sustained overpressure at 4.8 bar (limit 4.5). Cascading pressure risk in downstream network.", subsystem: "Pressure", severity: "critical" },
  { id: "D-03", message: "Communication failures up 40 % — Gateway G-17 is single point of failure for 22 % of North zone meters.", subsystem: "Smart Meters", severity: "high" },
];

const iconMap: Record<string, React.ReactNode> = {
  gauge: <Gauge className="w-5 h-5" />,
  users: <Users className="w-5 h-5" />,
  flame: <Flame className="w-5 h-5" />,
  manat: <Banknote className="w-5 h-5" />,
  alertTriangle: <AlertTriangle className="w-5 h-5" />,
  messageSquare: <MessageSquareWarning className="w-5 h-5" />,
  hardHat: <HardHat className="w-5 h-5" />,
  wrench: <Wrench className="w-5 h-5" />,
};

const Index = () => {
  const { data: kpiData = fallbackKpiData } = useDashboardKpis();
  const [selectedKpiIdx, setSelectedKpiIdx] = useState<number | null>(null);

  const selectedKpi = selectedKpiIdx !== null ? kpiData[selectedKpiIdx] : null;
  const selectedMeta = selectedKpi ? kpiMetadata[selectedKpi.icon] ?? null : null;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">Real-time operational intelligence across the gas distribution network</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiData.map((kpi, i) => {
          const meta = kpiMetadata[kpi.icon];
          return (
            <KpiCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              change={kpi.change}
              trend={kpi.trend}
              icon={iconMap[kpi.icon]}
              index={i}
              status={meta?.status}
              desiredTrend={meta?.desiredTrend}
              onClick={() => setSelectedKpiIdx(i)}
            />
          );
        })}
      </div>

      {/* KPI Detail Modal */}
      <KpiDetailModal
        open={selectedKpiIdx !== null}
        onOpenChange={(v) => { if (!v) setSelectedKpiIdx(null); }}
        meta={selectedMeta}
        label={selectedKpi?.label ?? ""}
        value={selectedKpi?.value ?? ""}
        change={selectedKpi?.change ?? ""}
        trend={selectedKpi?.trend ?? "neutral"}
        icon={selectedKpi ? iconMap[selectedKpi.icon] : null}
      />

      {/* Critical AI Alerts */}
      <CriticalAiAlerts alerts={dashboardCriticalAlerts} />

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ConsumptionChart />
        <RevenueChart />
      </div>

      {/* Charts row 2 + alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ComplaintsChart />
        <PressureMonitor />
        <AlertsFeed />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <FieldCrewStatus />
        <div className="lg:col-span-2">
          <HighRiskZones />
        </div>
      </div>

      {/* AI Advisory */}
      <AiAdvisory title="ICCC AI Advisory" insights={dashboardInsights} />
    </div>
  );
};

export default Index;
