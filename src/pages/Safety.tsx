import { useState } from "react";
import { AlertTriangle, Radio, ShieldAlert, HardHat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { KpiDetailModal } from "@/components/dashboard/KpiDetailModal";
import { AiAdvisory, CriticalAiAlerts } from "@/components/dashboard/AiAdvisory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { safetyKpis as fbKpis, gasPressureTrends as fbPressure, leakDetectionActivity as fbLeak, safetyAlerts as fbAlerts } from "@/data/mockData";
import { allKpiMetadata } from "@/data/allKpiMetadata";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { useSafety } from "@/hooks/useApiData";
import { useLiveAlerts } from "@/hooks/useLiveAlerts";
import type { AiInsight, CriticalAiAlert } from "@/components/dashboard/AiAdvisory";

const safetyInsights: AiInsight[] = [
  { type: "warning", text: "Safety alerts have doubled since January. 3 are critical gas leak / seismic alerts requiring immediate field response." },
  { type: "recommendation", text: "Sensor LD-023 has been malfunctioning for 48 hrs. Schedule emergency replacement to restore coverage in Zone D2." },
  { type: "trend", text: "Gas pressure in C1 station trending 8 % above threshold. AI predicts anomaly escalation within 6 hrs if unchecked." },
  { type: "info", text: "All 8 emergency response teams are at full strength. 3 deployed, 5 on standby for rapid dispatch." },
];

const safetyCriticalAlerts: CriticalAiAlert[] = [
  { id: "SA-01", message: "Gas leak detected at Pipeline P-204, North Zone — methane levels 3× above safe threshold. Immediate shutoff recommended.", subsystem: "Leak Detection", severity: "critical" },
  { id: "SA-02", message: "Pressure anomaly at C1 regulator station — sustained 4.8 bar (threshold 4.5). Risk of overpressure event.", subsystem: "Pressure Monitoring", severity: "critical" },
  { id: "SA-03", message: "Seismic micro-tremor detected near D2 district — pipeline integrity check advised within 2 hours.", subsystem: "Seismic Monitoring", severity: "high" },
];

const iconMap: Record<string, React.ReactNode> = {
  alertTriangle: <AlertTriangle className="w-5 h-5" />,
  radio: <Radio className="w-5 h-5" />,
  shieldAlert: <ShieldAlert className="w-5 h-5" />,
  hardHat: <HardHat className="w-5 h-5" />,
};

const sevColors = { critical: "text-red-400", warning: "text-amber-400", info: "text-blue-400" } as const;

const Safety = () => {
  const { data } = useSafety();
  const safetyKpis = data?.kpis ?? fbKpis;
  const gasPressureTrends = data?.pressureTrends ?? fbPressure;
  const leakDetectionActivity = data?.leakDetection ?? fbLeak;
  const baseSafetyAlerts = data?.alerts ?? fbAlerts;
  const { alerts: safetyAlerts, lastUpdated } = useLiveAlerts(baseSafetyAlerts, 30_000);
  const [selectedKpiIdx, setSelectedKpiIdx] = useState<number | null>(null);
  const selectedKpi = selectedKpiIdx !== null ? safetyKpis[selectedKpiIdx] : null;
  const selectedMeta = selectedKpi ? allKpiMetadata[selectedKpi.label] ?? null : null;
  return (
  <div className="space-y-6">
    <div>
      <h1 className="text-xl font-semibold">Safety</h1>
      <p className="text-sm text-muted-foreground">Leak detection, pressure monitoring & incident tracking</p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {safetyKpis.map((kpi, i) => {
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

    <CriticalAiAlerts alerts={safetyCriticalAlerts} />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Gas Pressure Trends (bar)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={gasPressureTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <YAxis domain={[2.5, 5]} tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, fontSize: 12 }} />
              <ReferenceLine y={4.5} stroke="hsl(0, 75%, 55%)" strokeDasharray="4 4" label={{ value: "Threshold", fill: "hsl(0, 75%, 55%)", fontSize: 10 }} />
              <Line type="monotone" dataKey="pressure" stroke="hsl(190, 80%, 45%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Leak Detection Activity</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={leakDetectionActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
              <XAxis dataKey="zone" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="detected" fill="hsl(0, 75%, 55%)" radius={[4, 4, 0, 0]} name="Detected" />
              <Bar dataKey="resolved" fill="hsl(160, 70%, 40%)" radius={[4, 4, 0, 0]} name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    {/* Safety Alerts */}
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Safety Alert Feed</CardTitle>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">live • {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence initial={false}>
          {safetyAlerts.map(a => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -12, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 12, height: 0 }}
              transition={{ duration: 0.3 }}
              layout
              className="flex items-start gap-3 p-3 rounded-md bg-secondary/50"
            >
              <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${sevColors[a.severity]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm">{a.message}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs ${a.time === "just now" ? "text-red-400 font-semibold" : "text-muted-foreground"}`}>{a.time}</span>
                  <span className="text-xs text-muted-foreground">• {a.source}</span>
                </div>
              </div>
              <Badge variant={a.severity === "critical" ? "destructive" : a.severity === "warning" ? "secondary" : "outline"} className="text-xs capitalize shrink-0">{a.severity}</Badge>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>

    <AiAdvisory title="Safety AI Advisory" insights={safetyInsights} />
  </div>
  );
};

export default Safety;
