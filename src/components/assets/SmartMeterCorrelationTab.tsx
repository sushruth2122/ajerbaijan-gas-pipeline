import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wifi, WifiOff, AlertTriangle, Radio } from "lucide-react";
import { SearchFilterBar } from "./SearchFilterBar";

interface MeterInfo {
  meter_id: string;
  status: string;
  communication_status: string;
  last_reading: number;
  meter_type: string;
}

interface MeterCorrelationRow {
  asset_id: string;
  type: string;
  location: string;
  pipeline_id: string;
  health_score: number;
  failure_risk: string;
  meters: MeterInfo[];
  totalMeters: number;
  problemMeters: number;
  hasIssues: boolean;
}

interface SmartMeterCorrelationTabProps {
  correlation: MeterCorrelationRow[];
}

const commBadge = (status: string) => {
  if (status === 'online') return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><Wifi className="w-3 h-3 mr-1" />Online</Badge>;
  if (status === 'offline') return <Badge variant="destructive"><WifiOff className="w-3 h-3 mr-1" />Offline</Badge>;
  return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Radio className="w-3 h-3 mr-1" />Intermittent</Badge>;
};

const meterStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    inactive: 'bg-muted text-muted-foreground',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return <Badge className={map[status] || 'bg-muted text-muted-foreground'}>{status}</Badge>;
};

export function SmartMeterCorrelationTab({ correlation }: SmartMeterCorrelationTabProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [issueFilter, setIssueFilter] = useState("");

  const types = useMemo(() => [...new Set(correlation.map(c => c.type))].sort(), [correlation]);

  const totalProblems = correlation.reduce((s, c) => s + c.problemMeters, 0);
  const affectedLocations = correlation.filter(c => c.hasIssues).length;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return correlation.filter(row => {
      if (q && !(`${row.asset_id} ${row.type} ${row.location} ${row.pipeline_id}`).toLowerCase().includes(q)) return false;
      if (typeFilter && row.type !== typeFilter) return false;
      if (issueFilter === "Issues" && !row.hasIssues) return false;
      if (issueFilter === "No Issues" && row.hasIssues) return false;
      return true;
    });
  }, [correlation, search, typeFilter, issueFilter]);

  // Sort: issues first, then by problem count
  const sorted = [...filtered].sort((a, b) => {
    if (a.hasIssues !== b.hasIssues) return a.hasIssues ? -1 : 1;
    return b.problemMeters - a.problemMeters;
  });

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-card border-border border-l-4 border-l-cyan-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-medium text-muted-foreground">Correlated Assets</span>
            </div>
            <p className="text-2xl font-bold">{correlation.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Assets with co-located meters</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-l-4 border-l-red-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <WifiOff className="w-4 h-4 text-red-400" />
              <span className="text-xs font-medium text-muted-foreground">Problem Meters</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{totalProblems}</p>
            <p className="text-xs text-muted-foreground mt-1">Offline / intermittent / error</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-l-4 border-l-amber-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-muted-foreground">Affected Locations</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">{affectedLocations}</p>
            <p className="text-xs text-muted-foreground mt-1">Asset locations with meter issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Correlation table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Asset ↔ Smart Meter Correlation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SearchFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            placeholder="Search by ID, type, location, pipeline..."
            resultCount={sorted.length}
            totalCount={correlation.length}
            filters={[
              { label: "All Types", value: typeFilter, options: types, onChange: setTypeFilter },
              { label: "All Status", value: issueFilter, options: ["Issues", "No Issues"], onChange: setIssueFilter },
            ]}
          />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Asset</TableHead>
                  <TableHead className="text-xs">Asset Type</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Pipeline</TableHead>
                  <TableHead className="text-xs text-center">Health</TableHead>
                  <TableHead className="text-xs text-center">Meters</TableHead>
                  <TableHead className="text-xs text-center">Issues</TableHead>
                  <TableHead className="text-xs">Meter Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((row) => (
                  <TableRow key={row.asset_id} className={row.hasIssues ? "bg-red-500/5" : ""}>
                    <TableCell className="font-mono text-xs">{row.asset_id}</TableCell>
                    <TableCell className="text-xs">{row.type}</TableCell>
                    <TableCell className="text-xs">{row.location}</TableCell>
                    <TableCell className="font-mono text-xs">{row.pipeline_id}</TableCell>
                    <TableCell className="text-center">
                      <span className={`text-xs font-semibold ${row.health_score >= 70 ? 'text-emerald-400' : row.health_score >= 55 ? 'text-amber-400' : 'text-red-400'}`}>
                        {row.health_score}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-xs">{row.totalMeters}</TableCell>
                    <TableCell className="text-center">
                      {row.problemMeters > 0 ? (
                        <Badge variant="destructive" className="text-xs">{row.problemMeters}</Badge>
                      ) : (
                        <span className="text-xs text-emerald-400">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {row.meters.map((m) => (
                          <div key={m.meter_id} className="flex items-center gap-1">
                            <span className="font-mono text-[10px] text-muted-foreground">{m.meter_id}</span>
                            {commBadge(m.communication_status)}
                          </div>
                        ))}
                      </div>
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
