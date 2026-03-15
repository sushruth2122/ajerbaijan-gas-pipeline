import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Siren, Clock, Truck, Users, MapPin, ArrowRight, Radio, AlertTriangle, Radar, Navigation, CheckCircle2, PhoneCall, Shield, Activity, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CrewInfo {
  crew_id: string;
  city: string;
  distance_km: number;
  eta_min: number;
  status?: string;
}

interface EmergencyIncident {
  incident_id: string;
  pipeline_id: string;
  severity: "critical" | "high";
  location: string;
  latitude: number;
  longitude: number;
  detected_time: string;
  status: string;
  estimated_flow_rate: number;
  affected_customers: number;
  nearest_crew: CrewInfo | null;
  recommended_crew: CrewInfo | null;
  all_crews: { crew_id: string; base_city: string; status: string; distance: number; eta: number }[];
}

interface EmergencyKpi {
  label: string;
  value: string;
  change: string;
  trend: string;
  icon: string;
}

const kpiIconMap: Record<string, React.ReactNode> = {
  siren: <Siren className="w-5 h-5" />,
  clock: <Clock className="w-5 h-5" />,
  truck: <Truck className="w-5 h-5" />,
  users: <Users className="w-5 h-5" />,
};

const sevBorder: Record<string, string> = {
  critical: "border-l-red-500",
  high: "border-l-amber-500",
};

const statusLabel: Record<string, string> = {
  in_progress: "Responding",
  contained: "Contained",
  patrol_only: "Patrol",
};

/* ─── Live Response Timeline Stages ─── */
const timelineStages = [
  { key: "detected", label: "LEAK DETECTED", icon: Radar, color: "text-red-400", bg: "bg-red-500", detail: "Methane sensor triggered — anomaly confirmed by SCADA" },
  { key: "classified", label: "AI CLASSIFIED", icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500", detail: "Severity: CRITICAL — 26 customers in affected zone" },
  { key: "dispatched", label: "CREW DISPATCHED", icon: PhoneCall, color: "text-violet-400", bg: "bg-violet-500", detail: "CRW-A notified via SMS + radio — route guidance sent" },
  { key: "enroute", label: "EN ROUTE", icon: Truck, color: "text-primary", bg: "bg-primary", detail: "CRW-A traveling from Baku — 8.6 km — ETA 13 min" },
  { key: "onsite", label: "ON SITE", icon: Navigation, color: "text-blue-400", bg: "bg-blue-500", detail: "Crew arrived — isolating gas valve on PL-139" },
  { key: "contained", label: "CONTAINED", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500", detail: "Leak sealed — pressure normalized — area safe" },
];

function LiveResponseTracker({ incident }: { incident: EmergencyIncident }) {
  const [activeStage, setActiveStage] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Simulate progression through stages
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Advance stage every ~8 seconds, pausing at the last reached stage
    const stageTimings = [0, 3, 8, 15, 28, 42]; // seconds at which each stage activates
    const current = stageTimings.findIndex((t, i) =>
      i === stageTimings.length - 1 ? elapsed >= t : elapsed >= t && elapsed < stageTimings[i + 1]
    );
    if (current >= 0) setActiveStage(current);
  }, [elapsed]);

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <Card className="bg-card border-red-500/30 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-red-400">LIVE</span> — Active Emergency Response
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span className="text-xs font-mono text-red-400 font-bold tabular-nums">{formatElapsed(elapsed)}</span>
            </div>
            <Badge variant="destructive" className="text-xs uppercase tracking-wider">
              {timelineStages[activeStage].label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Incident summary bar */}
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-sm bg-red-500/5 border border-red-500/20">
          <Badge variant="destructive" className="text-xs">CRITICAL</Badge>
          <span className="text-sm font-bold font-mono">{incident.incident_id}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{incident.pipeline_id}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs">{incident.location}</span>
          </div>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs">Flow: <strong className="text-red-400">{incident.estimated_flow_rate} m³/hr</strong></span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs">{incident.affected_customers} customers affected</span>
          {incident.recommended_crew && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs">Crew: <strong className="text-primary">{incident.recommended_crew.crew_id}</strong> ({incident.recommended_crew.city})</span>
            </>
          )}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Progress bar background */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-border/50 z-0" />
          {/* Progress bar fill */}
          <motion.div
            className="absolute top-4 left-4 h-0.5 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 z-[1]"
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min((activeStage / (timelineStages.length - 1)) * 100, 100)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ maxWidth: "calc(100% - 32px)" }}
          />

          <div className="grid grid-cols-6 gap-1 relative z-[2]">
            {timelineStages.map((stage, i) => {
              const Icon = stage.icon;
              const isActive = i === activeStage;
              const isComplete = i < activeStage;
              const isPending = i > activeStage;

              return (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Node */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500
                    ${isActive ? `${stage.bg} border-transparent shadow-[0_0_12px] shadow-current ${stage.color}` : ""}
                    ${isComplete ? `${stage.bg} border-transparent opacity-80` : ""}
                    ${isPending ? "bg-secondary border-border" : ""}
                  `}>
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <Icon className={`w-4 h-4 ${isPending ? "text-muted-foreground/50" : "text-white"}`} />
                    )}
                    {isActive && (
                      <motion.div
                        className={`absolute w-8 h-8 rounded-full ${stage.bg}/30`}
                        animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <p className={`text-[8px] font-bold tracking-[0.1em] mt-1.5 transition-colors duration-300
                    ${isActive ? stage.color : isComplete ? "text-muted-foreground" : "text-muted-foreground/40"}
                  `}>
                    {stage.label}
                  </p>

                  {/* Detail (only for active stage) */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[9px] font-mono text-muted-foreground mt-1 leading-snug max-w-[120px]"
                      >
                        {stage.detail}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Live console log */}
        <div className="rounded-sm bg-background/80 border border-border/50 p-3 max-h-[120px] overflow-y-auto">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-wider">Response Log</span>
          </div>
          <div className="space-y-1 font-mono text-[10px]">
            {timelineStages.slice(0, activeStage + 1).map((stage, i) => (
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2"
              >
                <span className="text-muted-foreground/60 tabular-nums shrink-0">T+{String(i === 0 ? 0 : [0, 3, 8, 15, 28, 42][i]).padStart(2, "0")}s</span>
                <span className={`shrink-0 ${stage.color}`}>■</span>
                <span className="text-muted-foreground">
                  <span className={`font-semibold ${stage.color}`}>[{stage.label}]</span> {stage.detail}
                </span>
              </motion.div>
            ))}
            {activeStage < timelineStages.length - 1 && (
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex items-center gap-2 text-muted-foreground/50"
              >
                <span className="tabular-nums">T+{formatElapsed(elapsed)}</span>
                <span>▶</span>
                <span>Awaiting next stage...</span>
              </motion.div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EmergencyResponsePanel({
  incidents,
  kpis,
}: {
  incidents: EmergencyIncident[];
  kpis: EmergencyKpi[];
}) {
  return (
    <div className="space-y-4">
      {/* Emergency KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-panel p-4 border-l-2 border-l-red-500"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="text-red-400">{kpiIconMap[kpi.icon] ?? <Siren className="w-5 h-5" />}</div>
              <span className="text-xs text-muted-foreground font-medium">{kpi.label}</span>
            </div>
            <p className="text-2xl font-bold font-mono">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Live Active Emergency Tracker — first critical incident */}
      {incidents.filter(inc => inc.severity === "critical").length > 0 && (
        <LiveResponseTracker incident={incidents.filter(inc => inc.severity === "critical")[0]} />
      )}

      {/* Active Emergency Incidents */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              Emergency Response — Active Incidents
            </CardTitle>
            <Badge variant="destructive" className="text-xs">{incidents.length} active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {incidents.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No active emergencies — all systems normal</p>
          )}
          {incidents.map((inc, i) => (
            <motion.div
              key={inc.incident_id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-sm border-l-4 ${sevBorder[inc.severity]} bg-secondary/40 p-4`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                {/* Left: Incident Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={inc.severity === "critical" ? "destructive" : "secondary"} className="text-xs capitalize">
                      {inc.severity}
                    </Badge>
                    <span className="text-sm font-semibold font-mono">{inc.incident_id}</span>
                    <span className="text-xs text-muted-foreground">• {inc.pipeline_id}</span>
                    <Badge variant="outline" className="text-xs capitalize">{statusLabel[inc.status] ?? inc.status}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{inc.location}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Flow: <strong className="text-foreground">{inc.estimated_flow_rate} m³/hr</strong></span>
                    <span>Affected: <strong className="text-foreground">{inc.affected_customers}</strong> customers</span>
                  </div>
                </div>

                {/* Right: Crew Dispatch */}
                <div className="md:w-72 shrink-0">
                  {inc.recommended_crew && (
                    <div className="bg-background/60 rounded-md p-3 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                        <Radio className="w-3.5 h-3.5" />
                        Nearest Response Team
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold font-mono">{inc.recommended_crew.crew_id}</p>
                          <p className="text-xs text-muted-foreground">{inc.recommended_crew.city}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <div className="text-right">
                          <p className="text-sm font-bold font-mono text-primary">{inc.recommended_crew.distance_km} km</p>
                          <p className="text-xs text-amber-400 font-semibold">ETA {inc.recommended_crew.eta_min} min</p>
                        </div>
                      </div>

                      {/* All nearby crews */}
                      {inc.all_crews.length > 1 && (
                        <div className="border-t border-border/50 pt-2 mt-2 space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">All Nearby Crews</span>
                          {inc.all_crews.map(c => (
                            <div key={c.crew_id} className="flex items-center justify-between text-xs">
                              <span className="font-mono">{c.crew_id} <span className="text-muted-foreground">({c.base_city})</span></span>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={c.status === "available" ? "default" : c.status === "emergency" ? "destructive" : "secondary"}
                                  className="text-[10px] px-1.5 py-0 capitalize"
                                >
                                  {c.status}
                                </Badge>
                                <span className="font-mono w-16 text-right">{c.distance} km</span>
                                <span className="text-muted-foreground w-14 text-right">{c.eta} min</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* ─── How It Works — Process Flow ─── */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="scada-label flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Emergency Response Workflow — How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Process pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0 relative">
            {[
              {
                step: 1,
                icon: <Radar className="w-6 h-6" />,
                title: "DETECTION",
                desc: "IoT sensors & SCADA telemetry detect anomalies — gas leak, pressure spike, or seismic event",
                color: "text-red-400",
                bg: "bg-red-500/10",
                border: "border-red-500/30",
                detail: "400+ smart meters, pressure sensors, methane detectors",
              },
              {
                step: 2,
                icon: <AlertTriangle className="w-6 h-6" />,
                title: "CLASSIFICATION",
                desc: "AI engine classifies severity (Critical / High / Medium) and estimates affected zone radius",
                color: "text-amber-400",
                bg: "bg-amber-500/10",
                border: "border-amber-500/30",
                detail: "ML model — 95% accuracy, <2s classification time",
              },
              {
                step: 3,
                icon: <Navigation className="w-6 h-6" />,
                title: "CREW MATCHING",
                desc: "System calculates distance to all 5 crews via Haversine formula and identifies the nearest available team",
                color: "text-primary",
                bg: "bg-primary/10",
                border: "border-primary/30",
                detail: "Real-time GPS tracking, ETA computed at 40 km/h avg",
              },
              {
                step: 4,
                icon: <PhoneCall className="w-6 h-6" />,
                title: "DISPATCH",
                desc: "Auto-notification sent to recommended crew with incident details, GPS coordinates & route guidance",
                color: "text-violet-400",
                bg: "bg-violet-500/10",
                border: "border-violet-500/30",
                detail: "SMS + push notification + radio alert to crew vehicle",
              },
              {
                step: 5,
                icon: <CheckCircle2 className="w-6 h-6" />,
                title: "RESOLUTION",
                desc: "Crew arrives on-site, contains the incident, and marks resolution — all tracked in real-time",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/30",
                detail: "Avg resolution: 45 min from detection to containment",
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.35 }}
                className="relative flex flex-col"
              >
                {/* Connector line (not on last) */}
                {i < 4 && (
                  <div className="hidden md:block absolute top-8 -right-[1px] w-full h-px z-10">
                    <div className="absolute right-0 top-0 w-1/2 h-px bg-gradient-to-r from-transparent to-border" />
                    <div className="absolute right-0 top-[-3px] w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-muted-foreground/40" />
                  </div>
                )}

                <div className={`flex flex-col items-center text-center p-3 mx-1 rounded-sm border ${s.border} ${s.bg} h-full`}>
                  {/* Step number badge */}
                  <div className={`w-5 h-5 rounded-full border ${s.border} flex items-center justify-center text-[10px] font-mono font-bold ${s.color} mb-2`}>
                    {s.step}
                  </div>

                  {/* Icon */}
                  <div className={`${s.color} mb-2`}>
                    {s.icon}
                  </div>

                  {/* Title */}
                  <h4 className={`text-[10px] font-bold tracking-[0.15em] ${s.color} mb-1.5`}>
                    {s.title}
                  </h4>

                  {/* Description */}
                  <p className="text-[11px] leading-relaxed text-muted-foreground mb-2 flex-1">
                    {s.desc}
                  </p>

                  {/* Technical detail */}
                  <div className="w-full border-t border-border/50 pt-1.5 mt-auto">
                    <p className="text-[9px] font-mono text-muted-foreground/70 leading-snug">
                      {s.detail}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary stats bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 rounded-sm bg-secondary/40 border border-border/50"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-scada-glow" />
                <span className="text-[10px] font-mono text-muted-foreground">SYSTEM STATUS: <span className="text-emerald-400 font-semibold">OPERATIONAL</span></span>
              </div>
              <div className="h-3 w-px bg-border" />
              <span className="text-[10px] font-mono text-muted-foreground">5 CREWS REGISTERED</span>
              <div className="h-3 w-px bg-border" />
              <span className="text-[10px] font-mono text-muted-foreground">400+ SENSORS ACTIVE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-mono text-muted-foreground">AVG RESPONSE: <span className="text-primary font-semibold">12 MIN</span></span>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
