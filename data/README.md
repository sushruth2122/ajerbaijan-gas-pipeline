# CSV Data — Single Source of Truth

> **Demo Disclaimer:** All data in these CSV files is synthetic sample data
> generated for demonstration purposes. Location coordinates, customer IDs,
> meter readings, and billing amounts are fictional and do not represent any
> real-world gas distribution network or customers.

All dashboard and API data in CaspiaGas Command Center is derived from the 7 CSV
files in this directory. The Express backend (`server/data/index.js`) parses
them at startup via `server/data/csvLoader.js` and builds every API response
from the rows.

## CSV Files

| File | Rows | Description |
|---|---|---|
| `meters.csv` | 25 | Smart meter registry (id, type, status, location, customer) |
| `pressure.csv` | 25 | Pipeline pressure/flow readings (pipeline_id, timestamp, psi, flow_rate) |
| `billing.csv` | 25 | Billing records (meter_id, cycle, consumption, amount, payment_status) |
| `complaints.csv` | 20 | Customer complaints (id, customer_id, category, priority, status, date) |
| `leaks.csv` | 15 | Leak detection events (id, pipeline_id, severity, status, lat/lng) |
| `assets.csv` | 20 | Physical assets (id, type, install_year, health_score, status) |
| `workorders.csv` | 15 | Work orders (id, asset_id, type, priority, status, assigned_crew) |

## CSV → Page Mapping

| Page / Widget | Primary CSVs | Key Aggregations |
|---|---|---|
| **Dashboard** KPIs | meters, billing, complaints, leaks, workorders | Total customers, active meters, gas consumption, revenue, alerts, complaints, crews, maintenance |
| **Dashboard** Consumption Trend | pressure | flow_rate averaged per hour |
| **Dashboard** Revenue vs Consumption | billing + meters | Grouped by meter_type |
| **Dashboard** Complaints by Area | complaints + meters | Zone classification from lat/lng |
| **Dashboard** Pipeline Pressure | pressure | Latest reading per pipeline, converted to bar |
| **Dashboard** Alerts | leaks, pressure, complaints, workorders | Critical/warning events from all CSVs |
| **Dashboard** Field Crew Status | workorders | Distinct crews by WO status |
| **Dashboard** High Risk Zones | leaks | Top 5 leak locations by severity |
| **Smart Meters** | meters, billing | Health by status, activity by meter_type, top customers by consumption |
| **Revenue** | billing, meters | KPIs from billing totals, area revenue by zone, consumption vs billed by meter_type |
| **Safety** | leaks, pressure | Active leaks, pressure trends by hour, leak activity by zone |
| **Customer Intelligence** | complaints, meters | Bucketed complaint types, trends by date, heatmap by zone×priority |
| **Workforce** | workorders | KPIs from WO counts, active tasks = open WOs |
| **Asset Management** | assets, workorders | Age distribution, maintenance by WO type, failure frequency for low-health assets |
| **Alerts Center** | all 7 CSVs | Unified alert feed from leaks, pressure anomalies, meter warnings, billing anomalies, complaints, work orders, asset issues |
| **Digital Twin** | pressure, meters, leaks, complaints, workorders | Pipeline metrics from pressure, GIS data retained (pipeline segments, clusters, monitoring nodes), incidents from leaks |

## Zone Classification

Meters and complaints are classified into geographic zones using lat/lng:

| Zone | Rule |
|---|---|
| North | latitude ≥ 40.76 |
| South | latitude < 40.70 |
| East | longitude > −74.00 |
| West | longitude < −74.02 |
| Central | everything else |

## Complaint Category Bucketing

The 20 unique complaint categories are grouped into 5 display buckets:

| Bucket | Source categories containing |
|---|---|
| Billing | "billing", "payment" |
| Gas Leak / Odor | "leak", "odor", "gas" |
| Meter Issue | "meter", "reading" |
| Pressure | "pressure", "flow" |
| Service / Other | everything else |

## Data Refresh

CSV files are read once at server startup (`require` time). To update data,
edit the CSV files and restart the server. The frontend polls the API every 30
seconds (dashboard, safety, and alerts pages).
