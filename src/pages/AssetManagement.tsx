import { useState } from "react";
import { GitBranch, Gauge, Settings, Wrench } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { KpiDetailModal } from "@/components/dashboard/KpiDetailModal";
import { AiAdvisory } from "@/components/dashboard/AiAdvisory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { assetKpis as fbKpis, assetAgeDistribution as fbAge, maintenanceHistory as fbMaint, failureFrequency as fbFail } from "@/data/mockData";
import { allKpiMetadata } from "@/data/allKpiMetadata";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { useAssets } from "@/hooks/useApiData";
import type { AiInsight } from "@/components/dashboard/AiAdvisory";

const assetInsights: AiInsight[] = [
  { type: "warning", text: "67 assets under maintenance is 34 % above target. Emergency repairs on P-204 and P-501 are driving the increase." },
  { type: "recommendation", text: "1.3 % of meters are classified as faulty — schedule batch replacement during the next planned outage window." },
  { type: "trend", text: "3 new pipeline segments commissioned this month. Network expansion on track toward 1,300 target by Q4 2026." },
  { type: "info", text: "Annual pressure calibration is 87 % complete across all 342 regulator stations. 45 stations remaining." },
];

const iconMap: Record<string, React.ReactNode> = {
  gitBranch: <GitBranch className="w-5 h-5" />,
  gauge: <Gauge className="w-5 h-5" />,
  settings: <Settings className="w-5 h-5" />,
  wrench: <Wrench className="w-5 h-5" />,
};

const ageColors = ["hsl(190, 80%, 45%)", "hsl(160, 70%, 40%)", "hsl(40, 90%, 55%)", "hsl(20, 80%, 50%)", "hsl(0, 75%, 55%)"];

const AssetManagement = () => {
  const { data } = useAssets();
  const assetKpis = data?.kpis ?? fbKpis;
  const assetAgeDistribution = data?.ageDistribution ?? fbAge;
  const maintenanceHistory = data?.maintenanceHistory ?? fbMaint;
  const failureFrequency = data?.failureFrequency ?? fbFail;
  const [selectedKpiIdx, setSelectedKpiIdx] = useState<number | null>(null);
  const selectedKpi = selectedKpiIdx !== null ? assetKpis[selectedKpiIdx] : null;
  const selectedMeta = selectedKpi ? allKpiMetadata[selectedKpi.label] ?? null : null;
  return (
  <div className="space-y-6">
    <div>
      <h1 className="text-xl font-semibold">Assets</h1>
      <p className="text-sm text-muted-foreground">Infrastructure lifecycle, maintenance & failure analysis</p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {assetKpis.map((kpi, i) => {
        const meta = allKpiMetadata[kpi.label];
        return (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} change={kpi.change} trend={kpi.trend} icon={iconMap[kpi.icon]} index={i}
            status={meta?.status} desiredTrend={meta?.desiredTrend} onClick={() => setSelectedKpiIdx(i)} />
        );
      })}
    </div>

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

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Asset Age Distribution</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={assetAgeDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
              <XAxis dataKey="age" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {assetAgeDistribution.map((_, i) => <Cell key={i} fill={ageColors[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Maintenance History</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={maintenanceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="preventive" fill="hsl(190, 80%, 45%)" radius={[4, 4, 0, 0]} name="Preventive" />
              <Bar dataKey="corrective" fill="hsl(40, 90%, 55%)" radius={[4, 4, 0, 0]} name="Corrective" />
              <Bar dataKey="emergency" fill="hsl(0, 75%, 55%)" radius={[4, 4, 0, 0]} name="Emergency" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    <Card className="bg-card border-border">
      <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Failure Frequency by Type</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={failureFrequency} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
            <YAxis dataKey="type" type="category" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} width={120} />
            <Tooltip contentStyle={{ background: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" fill="hsl(0, 75%, 55%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>

    <AiAdvisory title="Asset Management AI Advisory" insights={assetInsights} />
  </div>
  );
};

export default AssetManagement;
