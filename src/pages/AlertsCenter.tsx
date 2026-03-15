import { useState } from "react";
import { AlertTriangle, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { allAlerts as fallbackAlerts } from "@/data/mockData";
import { useAllAlerts } from "@/hooks/useApiData";
import { useLiveAlerts } from "@/hooks/useLiveAlerts";
import { AiAdvisory, CriticalAiAlerts } from "@/components/dashboard/AiAdvisory";
import type { AiInsight, CriticalAiAlert } from "@/components/dashboard/AiAdvisory";

const alertsInsights: AiInsight[] = [
  { type: "warning", text: "Critical alerts have increased 40 % MoM. Gas leak and pressure anomaly events are the primary drivers." },
  { type: "recommendation", text: "AI pattern analysis suggests correlating pressure alerts with recent pipeline maintenance. 3 alerts may share a common root cause." },
  { type: "trend", text: "Warning-level alerts are stable but info-level noise has grown 22 %. Consider tightening info-alert thresholds." },
  { type: "info", text: "Average alert-to-acknowledgement time is 14 min. Target is 5 min — escalation workflow optimisation recommended." },
];

const alertsCriticalAlerts: CriticalAiAlert[] = [
  { id: "AC-01", message: "Pipeline P-204 gas leak escalating — methane concentration rising 0.8 % / hr. Auto-shutoff valve activation imminent.", subsystem: "Pipeline Safety", severity: "critical" },
  { id: "AC-02", message: "3 correlated pressure anomalies detected in North zone within 2 hrs — potential cascading failure scenario.", subsystem: "Pressure Network", severity: "critical" },
];

type Severity = "all" | "critical" | "warning" | "info";

const sevColors = { critical: "text-red-400", warning: "text-amber-400", info: "text-blue-400" } as const;
const sevBg = { critical: "bg-red-500/10", warning: "bg-amber-500/10", info: "bg-blue-500/10" } as const;

const AlertsCenter = () => {
  const [filter, setFilter] = useState<Severity>("all");
  const { data: apiAlerts } = useAllAlerts();
  const baseAlerts = apiAlerts ?? fallbackAlerts;
  const { alerts: allAlerts, lastUpdated } = useLiveAlerts(baseAlerts, 30_000);
  const filtered = filter === "all" ? allAlerts : allAlerts.filter((a: any) => a.severity === filter);

  const counts = {
    critical: allAlerts.filter(a => a.severity === "critical").length,
    warning: allAlerts.filter(a => a.severity === "warning").length,
    info: allAlerts.filter(a => a.severity === "info").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold tracking-wide uppercase">Alerts</h1>
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-mono text-muted-foreground tracking-wide">Centralised alert monitoring across all subsystems</p>
          <span className="relative flex h-2 w-2 ml-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">updated {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {(["critical", "warning", "info"] as const).map(sev => (
          <div key={sev} className={`glass-panel rounded-sm p-4 ${sevBg[sev]}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{sev}</p>
            <p className={`text-3xl font-semibold font-mono ${sevColors[sev]}`}>{counts[sev]}</p>
          </div>
        ))}
      </div>

      <CriticalAiAlerts alerts={alertsCriticalAlerts} />

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filter:</span>
        {(["all", "critical", "warning", "info"] as const).map(f => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} className="text-xs capitalize h-7" onClick={() => setFilter(f)}>
            {f}
          </Button>
        ))}
      </div>

      {/* Alert List */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Events ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <AnimatePresence initial={false}>
            {filtered.map(a => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -12, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 12, height: 0 }}
                transition={{ duration: 0.3 }}
                layout
                className="flex items-start gap-3 p-3 rounded-md bg-secondary/50 hover:bg-secondary/80 transition-colors"
              >
                <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${sevColors[a.severity]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{a.message}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className={`text-xs ${a.time === "just now" ? "text-red-400 font-semibold" : "text-muted-foreground"}`}>{a.time}</span>
                    <span className="text-xs text-muted-foreground">• {a.source}</span>
                    {a.category && <Badge variant="outline" className="text-[10px] h-4">{a.category}</Badge>}
                  </div>
                </div>
                <Badge variant={a.severity === "critical" ? "destructive" : a.severity === "warning" ? "secondary" : "outline"} className="text-xs capitalize shrink-0">{a.severity}</Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>

      <AiAdvisory title="Alerts AI Advisory" insights={alertsInsights} />
    </div>
  );
};

export default AlertsCenter;
