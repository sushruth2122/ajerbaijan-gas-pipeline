import { useState } from "react";
import { Gauge, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { KpiDetailModal } from "@/components/dashboard/KpiDetailModal";
import { AiAdvisory } from "@/components/dashboard/AiAdvisory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { smartMeterKpis as fbKpis, meterHealthStatus as fbHealth, meterActivityByRegion as fbRegion, topCustomersByConsumption as fbCustomers, consumptionTrend as fbTrend } from "@/data/mockData";
import { allKpiMetadata } from "@/data/allKpiMetadata";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useSmartMeters } from "@/hooks/useApiData";
import type { AiInsight } from "@/components/dashboard/AiAdvisory";

const smartMeterInsights: AiInsight[] = [
  { type: "warning", text: "Communication failures up 40 % since Jan — Gateway G-17 in North zone is the primary hotspot. Recommend firmware OTA push." },
  { type: "trend", text: "Offline meter count is declining (-4.1 % MoM) but still 86 % above the 30 K target. Cluster 17 accounts for 22 % of outages." },
  { type: "recommendation", text: "Schedule proactive field visits to the 1,247 meters with repeated comm failures to prevent customer-reported outages." },
  { type: "info", text: "Smart meter rollout is at 94.9 % of the 3 M target. 153 K remaining meters are scheduled for Q3-Q4 deployment." },
];

const iconMap: Record<string, React.ReactNode> = {
  gauge: <Gauge className="w-5 h-5" />,
  wifi: <Wifi className="w-5 h-5" />,
  wifiOff: <WifiOff className="w-5 h-5" />,
  alertTriangle: <AlertTriangle className="w-5 h-5" />,
};

const healthColors = ["hsl(160, 70%, 40%)", "hsl(40, 90%, 55%)", "hsl(0, 75%, 55%)", "hsl(220, 15%, 40%)"];

const SmartMeters = () => {
  const { data } = useSmartMeters();
  const smartMeterKpis = data?.kpis ?? fbKpis;
  const meterHealthStatus = data?.healthStatus ?? fbHealth;
  const meterActivityByRegion = data?.activityByRegion ?? fbRegion;
  const topCustomersByConsumption = data?.topCustomers ?? fbCustomers;
  const consumptionTrend = data?.consumptionTrend ?? fbTrend;
  const [selectedKpiIdx, setSelectedKpiIdx] = useState<number | null>(null);
  const selectedKpi = selectedKpiIdx !== null ? smartMeterKpis[selectedKpiIdx] : null;
  const selectedMeta = selectedKpi ? allKpiMetadata[selectedKpi.label] ?? null : null;
  return (
  <div className="space-y-6">
    <div>
      <h1 className="text-lg font-bold tracking-wide uppercase">Smart Meters</h1>
      <p className="text-[11px] font-mono text-muted-foreground tracking-wide">Meter health, consumption trends & communication status</p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {smartMeterKpis.map((kpi, i) => {
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
      {/* Hourly Consumption */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Hourly Gas Consumption Trend</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={consumptionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="consumption" stroke="hsl(190, 80%, 45%)" fill="hsl(190, 80%, 45%)" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="baseline" stroke="hsl(215, 15%, 40%)" fill="none" strokeDasharray="4 4" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Meter Health */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Meter Health Status</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={meterHealthStatus} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <YAxis dataKey="status" type="category" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} width={70} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {meterHealthStatus.map((_, i) => <Cell key={i} fill={healthColors[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    {/* Meter Activity by Region */}
    <Card className="bg-card border-border">
      <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Meter Activity by Region</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={meterActivityByRegion}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
            <XAxis dataKey="region" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
            <Tooltip contentStyle={{ background: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="active" fill="hsl(190, 80%, 45%)" radius={[4, 4, 0, 0]} name="Active" />
            <Bar dataKey="inactive" fill="hsl(0, 75%, 55%)" radius={[4, 4, 0, 0]} name="Inactive" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>

    {/* Top 20 Customers */}
    <Card className="bg-card border-border">
      <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Top 20 Customers by Consumption</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Customer ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Consumption</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCustomersByConsumption.map(c => (
                <TableRow key={c.rank}>
                  <TableCell className="font-mono text-muted-foreground">{c.rank}</TableCell>
                  <TableCell className="font-mono text-xs">{c.customerId}</TableCell>
                  <TableCell className="text-sm">{c.name}</TableCell>
                  <TableCell className="text-sm">{c.region}</TableCell>
                  <TableCell className="font-mono text-sm">{c.consumption}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "Active" ? "outline" : "secondary"} className="text-xs">{c.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <AiAdvisory title="Smart Meter AI Advisory" insights={smartMeterInsights} />
  </div>
  );
};

export default SmartMeters;
