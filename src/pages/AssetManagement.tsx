import { useState } from "react";
import { GitBranch, Gauge, Settings, Wrench, ShieldAlert, AlertTriangle, Clock, Activity, Radio } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { KpiDetailModal } from "@/components/dashboard/KpiDetailModal";
import { AiAdvisory } from "@/components/dashboard/AiAdvisory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { assetKpis as fbKpis, assetAgeDistribution as fbAge, maintenanceHistory as fbMaint, failureFrequency as fbFail } from "@/data/mockData";
import { allKpiMetadata } from "@/data/allKpiMetadata";
import { useAssets } from "@/hooks/useApiData";
import type { AiInsight } from "@/components/dashboard/AiAdvisory";
import { AssetOverviewTab } from "@/components/assets/AssetOverviewTab";
import { PredictiveMaintenanceTab } from "@/components/assets/PredictiveMaintenanceTab";
import { ExpiryComplianceTab } from "@/components/assets/ExpiryComplianceTab";
import { SmartMeterCorrelationTab } from "@/components/assets/SmartMeterCorrelationTab";
import { RecommendedActionsTab } from "@/components/assets/RecommendedActionsTab";

const fallbackInsights: AiInsight[] = [
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
  shieldAlert: <ShieldAlert className="w-5 h-5" />,
  alertTriangle: <AlertTriangle className="w-5 h-5" />,
  clock: <Clock className="w-5 h-5" />,
  activity: <Activity className="w-5 h-5" />,
  radio: <Radio className="w-5 h-5" />,
};

const AssetManagement = () => {
  const { data } = useAssets();
  // Original chart data (fallback to mock)
  const assetAgeDistribution = data?.ageDistribution ?? fbAge;
  const maintenanceHistory = data?.maintenanceHistory ?? fbMaint;
  const failureFrequency = data?.failureFrequency ?? fbFail;

  // Intelligence data
  const intelKpis = data?.intelKpis ?? fbKpis;
  const assetIntel = data?.assetIntel ?? [];
  const predictiveFailures = data?.predictiveFailures ?? [];
  const expiryItems = data?.expiryItems ?? [];
  const meterCorrelation = data?.meterCorrelation ?? [];
  const recommendedActions = data?.recommendedActions ?? [];
  const aiAdvisory: AiInsight[] = data?.aiAdvisory ?? fallbackInsights;

  const [selectedKpiIdx, setSelectedKpiIdx] = useState<number | null>(null);
  const selectedKpi = selectedKpiIdx !== null ? intelKpis[selectedKpiIdx] : null;
  const selectedMeta = selectedKpi ? allKpiMetadata[selectedKpi.label] ?? null : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold tracking-wide uppercase">Asset Intelligence</h1>
        <p className="text-[11px] font-mono text-muted-foreground tracking-wide">ICCC cross-domain analytics — lifecycle, risk, predictive maintenance & meter correlation</p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {intelKpis.map((kpi: any, i: number) => {
          const meta = allKpiMetadata[kpi.label];
          return (
            <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} change={kpi.change} trend={kpi.trend} icon={iconMap[kpi.icon] || <Settings className="w-5 h-5" />} index={i}
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
        icon={selectedKpi ? (iconMap[selectedKpi.icon] || null) : null}
      />

      {/* Tabbed workspace */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Maintenance</TabsTrigger>
          <TabsTrigger value="expiry">Expiry / Compliance</TabsTrigger>
          <TabsTrigger value="meters">Smart Meter Correlation</TabsTrigger>
          <TabsTrigger value="actions">Recommended Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <AssetOverviewTab
            assetIntel={assetIntel}
            ageDistribution={assetAgeDistribution}
            maintenanceHistory={maintenanceHistory}
            failureFrequency={failureFrequency}
          />
        </TabsContent>

        <TabsContent value="predictive" className="mt-4">
          <PredictiveMaintenanceTab failures={predictiveFailures} />
        </TabsContent>

        <TabsContent value="expiry" className="mt-4">
          <ExpiryComplianceTab items={expiryItems} />
        </TabsContent>

        <TabsContent value="meters" className="mt-4">
          <SmartMeterCorrelationTab correlation={meterCorrelation} />
        </TabsContent>

        <TabsContent value="actions" className="mt-4">
          <RecommendedActionsTab actions={recommendedActions} />
        </TabsContent>
      </Tabs>

      {/* AI Advisory — below tabs, dynamically generated */}
      <AiAdvisory title="Asset Intelligence AI Advisory" insights={aiAdvisory} />
    </div>
  );
};

export default AssetManagement;
