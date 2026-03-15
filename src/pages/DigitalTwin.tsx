import { motion } from "framer-motion";
import { Activity, Droplets, Radio, AlertTriangle, Thermometer, CheckCircle } from "lucide-react";
import { digitalTwinMetrics as fallbackMetrics, pipelineMetrics as fallbackPipelines, networkStats as fallbackNetStats, alerts as fallbackAlerts } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import GasICCCMap from "@/components/dashboard/AzerbaijanGasMap";
import { useDigitalTwin, useDigitalTwinMap } from "@/hooks/useApiData";

const statusColors = {
  normal: "text-success",
  warning: "text-warning",
  critical: "text-destructive",
};

function MetricCard({ icon: Icon, label, value, unit, status }: {
  icon: React.ElementType; label: string; value: number | string; unit?: string; status: "normal" | "warning" | "critical";
}) {
  return (
    <div className="glass-panel rounded-sm p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${statusColors[status]}`} />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className={`text-2xl font-semibold font-mono ${statusColors[status]}`}>
        {value}
        {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
      </p>
    </div>
  );
}

const sevBadge = { critical: "destructive", warning: "secondary", info: "outline" } as const;

const DigitalTwin = () => {
  const { data: dtData } = useDigitalTwin();
  const { data: mapData } = useDigitalTwinMap();
  const digitalTwinMetrics = dtData?.metrics ?? fallbackMetrics;
  const pipelineMetrics = dtData?.pipelineMetrics ?? fallbackPipelines;
  const networkStats = dtData?.networkStats ?? fallbackNetStats;
  const alerts = dtData?.alerts ?? fallbackAlerts;
  const m = digitalTwinMetrics;
  const networkAlerts = alerts.filter((a: any) => a.severity !== "info").slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold tracking-wide uppercase">Network Map</h1>
        <p className="text-[11px] font-mono text-muted-foreground tracking-wide">Live pipeline visualisation & network monitoring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main visualization */}
        <div className="lg:col-span-3 space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-sm overflow-hidden" style={{ height: "520px" }}>
            <GasICCCMap mapData={mapData ?? null} />
          </motion.div>

          {/* Pipeline Metrics Table */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Pipeline Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pipeline ID</TableHead>
                    <TableHead>Pressure (bar)</TableHead>
                    <TableHead>Flow Rate (m³/hr)</TableHead>
                    <TableHead>Temp (°C)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pipelineMetrics.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-sm">{p.id}</TableCell>
                      <TableCell className={`font-mono ${statusColors[p.status]}`}>{p.pressure}</TableCell>
                      <TableCell className="font-mono">{p.flowRate.toLocaleString()}</TableCell>
                      <TableCell className="font-mono">{p.temperature}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === "normal" ? "outline" : p.status === "warning" ? "secondary" : "destructive"} className="text-xs capitalize">
                          {p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Side widgets */}
        <div className="space-y-4">
          <MetricCard icon={Activity} label="Pipeline Pressure" value={m.pipelinePressure.value} unit={m.pipelinePressure.unit} status={m.pipelinePressure.status} />
          <MetricCard icon={Droplets} label="Flow Rate" value={m.flowRate.value.toLocaleString()} unit={m.flowRate.unit} status={m.flowRate.status} />
          <MetricCard icon={Radio} label="Active Sensors" value={`${m.activeSensors.value.toLocaleString()} / ${m.activeSensors.total.toLocaleString()}`} status={m.activeSensors.status} />
          <MetricCard icon={AlertTriangle} label="Leak Alerts" value={m.leakAlerts.value} status={m.leakAlerts.status} />

          {/* Network Statistics */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Network Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Total Pipelines", value: networkStats.totalPipelines.toLocaleString() },
                { label: "Active Sensors", value: networkStats.activeSensors.toLocaleString() },
                { label: "Regulator Stations", value: networkStats.regulatorStations.toLocaleString() },
                { label: "Maintenance Zones", value: networkStats.maintenanceZones.toString() },
              ].map(s => (
                <div key={s.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-mono font-medium">{s.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {networkAlerts.map(a => (
                <div key={a.id} className="flex items-start gap-2 text-xs">
                  <AlertTriangle className={`w-3 h-3 mt-0.5 shrink-0 ${a.severity === "critical" ? "text-destructive" : "text-warning"}`} />
                  <div>
                    <p className="text-foreground">{a.message}</p>
                    <p className="text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DigitalTwin;
