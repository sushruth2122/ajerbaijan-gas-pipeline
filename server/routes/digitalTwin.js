const express = require('express');
const router = express.Router();
const data = require('../data');

// GET /api/digital-twin — all Digital Twin page data
router.get('/', (_req, res) => {
  res.json({
    metrics: data.digitalTwinMetrics,
    pipelineMetrics: data.pipelineMetrics,
    networkStats: data.networkStats,
    alerts: data.alerts,
  });
});

// GET /api/digital-twin/map — GIS map layers data
router.get('/map', (_req, res) => {
  res.json({
    pipelineSegments: data.pipelineSegments,
    smartMeterClusters: data.smartMeterClusters,
    monitoringNodes: data.monitoringNodes,
    incidents: data.mapIncidents,
    complaintPoints: data.complaintPoints,
    fieldCrews: data.mapFieldCrews,
  });
});

router.get('/metrics', (_req, res) => res.json(data.digitalTwinMetrics));
router.get('/pipeline-metrics', (_req, res) => res.json(data.pipelineMetrics));
router.get('/network-stats', (_req, res) => res.json(data.networkStats));

module.exports = router;
