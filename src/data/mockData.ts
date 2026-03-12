/**
 * Fallback data — shown only when the API is unreachable.
 * All real business data comes from the CSV-backed Express API.
 * These are empty-state skeletons that match the API response shapes.
 */

// ── Dashboard ──
export const kpiData: { label: string; value: string; change: string; trend: "up" | "down" | "neutral"; icon: string }[] = [];
export const consumptionTrend: { time: string; consumption: number; baseline: number }[] = [];
export const revenueVsConsumption: { month: string; revenue: number; consumption: number }[] = [];
export const complaintsByArea: { area: string; complaints: number; severity: string }[] = [];
export const pipelinePressure: { zone: string; pressure: number; normal: number; status: "normal" | "warning" | "critical" }[] = [];
export const alerts: { id: number; severity: "critical" | "warning" | "info"; message: string; time: string; source: string }[] = [];
export const fieldCrewStatus: { status: string; count: number; color: "success" | "info" | "warning" }[] = [];
export const highRiskZones: { zone: string; risk: number; type: string }[] = [];

// ── Digital Twin ──
export const digitalTwinMetrics = {
  pipelinePressure: { value: 0, unit: "bar", status: "normal" as const },
  flowRate: { value: 0, unit: "m³/hr", status: "normal" as const },
  activeSensors: { value: 0, total: 0, status: "normal" as const },
  leakAlerts: { value: 0, status: "normal" as const },
};
export const pipelineMetrics: { id: string; pressure: number; flowRate: number; temperature: number; status: "normal" | "warning" | "critical" }[] = [];
export const networkStats = { totalPipelines: 0, activeSensors: 0, regulatorStations: 0, maintenanceZones: 0 };

// ── Smart Meters ──
export const smartMeterKpis: typeof kpiData = [];
export const meterHealthStatus: { status: string; count: number; pct: number }[] = [];
export const meterActivityByRegion: { region: string; active: number; inactive: number }[] = [];
export const topCustomersByConsumption: { rank: number; customerId: string; name: string; region: string; consumption: string; status: string }[] = [];

// ── Revenue ──
export const revenueKpis: typeof kpiData = [];
export const areaWiseRevenue: { area: string; billed: number; collected: number }[] = [];
export const consumptionVsBilled: { month: string; consumed: number; billed: number; gap: number }[] = [];
export const tamperingAlerts: typeof alerts = [];

// ── Safety ──
export const safetyKpis: typeof kpiData = [];
export const gasPressureTrends: { time: string; pressure: number; threshold: number }[] = [];
export const leakDetectionActivity: { zone: string; detected: number; resolved: number }[] = [];
export const safetyAlerts: typeof alerts = [];

// ── Customer Intelligence ──
export const customerKpis: typeof kpiData = [];
export const complaintTypes: { type: string; count: number }[] = [];
export const complaintTrends: { day: string; complaints: number }[] = [];
export const complaintHeatmap: { area: string; low: number; medium: number; high: number }[] = [];
export const recentComplaints: { id: string; customer: string; area: string; type: string; status: string; time: string }[] = [];

// ── Workforce ──
export const workforceKpis: typeof kpiData = [];
export const activeTasks: { id: string; task: string; crew: string; location: string; priority: string; status: string; eta: string }[] = [];

// ── Assets ──
export const assetKpis: typeof kpiData = [];
export const assetAgeDistribution: { age: string; count: number }[] = [];
export const maintenanceHistory: { month: string; preventive: number; corrective: number; emergency: number }[] = [];
export const failureFrequency: { type: string; count: number }[] = [];

// ── Alerts Center ──
export const allAlerts: { id: number; severity: "critical" | "warning" | "info"; category: string; message: string; time: string; source: string }[] = [];
