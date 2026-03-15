const API_BASE = '/api';

async function fetchJson<T>(url: string): Promise<T> {
  // In production (static Netlify hosting) fetch pre-generated .json files.
  // In local dev the Vite proxy forwards to the Express server as-is.
  let resolvedUrl: string;
  if (import.meta.env.PROD) {
    const [p, qs] = url.split('?');
    resolvedUrl = `${API_BASE}${p}.json${qs ? '?' + qs : ''}`;
  } else {
    resolvedUrl = `${API_BASE}${url}`;
  }
  const res = await fetch(resolvedUrl);
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  return res.json();
}

// ── Dashboard ──
export const api = {
  dashboard: {
    getAll: () => fetchJson<any>('/dashboard'),
    getKpis: () => fetchJson<any[]>('/dashboard/kpis'),
    getConsumptionTrend: () => fetchJson<any[]>('/dashboard/consumption-trend'),
    getRevenueVsConsumption: () => fetchJson<any[]>('/dashboard/revenue-vs-consumption'),
    getComplaintsByArea: () => fetchJson<any[]>('/dashboard/complaints-by-area'),
    getPipelinePressure: () => fetchJson<any[]>('/dashboard/pipeline-pressure'),
    getAlerts: () => fetchJson<any[]>('/dashboard/alerts'),
    getFieldCrewStatus: () => fetchJson<any[]>('/dashboard/field-crew-status'),
    getHighRiskZones: () => fetchJson<any[]>('/dashboard/high-risk-zones'),
  },

  digitalTwin: {
    getAll: () => fetchJson<any>('/digital-twin'),
    getMap: () => fetchJson<any>('/digital-twin/map'),
    getMetrics: () => fetchJson<any>('/digital-twin/metrics'),
    getPipelineMetrics: () => fetchJson<any[]>('/digital-twin/pipeline-metrics'),
    getNetworkStats: () => fetchJson<any>('/digital-twin/network-stats'),
  },

  smartMeters: {
    getAll: () => fetchJson<any>('/smart-meters'),
    getKpis: () => fetchJson<any[]>('/smart-meters/kpis'),
    getHealthStatus: () => fetchJson<any[]>('/smart-meters/health-status'),
    getActivityByRegion: () => fetchJson<any[]>('/smart-meters/activity-by-region'),
    getTopCustomers: () => fetchJson<any[]>('/smart-meters/top-customers'),
  },

  revenue: {
    getAll: () => fetchJson<any>('/revenue'),
    getKpis: () => fetchJson<any[]>('/revenue/kpis'),
    getAreaWise: () => fetchJson<any[]>('/revenue/area-wise'),
    getConsumptionVsBilled: () => fetchJson<any[]>('/revenue/consumption-vs-billed'),
    getTamperingAlerts: () => fetchJson<any[]>('/revenue/tampering-alerts'),
  },

  safety: {
    getAll: () => fetchJson<any>('/safety'),
    getKpis: () => fetchJson<any[]>('/safety/kpis'),
    getPressureTrends: () => fetchJson<any[]>('/safety/pressure-trends'),
    getLeakDetection: () => fetchJson<any[]>('/safety/leak-detection'),
    getAlerts: () => fetchJson<any[]>('/safety/alerts'),
    getEmergencyResponse: () => fetchJson<any[]>('/safety/emergency-response'),
    getEmergencyKpis: () => fetchJson<any[]>('/safety/emergency-kpis'),
  },

  customers: {
    getAll: () => fetchJson<any>('/customers'),
    getKpis: () => fetchJson<any[]>('/customers/kpis'),
    getComplaintTypes: () => fetchJson<any[]>('/customers/complaint-types'),
    getComplaintTrends: () => fetchJson<any[]>('/customers/complaint-trends'),
    getComplaintHeatmap: () => fetchJson<any[]>('/customers/complaint-heatmap'),
    getRecentComplaints: () => fetchJson<any[]>('/customers/recent-complaints'),
    getList: () => fetchJson<any[]>('/customers/list'),
    getDistributionSummary: () => fetchJson<any>('/customers/distribution-summary'),
  },

  workforce: {
    getAll: () => fetchJson<any>('/workforce'),
    getKpis: () => fetchJson<any[]>('/workforce/kpis'),
    getActiveTasks: () => fetchJson<any[]>('/workforce/active-tasks'),
    getMapData: () => fetchJson<any[]>('/workforce/map-data'),
    getCrews: () => fetchJson<any[]>('/workforce/crews'),
    getDistribution: () => fetchJson<any>('/workforce/distribution'),
  },

  assets: {
    getAll: () => fetchJson<any>('/assets'),
    getKpis: () => fetchJson<any[]>('/assets/kpis'),
    getAgeDistribution: () => fetchJson<any[]>('/assets/age-distribution'),
    getMaintenanceHistory: () => fetchJson<any[]>('/assets/maintenance-history'),
    getFailureFrequency: () => fetchJson<any[]>('/assets/failure-frequency'),
    getIntelKpis: () => fetchJson<any[]>('/assets/intel-kpis'),
    getIntel: () => fetchJson<any[]>('/assets/intel'),
    getPredictiveFailures: () => fetchJson<any[]>('/assets/predictive-failures'),
    getExpiry: () => fetchJson<any[]>('/assets/expiry'),
    getMeterCorrelation: () => fetchJson<any[]>('/assets/meter-correlation'),
    getRecommendedActions: () => fetchJson<any[]>('/assets/recommended-actions'),
    getAiAdvisory: () => fetchJson<any[]>('/assets/ai-advisory'),
  },

  alerts: {
    getAll: (params?: { severity?: string; category?: string }) => {
      const qs = new URLSearchParams(params as any).toString();
      return fetchJson<any[]>(`/alerts${qs ? `?${qs}` : ''}`);
    },
  },
};
