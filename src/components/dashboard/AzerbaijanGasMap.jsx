import 'maplibre-gl/dist/maplibre-gl.css';
import {useMemo, useState} from 'react';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, IconLayer, ScatterplotLayer} from '@deck.gl/layers';
import {HeatmapLayer} from '@deck.gl/aggregation-layers';
import Map from 'react-map-gl/maplibre';

const LONGITUDE_OFFSET = -0.8;
const PIPELINE_LONGITUDE_OFFSET = -1.3;
const PIPELINE_LATITUDE_OFFSET = -0.12;

function shiftPositionLeft([lng, lat]) {
  return [lng + LONGITUDE_OFFSET, lat];
}

function shiftPipelinePositionLeft([lng, lat]) {
  return [lng + PIPELINE_LONGITUDE_OFFSET, lat + PIPELINE_LATITUDE_OFFSET];
}

function interpolatePosition([lng1, lat1], [lng2, lat2], t) {
  return [lng1 + (lng2 - lng1) * t, lat1 + (lat2 - lat1) * t];
}

const PIPELINE_ANCHORS = {
  pl1Start: shiftPipelinePositionLeft([49.8671, 40.4093]),
  pl2Mid: shiftPipelinePositionLeft([49.1, 40.35]),
  pl2Pl3Join: shiftPipelinePositionLeft([48.4, 40.2]),
  pl3Mid: shiftPipelinePositionLeft([47.8, 40.5]),
  pl3End: shiftPipelinePositionLeft([47.2, 40.75]),
  pl4End: shiftPipelinePositionLeft([49.2, 41.35]),
  pl5Mid: shiftPipelinePositionLeft([48.6, 39.95]),
};

function statusColor(status) {
  if (status === 'critical') {
    return [220, 38, 38, 240];
  }
  if (status === 'warning' || status === 'abnormal' || status === 'en-route') {
    return [245, 158, 11, 235];
  }
  if (status === 'issue') {
    return [249, 115, 22, 235];
  }
  if (status === 'available') {
    return [37, 99, 235, 235];
  }
  return [34, 197, 94, 235];
}

function createSvgMarker(fill) {
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none">
        <path d="M12 22C12 22 20 14.5 20 9.5C20 5.36 16.64 2 12.5 2C8.36 2 5 5.36 5 9.5C5 14.5 12 22 12 22Z" fill="${fill}"/>
        <circle cx="12" cy="9.5" r="3" fill="#FFFFFF"/>
      </svg>`
    )
  );
}

function createDiamondMarker(fill) {
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L21 12L12 22L3 12L12 2Z" fill="${fill}"/>
        <circle cx="12" cy="12" r="2.7" fill="#FFFFFF"/>
      </svg>`
    )
  );
}

function createHexMarker(fill) {
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none">
        <path d="M7 3.8L17 3.8L22 12L17 20.2L7 20.2L2 12L7 3.8Z" fill="${fill}"/>
        <circle cx="12" cy="12" r="2.5" fill="#FFFFFF"/>
      </svg>`
    )
  );
}

const OSM_RASTER_STYLE = {
  version: 8,
  sources: {
    'english-light-raster-tiles': {
      type: 'raster',
      tiles: ['https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [
    {
      id: 'english-light-raster-layer',
      type: 'raster',
      source: 'english-light-raster-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

const INCIDENT_ICONS = {
  medium: createSvgMarker('#F97316'),
  critical: createSvgMarker('#DC2626'),
};

const CREW_ICONS = {
  available: createDiamondMarker('#2563EB'),
  'en-route': createDiamondMarker('#F59E0B'),
  critical: createDiamondMarker('#DC2626'),
};

const NODE_ICONS = {
  healthy: createHexMarker('#22C55E'),
  abnormal: createHexMarker('#F59E0B'),
  critical: createHexMarker('#DC2626'),
};

const rawPipelineSegments = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'PL-1',
        name: 'Baku-North Segment',
        pressure: 55,
        flow: 220,
        status: 'normal',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [49.8671, 40.4093],
          [50.15, 40.72],
          [50.45, 41.02],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'PL-2',
        name: 'Baku-West Segment',
        pressure: 52,
        flow: 205,
        status: 'warning',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [49.8671, 40.4093],
          [49.1, 40.35],
          [48.4, 40.2],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'PL-3',
        name: 'Central Corridor',
        pressure: 44,
        flow: 180,
        status: 'critical',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [48.4, 40.2],
          [47.8, 40.5],
          [47.2, 40.75],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'PL-4',
        name: 'Northern Link',
        pressure: 57,
        flow: 230,
        status: 'normal',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [50.45, 41.02],
          [49.9, 41.2],
          [49.2, 41.35],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'PL-5',
        name: 'Southern Link',
        pressure: 50,
        flow: 198,
        status: 'warning',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [49.1, 40.35],
          [48.6, 39.95],
          [48.1, 39.65],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'PL-6',
        name: 'Central-East Branch',
        pressure: 53,
        flow: 214,
        status: 'normal',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [48.4, 40.2],
          [48.05, 40.52],
          [47.72, 40.82],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'PL-7',
        name: 'North-Central Loop',
        pressure: 47,
        flow: 186,
        status: 'warning',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [49.9, 41.2],
          [49.4, 40.95],
          [48.95, 40.7],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'PL-8',
        name: 'Southern Recovery Branch',
        pressure: 42,
        flow: 171,
        status: 'critical',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [48.6, 39.95],
          [49.25, 39.98],
          [49.92, 40.08],
        ],
      },
    },
  ],
};

const smartMeterClusters = [
  {
    id: 'MC-1',
    zone: 'Absheron East',
    position: shiftPositionLeft([49.95, 40.46]),
    meterCount: 180,
    offlineMeters: 3,
    dailyConsumption: 26.4,
    status: 'normal',
  },
  {
    id: 'MC-2',
    zone: 'Absheron Central',
    position: shiftPositionLeft([49.55, 40.34]),
    meterCount: 145,
    offlineMeters: 11,
    dailyConsumption: 21.9,
    status: 'issue',
  },
  {
    id: 'MC-3',
    zone: 'Shirvan Belt',
    position: shiftPositionLeft([48.8, 40.08]),
    meterCount: 132,
    offlineMeters: 4,
    dailyConsumption: 19.1,
    status: 'normal',
  },
  {
    id: 'MC-4',
    zone: 'Ganja Corridor',
    position: shiftPositionLeft([47.55, 40.7]),
    meterCount: 164,
    offlineMeters: 17,
    dailyConsumption: 24.2,
    status: 'critical',
  },
  {
    id: 'MC-5',
    zone: 'North Grid',
    position: shiftPositionLeft([49.45, 41.2]),
    meterCount: 121,
    offlineMeters: 2,
    dailyConsumption: 17.8,
    status: 'normal',
  },
];

const monitoringNodes = [
  {
    nodeId: 'ND-1',
    position: PIPELINE_ANCHORS.pl1Start,
    pressure: 54,
    flow: 210,
    temperature: 12,
    leakStatus: 'No leak',
    healthStatus: 'healthy',
  },
  {
    nodeId: 'ND-2',
    position: PIPELINE_ANCHORS.pl2Pl3Join,
    pressure: 49,
    flow: 188,
    temperature: 15,
    leakStatus: 'Micro leak risk',
    healthStatus: 'abnormal',
  },
  {
    nodeId: 'ND-3',
    position: PIPELINE_ANCHORS.pl3End,
    pressure: 41,
    flow: 165,
    temperature: 17,
    leakStatus: 'Leak detected',
    healthStatus: 'critical',
  },
  {
    nodeId: 'ND-4',
    position: PIPELINE_ANCHORS.pl4End,
    pressure: 56,
    flow: 228,
    temperature: 9,
    leakStatus: 'No leak',
    healthStatus: 'healthy',
  },
];

const incidents = [
  {
    id: 'INC-1',
    incidentType: 'Gas Leak',
    severity: 'critical',
    timestamp: '2026-03-09 14:18',
    description: 'Rapid methane spike detected near corridor junction.',
    location: PIPELINE_ANCHORS.pl3Mid,
  },
  {
    id: 'INC-2',
    incidentType: 'Pressure Drop',
    severity: 'medium',
    timestamp: '2026-03-09 13:42',
    description: 'Sustained pressure fluctuation across sector node.',
    location: PIPELINE_ANCHORS.pl2Mid,
  },
  {
    id: 'INC-3',
    incidentType: 'Network Failure',
    severity: 'critical',
    timestamp: '2026-03-09 12:05',
    description: 'Telemetry blackout from two sensor relays.',
    location: PIPELINE_ANCHORS.pl5Mid,
  },
];

const complaintPoints = [
  {
    id: 'CP-1',
    complaintType: 'Low Pressure',
    location: shiftPositionLeft([49.8, 40.42]),
    count: 18,
    cluster: 'Absheron Cluster',
    mostCommonIssue: 'Low Pressure',
  },
  {
    id: 'CP-2',
    complaintType: 'No Supply',
    location: shiftPositionLeft([49.65, 40.33]),
    count: 24,
    cluster: 'Absheron Cluster',
    mostCommonIssue: 'No Supply',
  },
  {
    id: 'CP-3',
    complaintType: 'Meter Fault',
    location: shiftPositionLeft([48.55, 40.05]),
    count: 14,
    cluster: 'Shirvan Cluster',
    mostCommonIssue: 'Meter Fault',
  },
  {
    id: 'CP-4',
    complaintType: 'Gas Smell',
    location: shiftPositionLeft([47.7, 40.63]),
    count: 26,
    cluster: 'Ganja Cluster',
    mostCommonIssue: 'Gas Smell',
  },
  {
    id: 'CP-5',
    complaintType: 'Billing Error',
    location: shiftPositionLeft([49.25, 41.12]),
    count: 11,
    cluster: 'North Cluster',
    mostCommonIssue: 'Billing Error',
  },
  {
    id: 'CP-6',
    complaintType: 'Low Pressure',
    location: shiftPositionLeft([48.1, 39.8]),
    count: 20,
    cluster: 'South Cluster',
    mostCommonIssue: 'Low Pressure',
  },
];

const fieldCrews = [
  {
    crewId: 'CR-1',
    status: 'available',
    assignedIncident: 'None',
    eta: 'Standby',
    position: shiftPositionLeft([49.55, 40.28]),
  },
  {
    crewId: 'CR-2',
    status: 'en-route',
    assignedIncident: 'INC-2',
    eta: '14 min',
    position: shiftPositionLeft([48.9, 40.0]),
  },
  {
    crewId: 'CR-3',
    status: 'critical',
    assignedIncident: 'INC-1',
    eta: 'On Site',
    position: shiftPositionLeft([47.9, 40.56]),
  },
];

const pipelineSegments = {
  ...rawPipelineSegments,
  features: rawPipelineSegments.features.map((feature) => ({
    ...feature,
    properties: {
      ...feature.properties,
      connectedMeterCount: 2,
    },
    geometry: {
      ...feature.geometry,
      coordinates: feature.geometry.coordinates.map(shiftPipelinePositionLeft),
    },
  })),
};

function createPipelineLayer({data, visible, onSelect}) {
  return new GeoJsonLayer({
    id: 'PipelineLayer',
    data,
    visible,
    pickable: true,
    stroked: true,
    filled: false,
    lineWidthUnits: 'pixels',
    getLineWidth: 4,
    getLineColor: (f) => {
      const status = f.properties.status;
      return statusColor(status);
    },
    onClick: (info) => {
      if (!info.object) {
        return;
      }
      const p = info.object.properties;
      onSelect({
        type: 'Pipeline',
        title: p.name,
        rows: [
          {label: 'Pipeline Name', value: p.name},
          {label: 'Pressure', value: `${p.pressure} bar`},
          {label: 'Flow Rate', value: `${p.flow} m3/h`},
          {label: 'Status', value: p.status},
          {label: 'Connected Meter Count', value: p.connectedMeterCount},
        ],
      });
    },
  });
}

function createMeterClusterLayer({data, visible, onSelect}) {
  return new ScatterplotLayer({
    id: 'SmartMeterClusterLayer',
    data,
    visible,
    pickable: true,
    radiusUnits: 'meters',
    getRadius: (d) => 1500 + d.meterCount * 2.2,
    radiusMinPixels: 10,
    radiusMaxPixels: 24,
    getPosition: (d) => d.position,
    getFillColor: (d) => statusColor(d.status),
    onClick: (info) => {
      if (!info.object) {
        return;
      }
      const d = info.object;
      onSelect({
        type: 'Smart Meter Cluster',
        title: d.zone,
        rows: [
          {label: 'Zone Name', value: d.zone},
          {label: 'Total Meters', value: d.meterCount},
          {label: 'Offline Meters', value: d.offlineMeters},
          {label: 'Daily Gas Consumption', value: `${d.dailyConsumption}k m3`},
        ],
      });
    },
  });
}

function createMonitoringNodeLayer({data, visible, onSelect}) {
  return new IconLayer({
    id: 'MonitoringNodeLayer',
    data,
    visible,
    pickable: true,
    getPosition: (d) => d.position,
    getIcon: (d) => ({
      url: NODE_ICONS[d.healthStatus],
      width: 64,
      height: 64,
      anchorY: 32,
    }),
    getSize: 22,
    sizeUnits: 'pixels',
    onClick: (info) => {
      if (!info.object) {
        return;
      }
      const d = info.object;
      onSelect({
        type: 'Monitoring Node',
        title: d.nodeId,
        rows: [
          {label: 'Node ID', value: d.nodeId},
          {label: 'Pressure', value: `${d.pressure} bar`},
          {label: 'Flow', value: `${d.flow} m3/h`},
          {label: 'Temperature', value: `${d.temperature} C`},
          {label: 'Leak Detection Status', value: d.leakStatus},
          {label: 'Health Status', value: d.healthStatus},
        ],
      });
    },
  });
}

function createIncidentLayer({data, visible, onSelect}) {
  return new IconLayer({
    id: 'IncidentLayer',
    data,
    visible,
    pickable: true,
    getPosition: (d) => d.location,
    getIcon: (d) => ({
      url: d.severity === 'critical' ? INCIDENT_ICONS.critical : INCIDENT_ICONS.medium,
      width: 64,
      height: 64,
      anchorY: 64,
    }),
    getSize: 26,
    sizeUnits: 'pixels',
    onClick: (info) => {
      if (!info.object) {
        return;
      }
      const d = info.object;
      onSelect({
        type: 'Incident',
        title: d.incidentType,
        rows: [
          {label: 'Incident Type', value: d.incidentType},
          {label: 'Severity', value: d.severity},
          {label: 'Time Detected', value: d.timestamp},
          {label: 'Description', value: d.description},
        ],
      });
    },
  });
}

function createComplaintHeatmapLayer({data, visible, onSelect}) {
  const heatLayer = new HeatmapLayer({
    id: 'ComplaintHeatmapLayer',
    data,
    visible,
    getPosition: (d) => d.location,
    getWeight: (d) => d.count,
    radiusPixels: 55,
    intensity: 1.5,
    threshold: 0.04,
  });

  const pickLayer = new ScatterplotLayer({
    id: 'ComplaintHeatmapPickLayer',
    data,
    visible,
    pickable: true,
    stroked: false,
    filled: true,
    opacity: 0.01,
    radiusUnits: 'meters',
    getRadius: 4200,
    getPosition: (d) => d.location,
    getFillColor: [15, 23, 42, 5],
    onClick: (info) => {
      if (!info.object) {
        return;
      }
      const d = info.object;
      onSelect({
        type: 'Complaint Cluster',
        title: d.cluster,
        rows: [
          {label: 'Complaint Cluster', value: d.cluster},
          {label: 'Complaint Count', value: d.count},
          {label: 'Most Common Issue', value: d.mostCommonIssue},
        ],
      });
    },
  });

  return [heatLayer, pickLayer];
}

function createCrewLayer({data, visible, onSelect}) {
  return new IconLayer({
    id: 'CrewLayer',
    data,
    visible,
    pickable: true,
    getPosition: (d) => d.position,
    getIcon: (d) => ({
      url: CREW_ICONS[d.status],
      width: 64,
      height: 64,
      anchorY: 64,
    }),
    getSize: 24,
    sizeUnits: 'pixels',
    onClick: (info) => {
      if (!info.object) {
        return;
      }
      const d = info.object;
      onSelect({
        type: 'Field Crew',
        title: d.crewId,
        rows: [
          {label: 'Crew ID', value: d.crewId},
          {label: 'Status', value: d.status},
          {label: 'Assigned Incident', value: d.assignedIncident},
          {label: 'ETA', value: d.eta},
        ],
      });
    },
  });
}

function getRandomDefaultSelection() {
  const candidates = [
    {
      type: 'Pipeline',
      getInfo: () => {
        const p = pipelineSegments.features[0].properties;
        return {
          type: 'Pipeline',
          title: p.name,
          rows: [
            {label: 'Pipeline Name', value: p.name},
            {label: 'Pressure', value: `${p.pressure} bar`},
            {label: 'Flow Rate', value: `${p.flow} m3/h`},
            {label: 'Status', value: p.status},
            {label: 'Connected Meter Count', value: p.connectedMeterCount},
          ],
        };
      },
    },
    {
      type: 'Smart Meter Cluster',
      getInfo: () => {
        const d = smartMeterClusters[0];
        return {
          type: 'Smart Meter Cluster',
          title: d.zone,
          rows: [
            {label: 'Zone Name', value: d.zone},
            {label: 'Total Meters', value: d.meterCount},
            {label: 'Offline Meters', value: d.offlineMeters},
            {label: 'Daily Gas Consumption', value: `${d.dailyConsumption}k m3`},
          ],
        };
      },
    },
    {
      type: 'Monitoring Node',
      getInfo: () => {
        const d = monitoringNodes[0];
        return {
          type: 'Monitoring Node',
          title: d.nodeId,
          rows: [
            {label: 'Node ID', value: d.nodeId},
            {label: 'Pressure', value: `${d.pressure} bar`},
            {label: 'Flow', value: `${d.flow} m3/h`},
            {label: 'Temperature', value: `${d.temperature} C`},
            {label: 'Leak Detection Status', value: d.leakStatus},
            {label: 'Health Status', value: d.healthStatus},
          ],
        };
      },
    },
    {
      type: 'Incident',
      getInfo: () => {
        const d = incidents[0];
        return {
          type: 'Incident',
          title: d.incidentType,
          rows: [
            {label: 'Incident Type', value: d.incidentType},
            {label: 'Severity', value: d.severity},
            {label: 'Time Detected', value: d.timestamp},
            {label: 'Description', value: d.description},
          ],
        };
      },
    },
    {
      type: 'Complaint Cluster',
      getInfo: () => {
        const d = complaintPoints[0];
        return {
          type: 'Complaint Cluster',
          title: d.cluster,
          rows: [
            {label: 'Complaint Cluster', value: d.cluster},
            {label: 'Complaint Count', value: d.count},
            {label: 'Most Common Issue', value: d.mostCommonIssue},
          ],
        };
      },
    },
    {
      type: 'Field Crew',
      getInfo: () => {
        const d = fieldCrews[0];
        return {
          type: 'Field Crew',
          title: d.crewId,
          rows: [
            {label: 'Crew ID', value: d.crewId},
            {label: 'Status', value: d.status},
            {label: 'Assigned Incident', value: d.assignedIncident},
            {label: 'ETA', value: d.eta},
          ],
        };
      },
    },
  ];

  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  return picked.getInfo();
}

export function GasICCCMap() {
  const [viewState, setViewState] = useState({
    latitude: 40.4093,
    longitude: 49.8671,
    zoom: 6,
    pitch: 0,
    bearing: 0,
  });

  const [selectedInfo, setSelectedInfo] = useState(() => getRandomDefaultSelection());

  const [layerVisibility, setLayerVisibility] = useState({
    pipelines: true,
    meterClusters: true,
    monitoringNodes: true,
    incidents: true,
    complaints: true,
    crews: true,
  });

  const layers = useMemo(
    () => {
      const allLayers = [
        createComplaintHeatmapLayer({
          data: complaintPoints,
          visible: layerVisibility.complaints,
          onSelect: setSelectedInfo,
        }),
        createPipelineLayer({
          data: pipelineSegments,
          visible: layerVisibility.pipelines,
          onSelect: setSelectedInfo,
        }),
        createMeterClusterLayer({
          data: smartMeterClusters,
          visible: layerVisibility.meterClusters,
          onSelect: setSelectedInfo,
        }),
        createMonitoringNodeLayer({
          data: monitoringNodes,
          visible: layerVisibility.monitoringNodes,
          onSelect: setSelectedInfo,
        }),
        createIncidentLayer({
          data: incidents,
          visible: layerVisibility.incidents,
          onSelect: setSelectedInfo,
        }),
        createCrewLayer({
          data: fieldCrews,
          visible: layerVisibility.crews,
          onSelect: setSelectedInfo,
        }),
      ];

      return allLayers.flat();
    },
    [layerVisibility]
  );

  const toggleItems = [
    {key: 'pipelines', label: 'Pipelines'},
    {key: 'meterClusters', label: 'Smart Meter Clusters'},
    {key: 'monitoringNodes', label: 'Monitoring Nodes'},
    {key: 'incidents', label: 'Incidents'},
    {key: 'complaints', label: 'Complaint Heatmap'},
    {key: 'crews', label: 'Field Crews'},
  ];

  const activeAlert = useMemo(() => {
    return incidents.find((incident) => incident.severity === 'critical') || incidents[0];
  }, []);

  return (
    <div style={{width: '100%', height: '100%', overflow: 'hidden', position: 'relative'}}>
      <DeckGL
        viewState={viewState}
        controller={true}
        layers={layers}
        onViewStateChange={({viewState: nextViewState}) => setViewState(nextViewState)}
      >
        <Map mapStyle={OSM_RASTER_STYLE} reuseMaps attributionControl={true} />
      </DeckGL>

      <div
        style={{
          position: 'absolute',
          right: 12,
          top: 12,
          width: 210,
          maxHeight: 260,
          overflowY: 'auto',
          background: 'rgba(15, 23, 42, 0.93)',
          color: '#f8fafc',
          border: '1px solid rgba(148, 163, 184, 0.35)',
          borderRadius: 10,
          padding: 10,
          boxShadow: '0 8px 24px rgba(2, 6, 23, 0.5)',
          zIndex: 10,
          fontFamily: 'ui-sans-serif, -apple-system, Segoe UI, sans-serif',
        }}
      >
        <div style={{fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5}}>Layer Controls</div>
        {toggleItems.map((item) => (
          <label
            key={item.key}
            style={{display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 11}}
          >
            <input
              type="checkbox"
              checked={layerVisibility[item.key]}
              style={{accentColor: '#38bdf8', width: 12, height: 12}}
              onChange={() =>
                setLayerVisibility((prev) => ({
                  ...prev,
                  [item.key]: !prev[item.key],
                }))
              }
            />
            {item.label}
          </label>
        ))}

        <div
          style={{
            height: 1,
            background: 'rgba(148, 163, 184, 0.25)',
            marginTop: 8,
            marginBottom: 8,
          }}
        />

        <div style={{fontSize: 11, fontWeight: 700, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5}}>Selected</div>
        <div style={{fontSize: 10, letterSpacing: 0.3, opacity: 0.7}}>{selectedInfo.type}</div>
        <div style={{fontSize: 12, fontWeight: 700, marginTop: 2, marginBottom: 6}}>
          {selectedInfo.title}
        </div>
        {selectedInfo.rows.map((row) => (
          <div
            key={row.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 8,
              borderTop: '1px solid rgba(148, 163, 184, 0.15)',
              paddingTop: 4,
              marginTop: 4,
              fontSize: 10,
            }}
          >
            <span style={{opacity: 0.7}}>{row.label}</span>
            <span style={{textAlign: 'right', fontWeight: 600}}>{row.value}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          right: 12,
          bottom: 12,
          width: 210,
          background: 'rgba(127, 29, 29, 0.95)',
          color: '#fee2e2',
          border: '1px solid rgba(252, 165, 165, 0.5)',
          borderRadius: 10,
          padding: 10,
          boxShadow: '0 8px 20px rgba(69, 10, 10, 0.45)',
          zIndex: 11,
          fontFamily: 'ui-sans-serif, -apple-system, Segoe UI, sans-serif',
        }}
      >
        <div style={{fontSize: 10, fontWeight: 700, letterSpacing: 0.5}}>ACTIVE ALERT</div>
        <div style={{fontSize: 13, fontWeight: 700, marginTop: 2}}>{activeAlert.incidentType}</div>
        <div style={{fontSize: 10, opacity: 0.92, marginTop: 4}}>
          Severity: {activeAlert.severity} | {activeAlert.timestamp}
        </div>
        <div style={{fontSize: 10, marginTop: 4, lineHeight: 1.4, opacity: 0.88}}>{activeAlert.description}</div>
      </div>
    </div>
  );
}

export default GasICCCMap;
