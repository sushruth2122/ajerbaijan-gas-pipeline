const express = require('express');
const router = express.Router();
const data = require('../data');

// GET /api/dashboard — all dashboard data in one call
router.get('/', (_req, res) => {
  res.json({
    kpiData: data.kpiData,
    consumptionTrend: data.consumptionTrend,
    revenueVsConsumption: data.revenueVsConsumption,
    complaintsByArea: data.complaintsByArea,
    pipelinePressure: data.pipelinePressure,
    alerts: data.alerts,
    fieldCrewStatus: data.fieldCrewStatus,
    highRiskZones: data.highRiskZones,
  });
});

router.get('/kpis', (_req, res) => res.json(data.kpiData));
router.get('/consumption-trend', (_req, res) => res.json(data.consumptionTrend));
router.get('/revenue-vs-consumption', (_req, res) => res.json(data.revenueVsConsumption));
router.get('/complaints-by-area', (_req, res) => res.json(data.complaintsByArea));
router.get('/pipeline-pressure', (_req, res) => res.json(data.pipelinePressure));
router.get('/alerts', (_req, res) => res.json(data.alerts));
router.get('/field-crew-status', (_req, res) => res.json(data.fieldCrewStatus));
router.get('/high-risk-zones', (_req, res) => res.json(data.highRiskZones));

module.exports = router;
