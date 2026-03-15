/**
 * Rich metadata for each dashboard KPI card.
 * Keyed by the KPI `icon` field so we can look-up per card.
 */

export interface KpiThreshold {
  label: string;
  min: number;
  max: number;
  color: "safe" | "warning" | "critical";
}

export interface KpiMeta {
  /** Short identifier matching the `icon` field on kpiData */
  key: string;
  /** Human-readable definition */
  definition: string;
  /** Unit of measurement shown in detail panel */
  unit: string;
  /** Overall status colour for the card border */
  status: "safe" | "warning" | "critical";
  /** Is "up" good or bad for this metric? Determines trend arrow colour */
  desiredTrend: "up" | "down" | "neutral";
  /** Absolute floor observed */
  min: number;
  /** Absolute ceiling observed */
  max: number;
  /** Operational target */
  target: number;
  /** Current raw numeric value (for gauge calculations) */
  currentNumeric: number;
  /** Colour-coded bands */
  thresholds: KpiThreshold[];
  /** Historical monthly data for sparkline (label + value) */
  history: { label: string; value: number }[];
  /** Contextual insight shown in the detail modal */
  insight: string;
}

/**
 * Look-up map: icon-name ➜ KpiMeta
 * The `icon` strings come from `kpiData[].icon`.
 */
export const kpiMetadata: Record<string, KpiMeta> = {
  /* ─── 1. Total Customers ─── */
  users: {
    key: "users",
    definition:
      "Total number of registered domestic, commercial & industrial customers currently in the gas distribution network.",
    unit: "customers",
    status: "safe",
    desiredTrend: "up",
    min: 300,
    max: 500,
    target: 450,
    currentNumeric: 400,
    thresholds: [
      { label: "Below target", min: 0, max: 350, color: "critical" },
      { label: "Approaching target", min: 350, max: 420, color: "warning" },
      { label: "On target", min: 420, max: 500, color: "safe" },
    ],
    history: [
      { label: "Sep", value: 365 },
      { label: "Oct", value: 372 },
      { label: "Nov", value: 380 },
      { label: "Dec", value: 388 },
      { label: "Jan-1", value: 395 },
      { label: "Jan-18", value: 400 },
    ],
    insight:
      "Customer base has been growing steadily. The network currently serves 400 metered customers across Baku and surrounding regions.",
  },

  /* ─── 2. Total Active Smart Gas Meters ─── */
  gauge: {
    key: "gauge",
    definition:
      "Count of IoT-enabled smart gas meters currently reporting telemetry data to the central platform.",
    unit: "meters",
    status: "safe",
    desiredTrend: "up",
    min: 250,
    max: 450,
    target: 400,
    currentNumeric: 320,
    thresholds: [
      { label: "Low coverage", min: 0, max: 280, color: "critical" },
      { label: "In progress", min: 280, max: 360, color: "warning" },
      { label: "Target met", min: 360, max: 500, color: "safe" },
    ],
    history: [
      { label: "Sep", value: 280 },
      { label: "Oct", value: 290 },
      { label: "Nov", value: 300 },
      { label: "Dec", value: 308 },
      { label: "Jan-1", value: 315 },
      { label: "Jan-18", value: 320 },
    ],
    insight:
      "320 of 400 meters are active (80%). 38 in warning state, 20 in error, 22 inactive — requiring field checks.",
  },

  /* ─── 3. Gas Consumption Today ─── */
  flame: {
    key: "flame",
    definition:
      "Total gas consumption based on the latest reading across all metered customers.",
    unit: "m³",
    status: "warning",
    desiredTrend: "down",
    min: 500,
    max: 2500,
    target: 1500,
    currentNumeric: 1800,
    thresholds: [
      { label: "Below baseline", min: 0, max: 1200, color: "safe" },
      { label: "Normal range", min: 1200, max: 1800, color: "warning" },
      { label: "High consumption", min: 1800, max: 3000, color: "critical" },
    ],
    history: [
      { label: "Sep", value: 1250 },
      { label: "Oct", value: 1380 },
      { label: "Nov", value: 1520 },
      { label: "Dec", value: 1650 },
      { label: "Jan-1", value: 1730 },
      { label: "Jan-18", value: 1800 },
    ],
    insight:
      "Consumption is elevated due to winter seasonal demand. Rising trend correlates with temperature drops across Azerbaijan.",
  },

  /* ─── 4. Revenue Collected Today ─── */
  manat: {
    key: "manat",
    definition:
      "Total billing revenue collected from all customer segments, including arrears recovered.",
    unit: "AZN",
    status: "safe",
    desiredTrend: "up",
    min: 5000,
    max: 30000,
    target: 20000,
    currentNumeric: 18500,
    thresholds: [
      { label: "Below target", min: 0, max: 12000, color: "critical" },
      { label: "Near target", min: 12000, max: 18000, color: "warning" },
      { label: "On / above target", min: 18000, max: 35000, color: "safe" },
    ],
    history: [
      { label: "Sep", value: 14200 },
      { label: "Oct", value: 15800 },
      { label: "Nov", value: 16500 },
      { label: "Dec", value: 17200 },
      { label: "Jan-1", value: 18000 },
      { label: "Jan-18", value: 18500 },
    ],
    insight:
      "Collection efficiency is strong with most paid accounts up to date. Overdue amount is being tracked for follow-up.",
  },

  /* ─── 5. Active Network Alerts ─── */
  alertTriangle: {
    key: "alertTriangle",
    definition:
      "Number of currently active (unresolved) alerts across all subsystems — pressure, leak detection, safety & communication.",
    unit: "alerts",
    status: "critical",
    desiredTrend: "down",
    min: 0,
    max: 30,
    target: 5,
    currentNumeric: 15,
    thresholds: [
      { label: "Healthy", min: 0, max: 8, color: "safe" },
      { label: "Elevated", min: 8, max: 15, color: "warning" },
      { label: "Critical load", min: 15, max: 40, color: "critical" },
    ],
    history: [
      { label: "Sep", value: 6 },
      { label: "Oct", value: 8 },
      { label: "Nov", value: 7 },
      { label: "Dec", value: 10 },
      { label: "Jan-1", value: 12 },
      { label: "Jan-18", value: 15 },
    ],
    insight:
      "Alert count has risen 25% month-on-month. Multiple critical leak and pressure alerts require immediate triage.",
  },

  /* ─── 6. Open Customer Complaints ─── */
  messageSquare: {
    key: "messageSquare",
    definition:
      "Total unresolved customer complaints across all regions and categories.",
    unit: "complaints",
    status: "warning",
    desiredTrend: "down",
    min: 0,
    max: 40,
    target: 10,
    currentNumeric: 18,
    thresholds: [
      { label: "Acceptable", min: 0, max: 12, color: "safe" },
      { label: "Elevated", min: 12, max: 20, color: "warning" },
      { label: "High backlog", min: 20, max: 50, color: "critical" },
    ],
    history: [
      { label: "Sep", value: 8 },
      { label: "Oct", value: 10 },
      { label: "Nov", value: 12 },
      { label: "Dec", value: 14 },
      { label: "Jan-1", value: 16 },
      { label: "Jan-18", value: 18 },
    ],
    insight:
      "Complaints are above the 10-target. Billing and meter issues are primary contributors. Resolution times averaging 4.2 hrs.",
  },

  /* ─── 7. Field Crews Active ─── */
  hardHat: {
    key: "hardHat",
    definition:
      "Total number of field maintenance & emergency crews currently assigned and active across the network.",
    unit: "crews",
    status: "safe",
    desiredTrend: "neutral",
    min: 2,
    max: 8,
    target: 5,
    currentNumeric: 5,
    thresholds: [
      { label: "Under-staffed", min: 0, max: 3, color: "critical" },
      { label: "Moderate", min: 3, max: 5, color: "warning" },
      { label: "Full deployment", min: 5, max: 10, color: "safe" },
    ],
    history: [
      { label: "Sep", value: 4 },
      { label: "Oct", value: 4 },
      { label: "Nov", value: 5 },
      { label: "Dec", value: 5 },
      { label: "Jan-1", value: 5 },
      { label: "Jan-18", value: 5 },
    ],
    insight:
      "All 5 crews deployed across Baku, Sumqayit, Ganja, Mingachevir, and Lankaran. 2 available, 2 assigned, 1 on emergency.",
  },

  /* ─── 8. Pipelines Under Maintenance ─── */
  wrench: {
    key: "wrench",
    definition:
      "Number of open work orders / pipeline segments currently undergoing scheduled or corrective maintenance.",
    unit: "work orders",
    status: "warning",
    desiredTrend: "down",
    min: 5,
    max: 40,
    target: 15,
    currentNumeric: 22,
    thresholds: [
      { label: "Normal load", min: 0, max: 15, color: "safe" },
      { label: "Elevated", min: 15, max: 25, color: "warning" },
      { label: "Capacity strain", min: 25, max: 50, color: "critical" },
    ],
    history: [
      { label: "Sep", value: 14 },
      { label: "Oct", value: 16 },
      { label: "Nov", value: 18 },
      { label: "Dec", value: 19 },
      { label: "Jan-1", value: 20 },
      { label: "Jan-18", value: 22 },
    ],
    insight:
      "22 open work orders, above the 15 target. Includes emergency repairs and preventive maintenance across all regions.",
  },
};
