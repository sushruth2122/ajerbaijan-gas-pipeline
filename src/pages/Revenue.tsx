import { useState } from "react";
import { Flame, Banknote, FileWarning, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { KpiDetailModal } from "@/components/dashboard/KpiDetailModal";
import { AiAdvisory } from "@/components/dashboard/AiAdvisory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { revenueKpis as fbKpis, areaWiseRevenue as fbArea, consumptionVsBilled as fbBilled, tamperingAlerts as fbAlerts } from "@/data/mockData";
import { allKpiMetadata } from "@/data/allKpiMetadata";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useRevenue } from "@/hooks/useApiData";
import { useLiveAlerts } from "@/hooks/useLiveAlerts";
import type { AiInsight } from "@/components/dashboard/AiAdvisory";

const revenueInsights: AiInsight[] = [
  { type: "warning", text: "Revenue leakage gap widening to AZN 4.2 M — AI models flag 5 additional tampering suspects beyond the 2 confirmed cases." },
  { type: "recommendation", text: "Top 50 defaulters account for 38 % of AZN 12.8 M outstanding. Deploy automated payment reminders for high-risk accounts." },
  { type: "trend", text: "Collection efficiency at 95.2 % and improving +0.4 % MoM. On track to reach 96 % target by Q4 if trend holds." },
  { type: "info", text: "North district accounts for 42 % of unpaid bills. Consider deploying mobile billing centres in the area." },
];

const iconMap: Record<string, React.ReactNode> = {
  flame: <Flame className="w-5 h-5" />,
  manat: <Banknote className="w-5 h-5" />,
  fileWarning: <FileWarning className="w-5 h-5" />,
  shieldAlert: <ShieldAlert className="w-5 h-5" />,
};

const sevColors = { critical: "text-red-400", warning: "text-amber-400", info: "text-blue-400" } as const;

const Revenue = () => {
  const { data } = useRevenue();
  const revenueKpis = data?.kpis ?? fbKpis;
  const areaWiseRevenue = data?.areaWiseRevenue ?? fbArea;
  const consumptionVsBilled = data?.consumptionVsBilled ?? fbBilled;
  const tamperingBase = data?.tamperingAlerts ?? fbAlerts;
  const { alerts: tamperingAlerts, lastUpdated } = useLiveAlerts(tamperingBase, 30_000);
  const [selectedKpiIdx, setSelectedKpiIdx] = useState<number | null>(null);
  const selectedKpi = selectedKpiIdx !== null ? revenueKpis[selectedKpiIdx] : null;
  const selectedMeta = selectedKpi ? allKpiMetadata[selectedKpi.label] ?? null : null;
  return (
  <div className="space-y-6">
    <div>
      <h1 className="text-lg font-bold tracking-wide uppercase">Revenue</h1>
      <p className="text-[11px] font-mono text-muted-foreground tracking-wide">Billing, collections & loss detection analytics</p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {revenueKpis.map((kpi, i) => {
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
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Area-wise Revenue Comparison (AZN M)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={areaWiseRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
              <XAxis dataKey="area" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="billed" fill="hsl(190, 80%, 45%)" radius={[4, 4, 0, 0]} name="Billed" />
              <Bar dataKey="collected" fill="hsl(160, 70%, 40%)" radius={[4, 4, 0, 0]} name="Collected" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Consumption vs Billed Volume (M m³)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={consumptionVsBilled}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="consumed" stroke="hsl(190, 80%, 45%)" strokeWidth={2} dot={{ r: 3 }} name="Consumed" />
              <Line type="monotone" dataKey="billed" stroke="hsl(40, 90%, 55%)" strokeWidth={2} dot={{ r: 3 }} name="Billed" />
              <Line type="monotone" dataKey="gap" stroke="hsl(0, 75%, 55%)" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} name="Gap" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    {/* Tampering Alerts */}
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Abnormal Consumption / Tampering Alerts</CardTitle>
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
          {tamperingAlerts.map(a => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -12, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 12, height: 0 }}
              transition={{ duration: 0.3 }}
              layout
              className="flex items-start gap-3 p-3 rounded-md bg-secondary/50"
            >
              <ShieldAlert className={`w-4 h-4 mt-0.5 shrink-0 ${sevColors[a.severity]}`} />
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

    <AiAdvisory title="Revenue AI Advisory" insights={revenueInsights} />
  </div>
  );
};

export default Revenue;
