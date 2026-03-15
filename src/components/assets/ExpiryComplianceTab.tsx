import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarClock, AlertTriangle, Clock, RotateCcw } from "lucide-react";
import { SearchFilterBar } from "./SearchFilterBar";

interface ExpiryItem {
  asset_id: string;
  type: string;
  location: string;
  pipeline_id: string;
  health_score: number;
  next_scheduled_maintenance: string;
  daysTillMaint: number;
  overdue: boolean;
  installation_year: number;
  age: number;
  lifespan: number;
  eolYear: number;
  yearsToEol: number;
  eolCandidate: boolean;
  status: string;
}

interface ExpiryComplianceTabProps {
  items: ExpiryItem[];
}

const statusBadge = (status: string) => {
  const map: Record<string, { cls: string; label: string }> = {
    'overdue': { cls: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Overdue' },
    'due-7d': { cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'Due ≤ 7d' },
    'due-30d': { cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Due ≤ 30d' },
    'due-90d': { cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Due ≤ 90d' },
    'eol': { cls: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'End of Life' },
  };
  const cfg = map[status] || { cls: 'bg-muted text-muted-foreground', label: status };
  return <Badge className={cfg.cls}>{cfg.label}</Badge>;
};

export function ExpiryComplianceTab({ items }: ExpiryComplianceTabProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const types = useMemo(() => [...new Set(items.map(i => i.type))].sort(), [items]);
  const statuses = useMemo(() => [...new Set(items.map(i => i.status))].sort(), [items]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(item => {
      if (q && !(`${item.asset_id} ${item.type} ${item.location} ${item.pipeline_id}`).toLowerCase().includes(q)) return false;
      if (typeFilter && item.type !== typeFilter) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      return true;
    });
  }, [items, search, typeFilter, statusFilter]);

  const overdueCount = items.filter(i => i.overdue).length;
  const due7 = items.filter(i => i.status === 'due-7d').length;
  const due30 = items.filter(i => i.status === 'due-30d').length;
  const eolCount = items.filter(i => i.eolCandidate).length;

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card border-border border-l-4 border-l-red-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs font-medium text-muted-foreground">Overdue</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{overdueCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-l-4 border-l-orange-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-medium text-muted-foreground">Due ≤ 7 Days</span>
            </div>
            <p className="text-2xl font-bold text-orange-400">{due7}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-l-4 border-l-amber-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <CalendarClock className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-muted-foreground">Due ≤ 30 Days</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">{due30}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-l-4 border-l-purple-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <RotateCcw className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-muted-foreground">End-of-Life</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">{eolCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Expiry table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Maintenance & Lifecycle Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SearchFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            placeholder="Search by ID, type, location, pipeline..."
            resultCount={filtered.length}
            totalCount={items.length}
            filters={[
              { label: "All Types", value: typeFilter, options: types, onChange: setTypeFilter },
              { label: "All Statuses", value: statusFilter, options: statuses, onChange: setStatusFilter },
            ]}
          />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Asset</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Pipeline</TableHead>
                  <TableHead className="text-xs text-center">Health</TableHead>
                  <TableHead className="text-xs">Next Maintenance</TableHead>
                  <TableHead className="text-xs text-center">Days</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-center">Age (yr)</TableHead>
                  <TableHead className="text-xs text-center">Expected Life</TableHead>
                  <TableHead className="text-xs text-center">EOL Year</TableHead>
                  <TableHead className="text-xs">EOL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.asset_id} className={item.overdue ? "bg-red-500/5" : item.eolCandidate ? "bg-purple-500/5" : ""}>
                    <TableCell className="font-mono text-xs">{item.asset_id}</TableCell>
                    <TableCell className="text-xs">{item.type}</TableCell>
                    <TableCell className="text-xs">{item.location}</TableCell>
                    <TableCell className="font-mono text-xs">{item.pipeline_id}</TableCell>
                    <TableCell className="text-center">
                      <span className={`text-xs font-semibold ${item.health_score >= 70 ? 'text-emerald-400' : item.health_score >= 55 ? 'text-amber-400' : 'text-red-400'}`}>
                        {item.health_score}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">{item.next_scheduled_maintenance}</TableCell>
                    <TableCell className="text-center">
                      <span className={`text-xs font-bold ${item.overdue ? 'text-red-400' : item.daysTillMaint <= 7 ? 'text-orange-400' : 'text-muted-foreground'}`}>
                        {item.overdue ? `${Math.abs(item.daysTillMaint)}d ago` : `${item.daysTillMaint}d`}
                      </span>
                    </TableCell>
                    <TableCell>{statusBadge(item.status)}</TableCell>
                    <TableCell className="text-center text-xs">{item.age}</TableCell>
                    <TableCell className="text-center text-xs">{item.lifespan} yr</TableCell>
                    <TableCell className="text-center text-xs">{item.eolYear}</TableCell>
                    <TableCell>
                      {item.eolCandidate && (
                        <Badge className={item.yearsToEol <= 0 ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-purple-500/20 text-purple-400 border-purple-500/30"}>
                          {item.yearsToEol <= 0 ? 'Past EOL' : `${item.yearsToEol}yr left`}
                        </Badge>
                      )}
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
