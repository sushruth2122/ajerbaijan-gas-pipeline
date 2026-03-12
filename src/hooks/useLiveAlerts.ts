import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Simulates live alert cycling.
 * Every `intervalMs` (default 30 s) it:
 *   1. Picks a random alert, bumps it to the top with a fresh timestamp
 *   2. Occasionally injects a brand-new transient alert
 * This makes the feed feel alive even when the backend returns static data.
 */

interface Alert {
  id: number | string;
  severity: "critical" | "warning" | "info";
  message: string;
  time: string;
  source: string;
  [key: string]: unknown;
}

const TRANSIENT_POOL: Omit<Alert, "id" | "time">[] = [
  { severity: "warning", message: "Pressure fluctuation detected — Sector B4 regulator", source: "Pressure Sensor PS-412" },
  { severity: "critical", message: "Sudden flow spike — Pipeline P-310, possible line break", source: "Flow Meter FM-112" },
  { severity: "info", message: "Field Crew FC-09 checked in — Sector C1 inspection", source: "Workforce System" },
  { severity: "warning", message: "Smart meter timeout — Block 22, West zone", source: "Meter Gateway G-22" },
  { severity: "critical", message: "Methane elevation rising — Residential Block D5", source: "Gas Analyzer GA-018" },
  { severity: "info", message: "Scheduled valve test completed — Junction J-51", source: "Maintenance System" },
  { severity: "warning", message: "Customer complaint surge — South district (+12 in 5 min)", source: "CRM System" },
  { severity: "critical", message: "Pipeline corrosion alert — P-112 wall thickness below threshold", source: "Inspection Bot IB-03" },
  { severity: "info", message: "Firmware OTA pushed to 340 meters — Cluster 9", source: "OTA System" },
  { severity: "warning", message: "Emergency crew FC-31 delayed — traffic congestion Sector A2", source: "GPS Tracking" },
];

function relativeTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} hr ago`;
}

export function useLiveAlerts<T extends Alert>(
  baseAlerts: T[],
  intervalMs = 30_000,
) {
  const tickRef = useRef(0);
  const [displayed, setDisplayed] = useState<T[]>(() => baseAlerts);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const baseRef = useRef(baseAlerts);

  // Keep base in sync when upstream refreshes (e.g. from API refetch)
  useEffect(() => {
    baseRef.current = baseAlerts;
    setDisplayed(baseAlerts);
  }, [baseAlerts]);

  const tick = useCallback(() => {
    tickRef.current += 1;
    const t = tickRef.current;

    setDisplayed((prev) => {
      const list = [...prev];

      // Every other tick: inject a transient alert at the top
      if (t % 2 === 0) {
        const pool = TRANSIENT_POOL[t % TRANSIENT_POOL.length];
        const newAlert = {
          ...pool,
          id: `live-${Date.now()}`,
          time: "just now",
        } as unknown as T;
        list.unshift(newAlert);
        // Cap at 20 alerts so it doesn't grow forever
        if (list.length > 20) list.length = 20;
      } else {
        // Odd tick: bump a random existing alert to top with refreshed time
        if (list.length > 2) {
          const idx = 1 + Math.floor(Math.random() * (list.length - 1));
          const bumped = { ...list[idx], time: "just now" };
          list.splice(idx, 1);
          list.unshift(bumped);
        }
      }

      // Age timestamps for items beyond the first
      return list.map((a, i) => {
        if (i === 0) return a;
        // Parse "X min ago" style times and add 30s
        const ageSeconds = parseAge(a.time) + 30;
        return { ...a, time: relativeTime(ageSeconds) };
      });
    });

    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [tick, intervalMs]);

  return { alerts: displayed, lastUpdated };
}

/** Parse "Xs ago", "X min ago", "X hr ago", "just now" into seconds */
function parseAge(time: string): number {
  if (time === "just now") return 0;
  const s = time.match(/^(\d+)\s*s/);
  if (s) return parseInt(s[1], 10);
  const m = time.match(/^(\d+)\s*min/);
  if (m) return parseInt(m[1], 10) * 60;
  const h = time.match(/^([\d.]+)\s*hr/);
  if (h) return Math.round(parseFloat(h[1]) * 3600);
  return 120; // default 2 min
}
