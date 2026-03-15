import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { SearchFilterBar } from "./SearchFilterBar";
import { Package } from "lucide-react";

interface AssetIntelRow {
  asset_id: string;
  type: string;
  location: string;
  pipeline_id: string;
  health_score: number;
  riskScore: number;
  failure_risk: string;
  overdue: boolean;
  action: string;
  reasons: string[];
}

interface AssetOverviewTabProps {
  assetIntel: AssetIntelRow[];
  ageDistribution: { age: string; count: number }[];
  maintenanceHistory: { month: string; preventive: number; corrective: number; emergency: number }[];
  failureFrequency: { type: string; count: number }[];
}

const ageColors = ["hsl(200, 40%, 45%)", "hsl(160, 35%, 42%)", "hsl(35, 45%, 48%)", "hsl(18, 42%, 46%)", "hsl(0, 38%, 48%)"];

const riskBadge = (score: number) => {
  if (score >= 70) return <Badge variant="destructive">Critical</Badge>;
  if (score >= 50) return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">High</Badge>;
  if (score >= 30) return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Medium</Badge>;
  return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Low</Badge>;
};

const healthColor = (score: number) =>
  score >= 85 ? "text-emerald-400" : score >= 70 ? "text-green-400" : score >= 55 ? "text-amber-400" : "text-red-400";

export function AssetOverviewTab({ assetIntel, ageDistribution, maintenanceHistory, failureFrequency }: AssetOverviewTabProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [pipelineFilter, setPipelineFilter] = useState("");

  const types = useMemo(() => [...new Set(assetIntel.map(a => a.type))].sort(), [assetIntel]);
  const pipelines = useMemo(() => [...new Set(assetIntel.map(a => a.pipeline_id))].sort(), [assetIntel]);

  const riskLabel = (score: number) => score >= 70 ? "Critical" : score >= 50 ? "High" : score >= 30 ? "Medium" : "Low";

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return assetIntel.filter(a => {
      if (q && !(`${a.asset_id} ${a.type} ${a.location} ${a.pipeline_id}`).toLowerCase().includes(q)) return false;
      if (typeFilter && a.type !== typeFilter) return false;
      if (riskFilter && riskLabel(a.riskScore) !== riskFilter) return false;
      if (pipelineFilter && a.pipeline_id !== pipelineFilter) return false;
      return true;
    });
  }, [assetIntel, search, typeFilter, riskFilter, pipelineFilter]);

  return (
    <div className="space-y-4">
      {/* Total asset count */}
      <Card className="bg-card border-border">
        <CardContent className="py-3 flex items-center gap-3">
          <Package className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium">Total Assets: <span className="text-lg font-bold">{assetIntel.length}</span></span>
        </CardContent>
      </Card>

      {/* Risk-Ranked Asset Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Risk-Ranked Asset Table</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SearchFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            placeholder="Search by ID, type, location, pipeline..."
            resultCount={filtered.length}
            totalCount={assetIntel.length}
            filters={[
              { label: "All Types", value: typeFilter, options: types, onChange: setTypeFilter },
              { label: "All Risk Levels", value: riskFilter, options: ["Critical", "High", "Medium", "Low"], onChange: setRiskFilter },
              { label: "All Pipelines", value: pipelineFilter, options: pipelines, onChange: setPipelineFilter },
            ]}
          />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Asset</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Pipeline</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs text-center">Health</TableHead>
                  <TableHead className="text-xs text-center">Risk</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Reason</TableHead>
                  <TableHead className="text-xs">Recommended Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.asset_id} className={a.riskScore >= 70 ? "bg-red-500/5" : a.riskScore >= 50 ? "bg-orange-500/5" : ""}>
                    <TableCell className="font-mono text-xs">{a.asset_id}</TableCell>
                    <TableCell className="text-xs">{a.type}</TableCell>
                    <TableCell className="font-mono text-xs">{a.pipeline_id}</TableCell>
                    <TableCell className="text-xs">{a.location}</TableCell>
                    <TableCell className="text-center">
                      <span className={`text-xs font-semibold ${healthColor(a.health_score)}`}>{a.health_score}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-semibold">{a.riskScore}</span>
                        <Progress value={a.riskScore} className="h-1.5 w-12" />
                      </div>
                    </TableCell>
                    <TableCell>{riskBadge(a.riskScore)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate" title={a.reasons.join('; ')}>
                      {a.reasons.slice(0, 2).join('; ') || '—'}
                    </TableCell>
                    <TableCell className="text-xs max-w-[180px]">{a.action}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Asset Age Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                <XAxis dataKey="age" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
                <Tooltip contentStyle={{ background: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {ageDistribution.map((_, i) => <Cell key={i} fill={ageColors[i % ageColors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Maintenance History</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={maintenanceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
                <Tooltip contentStyle={{ background: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="preventive" fill="hsl(200, 40%, 45%)" radius={[4, 4, 0, 0]} name="Preventive" />
                <Bar dataKey="corrective" fill="hsl(35, 45%, 48%)" radius={[4, 4, 0, 0]} name="Corrective" />
                <Bar dataKey="emergency" fill="hsl(0, 38%, 48%)" radius={[4, 4, 0, 0]} name="Emergency" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Failure Frequency */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Failure Frequency by Type</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={failureFrequency} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <YAxis dataKey="type" type="category" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} width={120} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(0, 38%, 48%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
