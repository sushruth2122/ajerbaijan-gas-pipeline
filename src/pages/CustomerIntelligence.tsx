import { useState } from "react";
import { MessageSquareWarning, Clock, Repeat, MapPin } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { KpiDetailModal } from "@/components/dashboard/KpiDetailModal";
import { AiAdvisory } from "@/components/dashboard/AiAdvisory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { customerKpis as fbKpis, complaintTypes as fbTypes, complaintTrends as fbTrends, complaintHeatmap as fbHeatmap, recentComplaints as fbComplaints, customerList as fbCustomerList, customerDistributionSummary as fbDistSummary } from "@/data/mockData";
import { allKpiMetadata } from "@/data/allKpiMetadata";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useCustomers } from "@/hooks/useApiData";
import type { AiInsight } from "@/components/dashboard/AiAdvisory";
import { CustomerDistributionMap } from "@/components/customers/CustomerDistributionMap";
import { CustomerList } from "@/components/customers/CustomerList";
import { SearchFilterBar } from "@/components/assets/SearchFilterBar";

const customerInsights: AiInsight[] = [
  { type: "warning", text: "Complaint volume at 1,284 is 157 % above the 500 target. Low Pressure (32 %) and Billing (22 %) are the top categories." },
  { type: "trend", text: "Average resolution time improving (-0.8 hrs this month) but still 2× above the 2-hr target. Gas Smell complaints take the longest." },
  { type: "recommendation", text: "Deploy dedicated low-pressure response teams in North and Central zones to cut repeat complaints by an estimated 35 %." },
  { type: "info", text: "5 zones now exceed the 200-complaint/day threshold. North and Central are the worst, requiring priority crew allocation." },
];

const iconMap: Record<string, React.ReactNode> = {
  messageSquare: <MessageSquareWarning className="w-5 h-5" />,
  clock: <Clock className="w-5 h-5" />,
  repeat: <Repeat className="w-5 h-5" />,
  mapPin: <MapPin className="w-5 h-5" />,
};

const statusVariant = { Open: "destructive", "In Progress": "secondary", Resolved: "outline" } as const;

const CustomerIntelligence = () => {
  const { data } = useCustomers();
  const customerKpis = data?.kpis ?? fbKpis;
  const complaintTypes = data?.complaintTypes ?? fbTypes;
  const complaintTrends = data?.complaintTrends ?? fbTrends;
  const complaintHeatmap = data?.complaintHeatmap ?? fbHeatmap;
  const recentComplaints = data?.recentComplaints ?? fbComplaints;
  const customerList = data?.customerList ?? fbCustomerList;
  const distributionSummary = data?.customerDistributionSummary ?? fbDistSummary;
  const [selectedKpiIdx, setSelectedKpiIdx] = useState<number | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<{ customerType: string; location: string; estimatedCount: number | string; coordinates: string } | null>(null);
  const [complaintSearch, setComplaintSearch] = useState("");
  const [complaintStatusFilter, setComplaintStatusFilter] = useState("");
  const selectedKpi = selectedKpiIdx !== null ? customerKpis[selectedKpiIdx] : null;
  const selectedMeta = selectedKpi ? allKpiMetadata[selectedKpi.label] ?? null : null;

  const filteredComplaints = recentComplaints.filter((c: any) => {
    const q = complaintSearch.toLowerCase();
    if (q && !(`${c.id} ${c.customer} ${c.area} ${c.type}`).toLowerCase().includes(q)) return false;
    if (complaintStatusFilter && c.status !== complaintStatusFilter) return false;
    return true;
  });

  return (
  <div className="space-y-6">
    <div>
      <h1 className="text-lg font-bold tracking-wide uppercase">Customers</h1>
      <p className="text-[11px] font-mono text-muted-foreground tracking-wide">Customer distribution, complaint tracking, resolution times & satisfaction analytics</p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {customerKpis.map((kpi: any, i: number) => {
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

    {/* Tabbed workspace */}
    <Tabs defaultValue="distribution" className="w-full">
      <TabsList className="bg-muted/50">
        <TabsTrigger value="distribution">Customer Distribution</TabsTrigger>
        <TabsTrigger value="complaints">Complaint Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="distribution" className="mt-4 space-y-4">
        {/* Map */}
        <Card className="bg-card border-border overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Customer Distribution Map</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <CustomerDistributionMap onSelectCustomer={setSelectedCustomer} />
          </CardContent>
        </Card>

        {/* Selected customer details */}
        {selectedCustomer && (
          <Card className="bg-card border-border">
            <CardContent className="pt-4 pb-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-muted-foreground">Customer Type:</span> <strong>{selectedCustomer.customerType}</strong></div>
                <div><span className="text-muted-foreground">Location:</span> <strong>{selectedCustomer.location}</strong></div>
                <div><span className="text-muted-foreground">Est. Count in Area:</span> <strong>{selectedCustomer.estimatedCount}</strong></div>
                <div><span className="text-muted-foreground">Coordinates:</span> <span className="font-mono text-xs">{selectedCustomer.coordinates}</span></div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer list with search/filter */}
        <CustomerList customers={customerList} summary={distributionSummary} />
      </TabsContent>

      <TabsContent value="complaints" className="mt-4 space-y-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Complaint Types Distribution</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={complaintTypes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <YAxis dataKey="type" type="category" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} width={110} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(200, 40%, 45%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Weekly Complaint Trends</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={complaintTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="complaints" stroke="hsl(35, 45%, 48%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    {/* Complaint Heatmap */}
    <Card className="bg-card border-border">
      <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Complaint Heatmap by Area & Severity</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={complaintHeatmap}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
            <XAxis dataKey="area" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
            <Tooltip contentStyle={{ background: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="low" stackId="a" fill="hsl(210, 40%, 50%)" name="Low" />
            <Bar dataKey="medium" stackId="a" fill="hsl(35, 45%, 48%)" name="Medium" />
            <Bar dataKey="high" stackId="a" fill="hsl(0, 38%, 48%)" name="High" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>

    {/* Recent Complaints */}
    <Card className="bg-card border-border">
      <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Recent Customer Complaints</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <SearchFilterBar
          searchValue={complaintSearch}
          onSearchChange={setComplaintSearch}
          placeholder="Search by ID, customer, area, type..."
          resultCount={filteredComplaints.length}
          totalCount={recentComplaints.length}
          filters={[
            { label: "All Status", value: complaintStatusFilter, options: ["Open", "In Progress", "Resolved", "Investigating"], onChange: setComplaintStatusFilter },
          ]}
        />
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Complaint ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComplaints.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.id}</TableCell>
                  <TableCell className="text-sm">{c.customer}</TableCell>
                  <TableCell className="text-sm">{c.area}</TableCell>
                  <TableCell className="text-sm">{c.type}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[c.status as keyof typeof statusVariant] ?? "outline"} className="text-xs">{c.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
      </TabsContent>
    </Tabs>

    <AiAdvisory title="Customer Intelligence AI Advisory" insights={customerInsights} />
  </div>
  );
};

export default CustomerIntelligence;
