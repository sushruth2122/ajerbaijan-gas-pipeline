/**
 * Pre-build script: reads CSV data and writes static JSON API responses to
 * public/api/. Vite copies public/ into dist/ automatically.
 *
 * Run: node scripts/generate-static-data.js
 *      or via package.json: "build": "node scripts/generate-static-data.js && vite build"
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// createRequire lets us load CommonJS server modules from an ES module script
const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Tell csvLoader where the data directory is
process.env.GCC_DATA_DIR = path.join(__dirname, '..', 'data');

const d = require('../server/data');

const OUT = path.join(__dirname, '..', 'public', 'api');

function write(relPath, content) {
  const full = path.join(OUT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(content));
}

// Health
write('health.json', { status: 'ok', timestamp: new Date().toISOString() });

// ── Dashboard ──────────────────────────────────────────────────────────────
write('dashboard.json', {
  kpiData:               d.kpiData,
  consumptionTrend:      d.consumptionTrend,
  revenueVsConsumption:  d.revenueVsConsumption,
  complaintsByArea:      d.complaintsByArea,
  pipelinePressure:      d.pipelinePressure,
  alerts:                d.alerts,
  fieldCrewStatus:       d.fieldCrewStatus,
  highRiskZones:         d.highRiskZones,
});
write('dashboard/kpis.json',                    d.kpiData);
write('dashboard/consumption-trend.json',       d.consumptionTrend);
write('dashboard/revenue-vs-consumption.json',  d.revenueVsConsumption);
write('dashboard/complaints-by-area.json',      d.complaintsByArea);
write('dashboard/pipeline-pressure.json',       d.pipelinePressure);
write('dashboard/alerts.json',                  d.alerts);
write('dashboard/field-crew-status.json',       d.fieldCrewStatus);
write('dashboard/high-risk-zones.json',         d.highRiskZones);

// ── Digital Twin ───────────────────────────────────────────────────────────
write('digital-twin.json', {
  metrics:         d.digitalTwinMetrics,
  pipelineMetrics: d.pipelineMetrics,
  networkStats:    d.networkStats,
  alerts:          d.alerts,
});
write('digital-twin/map.json', {
  pipelineSegments:    d.pipelineSegments,
  smartMeterClusters:  d.smartMeterClusters,
  monitoringNodes:     d.monitoringNodes,
  incidents:           d.mapIncidents,
  complaintPoints:     d.complaintPoints,
  fieldCrews:          d.mapFieldCrews,
});
write('digital-twin/metrics.json',         d.digitalTwinMetrics);
write('digital-twin/pipeline-metrics.json', d.pipelineMetrics);
write('digital-twin/network-stats.json',    d.networkStats);

// ── Smart Meters ───────────────────────────────────────────────────────────
write('smart-meters.json', {
  kpis:             d.smartMeterKpis,
  healthStatus:     d.meterHealthStatus,
  activityByRegion: d.meterActivityByRegion,
  topCustomers:     d.topCustomersByConsumption,
  consumptionTrend: d.consumptionTrend,
});
write('smart-meters/kpis.json',               d.smartMeterKpis);
write('smart-meters/health-status.json',      d.meterHealthStatus);
write('smart-meters/activity-by-region.json', d.meterActivityByRegion);
write('smart-meters/top-customers.json',      d.topCustomersByConsumption);

// ── Revenue ────────────────────────────────────────────────────────────────
write('revenue.json', {
  kpis:               d.revenueKpis,
  areaWiseRevenue:    d.areaWiseRevenue,
  consumptionVsBilled: d.consumptionVsBilled,
  tamperingAlerts:    d.tamperingAlerts,
});
write('revenue/kpis.json',                  d.revenueKpis);
write('revenue/area-wise.json',             d.areaWiseRevenue);
write('revenue/consumption-vs-billed.json', d.consumptionVsBilled);
write('revenue/tampering-alerts.json',      d.tamperingAlerts);

// ── Safety ─────────────────────────────────────────────────────────────────
write('safety.json', {
  kpis:              d.safetyKpis,
  pressureTrends:    d.gasPressureTrends,
  leakDetection:     d.leakDetectionActivity,
  alerts:            d.safetyAlerts,
  emergencyResponse: d.emergencyResponse,
  emergencyKpis:     d.emergencyKpis,
});
write('safety/kpis.json',               d.safetyKpis);
write('safety/pressure-trends.json',    d.gasPressureTrends);
write('safety/leak-detection.json',     d.leakDetectionActivity);
write('safety/alerts.json',             d.safetyAlerts);
write('safety/emergency-response.json', d.emergencyResponse);
write('safety/emergency-kpis.json',     d.emergencyKpis);

// ── Customers ──────────────────────────────────────────────────────────────
write('customers.json', {
  kpis:              d.customerKpis,
  complaintTypes:    d.complaintTypes,
  complaintTrends:   d.complaintTrends,
  complaintHeatmap:  d.complaintHeatmap,
  recentComplaints:  d.recentComplaints,
  customerList:      d.customerList,
  customerDistributionSummary: d.customerDistributionSummary,
});
write('customers/kpis.json',              d.customerKpis);
write('customers/complaint-types.json',   d.complaintTypes);
write('customers/complaint-trends.json',  d.complaintTrends);
write('customers/complaint-heatmap.json', d.complaintHeatmap);
write('customers/recent-complaints.json', d.recentComplaints);
write('customers/list.json',              d.customerList);
write('customers/distribution-summary.json', d.customerDistributionSummary);

// ── Workforce ──────────────────────────────────────────────────────────────
write('workforce.json', {
  kpis:            d.workforceKpis,
  activeTasks:     d.activeTasks,
  workOrderMapData: d.workOrderMapData,
  crewVehicles:    d.crewVehicles,
  distribution:    d.workforceDistribution,
});
write('workforce/kpis.json',         d.workforceKpis);
write('workforce/active-tasks.json', d.activeTasks);
write('workforce/map-data.json',     d.workOrderMapData);
write('workforce/crews.json',        d.crewVehicles);
write('workforce/distribution.json', d.workforceDistribution);

// ── Assets ─────────────────────────────────────────────────────────────────
write('assets.json', {
  kpis:               d.assetKpis,
  ageDistribution:    d.assetAgeDistribution,
  maintenanceHistory: d.maintenanceHistory,
  failureFrequency:   d.failureFrequency,
  intelKpis:          d.assetIntelKpis,
  assetIntel:         d.assetIntel,
  predictiveFailures: d.predictiveFailures,
  expiryItems:        d.expiryItems,
  meterCorrelation:   d.meterCorrelation,
  recommendedActions: d.recommendedActions,
  aiAdvisory:         d.aiAdvisory,
});
write('assets/kpis.json',                d.assetKpis);
write('assets/age-distribution.json',    d.assetAgeDistribution);
write('assets/maintenance-history.json', d.maintenanceHistory);
write('assets/failure-frequency.json',   d.failureFrequency);
write('assets/intel-kpis.json',          d.assetIntelKpis);
write('assets/intel.json',               d.assetIntel);
write('assets/predictive-failures.json', d.predictiveFailures);
write('assets/expiry.json',              d.expiryItems);
write('assets/meter-correlation.json',   d.meterCorrelation);
write('assets/recommended-actions.json', d.recommendedActions);
write('assets/ai-advisory.json',         d.aiAdvisory);

// ── Alerts ─────────────────────────────────────────────────────────────────
write('alerts.json', d.allAlerts);

const count = fs.readdirSync(OUT, { recursive: true }).length;
console.log(`✓ Static API data written to public/api/ (${count} files)`);
