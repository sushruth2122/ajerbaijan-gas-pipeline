import { Sparkles, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

export interface AiInsight {
  type: "recommendation" | "warning" | "trend" | "info";
  text: string;
}

interface AiAdvisoryProps {
  /** Section title – defaults to "AI Advisory" */
  title?: string;
  insights: AiInsight[];
  /** Optional: make the panel span full width */
  className?: string;
}

const typeConfig = {
  recommendation: { icon: Lightbulb, accent: "text-violet-300" },
  warning: { icon: AlertTriangle, accent: "text-amber-400" },
  trend: { icon: TrendingUp, accent: "text-violet-300" },
  info: { icon: Sparkles, accent: "text-violet-300" },
};

export function AiAdvisory({ title = "AI Advisory", insights, className = "" }: AiAdvisoryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-lg border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-violet-900/20 to-transparent p-4 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-md bg-violet-500/20">
          <Sparkles className="w-4 h-4 text-violet-400" />
        </div>
        <h3 className="text-sm font-semibold text-violet-300 uppercase tracking-wider">{title}</h3>
      </div>

      <div className="space-y-2">
        {insights.map((insight, i) => {
          const cfg = typeConfig[insight.type];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.25 }}
              className="flex items-start gap-2.5 p-2.5 rounded-md bg-violet-500/5 hover:bg-violet-500/10 transition-colors"
            >
              <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${cfg.accent}`} />
              <p className="text-xs leading-relaxed text-violet-100/80">{insight.text}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── Critical AI Alerts banner (red/violet blend) ── */

export interface CriticalAiAlert {
  id: string;
  message: string;
  subsystem: string;
  severity: "critical" | "high";
}

interface CriticalAiAlertsProps {
  alerts: CriticalAiAlert[];
  className?: string;
}

export function CriticalAiAlerts({ alerts, className = "" }: CriticalAiAlertsProps) {
  if (alerts.length === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border border-red-500/40 bg-gradient-to-r from-red-950/50 via-red-900/20 to-violet-950/30 p-4 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-md bg-red-500/20">
          <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
        </div>
        <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Critical AI Alerts</h3>
        <span className="ml-auto text-[10px] font-mono bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
          {alerts.length} active
        </span>
      </div>
      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-2.5 p-2.5 rounded-md bg-red-500/5 border-l-2 border-l-red-500/60"
          >
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-400" />
            <div className="flex-1 min-w-0">
              <p className="text-xs leading-relaxed text-red-100/80">{alert.message}</p>
              <span className="text-[10px] text-red-400/60 mt-0.5 inline-block">{alert.subsystem}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
