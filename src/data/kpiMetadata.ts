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
    min: 1_800_000,
    max: 2_000_000,
    target: 2_000_000,
    currentNumeric: 1_923_456,
    thresholds: [
      { label: "Below target", min: 0, max: 1_850_000, color: "critical" },
      { label: "Approaching target", min: 1_850_000, max: 1_950_000, color: "warning" },
      { label: "On target", min: 1_950_000, max: 2_100_000, color: "safe" },
    ],
    history: [
      { label: "Jan", value: 1_878_200 },
      { label: "Feb", value: 1_885_400 },
      { label: "Mar", value: 1_894_100 },
      { label: "Apr", value: 1_905_700 },
      { label: "May", value: 1_916_300 },
      { label: "Jun", value: 1_923_456 },
    ],
    insight:
      "Customer base has been growing steadily at ~0.8 % month-on-month. The network is on track to cross 2 M customers by Q4 2026.",
  },

  /* ─── 2. Total Active Smart Gas Meters ─── */
  gauge: {
    key: "gauge",
    definition:
      "Count of IoT-enabled smart gas meters currently online and reporting telemetry data to the central platform.",
    unit: "meters",
    status: "safe",
    desiredTrend: "up",
    min: 2_400_000,
    max: 3_000_000,
    target: 3_000_000,
    currentNumeric: 2_847_312,
    thresholds: [
      { label: "Low rollout", min: 0, max: 2_500_000, color: "critical" },
      { label: "In progress", min: 2_500_000, max: 2_900_000, color: "warning" },
      { label: "Target met", min: 2_900_000, max: 3_500_000, color: "safe" },
    ],
    history: [
      { label: "Jan", value: 2_620_000 },
      { label: "Feb", value: 2_678_000 },
      { label: "Mar", value: 2_735_000 },
      { label: "Apr", value: 2_780_000 },
      { label: "May", value: 2_812_000 },
      { label: "Jun", value: 2_847_312 },
    ],
    insight:
      "Smart meter rollout is at 94.9 % of the 3 M target. Remaining ~153 K meters are scheduled for deployment in Q3-Q4 2026.",
  },

  /* ─── 3. Gas Consumption Today ─── */
  flame: {
    key: "flame",
    definition:
      "Total volume of natural gas consumed across the entire city distribution network in the current day (00:00–now).",
    unit: "million m³",
    status: "warning",
    desiredTrend: "down",
    min: 11.2,
    max: 18.4,
    target: 13.5,
    currentNumeric: 14.7,
    thresholds: [
      { label: "Below baseline", min: 0, max: 12.0, color: "safe" },
      { label: "Normal range", min: 12.0, max: 15.0, color: "warning" },
      { label: "High consumption", min: 15.0, max: 20.0, color: "critical" },
    ],
    history: [
      { label: "Jan", value: 12.1 },
      { label: "Feb", value: 11.4 },
      { label: "Mar", value: 13.2 },
      { label: "Apr", value: 12.8 },
      { label: "May", value: 14.7 },
      { label: "Jun", value: 15.1 },
    ],
    insight:
      "Consumption is 8.9 % above the 13.5 M m³ baseline. The increase correlates with seasonal demand; June is trending even higher.",
  },

  /* ─── 4. Revenue Collected Today ─── */
  manat: {
    key: "manat",
    definition:
      "Total billing revenue collected from all customer segments for the current day, including arrears recovered.",
    unit: "AZN Million",
    status: "safe",
    desiredTrend: "up",
    min: 32.0,
    max: 48.0,
    target: 40.0,
    currentNumeric: 42.3,
    thresholds: [
      { label: "Below target", min: 0, max: 35.0, color: "critical" },
      { label: "Near target", min: 35.0, max: 40.0, color: "warning" },
      { label: "On / above target", min: 40.0, max: 55.0, color: "safe" },
    ],
    history: [
      { label: "Jan", value: 38.2 },
      { label: "Feb", value: 35.8 },
      { label: "Mar", value: 41.5 },
      { label: "Apr", value: 39.1 },
      { label: "May", value: 42.3 },
      { label: "Jun", value: 44.0 },
    ],
    insight:
      "Revenue is AZN 2.3 M above the AZN 40 M daily target (+5.8 %). June projection: AZN 44 M/day, indicating strong collection efficiency.",
  },

  /* ─── 5. Active Network Alerts ─── */
  alertTriangle: {
    key: "alertTriangle",
    definition:
      "Number of currently active (unresolved) alerts across all subsystems — pressure, leak detection, communication, safety & flow.",
    unit: "alerts",
    status: "critical",
    desiredTrend: "down",
    min: 3,
    max: 30,
    target: 10,
    currentNumeric: 15,
    thresholds: [
      { label: "Healthy", min: 0, max: 10, color: "safe" },
      { label: "Elevated", min: 10, max: 20, color: "warning" },
      { label: "Critical load", min: 20, max: 50, color: "critical" },
    ],
    history: [
      { label: "Jan", value: 8 },
      { label: "Feb", value: 11 },
      { label: "Mar", value: 9 },
      { label: "Apr", value: 14 },
      { label: "May", value: 12 },
      { label: "Jun", value: 15 },
    ],
    insight:
      "Alert count has risen 25 % month-on-month. 4 are critical (leak & seismic), 5 warnings. Immediate triage recommended.",
  },

  /* ─── 6. Open Customer Complaints ─── */
  messageSquare: {
    key: "messageSquare",
    definition:
      "Total unresolved customer complaints across all regions and complaint types (Low Pressure, Billing, Gas Smell, Meter Fault, etc.).",
    unit: "complaints",
    status: "critical",
    desiredTrend: "down",
    min: 600,
    max: 2_000,
    target: 500,
    currentNumeric: 1_284,
    thresholds: [
      { label: "Acceptable", min: 0, max: 500, color: "safe" },
      { label: "Elevated", min: 500, max: 1_000, color: "warning" },
      { label: "High backlog", min: 1_000, max: 3_000, color: "critical" },
    ],
    history: [
      { label: "Jan", value: 980 },
      { label: "Feb", value: 1_050 },
      { label: "Mar", value: 1_120 },
      { label: "Apr", value: 1_190 },
      { label: "May", value: 1_240 },
      { label: "Jun", value: 1_284 },
    ],
    insight:
      "Complaints are 156 % above the 500-target. North (342) and East (289) are the top contributors. Avg resolution: 4.2 hrs.",
  },

  /* ─── 7. Field Crews Active ─── */
  hardHat: {
    key: "hardHat",
    definition:
      "Total number of field maintenance & emergency crews currently deployed (Active + Enroute + Busy). 187 Active, 98 Enroute, 57 Busy.",
    unit: "crews",
    status: "safe",
    desiredTrend: "neutral",
    min: 250,
    max: 400,
    target: 342,
    currentNumeric: 342,
    thresholds: [
      { label: "Under-staffed", min: 0, max: 280, color: "critical" },
      { label: "Moderate", min: 280, max: 340, color: "warning" },
      { label: "Full deployment", min: 340, max: 420, color: "safe" },
    ],
    history: [
      { label: "Jan", value: 310 },
      { label: "Feb", value: 318 },
      { label: "Mar", value: 325 },
      { label: "Apr", value: 330 },
      { label: "May", value: 338 },
      { label: "Jun", value: 342 },
    ],
    insight:
      "All 342 crews are deployed. 187 are actively on tasks, 98 enroute to assignments, and 57 are engaged (busy). Zero idle crews indicates full utilisation.",
  },

  /* ─── 8. Pipelines Under Maintenance ─── */
  wrench: {
    key: "wrench",
    definition:
      "Number of pipeline segments currently undergoing scheduled or corrective maintenance, temporarily out of full service.",
    unit: "pipelines",
    status: "warning",
    desiredTrend: "down",
    min: 8,
    max: 30,
    target: 15,
    currentNumeric: 18,
    thresholds: [
      { label: "Normal load", min: 0, max: 15, color: "safe" },
      { label: "Elevated", min: 15, max: 22, color: "warning" },
      { label: "Capacity strain", min: 22, max: 40, color: "critical" },
    ],
    history: [
      { label: "Jan", value: 12 },
      { label: "Feb", value: 14 },
      { label: "Mar", value: 16 },
      { label: "Apr", value: 15 },
      { label: "May", value: 17 },
      { label: "Jun", value: 18 },
    ],
    insight:
      "18 pipelines under maintenance is 20 % above the 15-pipeline target. 3 are emergency repairs (P-204, P-501, J-47); the rest are preventive.",
  },
};
