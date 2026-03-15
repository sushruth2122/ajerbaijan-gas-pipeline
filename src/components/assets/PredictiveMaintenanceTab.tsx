import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Zap, Wrench, Clock } from "lucide-react";
import { SearchFilterBar } from "./SearchFilterBar";

interface PredictiveFailure {
  asset_id: string;
  type: string;
  location: string;
  pipeline_id: string;
  health_score: number;
  riskScore: number;
  confidence: number;
  daysToFailure: number;
  suggestedWO: string;
  reasons: string[];
}

interface PredictiveMaintenanceTabProps {
  failures: PredictiveFailure[];
}

const severityIcon = (risk: number) => {
  if (risk >= 70) return <AlertTriangle className="w-4 h-4 text-red-400" />;
  if (risk >= 50) return <Zap className="w-4 h-4 text-orange-400" />;
  return <Clock className="w-4 h-4 text-amber-400" />;
};

const woTypeBadge = (wo: string) => {
  const map: Record<string, string> = {
    'Emergency Repair': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Corrective Maintenance': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Scheduled Maintenance': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Preventive Inspection': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };
  return <Badge className={map[wo] || 'bg-muted text-muted-foreground'}>{wo}</Badge>;
};

export function PredictiveMaintenanceTab({ failures }: PredictiveMaintenanceTabProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");

  const types = useMemo(() => [...new Set(failures.map(f => f.type))].sort(), [failures]);
  const riskLabel = (score: number) => score >= 70 ? "Critical" : score >= 50 ? "High" : "Moderate";

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return failures.filter(f => {
      if (q && !(`${f.asset_id} ${f.type} ${f.location} ${f.pipeline_id}`).toLowerCase().includes(q)) return false;
      if (typeFilter && f.type !== typeFilter) return false;
      if (riskFilter && riskLabel(f.riskScore) !== riskFilter) return false;
      return true;
    });
  }, [failures, search, typeFilter, riskFilter]);

  const critical = failures.filter(f => f.riskScore >= 70);
  const high = failures.filter(f => f.riskScore >= 50 && f.riskScore < 70);
  const moderate = failures.filter(f => f.riskScore < 50);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-card border-border border-l-4 border-l-red-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs font-medium text-muted-foreground">Critical Risk</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{critical.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Failure likely within days</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-l-4 border-l-orange-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-medium text-muted-foreground">High Risk</span>
            </div>
            <p className="text-2xl font-bold text-orange-400">{high.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Schedule corrective maintenance</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-l-4 border-l-amber-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-muted-foreground">Moderate Risk</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">{moderate.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Preventive inspection suggested</p>
          </CardContent>
        </Card>
      </div>

      {/* Failure candidates table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Top Failure Candidates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SearchFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            placeholder="Search by ID, type, location, pipeline..."
            resultCount={filtered.length}
            totalCount={failures.length}
            filters={[
              { label: "All Types", value: typeFilter, options: types, onChange: setTypeFilter },
              { label: "All Risk Levels", value: riskFilter, options: ["Critical", "High", "Moderate"], onChange: setRiskFilter },
            ]}
          />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-8"></TableHead>
                  <TableHead className="text-xs">Asset</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Pipeline</TableHead>
                  <TableHead className="text-xs text-center">Health</TableHead>
                  <TableHead className="text-xs text-center">Risk Score</TableHead>
                  <TableHead className="text-xs text-center">Confidence</TableHead>
                  <TableHead className="text-xs text-center">Days to Failure</TableHead>
                  <TableHead className="text-xs">Suggested Work Order</TableHead>
                  <TableHead className="text-xs">Signals</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((f) => (
                  <TableRow key={f.asset_id} className={f.riskScore >= 70 ? "bg-red-500/5" : f.riskScore >= 50 ? "bg-orange-500/5" : ""}>
                    <TableCell>{severityIcon(f.riskScore)}</TableCell>
                    <TableCell className="font-mono text-xs">{f.asset_id}</TableCell>
                    <TableCell className="text-xs">{f.type}</TableCell>
                    <TableCell className="text-xs">{f.location}</TableCell>
                    <TableCell className="font-mono text-xs">{f.pipeline_id}</TableCell>
                    <TableCell className="text-center">
                      <span className={`text-xs font-semibold ${f.health_score >= 70 ? 'text-emerald-400' : f.health_score >= 55 ? 'text-amber-400' : 'text-red-400'}`}>
                        {f.health_score}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-bold">{f.riskScore}</span>
                        <Progress value={f.riskScore} className="h-1.5 w-12" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs font-medium">{f.confidence}%</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`text-xs font-bold ${f.daysToFailure <= 30 ? 'text-red-400' : f.daysToFailure <= 90 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                        ~{f.daysToFailure}d
                      </span>
                    </TableCell>
                    <TableCell>{woTypeBadge(f.suggestedWO)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px]" title={f.reasons.join('; ')}>
                      {f.reasons.slice(0, 2).join('; ')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
