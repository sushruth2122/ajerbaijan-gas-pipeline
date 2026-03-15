import { useState } from "react";
import { HardHat, UserCheck, Truck, ClipboardList } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { KpiDetailModal } from "@/components/dashboard/KpiDetailModal";
import { AiAdvisory } from "@/components/dashboard/AiAdvisory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { workforceKpis as fbKpis, activeTasks as fbTasks, workOrderMapData as fbMapData, crewVehicles as fbCrews, workforceDistribution as fbDist } from "@/data/mockData";
import { allKpiMetadata } from "@/data/allKpiMetadata";
import { useWorkforce } from "@/hooks/useApiData";
import type { AiInsight } from "@/components/dashboard/AiAdvisory";
import { WorkforceDistributionMap } from "@/components/workforce/WorkforceDistributionMap";
import { SearchFilterBar } from "@/components/assets/SearchFilterBar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

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

const MUTED_COLORS = ["hsl(200, 40%, 45%)", "hsl(35, 45%, 48%)", "hsl(0, 38%, 48%)", "hsl(210, 40%, 50%)", "hsl(150, 35%, 42%)"];
const PIE_COLORS = ["hsl(200, 40%, 45%)", "hsl(35, 45%, 48%)", "hsl(0, 38%, 48%)", "hsl(150, 35%, 42%)"];

const Workforce = () => {
  const { data } = useWorkforce();
  const workforceKpis = data?.kpis ?? fbKpis;
  const activeTasks = data?.activeTasks ?? fbTasks;
  const workOrderMapData = data?.workOrderMapData ?? fbMapData;
  const crewVehicles = data?.crewVehicles ?? fbCrews;
  const distribution = data?.distribution ?? fbDist;

  const [selectedKpiIdx, setSelectedKpiIdx] = useState<number | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<{ location: string; activeWorkOrders: number; taskTypes: string[]; assignedCrews: string[]; highestPriority: string | null } | null>(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [crewFilter, setCrewFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const selectedKpi = selectedKpiIdx !== null ? workforceKpis[selectedKpiIdx] : null;
  const selectedMeta = selectedKpi ? allKpiMetadata[selectedKpi.label] ?? null : null;

  const filteredTasks = activeTasks.filter((t: any) => {
    const q = search.toLowerCase();
    if (q && !(`${t.id} ${t.task} ${t.crew} ${t.location} ${t.city || ""}`).toLowerCase().includes(q)) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    if (crewFilter && t.crew !== crewFilter) return false;
    if (cityFilter && (t.city || "") !== cityFilter) return false;
    return true;
  });

  const uniqueCrews = [...new Set(activeTasks.map((t: any) => t.crew).filter(Boolean))].sort();
  const uniqueCities = [...new Set(activeTasks.map((t: any) => t.city).filter(Boolean))].sort();

  return (
  <div className="space-y-6">
    <div>
      <h1 className="text-lg font-bold tracking-wide uppercase">Workforce</h1>
      <p className="text-[11px] font-mono text-muted-foreground tracking-wide">Crew dispatch, task tracking, field operations & workforce distribution</p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {workforceKpis.map((kpi: any, i: number) => {
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

    <Tabs defaultValue="distribution" className="w-full">
      <TabsList className="bg-muted/50">
        <TabsTrigger value="distribution">Workforce Distribution</TabsTrigger>
        <TabsTrigger value="tasks">Active Tasks</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      {/* ── Distribution Map Tab ── */}
      <TabsContent value="distribution" className="mt-4 space-y-4">
        <Card className="bg-card border-border overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Workforce Heatmap & Work Order Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <WorkforceDistributionMap
              workOrders={workOrderMapData}
              crewVehicles={crewVehicles}
              onSelectSummary={setSelectedSummary}
            />
          </CardContent>
        </Card>

        {selectedSummary && (
          <Card className="bg-card border-border">
            <CardContent className="pt-4 pb-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-muted-foreground">Location:</span> <strong>{selectedSummary.location}</strong></div>
                <div><span className="text-muted-foreground">Active WOs:</span> <strong>{selectedSummary.activeWorkOrders}</strong></div>
                <div><span className="text-muted-foreground">Task Types:</span> <strong>{selectedSummary.taskTypes.join(", ")}</strong></div>
                <div><span className="text-muted-foreground">Crews:</span> <strong>{selectedSummary.assignedCrews.join(", ")}</strong></div>
              </div>
              {selectedSummary.highestPriority && (
                <div className="mt-2 text-sm"><span className="text-muted-foreground">Highest Priority:</span>{" "}
                  <Badge variant={priorityVariant[selectedSummary.highestPriority as keyof typeof priorityVariant] ?? "outline"} className="text-xs ml-1">{selectedSummary.highestPriority}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Crew vehicles summary */}
        {crewVehicles.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Crew Vehicles</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Crew ID</TableHead>
                      <TableHead>Base City</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Coordinates</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {crewVehicles.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs">{c.id}</TableCell>
                        <TableCell className="text-sm">{c.baseCity}</TableCell>
                        <TableCell>
                          <Badge variant={c.status === "Emergency" ? "destructive" : c.status === "Assigned" ? "secondary" : "outline"} className="text-xs">{c.status}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {c.location[1].toFixed(4)}, {c.location[0].toFixed(4)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* ── Active Tasks Tab ── */}
      <TabsContent value="tasks" className="mt-4 space-y-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Active Tasks & Dispatch Orders</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <SearchFilterBar
              searchValue={search}
              onSearchChange={setSearch}
              placeholder="Search by ID, task, crew, location, city..."
              resultCount={filteredTasks.length}
              totalCount={activeTasks.length}
              filters={[
                { label: "All Priority", value: priorityFilter, options: ["Critical", "High", "Medium", "Low"], onChange: setPriorityFilter },
                { label: "All Status", value: statusFilter, options: ["In Progress", "Assigned", "Pending"], onChange: setStatusFilter },
                { label: "All Crews", value: crewFilter, options: uniqueCrews, onChange: setCrewFilter },
                { label: "All Cities", value: cityFilter, options: uniqueCities, onChange: setCityFilter },
              ]}
            />
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Order</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Crew</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>ETA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.id}</TableCell>
                      <TableCell className="text-sm">{t.task}</TableCell>
                      <TableCell className="font-mono text-xs">{t.crew}</TableCell>
                      <TableCell className="text-sm max-w-[180px] truncate">{t.location}</TableCell>
                      <TableCell className="text-sm">{t.city || "–"}</TableCell>
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
      </TabsContent>

      {/* ── Analytics Tab ── */}
      <TabsContent value="analytics" className="mt-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Work Orders by City */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Work Orders by City</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={distribution.byCity} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} width={120} />
                  <Tooltip contentStyle={{ background: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="hsl(200, 40%, 45%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Work Orders by Priority */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Work Orders by Priority</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={distribution.byPriority} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, count }: any) => `${name}: ${count}`} labelLine={{ stroke: "hsl(215, 15%, 55%)" }}>
                    {distribution.byPriority.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Work Orders by Status */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Work Orders by Status</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={distribution.byStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
                  <Tooltip contentStyle={{ background: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="hsl(35, 45%, 48%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Work Orders by Type */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Work Orders by Type</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={distribution.byType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
                  <Tooltip contentStyle={{ background: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="count" fill="hsl(210, 40%, 50%)" name="Count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>

    <AiAdvisory title="Workforce AI Advisory" insights={workforceInsights} />
  </div>
  );
};

export default Workforce;
