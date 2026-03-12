import { useState } from "react";
import { HardHat, UserCheck, Truck, ClipboardList } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { KpiDetailModal } from "@/components/dashboard/KpiDetailModal";
import { AiAdvisory } from "@/components/dashboard/AiAdvisory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { workforceKpis as fbKpis, activeTasks as fbTasks } from "@/data/mockData";
import { allKpiMetadata } from "@/data/allKpiMetadata";
import { useWorkforce } from "@/hooks/useApiData";
import type { AiInsight } from "@/components/dashboard/AiAdvisory";

const workforceInsights: AiInsight[] = [
  { type: "warning", text: "Available crews declining for 6 consecutive months as incident rate grows. Consider temporary workforce augmentation for Q3." },
  { type: "recommendation", text: "2 critical work orders (leak repair P-204, emergency shutoff) require same-day completion — prioritise nearest available crew." },
  { type: "trend", text: "98 crews enroute is 22.5 % above normal, reflecting increased leak & pressure dispatches. Average ETA is 28 min." },
  { type: "info", text: "Open work orders have increased 37 % since January. AI recommends shifting 15 crews from preventive to corrective duty." },
];

const iconMap: Record<string, React.ReactNode> = {
  hardHat: <HardHat className="w-5 h-5" />,
  userCheck: <UserCheck className="w-5 h-5" />,
  truck: <Truck className="w-5 h-5" />,
  clipboardList: <ClipboardList className="w-5 h-5" />,
};

const priorityVariant = { Critical: "destructive", High: "secondary", Medium: "outline", Low: "outline" } as const;

const Workforce = () => {
  const { data } = useWorkforce();
  const workforceKpis = data?.kpis ?? fbKpis;
  const activeTasks = data?.activeTasks ?? fbTasks;
  const [selectedKpiIdx, setSelectedKpiIdx] = useState<number | null>(null);
  const selectedKpi = selectedKpiIdx !== null ? workforceKpis[selectedKpiIdx] : null;
  const selectedMeta = selectedKpi ? allKpiMetadata[selectedKpi.label] ?? null : null;
  return (
  <div className="space-y-6">
    <div>
      <h1 className="text-xl font-semibold">Workforce</h1>
      <p className="text-sm text-muted-foreground">Crew dispatch, task tracking & field operations</p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {workforceKpis.map((kpi, i) => {
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

    {/* Active Tasks */}
    <Card className="bg-card border-border">
      <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Active Tasks & Dispatch Orders</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Order</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Crew</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>ETA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeTasks.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.id}</TableCell>
                  <TableCell className="text-sm">{t.task}</TableCell>
                  <TableCell className="font-mono text-xs">{t.crew}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{t.location}</TableCell>
                  <TableCell>
                    <Badge variant={priorityVariant[t.priority as keyof typeof priorityVariant] ?? "outline"} className="text-xs">{t.priority}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{t.status}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{t.eta}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <AiAdvisory title="Workforce AI Advisory" insights={workforceInsights} />
  </div>
  );
};

export default Workforce;
