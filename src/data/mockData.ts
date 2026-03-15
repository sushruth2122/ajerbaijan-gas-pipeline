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

export const emergencyKpis: typeof kpiData = [
  { label: "Active Emergencies", value: "3",       change: "1 critical",      trend: "up",      icon: "siren" },
  { label: "Avg Response ETA",   value: "13 min",   change: "target < 15 min", trend: "neutral", icon: "clock" },
  { label: "Available Crews",    value: "2",        change: "of 5 total",      trend: "neutral", icon: "truck" },
  { label: "Customers at Risk",  value: "115",      change: "3 incidents",     trend: "up",      icon: "users" },
];

export const emergencyResponse: {
  incident_id: string; pipeline_id: string; severity: "critical" | "high";
  location: string; latitude: number; longitude: number;
  detected_time: string; status: string;
  estimated_flow_rate: number; affected_customers: number;
  nearest_crew: { crew_id: string; city: string; distance_km: number; eta_min: number; status?: string } | null;
  recommended_crew: { crew_id: string; city: string; distance_km: number; eta_min: number } | null;
  all_crews: { crew_id: string; base_city: string; status: string; distance: number; eta: number }[];
}[] = [
  {
    incident_id: "LKS-013", pipeline_id: "PL-139", severity: "critical",
    location: "Yasamal District", latitude: 40.382, longitude: 49.8108,
    detected_time: "2024-01-18T09:45:00Z", status: "in_progress",
    estimated_flow_rate: 44.2, affected_customers: 26,
    nearest_crew:     { crew_id: "CRW-A", city: "Baku",     distance_km: 8.6,  eta_min: 13, status: "available" },
    recommended_crew: { crew_id: "CRW-A", city: "Baku",     distance_km: 8.6,  eta_min: 13 },
    all_crews: [
      { crew_id: "CRW-A", base_city: "Baku",      status: "available", distance: 8.6,  eta: 13  },
      { crew_id: "CRW-B", base_city: "Sumqayit",  status: "assigned",  distance: 25.9, eta: 39  },
      { crew_id: "CRW-E", base_city: "Lankaran",  status: "emergency", distance: 196.2, eta: 294 },
    ],
  },
  {
    incident_id: "LKS-001", pipeline_id: "PL-074", severity: "high",
    location: "Lankaran District", latitude: 38.752, longitude: 48.851,
    detected_time: "2024-01-18T08:12:00Z", status: "patrol_only",
    estimated_flow_rate: 12.8, affected_customers: 44,
    nearest_crew:     { crew_id: "CRW-E", city: "Lankaran", distance_km: 3.1,  eta_min: 5,  status: "emergency" },
    recommended_crew: { crew_id: "CRW-D", city: "Mingachevir", distance_km: 98.4, eta_min: 148 },
    all_crews: [
      { crew_id: "CRW-E", base_city: "Lankaran",     status: "emergency", distance: 3.1,  eta: 5   },
      { crew_id: "CRW-D", base_city: "Mingachevir",  status: "available", distance: 98.4, eta: 148 },
      { crew_id: "CRW-C", base_city: "Ganja",        status: "assigned",  distance: 201.5, eta: 302 },
    ],
  },
  {
    incident_id: "LKS-007", pipeline_id: "PL-212", severity: "high",
    location: "Mingachevir Station", latitude: 40.765, longitude: 47.054,
    detected_time: "2024-01-18T10:30:00Z", status: "contained",
    estimated_flow_rate: 8.4, affected_customers: 45,
    nearest_crew:     { crew_id: "CRW-D", city: "Mingachevir", distance_km: 1.8,  eta_min: 3,  status: "available" },
    recommended_crew: { crew_id: "CRW-D", city: "Mingachevir", distance_km: 1.8,  eta_min: 3  },
    all_crews: [
      { crew_id: "CRW-D", base_city: "Mingachevir", status: "available", distance: 1.8,  eta: 3   },
      { crew_id: "CRW-C", base_city: "Ganja",       status: "assigned",  distance: 98.1, eta: 147 },
      { crew_id: "CRW-B", base_city: "Sumqayit",    status: "assigned",  distance: 178.3, eta: 267 },
    ],
  },
];

// ── Customer Intelligence ──
export const customerKpis: typeof kpiData = [];
export const complaintTypes: { type: string; count: number }[] = [];
export const complaintTrends: { day: string; complaints: number }[] = [];
export const complaintHeatmap: { area: string; low: number; medium: number; high: number }[] = [];
export const recentComplaints: { id: string; customer: string; area: string; type: string; status: string; time: string }[] = [];
export const customerList: any[] = [];
export const customerDistributionSummary: any = { total: 0, byCategory: {}, byRegion: [], byDistrict: [] };

// ── Workforce ──
export const workforceKpis: typeof kpiData = [];
export const activeTasks: { id: string; task: string; crew: string; location: string; priority: string; status: string; eta: string; latitude?: number; longitude?: number; city?: string }[] = [];
export const workOrderMapData: any[] = [];
export const crewVehicles: any[] = [];
export const workforceDistribution: any = { total: 0, byCity: [], byPriority: [], byStatus: [], byType: [] };

// ── Assets ──
export const assetKpis: typeof kpiData = [];
export const assetAgeDistribution: { age: string; count: number }[] = [];
export const maintenanceHistory: { month: string; preventive: number; corrective: number; emergency: number }[] = [];
export const failureFrequency: { type: string; count: number }[] = [];

// ── Alerts Center ──
export const allAlerts: { id: number; severity: "critical" | "warning" | "info"; category: string; message: string; time: string; source: string }[] = [];
