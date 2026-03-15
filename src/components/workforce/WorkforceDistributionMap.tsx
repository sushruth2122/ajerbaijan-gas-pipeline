import { useMemo, useState, useCallback } from "react";
import DeckGL from "@deck.gl/react";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import { ScatterplotLayer, IconLayer } from "@deck.gl/layers";
import Map from "react-map-gl/maplibre";

/* ── Map style ─────────────────────────────────────────────────────── */
const MAP_STYLE = {
  version: 8 as const,
  sources: {
    "carto-voyager": {
      type: "raster" as const,
      tiles: ["https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [{ id: "carto-voyager-layer", type: "raster" as const, source: "carto-voyager", minzoom: 0, maxzoom: 19 }],
};

/* ── Constants ─────────────────────────────────────────────────────── */
const PRIORITY_WEIGHTS: Record<string, number> = { Critical: 5, High: 4, Medium: 3, Low: 2 };
const PRIORITY_RANK: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };

// Muted / standard palette matching the rest of the app
const PRIORITY_COLORS: Record<string, [number, number, number, number]> = {
  Critical: [180, 50, 50, 215],   // muted red
  High:     [190, 110, 50, 210],  // muted orange
  Medium:   [185, 140, 55, 210],  // muted amber
  Low:      [60, 150, 90, 210],   // muted green
};

const CREW_STATUS_FILL: Record<string, string> = {
  Available: "#4AAF6A",  // muted green
  Assigned:  "#B8A030",  // muted yellow
  Emergency: "#B83030",  // muted red
};

/* ── Types ─────────────────────────────────────────────────────────── */
interface WorkOrder {
  id: string;
  location: [number, number];
  taskType: string;
  crew: string;
  priority: string;
  status: string;
  city: string;
}

interface CrewVehicle {
  id: string;
  location: [number, number];
  status: string;
  baseCity: string;
}

interface LocationSummary {
  location: string;
  activeWorkOrders: number;
  taskTypes: string[];
  assignedCrews: string[];
  highestPriority: string | null;
}

interface Props {
  workOrders: WorkOrder[];
  crewVehicles: CrewVehicle[];
  onSelectSummary?: (summary: LocationSummary) => void;
}

/* ── Helpers ───────────────────────────────────────────────────────── */
function getLocationSummary(workOrders: WorkOrder[], target: WorkOrder): LocationSummary {
  const scoped = workOrders.filter((w) => w.city === target.city);
  return {
    location: target.city,
    activeWorkOrders: scoped.length,
    taskTypes: [...new Set(scoped.map((w) => w.taskType))],
    assignedCrews: [...new Set(scoped.map((w) => w.crew).filter(Boolean))],
    highestPriority: scoped.reduce<string | null>((h, w) => {
      if (!h) return w.priority;
      return (PRIORITY_RANK[w.priority] ?? 0) > (PRIORITY_RANK[h] ?? 0) ? w.priority : h;
    }, null),
  };
}

function priorityToRadius(priority: string): number {
  if (priority === "Critical") return 3200;
  if (priority === "High") return 2500;
  if (priority === "Medium") return 1900;
  return 1400;
}

function buildHeatmapPoints(data: WorkOrder[]) {
  const jitter = [
    [0.0, 0.0],
    [0.07, 0.02],
    [-0.05, 0.03],
    [0.03, -0.06],
  ];
  return data.flatMap((entry) => {
    const numId = Number(entry.id.replace(/\D/g, "")) || 1;
    const scale = 0.35 + (numId % 5) * 0.14;
    return jitter.map(([lJ, latJ], idx) => {
      const w = PRIORITY_WEIGHTS[entry.priority] || 1;
      return {
        ...entry,
        id: `${entry.id}-H${idx}`,
        location: [entry.location[0] + lJ * scale, entry.location[1] + latJ * scale] as [number, number],
        heatWeight: idx === 0 ? w : w * 0.42,
      };
    });
  });
}

function createCrewIcon(fill: string): string {
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none">
        <path d="M3 14.5L5.2 8.2C5.5 7.3 6.4 6.7 7.3 6.7H16.7C17.6 6.7 18.5 7.3 18.8 8.2L21 14.5V17.1C21 17.8 20.4 18.4 19.7 18.4H18.9C18.2 18.4 17.6 17.8 17.6 17.1V16.4H6.4V17.1C6.4 17.8 5.8 18.4 5.1 18.4H4.3C3.6 18.4 3 17.8 3 17.1V14.5Z" fill="${fill}"/>
        <rect x="6.5" y="9" width="11" height="3" rx="1" fill="#FFFFFF" opacity="0.9"/>
        <circle cx="7.8" cy="15.3" r="1.2" fill="#0F172A"/>
        <circle cx="16.2" cy="15.3" r="1.2" fill="#0F172A"/>
      </svg>`
    )
  );
}

/* ── Component ─────────────────────────────────────────────────────── */
export function WorkforceDistributionMap({ workOrders, crewVehicles, onSelectSummary }: Props) {
  const [viewState, setViewState] = useState({
    latitude: 40.22,
    longitude: 48.35,
    zoom: 6.2,
    pitch: 0,
    bearing: 0,
  });

  const heatmapData = useMemo(() => buildHeatmapPoints(workOrders), [workOrders]);

  const crewIcons = useMemo(
    () => Object.fromEntries(Object.entries(CREW_STATUS_FILL).map(([s, c]) => [s, createCrewIcon(c)])),
    []
  );

  const handleClick = useCallback(
    (wo: WorkOrder) => {
      onSelectSummary?.(getLocationSummary(workOrders, wo));
    },
    [workOrders, onSelectSummary]
  );

  const layers = useMemo(() => {
    // Unified heatmap — muted blue→green→amber→red
    const heatmap = new HeatmapLayer({
      id: "workforce-heatmap",
      data: heatmapData,
      getPosition: (d: any) => d.location,
      getWeight: (d: any) => d.heatWeight || PRIORITY_WEIGHTS[d.priority] || 1,
      aggregation: "SUM",
      radiusPixels: 70,
      intensity: 1,
      threshold: 0.03,
      colorRange: [
        [60, 100, 180],   // muted blue
        [60, 150, 90],    // muted green
        [185, 160, 55],   // muted amber
        [180, 50, 50],    // muted red
      ],
    });

    // Priority-specific heatmaps
    const priorityConfigs = [
      {
        id: "workforce-heatmap-critical",
        matches: (d: any) => d.priority === "Critical",
        radiusPixels: 72,
        intensity: 0.95,
        colorRange: [[200, 140, 140], [195, 115, 115], [190, 85, 85], [180, 50, 50]] as [number, number, number][],
      },
      {
        id: "workforce-heatmap-high-medium",
        matches: (d: any) => d.priority === "High" || d.priority === "Medium",
        radiusPixels: 62,
        intensity: 0.8,
        colorRange: [[200, 170, 130], [195, 145, 95], [190, 115, 65], [180, 80, 30]] as [number, number, number][],
      },
      {
        id: "workforce-heatmap-low",
        matches: (d: any) => d.priority === "Low",
        radiusPixels: 54,
        intensity: 0.7,
        colorRange: [[150, 195, 160], [110, 185, 135], [75, 170, 110], [50, 145, 75]] as [number, number, number][],
      },
    ];

    const priorityHeatmaps = priorityConfigs.map(
      (cfg) =>
        new HeatmapLayer({
          id: cfg.id,
          data: heatmapData,
          getPosition: (d: any) => d.location,
          getWeight: (d: any) => (cfg.matches(d) ? d.heatWeight || PRIORITY_WEIGHTS[d.priority] || 1 : 0),
          aggregation: "SUM",
          radiusPixels: cfg.radiusPixels,
          intensity: cfg.intensity,
          threshold: 0.04,
          colorRange: cfg.colorRange,
        })
    );

    // Invisible click-target layer for heatmap areas
    const clickTarget = new ScatterplotLayer({
      id: "workforce-click-target",
      data: workOrders,
      pickable: true,
      stroked: false,
      filled: true,
      opacity: 0.01,
      radiusUnits: "meters",
      getRadius: 6500,
      getPosition: (d: any) => d.location,
      getFillColor: [15, 23, 42, 4],
      onClick: (info: any) => {
        if (info.object) handleClick(info.object);
      },
    });

    // Scatter dots for individual work orders
    const scatter = new ScatterplotLayer({
      id: "workforce-scatter",
      data: workOrders,
      pickable: true,
      stroked: true,
      filled: true,
      lineWidthUnits: "pixels",
      getLineWidth: 1.5,
      getLineColor: [241, 245, 249, 220],
      opacity: 0.75,
      radiusUnits: "meters",
      radiusMinPixels: 4,
      radiusMaxPixels: 30,
      getRadius: (d: any) => priorityToRadius(d.priority),
      getPosition: (d: any) => d.location,
      getFillColor: (d: any) => PRIORITY_COLORS[d.priority] || [148, 163, 184, 200],
      onClick: (info: any) => {
        if (info.object) handleClick(info.object);
      },
    });

    // Crew vehicle icons
    const crews = new IconLayer({
      id: "workforce-crew-icons",
      data: crewVehicles,
      pickable: true,
      getPosition: (d: any) => d.location,
      getIcon: (d: any) => ({
        url: crewIcons[d.status] || crewIcons.Available,
        width: 64,
        height: 64,
        anchorY: 48,
      }),
      getSize: 24,
      sizeUnits: "pixels",
    });

    return [heatmap, ...priorityHeatmaps, clickTarget, scatter, crews];
  }, [heatmapData, workOrders, crewVehicles, crewIcons, handleClick]);

  return (
    <div style={{ width: "100%", height: 480, position: "relative" }}>
      <DeckGL
        viewState={viewState as any}
        controller
        layers={layers}
        onViewStateChange={({ viewState: vs }: any) => setViewState(vs)}
      >
        <Map mapStyle={MAP_STYLE as any} attributionControl={{}} reuseMaps />
      </DeckGL>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-card/90 border border-border rounded-sm px-3 py-2 text-xs space-y-1 z-10">
        <div className="font-semibold text-foreground mb-1">Priority</div>
        {(["Critical", "High", "Medium", "Low"] as const).map((p) => {
          const c = PRIORITY_COLORS[p];
          return (
            <div key={p} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: `rgba(${c.join(",")})` }} />
              <span className="text-muted-foreground">{p}</span>
            </div>
          );
        })}
        <div className="border-t border-border pt-1 mt-1 font-semibold text-foreground">Crew Status</div>
        {Object.entries(CREW_STATUS_FILL).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <span className="w-3 h-2 rounded-sm inline-block" style={{ background: color }} />
            <span className="text-muted-foreground">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
