import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Wrench, Clock, AlertTriangle } from "lucide-react";
import { SearchFilterBar } from "./SearchFilterBar";

interface RecommendedAction {
  asset_id: string;
  type: string;
  location: string;
  pipeline_id: string;
  riskScore: number;
  health_score: number;
  priority: string;
  action: string;
  reasons: string[];
  estimatedDowntime: string;
  suggestedWO: string;
}

interface RecommendedActionsTabProps {
  actions: RecommendedAction[];
}

const priorityBadge = (p: string) => {
  const map: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };
  return <Badge className={map[p] || 'bg-muted text-muted-foreground'}>{p}</Badge>;
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

export function RecommendedActionsTab({ actions }: RecommendedActionsTabProps) {
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const types = useMemo(() => [...new Set(actions.map(a => a.type))].sort(), [actions]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return actions.filter(a => {
      if (q && !(`${a.asset_id} ${a.type} ${a.location} ${a.pipeline_id} ${a.action}`).toLowerCase().includes(q)) return false;
      if (priorityFilter && a.priority !== priorityFilter.toLowerCase()) return false;
      if (typeFilter && a.type !== typeFilter) return false;
      return true;
    });
  }, [actions, search, priorityFilter, typeFilter]);

  const criticalActions = actions.filter(a => a.priority === 'critical');
  const highActions = actions.filter(a => a.priority === 'high');
  const mediumActions = actions.filter(a => a.priority === 'medium');

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-card border-border border-l-4 border-l-red-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs font-medium text-muted-foreground">Critical Actions</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{criticalActions.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Requires immediate dispatch</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-l-4 border-l-orange-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-medium text-muted-foreground">High Priority</span>
            </div>
            <p className="text-2xl font-bold text-orange-400">{highActions.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Schedule within 48 hours</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-l-4 border-l-amber-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-muted-foreground">Medium Priority</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">{mediumActions.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Plan for next maintenance window</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions table (work-order style) */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Recommended Maintenance Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SearchFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            placeholder="Search by ID, type, location, action..."
            resultCount={filtered.length}
            totalCount={actions.length}
            filters={[
              { label: "All Priorities", value: priorityFilter, options: ["Critical", "High", "Medium"], onChange: setPriorityFilter },
              { label: "All Types", value: typeFilter, options: types, onChange: setTypeFilter },
            ]}
          />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Priority</TableHead>
                  <TableHead className="text-xs">Asset</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Pipeline</TableHead>
                  <TableHead className="text-xs text-center">Risk</TableHead>
                  <TableHead className="text-xs">Action</TableHead>
                  <TableHead className="text-xs">Suggested WO</TableHead>
                  <TableHead className="text-xs text-center">Est. Downtime</TableHead>
                  <TableHead className="text-xs">Justification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.asset_id} className={a.priority === 'critical' ? "bg-red-500/5" : a.priority === 'high' ? "bg-orange-500/5" : ""}>
                    <TableCell>{priorityBadge(a.priority)}</TableCell>
                    <TableCell className="font-mono text-xs">{a.asset_id}</TableCell>
                    <TableCell className="text-xs">{a.type}</TableCell>
                    <TableCell className="text-xs">{a.location}</TableCell>
                    <TableCell className="font-mono text-xs">{a.pipeline_id}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-bold">{a.riskScore}</span>
                        <Progress value={a.riskScore} className="h-1.5 w-12" />
                      </div>
                    </TableCell>
                    <TableCell className="text-xs max-w-[180px]">{a.action}</TableCell>
                    <TableCell>{woTypeBadge(a.suggestedWO)}</TableCell>
                    <TableCell className="text-center text-xs">{a.estimatedDowntime}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px]" title={a.reasons.join('; ')}>
                      {a.reasons.slice(0, 2).join('; ')}
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
