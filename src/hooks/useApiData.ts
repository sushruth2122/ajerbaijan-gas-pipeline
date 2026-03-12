import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Stale time of 30s — data refreshes if older than this
const STALE = 30_000;

// ── Dashboard ──
export const useDashboard = () =>
  useQuery({ queryKey: ["dashboard"], queryFn: api.dashboard.getAll, staleTime: STALE, refetchInterval: 30_000 });

export const useDashboardKpis = () =>
  useQuery({ queryKey: ["dashboard", "kpis"], queryFn: api.dashboard.getKpis, staleTime: STALE });

// ── Digital Twin ──
export const useDigitalTwin = () =>
  useQuery({ queryKey: ["digitalTwin"], queryFn: api.digitalTwin.getAll, staleTime: STALE });

export const useDigitalTwinMap = () =>
  useQuery({ queryKey: ["digitalTwin", "map"], queryFn: api.digitalTwin.getMap, staleTime: STALE });

// ── Smart Meters ──
export const useSmartMeters = () =>
  useQuery({ queryKey: ["smartMeters"], queryFn: api.smartMeters.getAll, staleTime: STALE });

// ── Revenue ──
export const useRevenue = () =>
  useQuery({ queryKey: ["revenue"], queryFn: api.revenue.getAll, staleTime: STALE });

// ── Safety ──
export const useSafety = () =>
  useQuery({ queryKey: ["safety"], queryFn: api.safety.getAll, staleTime: STALE, refetchInterval: 30_000 });

// ── Customers ──
export const useCustomers = () =>
  useQuery({ queryKey: ["customers"], queryFn: api.customers.getAll, staleTime: STALE });

// ── Workforce ──
export const useWorkforce = () =>
  useQuery({ queryKey: ["workforce"], queryFn: api.workforce.getAll, staleTime: STALE });

// ── Assets ──
export const useAssets = () =>
  useQuery({ queryKey: ["assets"], queryFn: api.assets.getAll, staleTime: STALE });

// ── Alerts ──
export const useAllAlerts = (params?: { severity?: string; category?: string }) =>
  useQuery({ queryKey: ["alerts", params], queryFn: () => api.alerts.getAll(params), staleTime: STALE, refetchInterval: 30_000 });
