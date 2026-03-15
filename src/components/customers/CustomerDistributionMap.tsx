import { useEffect, useMemo, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import Map from 'react-map-gl/maplibre';
import customersGeoJsonUrl from '@/data/customers.geojson?url';

const TARGET_COUNTS = {
  smart: 44900,
  commercial: 5040,
  industrial: 469,
};

const CATEGORY_CONFIG: Record<string, { label: string; color: [number, number, number, number]; radius: number; jitterDeg: number }> = {
  smart: { label: 'Smart (Household)', color: [37, 99, 235, 95], radius: 80, jitterDeg: 0.06 },
  commercial: { label: 'Commercial', color: [249, 115, 22, 110], radius: 140, jitterDeg: 0.03 },
  industrial: { label: 'Industrial', color: [220, 38, 38, 130], radius: 210, jitterDeg: 0.016 },
};

function normalizeCategory(feature: any): string {
  const raw = feature?.properties?.category ?? feature?.properties?.type ?? 'smart';
  const value = String(raw).toLowerCase();
  return (TARGET_COUNTS as any)[value] ? value : 'smart';
}

function allocateCounts(features: any[], targetCount: number): number[] {
  if (!features.length || targetCount <= 0) return [];
  const weights = features.map((f) => {
    const count = Number(f?.properties?.customerCount);
    return Number.isFinite(count) && count > 0 ? count : 1;
  });
  const totalWeight = weights.reduce((s, w) => s + w, 0) || features.length;
  const floats = weights.map((w) => (w / totalWeight) * targetCount);
  const base = floats.map((v) => Math.floor(v));
  let assigned = base.reduce((s, v) => s + v, 0);
  const fractional = floats.map((v, i) => ({ index: i, remainder: v - Math.floor(v) }));
  fractional.sort((a, b) => b.remainder - a.remainder);
  let cursor = 0;
  while (assigned < targetCount && fractional.length > 0) {
    base[fractional[cursor % fractional.length].index] += 1;
    assigned += 1;
    cursor += 1;
  }
  return base;
}

function buildExpandedCustomers(features: any[]): any[] {
  const grouped: Record<string, any[]> = { smart: [], commercial: [], industrial: [] };
  for (const feature of features) {
    const coords = feature?.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) continue;
    grouped[normalizeCategory(feature)].push(feature);
  }
  const expanded: any[] = [];
  for (const category of Object.keys(TARGET_COUNTS)) {
    const catFeatures = grouped[category];
    if (!catFeatures.length) continue;
    const allocations = allocateCounts(catFeatures, (TARGET_COUNTS as any)[category]);
    const jitterDeg = CATEGORY_CONFIG[category].jitterDeg;
    catFeatures.forEach((feature, fi) => {
      const [lng, lat] = feature.geometry.coordinates;
      const localCount = allocations[fi] || 0;
      const lngScale = 1 / Math.max(Math.cos((lat * Math.PI) / 180), 0.2);
      for (let i = 0; i < localCount; i++) {
        const angle = (((i * 137.508) + fi * 19.911) * Math.PI) / 180;
        const radius = jitterDeg * Math.sqrt((i + 0.5) / localCount);
        expanded.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [lng + Math.cos(angle) * radius * lngScale, lat + Math.sin(angle) * radius] },
          properties: { ...feature.properties, category, estimatedAreaCount: feature.properties?.customerCount ?? Math.round((TARGET_COUNTS as any)[category] / catFeatures.length) },
        });
      }
    });
  }
  return expanded;
}

const OSM_RASTER_STYLE = {
  version: 8 as const,
  sources: {
    'carto-raster': {
      type: 'raster' as const,
      tiles: ['https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [{ id: 'carto-layer', type: 'raster' as const, source: 'carto-raster', minzoom: 0, maxzoom: 19 }],
};

interface CustomerDistributionMapProps {
  onSelectCustomer?: (info: { customerType: string; location: string; estimatedCount: number | string; coordinates: string } | null) => void;
}

export function CustomerDistributionMap({ onSelectCustomer }: CustomerDistributionMapProps) {
  const [viewState, setViewState] = useState({ latitude: 40.4093, longitude: 49.8671, zoom: 6, pitch: 0, bearing: 0 });
  const [customerSources, setCustomerSources] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch(customersGeoJsonUrl)
      .then((r) => r.json())
      .then((data) => { if (mounted) setCustomerSources(data.features || []); })
      .catch(() => { if (mounted) setCustomerSources([]); });
    return () => { mounted = false; };
  }, []);

  const customers = useMemo(() => buildExpandedCustomers(customerSources), [customerSources]);

  const renderedCounts = useMemo(() => {
    const counts = { smart: 0, commercial: 0, industrial: 0 };
    for (const f of customers) counts[normalizeCategory(f) as keyof typeof counts] += 1;
    return counts;
  }, [customers]);

  const layers = useMemo(() => [
    new ScatterplotLayer({
      id: 'customer-scatter',
      data: customers,
      pickable: true,
      radiusUnits: 'meters',
      stroked: false,
      filled: true,
      getPosition: (d: any) => d.geometry.coordinates,
      getRadius: (d: any) => CATEGORY_CONFIG[normalizeCategory(d)]?.radius ?? 80,
      radiusMinPixels: 2,
      radiusMaxPixels: 14,
      getFillColor: (d: any) => CATEGORY_CONFIG[normalizeCategory(d)]?.color ?? CATEGORY_CONFIG.smart.color,
      onClick: (info: any) => {
        if (!info.object || !onSelectCustomer) return;
        const cat = normalizeCategory(info.object);
        const cfg = CATEGORY_CONFIG[cat];
        const props = info.object.properties || {};
        const [lng, lat] = info.object.geometry?.coordinates || [];
        onSelectCustomer({
          customerType: cfg.label,
          location: `${props.district || 'Unknown'}, ${props.region || 'Unknown'}`,
          estimatedCount: props.estimatedAreaCount ?? props.customerCount ?? 'N/A',
          coordinates: typeof lng === 'number' && typeof lat === 'number' ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : 'N/A',
        });
      },
    }),
  ], [customers, onSelectCustomer]);

  const total = renderedCounts.smart + renderedCounts.commercial + renderedCounts.industrial;

  return (
    <div className="relative w-full" style={{ height: 480 }}>
      <DeckGL
        viewState={viewState}
        controller={true}
        layers={layers}
        onViewStateChange={({ viewState: vs }: any) => setViewState(vs)}
      >
        <Map mapStyle={OSM_RASTER_STYLE as any} attributionControl={true} reuseMaps />
      </DeckGL>

      {/* Legend overlay */}
      <div className="absolute left-3 bottom-3 bg-slate-900/90 text-slate-100 border border-slate-600/40 rounded-sm p-3 z-10 text-xs space-y-1.5 min-w-[200px]">
        <div className="text-sm font-semibold mb-2">Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
          Smart (Household): {renderedCounts.smart.toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
          Commercial: {renderedCounts.commercial.toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
          Industrial: {renderedCounts.industrial.toLocaleString()}
        </div>
        <div className="pt-1 opacity-80">Total: {total.toLocaleString()}</div>
      </div>
    </div>
  );
}
