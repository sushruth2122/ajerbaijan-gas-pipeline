/**
 * â”€â”€ CSV-backed data module â”€â”€
 *
 * Every API response is computed deterministically from the 7 CSV files
 * in /data.  GIS map layers for the Digital Twin page are kept as-is
 * (visualisation coordinates, not business data).
 *
 * â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
 * â”‚ CSV file         â”‚ Feeds pages / widgets                            â”‚
 * â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
 * â”‚ meters.csv       â”‚ Dashboard KPIs, Smart Meters, Revenue, Digital   â”‚
 * â”‚                  â”‚ Twin metrics, Alerts                             â”‚
 * â”‚ pressure.csv     â”‚ Dashboard pressure & consumption, Safety trends, â”‚
 * â”‚                  â”‚ Digital Twin metrics, Alerts                     â”‚
 * â”‚ billing.csv      â”‚ Dashboard revenue KPI, Revenue page, Smart Meter â”‚
 * â”‚                  â”‚ top-customers                                    â”‚
 * â”‚ complaints.csv   â”‚ Dashboard complaints, Customers page, Alerts     â”‚
 * â”‚ leaks.csv        â”‚ Dashboard alerts & risk zones, Safety page,      â”‚
 * â”‚                  â”‚ Alerts, Digital Twin metrics                     â”‚
 * â”‚ assets.csv       â”‚ Assets page, Digital Twin network stats          â”‚
 * â”‚ workorders.csv   â”‚ Dashboard crew KPIs, Workforce page, Assets      â”‚
 * â”‚                  â”‚ maintenance, Alerts                              â”‚
 * â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
 */

const { loadCsv } = require('./csvLoader');

// â”€â”€ Load all CSVs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const meters     = loadCsv('meters.csv');
const pressure   = loadCsv('pressure.csv');
const billing    = loadCsv('billing.csv');
const complaints = loadCsv('complaints.csv');
const leaks      = loadCsv('leaks.csv');
const assets     = loadCsv('assets.csv');
const workorders = loadCsv('workorders.csv');

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const fmt   = (n) => n.toLocaleString('en-IN');
const round = (n, d = 1) => Number(n.toFixed(d));
const countWhere = (arr, fn) => arr.filter(fn).length;
const sumOf = (arr, key) => arr.reduce((s, r) => s + (Number(r[key]) || 0), 0);
const cap   = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Classify a lat/lng into a city zone. */
function toZone(lat, lng) {
  if (lat >= 40.76) return 'North';
  if (lat < 40.70)  return 'South';
  if (lng > -74.00) return 'East';
  if (lng < -74.02) return 'West';
  return 'Central';
}

/** Bucket fine-grained complaint categories into broader groups. */
function bucketCategory(cat) {
  if (/bill|billing|dispute|incorrect/i.test(cat)) return 'Billing';
  if (/leak|gas\s*(leak|smell|odor)|methane/i.test(cat)) return 'Gas Leak / Odor';
  if (/meter|reading|tamper|offline|replace/i.test(cat)) return 'Meter Issue';
  if (/pressure|flow|low pressure|fluctuation/i.test(cat)) return 'Pressure';
  return 'Service / Other';
}

/** Relative time string from ISO timestamp. */
function timeSince(iso) {
  if (!iso) return 'â€”';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// â”€â”€ Lookup maps â”€â”€
const meterById   = Object.fromEntries(meters.map(m => [m.meter_id, m]));
const billByMeter = Object.fromEntries(billing.map(b => [b.meter_id, b]));

// â”€â”€ Meter aggregates â”€â”€
const activeMeters  = countWhere(meters, m => m.status === 'active');
const onlineMeters  = countWhere(meters, m => m.communication_status === 'online');
const offlineMeters = countWhere(meters, m => m.communication_status === 'offline');
const intermittent  = countWhere(meters, m => m.communication_status === 'intermittent');
const totalMeterConsumption = round(sumOf(meters, 'last_reading'), 1);

// â”€â”€ Billing aggregates â”€â”€
const totalBilled    = round(sumOf(billing, 'amount'), 2);
const paidRows       = billing.filter(b => b.payment_status === 'paid');
const totalCollected = round(sumOf(paidRows, 'amount'), 2);
const overdueRows    = billing.filter(b => b.payment_status === 'overdue');
const pendingBillRows = billing.filter(b => b.payment_status === 'pending');
const totalOverdue   = round(sumOf(overdueRows, 'amount'), 2);
const billingAnomalies = countWhere(billing, b => b.billing_anomaly === true);

// â”€â”€ Complaint aggregates â”€â”€
const unresolvedComplaints = countWhere(complaints, c => c.status !== 'resolved');
const repeatComplaints     = countWhere(complaints, c => c.repeat_complaint === true);
const resolvedTimes = complaints.filter(c => c.resolution_time_hours !== '').map(c => Number(c.resolution_time_hours));
const avgResolution = resolvedTimes.length ? round(resolvedTimes.reduce((a, b) => a + b, 0) / resolvedTimes.length, 1) : 0;

// â”€â”€ Leak aggregates â”€â”€
const activeLeaks     = leaks.filter(l => l.status !== 'resolved');
const totalAffected   = sumOf(activeLeaks, 'affected_customers');
const crewsDispatched = countWhere(leaks, l => l.crew_dispatched === true && l.status !== 'resolved');

// â”€â”€ Workorder aggregates â”€â”€
const uniqueCrews   = [...new Set(workorders.filter(w => w.crew_id).map(w => w.crew_id))];
const openWOs       = countWhere(workorders, w => w.status !== 'completed');
const inProgressWOs = countWhere(workorders, w => w.status === 'in_progress');
const assignedWOs   = countWhere(workorders, w => w.status === 'assigned');
const completedWOs  = countWhere(workorders, w => w.status === 'completed');
const pendingWOs    = countWhere(workorders, w => w.status === 'pending');

// â”€â”€ Pressure aggregates â”€â”€
const latestTs       = pressure.reduce((l, p) => p.timestamp > l ? p.timestamp : l, '');
const latestPressure = pressure.filter(p => p.timestamp === latestTs);
const pressureAnomalies = countWhere(pressure, p => p.status !== 'normal');
const uniqueAssetPipelines = [...new Set(assets.map(a => a.pipeline_id))];
const criticalRiskAssets = countWhere(assets, a => a.failure_risk === 'critical');
const highRiskAssets     = countWhere(assets, a => a.failure_risk === 'high');

// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
// DASHBOARD  â† meters, billing, complaints,
//               leaks, pressure, workorders
// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

const kpiData = [
  { label: "Total Customers",     value: fmt(meters.length),          change: `${meters.length} meters`,          trend: "neutral", icon: "users" },
  { label: "Active Smart Meters", value: fmt(activeMeters),           change: `${round(activeMeters/meters.length*100)}%`, trend: "up", icon: "gauge" },
  { label: "Gas Consumption",     value: `${fmt(totalMeterConsumption)} m³`, change: `${meters.length} meters`,  trend: "neutral", icon: "flame" },
  { label: "Revenue Collected",   value: `AZN ${fmt(totalCollected)}`,   change: `of AZN ${fmt(totalBilled)}`,        trend: "up",      icon: "manat" },
  { label: "Active Leak Alerts",  value: String(activeLeaks.length),   change: `${countWhere(activeLeaks, l => l.severity === 'critical')} critical`, trend: "up", icon: "alertTriangle" },
  { label: "Open Complaints",     value: String(unresolvedComplaints), change: `of ${complaints.length}`,        trend: "down",    icon: "messageSquare" },
  { label: "Field Crews Active",  value: String(uniqueCrews.length),   change: `${inProgressWOs} in-progress`,   trend: "neutral", icon: "hardHat" },
  { label: "Open Work Orders",    value: String(openWOs),              change: `${pendingWOs} pending`,           trend: "up",      icon: "wrench" },
];

// consumptionTrend â† pressure.csv total flow_rate per timestamp hour
const flowByHour = {};
pressure.forEach(p => {
  const hour = p.timestamp.substring(11, 16);
  if (!flowByHour[hour]) flowByHour[hour] = { total: 0, count: 0 };
  flowByHour[hour].total += p.flow_rate;
  flowByHour[hour].count += 1;
});
const consumptionTrend = Object.keys(flowByHour).sort().map(hour => ({
  time: hour,
  consumption: Math.round(flowByHour[hour].total),
  baseline: Math.round(flowByHour[hour].total * 0.95),
}));

// revenueVsConsumption â† billing by meter_type
const rvByType = {};
billing.forEach(b => {
  const m = meterById[b.meter_id];
  const type = m ? cap(m.meter_type) : 'Unknown';
  if (!rvByType[type]) rvByType[type] = { consumption: 0, revenue: 0 };
  rvByType[type].consumption += Number(b.consumption) || 0;
  rvByType[type].revenue     += Number(b.amount) || 0;
});
const revenueVsConsumption = Object.entries(rvByType).map(([t, d]) => ({
  month: t, revenue: round(d.revenue, 1), consumption: round(d.consumption, 1),
}));

// complaintsByArea â† complaints grouped by lat/lng zone
const compByZone = {};
complaints.forEach(c => {
  const z = toZone(c.latitude, c.longitude);
  if (!compByZone[z]) compByZone[z] = { total: 0, maxPri: 0 };
  compByZone[z].total += 1;
  const pw = { critical: 4, high: 3, medium: 2, low: 1 };
  if ((pw[c.priority] || 0) > compByZone[z].maxPri) compByZone[z].maxPri = pw[c.priority];
});
const priToSev = { 4: 'high', 3: 'high', 2: 'medium', 1: 'low', 0: 'low' };
const complaintsByArea = Object.entries(compByZone)
  .sort((a, b) => b[1].total - a[1].total)
  .map(([area, d]) => ({ area, complaints: d.total, severity: priToSev[d.maxPri] }));

// pipelinePressure â† pressure.csv latest readings per pipeline (scaled to bar)
const PRESSURE_NORMAL = 4.5;
const pipelinePressure = latestPressure.map(p => ({
  zone: p.pipeline_id,
  pressure: round(p.pressure / 10, 1),
  normal: PRESSURE_NORMAL,
  status: p.status,
}));

// alerts â† leaks + pressure anomalies + complaints
let alertId = 0;
const alerts = [];
activeLeaks.filter(l => l.severity === 'critical' || l.severity === 'high').forEach(l => {
  alerts.push({ id: ++alertId, severity: l.severity === 'critical' ? 'critical' : 'warning',
    message: `${l.severity === 'critical' ? 'Gas Leak' : 'Leak Alert'} â€” ${l.pipeline_id}, ${l.location}`,
    time: timeSince(l.detected_time), source: `Leak Detector ${l.leak_id}` });
});
latestPressure.filter(p => p.anomaly === true).forEach(p => {
  alerts.push({ id: ++alertId, severity: p.status === 'critical' ? 'critical' : 'warning',
    message: `Pressure ${p.status} â€” ${p.pipeline_id}, ${p.location}`,
    time: timeSince(p.timestamp), source: `Pipeline Sensor ${p.pipeline_id}` });
});
complaints.filter(c => c.status !== 'resolved' && (c.priority === 'critical' || c.priority === 'high')).forEach(c => {
  alerts.push({ id: ++alertId, severity: c.priority === 'critical' ? 'critical' : 'warning',
    message: `${c.category} â€” ${c.location}`, time: timeSince(c.timestamp), source: `Complaint ${c.complaint_id}` });
});
workorders.filter(w => w.status === 'completed').forEach(w => {
  alerts.push({ id: ++alertId, severity: 'info',
    message: `WO completed â€” ${w.workorder_id} (${w.type}) at ${w.location}`,
    time: timeSince(w.actual_resolution_time || w.assigned_time), source: 'Workforce System' });
});

// fieldCrewStatus â† workorders by status
const fieldCrewStatus = [
  { status: "In Progress", count: inProgressWOs, color: "success" },
  { status: "Assigned",    count: assignedWOs,   color: "info" },
  { status: "Pending",     count: pendingWOs,    color: "warning" },
];

// highRiskZones â† leaks sorted by severity+flow
const riskScore = (l) => {
  const sw = { critical: 40, high: 30, medium: 20, low: 10 };
  return (sw[l.severity] || 0) + Math.min(l.estimated_flow_rate, 60);
};
const highRiskZones = activeLeaks
  .sort((a, b) => riskScore(b) - riskScore(a))
  .slice(0, 5)
  .map(l => ({
    zone: `${l.pipeline_id} (${l.location})`,
    risk: Math.min(Math.round(riskScore(l)), 99),
    type: `${cap(l.severity)} Leak â€” ${l.status}`,
  }));

// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
// DIGITAL TWIN  â† pressure, leaks, assets + GIS
// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

const avgPressure = round(sumOf(latestPressure, 'pressure') / (latestPressure.length || 1), 1);
const avgFlowRate = Math.round(sumOf(latestPressure, 'flow_rate') / (latestPressure.length || 1));

const digitalTwinMetrics = {
  pipelinePressure: { value: avgPressure, unit: "psi", status: avgPressure < 30 ? "critical" : avgPressure < 35 ? "warning" : "normal" },
  flowRate:         { value: avgFlowRate, unit: "mÂ³/hr", status: "normal" },
  activeSensors:    { value: assets.length, total: assets.length + 5, status: "normal" },
  leakAlerts:       { value: activeLeaks.length, status: activeLeaks.length > 8 ? "critical" : "warning" },
};

const pipelineMetrics = latestPressure.slice(0, 5).map(p => ({
  id: p.pipeline_id, pressure: round(p.pressure, 1),
  flowRate: p.flow_rate, temperature: round(p.temperature, 0), status: p.status,
}));

const networkStats = {
  totalPipelines:    uniqueAssetPipelines.length,
  activeSensors:     assets.length,
  regulatorStations: countWhere(assets, a => /Regulator|Valve/.test(a.type)),
  maintenanceZones:  openWOs,
};

// â”€â”€ GIS map data (retained â€” visualisation coordinates) â”€â”€
const PLO = -1.3, PLA = -0.12, LO = -0.8;
function spl([lng, lat]) { return [lng + PLO, lat + PLA]; }
function sl([lng, lat])  { return [lng + LO, lat]; }

const PIPELINE_ANCHORS = {
  pl1Start: spl([49.8671,40.4093]), pl2Mid: spl([49.1,40.35]),
  pl2Pl3Join: spl([48.4,40.2]),     pl3Mid: spl([47.8,40.5]),
  pl3End: spl([47.2,40.75]),        pl4End: spl([49.2,41.35]),
  pl5Mid: spl([48.6,39.95]),
};

const rawPipelineSegments = {
  type: "FeatureCollection",
  features: [
    { type:"Feature", properties:{ id:"PL-1", name:"Baku-North Segment", pressure:55, flow:220, status:"normal" },   geometry:{ type:"LineString", coordinates:[[49.8671,40.4093],[50.15,40.72],[50.45,41.02]] }},
    { type:"Feature", properties:{ id:"PL-2", name:"Baku-West Segment",  pressure:52, flow:205, status:"warning" },  geometry:{ type:"LineString", coordinates:[[49.8671,40.4093],[49.1,40.35],[48.4,40.2]] }},
    { type:"Feature", properties:{ id:"PL-3", name:"Central Corridor",   pressure:44, flow:180, status:"critical" }, geometry:{ type:"LineString", coordinates:[[48.4,40.2],[47.8,40.5],[47.2,40.75]] }},
    { type:"Feature", properties:{ id:"PL-4", name:"Northern Link",      pressure:57, flow:230, status:"normal" },   geometry:{ type:"LineString", coordinates:[[50.45,41.02],[49.9,41.2],[49.2,41.35]] }},
    { type:"Feature", properties:{ id:"PL-5", name:"Southern Link",      pressure:50, flow:198, status:"warning" },  geometry:{ type:"LineString", coordinates:[[49.1,40.35],[48.6,39.95],[48.1,39.65]] }},
    { type:"Feature", properties:{ id:"PL-6", name:"Central-East Branch",pressure:53, flow:214, status:"normal" },   geometry:{ type:"LineString", coordinates:[[48.4,40.2],[48.05,40.52],[47.72,40.82]] }},
    { type:"Feature", properties:{ id:"PL-7", name:"North-Central Loop", pressure:47, flow:186, status:"warning" },  geometry:{ type:"LineString", coordinates:[[49.9,41.2],[49.4,40.95],[48.95,40.7]] }},
    { type:"Feature", properties:{ id:"PL-8", name:"South Recovery",     pressure:42, flow:171, status:"critical" }, geometry:{ type:"LineString", coordinates:[[48.6,39.95],[49.25,39.98],[49.92,40.08]] }},
  ],
};
const pipelineSegments = {
  ...rawPipelineSegments,
  features: rawPipelineSegments.features.map(f => ({
    ...f, properties: { ...f.properties, connectedMeterCount: 2 },
    geometry: { ...f.geometry, coordinates: f.geometry.coordinates.map(spl) },
  })),
};

const smartMeterClusters = [
  { id:"MC-1", zone:"Absheron East",    position:sl([49.95,40.46]), meterCount:180, offlineMeters:3,  dailyConsumption:26.4, status:"normal" },
  { id:"MC-2", zone:"Absheron Central", position:sl([49.55,40.34]), meterCount:145, offlineMeters:11, dailyConsumption:21.9, status:"issue" },
  { id:"MC-3", zone:"Shirvan Belt",     position:sl([48.8,40.08]),  meterCount:132, offlineMeters:4,  dailyConsumption:19.1, status:"normal" },
  { id:"MC-4", zone:"Ganja Corridor",   position:sl([47.55,40.7]),  meterCount:164, offlineMeters:17, dailyConsumption:24.2, status:"critical" },
  { id:"MC-5", zone:"North Grid",       position:sl([49.45,41.2]),  meterCount:121, offlineMeters:2,  dailyConsumption:17.8, status:"normal" },
];

const monitoringNodes = [
  { nodeId:"ND-1", position:PIPELINE_ANCHORS.pl1Start,   pressure:54, flow:210, temperature:12, leakStatus:"No leak",        healthStatus:"healthy" },
  { nodeId:"ND-2", position:PIPELINE_ANCHORS.pl2Pl3Join, pressure:49, flow:188, temperature:15, leakStatus:"Micro leak risk", healthStatus:"abnormal" },
  { nodeId:"ND-3", position:PIPELINE_ANCHORS.pl3End,     pressure:41, flow:165, temperature:17, leakStatus:"Leak detected",   healthStatus:"critical" },
  { nodeId:"ND-4", position:PIPELINE_ANCHORS.pl4End,     pressure:56, flow:228, temperature:9,  leakStatus:"No leak",        healthStatus:"healthy" },
];

// mapIncidents â† critical leaks with coordinates
const mapIncidents = activeLeaks.filter(l => l.severity === 'critical').map((l, i) => ({
  id: `INC-${i+1}`, incidentType: "Gas Leak", severity: "critical",
  timestamp: l.detected_time.replace('T',' ').substring(0,16),
  description: `${cap(l.severity)} leak (${l.estimated_flow_rate} mÂ³/hr) â€” ${l.affected_customers} customers affected.`,
  location: [l.longitude, l.latitude],
}));

// complaintPoints â† complaints with coordinates
const complaintPoints = complaints.slice(0, 6).map((c, i) => ({
  id: `CP-${i+1}`, complaintType: c.category,
  location: [c.longitude, c.latitude], count: 1,
  cluster: c.location, mostCommonIssue: c.category,
}));

// mapFieldCrews â† from active workorders with asset coordinates
const mapFieldCrews = workorders.filter(w => w.crew_id && w.status !== 'completed').slice(0, 3).map(w => {
  const ast = assets.find(a => a.asset_id === w.asset_id);
  return {
    crewId: w.crew_id,
    status: w.status === 'in_progress' ? 'critical' : 'en-route',
    assignedIncident: w.workorder_id, eta: w.status === 'in_progress' ? 'On Site' : 'â€”',
    position: ast ? [ast.longitude, ast.latitude] : sl([49.55, 40.28]),
  };
});

// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
// SMART METERS  â† meters.csv, billing.csv
// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

const smartMeterKpis = [
  { label: "Total Smart Meters",   value: fmt(meters.length), change: `${meters.length} total`,                  trend: "neutral", icon: "gauge" },
  { label: "Online Meters",        value: fmt(onlineMeters),  change: `${round(onlineMeters/meters.length*100)}%`, trend: "up",      icon: "wifi" },
  { label: "Offline Meters",       value: fmt(offlineMeters), change: `${round(offlineMeters/meters.length*100)}%`, trend: "down",   icon: "wifiOff" },
  { label: "Communication Issues", value: fmt(intermittent),  change: `${round(intermittent/meters.length*100)}%`, trend: "up",      icon: "alertTriangle" },
];

// meterHealthStatus â† meters grouped by status
const meterHealthStatus = [
  { status: "Active",   count: activeMeters,                   pct: round(activeMeters / meters.length * 100, 1) },
  { status: "Warning",  count: countWhere(meters, m => m.status === 'warning'), pct: round(countWhere(meters, m => m.status === 'warning') / meters.length * 100, 1) },
  { status: "Error",    count: countWhere(meters, m => m.status === 'error'),   pct: round(countWhere(meters, m => m.status === 'error')   / meters.length * 100, 1) },
  { status: "Inactive", count: countWhere(meters, m => m.status === 'inactive'),pct: round(countWhere(meters, m => m.status === 'inactive')/ meters.length * 100, 1) },
];

// meterActivityByRegion â† meters grouped by meter_type
const metersByType = {};
meters.forEach(m => {
  const t = cap(m.meter_type);
  if (!metersByType[t]) metersByType[t] = { active: 0, inactive: 0 };
  if (m.status === 'active') metersByType[t].active += 1;
  else metersByType[t].inactive += 1;
});
const meterActivityByRegion = Object.entries(metersByType).map(([region, d]) => ({ region, ...d }));

// topCustomersByConsumption â† billing + meters, sorted desc
const topCustomersByConsumption = billing
  .map(b => {
    const m = meterById[b.meter_id];
    return {
      customerId: b.customer_id, name: m ? m.location : 'â€”',
      region: m ? cap(m.meter_type) : 'â€”',
      consumption: `${fmt(b.consumption)} mÂ³`,
      rawConsumption: Number(b.consumption),
      status: b.payment_status === 'paid' ? 'Active' : b.payment_status === 'overdue' ? 'Warning' : 'Pending',
    };
  })
  .sort((a, b) => b.rawConsumption - a.rawConsumption)
  .map((c, i) => ({ rank: i + 1, ...c }));

// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
// REVENUE  â† billing.csv, meters.csv
// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

const revenueKpis = [
  { label: "Total Billed",      value: `AZN ${fmt(totalBilled)}`,    change: `${billing.length} bills`,       trend: "neutral", icon: "flame" },
  { label: "Total Collected",   value: `AZN ${fmt(totalCollected)}`, change: `${paidRows.length} paid`,       trend: "up",      icon: "manat" },
  { label: "Overdue Amount",    value: `AZN ${fmt(totalOverdue)}`,   change: `${overdueRows.length} bills`,   trend: "up",      icon: "fileWarning" },
  { label: "Billing Anomalies", value: String(billingAnomalies),   change: `of ${billing.length}`,          trend: billingAnomalies > 0 ? "up" : "neutral", icon: "shieldAlert" },
];

// areaWiseRevenue â† billing+meters grouped by zone
const revByZone = {};
billing.forEach(b => {
  const m = meterById[b.meter_id];
  const z = m ? toZone(m.latitude, m.longitude) : 'Unknown';
  if (!revByZone[z]) revByZone[z] = { billed: 0, collected: 0 };
  revByZone[z].billed += Number(b.amount) || 0;
  if (b.payment_status === 'paid') revByZone[z].collected += Number(b.amount) || 0;
});
const areaWiseRevenue = Object.entries(revByZone)
  .sort((a, b) => b[1].billed - a[1].billed)
  .map(([area, d]) => ({ area, billed: round(d.billed, 1), collected: round(d.collected, 1) }));

// consumptionVsBilled â† billing by meter_type
const cvbByType = {};
billing.forEach(b => {
  const m = meterById[b.meter_id];
  const type = m ? cap(m.meter_type) : 'Unknown';
  if (!cvbByType[type]) cvbByType[type] = { consumed: 0, billed: 0 };
  cvbByType[type].consumed += Number(b.consumption) || 0;
  cvbByType[type].billed   += Number(b.amount) || 0;
});
const consumptionVsBilled = Object.entries(cvbByType).map(([t, d]) => ({
  month: t, consumed: round(d.consumed, 1), billed: round(d.billed, 1), gap: round(d.billed - d.consumed, 1),
}));

// tamperingAlerts â† billing anomalies + meter warnings
const tamperingAlerts = [];
let tId = 0;
billing.filter(b => b.billing_anomaly === true).forEach(b => {
  const m = meterById[b.meter_id];
  tamperingAlerts.push({ id: ++tId, severity: 'critical',
    message: `Billing anomaly â€” ${b.meter_id} (${m ? m.location : '?'}), â‚¹${b.amount}`,
    time: timeSince(b.due_date + 'T00:00:00Z'), source: 'Billing System' });
});
meters.filter(m => m.status === 'warning' || m.status === 'error').forEach(m => {
  tamperingAlerts.push({ id: ++tId, severity: m.status === 'error' ? 'critical' : 'warning',
    message: `Meter ${m.status} â€” ${m.meter_id} (${m.location}), comm: ${m.communication_status}`,
    time: 'recent', source: 'Smart Meter System' });
});
if (!tamperingAlerts.length) tamperingAlerts.push({ id: ++tId, severity: 'info', message: 'No anomalies', time: 'now', source: 'System' });

// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
// SAFETY  â† pressure.csv, leaks.csv
// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

const safetyKpis = [
  { label: "Active Leak Alerts",  value: String(activeLeaks.length), change: `${countWhere(activeLeaks, l => l.severity === 'critical')} critical`, trend: "up",      icon: "alertTriangle" },
  { label: "Pressure Warnings",   value: String(pressureAnomalies), change: `of ${pressure.length} readings`,    trend: "up",      icon: "radio" },
  { label: "Affected Customers",  value: fmt(totalAffected),        change: `${activeLeaks.length} active leaks`, trend: "up",     icon: "shieldAlert" },
  { label: "Crews Dispatched",    value: String(crewsDispatched),   change: `of ${activeLeaks.length} leaks`,     trend: "neutral", icon: "hardHat" },
];

// gasPressureTrends â† pressure.csv avg per timestamp
const gasPressureTrends = Object.keys(flowByHour).sort().map(hour => {
  const rows = pressure.filter(p => p.timestamp.substring(11, 16) === hour);
  const avg = rows.reduce((s, r) => s + r.pressure, 0) / rows.length;
  return { time: hour, pressure: round(avg, 1), threshold: 45 };
});

// leakDetectionActivity â† leaks grouped by zone (lat/lng)
const leakByZone = {};
leaks.forEach(l => {
  const z = toZone(l.latitude, l.longitude);
  if (!leakByZone[z]) leakByZone[z] = { detected: 0, resolved: 0 };
  leakByZone[z].detected += 1;
  if (l.status === 'resolved') leakByZone[z].resolved += 1;
});
const leakDetectionActivity = Object.entries(leakByZone).map(([zone, d]) => ({ zone, ...d }));

// safetyAlerts â† leaks + pressure anomalies
const safetyAlerts = [];
let sId = 0;
activeLeaks.forEach(l => {
  safetyAlerts.push({ id: ++sId,
    severity: (l.severity === 'critical' || l.severity === 'high') ? 'critical' : 'warning',
    message: `${cap(l.severity)} leak â€” ${l.pipeline_id}, ${l.location} (${l.estimated_flow_rate} mÂ³/hr)`,
    time: timeSince(l.detected_time), source: `Leak Detector ${l.leak_id}` });
});
latestPressure.filter(p => p.anomaly === true).forEach(p => {
  safetyAlerts.push({ id: ++sId, severity: p.status === 'critical' ? 'critical' : 'warning',
    message: `Pressure ${p.status} â€” ${p.pipeline_id}, ${p.location} (${p.pressure} psi)`,
    time: timeSince(p.timestamp), source: `Sensor ${p.pipeline_id}` });
});
if (!safetyAlerts.length) safetyAlerts.push({ id: ++sId, severity: 'info', message: 'All systems normal', time: 'now', source: 'System' });

// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
// CUSTOMERS  â† complaints.csv
// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

const customerKpis = [
  { label: "Total Complaints",    value: String(complaints.length),    change: `${unresolvedComplaints} open`,                                 trend: unresolvedComplaints > 0 ? "up" : "neutral", icon: "messageSquare" },
  { label: "Avg Resolution Time", value: `${avgResolution} hrs`,       change: `${resolvedTimes.length} resolved`,                             trend: "down",                                      icon: "clock" },
  { label: "Repeat Complaints",   value: String(repeatComplaints),     change: `${round(repeatComplaints / complaints.length * 100)}%`,        trend: "up",                                        icon: "repeat" },
  { label: "Unresolved",          value: String(unresolvedComplaints), change: `of ${complaints.length}`,                                      trend: "up",                                        icon: "mapPin" },
];

// complaintTypes â† complaints bucketed into broader categories
const catCounts = {};
complaints.forEach(c => {
  const bucket = bucketCategory(c.category);
  catCounts[bucket] = (catCounts[bucket] || 0) + 1;
});
const complaintTypes = Object.entries(catCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([type, count]) => ({ type, count }));

// complaintTrends â† complaints grouped by date
const dayCounts = {};
complaints.forEach(c => { dayCounts[c.timestamp.substring(0, 10)] = (dayCounts[c.timestamp.substring(0, 10)] || 0) + 1; });
const complaintTrends = Object.entries(dayCounts)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([day, complaints]) => ({ day: day.substring(5), complaints }));

// complaintHeatmap â† complaints grouped by zone Ã— priority
const hmByZone = {};
complaints.forEach(c => {
  const z = toZone(c.latitude, c.longitude);
  if (!hmByZone[z]) hmByZone[z] = { low: 0, medium: 0, high: 0 };
  if (c.priority === 'low') hmByZone[z].low += 1;
  else if (c.priority === 'medium') hmByZone[z].medium += 1;
  else hmByZone[z].high += 1;
});
const complaintHeatmap = Object.entries(hmByZone).map(([area, d]) => ({ area, ...d }));

// recentComplaints â† sorted by timestamp desc
const recentComplaints = [...complaints]
  .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  .map(c => ({
    id: c.complaint_id, customer: c.customer_id, area: c.location,
    type: c.category,
    status: c.status === 'resolved' ? 'Resolved' : c.status === 'open' ? 'Open' : c.status === 'in_progress' ? 'In Progress' : 'Investigating',
    time: timeSince(c.timestamp),
  }));

// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
// WORKFORCE  â† workorders.csv, assets.csv
// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

const workforceKpis = [
  { label: "Total Crews",      value: String(uniqueCrews.length), change: uniqueCrews.join(', '),            trend: "neutral", icon: "hardHat" },
  { label: "In-Progress WOs",  value: String(inProgressWOs),      change: `${assignedWOs} assigned`,         trend: "up",      icon: "userCheck" },
  { label: "Pending WOs",      value: String(pendingWOs),         change: `${round(pendingWOs/workorders.length*100)}%`, trend: "up", icon: "truck" },
  { label: "Open Work Orders", value: String(openWOs),            change: `${completedWOs} completed`,       trend: "up",      icon: "clipboardList" },
];

const activeTasks = workorders.filter(w => w.status !== 'completed').map(w => ({
  id: w.workorder_id,
  task: cap(w.type),
  crew: w.crew_id || 'â€”',
  location: w.location,
  priority: cap(w.priority),
  status: w.status === 'in_progress' ? 'In Progress' : w.status === 'assigned' ? 'Assigned' : 'Pending',
  eta: w.estimated_resolution_time ? timeSince(w.estimated_resolution_time) : 'â€”',
}));

// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
// ASSETS  â† assets.csv, workorders.csv
// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

const assetKpis = [
  { label: "Total Assets",       value: String(assets.length),              change: `${[...new Set(assets.map(a => a.type))].length} types`, trend: "neutral", icon: "gitBranch" },
  { label: "Pipelines Monitored", value: String(uniqueAssetPipelines.length), change: `${assets.length} sensors`,                          trend: "neutral", icon: "gauge" },
  { label: "Critical Risk",      value: String(criticalRiskAssets),          change: `${highRiskAssets} high risk`,                         trend: "up",      icon: "settings" },
  { label: "Under Maintenance",  value: String(openWOs),                     change: `${completedWOs} completed`,                          trend: "up",      icon: "wrench" },
];

// assetAgeDistribution â† assets by installation_year (ref 2024)
const ageBuckets = { '0-2 yrs': 0, '2-5 yrs': 0, '5-10 yrs': 0, '10+ yrs': 0 };
assets.forEach(a => {
  const age = 2024 - a.installation_year;
  if (age <= 2) ageBuckets['0-2 yrs'] += 1;
  else if (age <= 5) ageBuckets['2-5 yrs'] += 1;
  else if (age <= 10) ageBuckets['5-10 yrs'] += 1;
  else ageBuckets['10+ yrs'] += 1;
});
const assetAgeDistribution = Object.entries(ageBuckets).map(([age, count]) => ({ age, count }));

// maintenanceHistory â† workorders by status Ã— type mapping
const woByStatus = {};
workorders.forEach(w => {
  const sl = { completed:'Completed', in_progress:'In Progress', assigned:'Assigned', pending:'Pending' }[w.status];
  if (!woByStatus[sl]) woByStatus[sl] = { preventive: 0, corrective: 0, emergency: 0 };
  if (w.type === 'maintenance' || w.type === 'inspection') woByStatus[sl].preventive += 1;
  else if (w.type === 'repair') woByStatus[sl].corrective += 1;
  else if (w.type === 'emergency') woByStatus[sl].emergency += 1;
});
const maintenanceHistory = Object.entries(woByStatus).map(([month, d]) => ({ month, ...d }));

// failureFrequency â† assets with health_score < 80 grouped by type
const failCounts = {};
assets.forEach(a => { if (a.health_score < 80) failCounts[a.type] = (failCounts[a.type] || 0) + 1; });
const failureFrequency = Object.entries(failCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([type, count]) => ({ type, count }));

// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
// ALERTS CENTER  â† all CSVs aggregated
// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

let aId = 0;
const allAlerts = [];

activeLeaks.forEach(l => {
  allAlerts.push({ id: ++aId, severity: (l.severity === 'critical' || l.severity === 'high') ? 'critical' : 'warning',
    category: 'Leak Detection', message: `${cap(l.severity)} leak â€” ${l.pipeline_id}, ${l.location}`,
    time: timeSince(l.detected_time), source: `Leak Detector ${l.leak_id}` });
});
latestPressure.filter(p => p.anomaly === true).forEach(p => {
  allAlerts.push({ id: ++aId, severity: p.status === 'critical' ? 'critical' : 'warning',
    category: 'Pressure', message: `Pressure ${p.status} â€” ${p.pipeline_id}, ${p.location}`,
    time: timeSince(p.timestamp), source: `Sensor ${p.pipeline_id}` });
});
meters.filter(m => m.communication_status !== 'online').forEach(m => {
  allAlerts.push({ id: ++aId, severity: m.status === 'error' ? 'critical' : 'warning',
    category: 'Communication', message: `Meter ${m.communication_status} â€” ${m.meter_id}, ${m.location}`,
    time: 'recent', source: `Smart Meter ${m.meter_id}` });
});
billing.filter(b => b.billing_anomaly === true).forEach(b => {
  allAlerts.push({ id: ++aId, severity: 'warning', category: 'Revenue',
    message: `Billing anomaly â€” ${b.meter_id}, ${b.customer_id}`,
    time: timeSince(b.due_date + 'T00:00:00Z'), source: 'Billing System' });
});
complaints.filter(c => c.status !== 'resolved' && (c.priority === 'critical' || c.priority === 'high')).forEach(c => {
  allAlerts.push({ id: ++aId, severity: c.priority === 'critical' ? 'critical' : 'warning',
    category: 'Customer', message: `${c.category} â€” ${c.location}`,
    time: timeSince(c.timestamp), source: `Complaint ${c.complaint_id}` });
});
workorders.filter(w => w.status === 'completed').forEach(w => {
  allAlerts.push({ id: ++aId, severity: 'info', category: 'Workforce',
    message: `WO ${w.workorder_id} completed â€” ${w.type} at ${w.location}`,
    time: timeSince(w.actual_resolution_time || w.assigned_time), source: 'Workforce System' });
});
assets.filter(a => a.failure_risk === 'critical').forEach(a => {
  allAlerts.push({ id: ++aId, severity: 'warning', category: 'Maintenance',
    message: `Critical failure risk â€” ${a.asset_id} (${a.type}) at ${a.location}`,
    time: 'recent', source: 'Asset Monitor' });
});

// â”€â”€ Exports â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
module.exports = {
  kpiData, consumptionTrend, revenueVsConsumption, complaintsByArea,
  pipelinePressure, alerts, fieldCrewStatus, highRiskZones,
  digitalTwinMetrics, pipelineMetrics, networkStats,
  pipelineSegments, smartMeterClusters, monitoringNodes,
  mapIncidents, complaintPoints, mapFieldCrews,
  smartMeterKpis, meterHealthStatus, meterActivityByRegion,
  topCustomersByConsumption, consumptionTrend,
  revenueKpis, areaWiseRevenue, consumptionVsBilled, tamperingAlerts,
  safetyKpis, gasPressureTrends, leakDetectionActivity: leakDetectionActivity,
  safetyAlerts,
  customerKpis, complaintTypes, complaintTrends, complaintHeatmap, recentComplaints,
  workforceKpis, activeTasks,
  assetKpis, assetAgeDistribution, maintenanceHistory, failureFrequency,
  allAlerts,
};
