const express = require('express');
const router = express.Router();
const data = require('../data');

router.get('/', (_req, res) => {
  res.json({
    kpis: data.smartMeterKpis,
    healthStatus: data.meterHealthStatus,
    activityByRegion: data.meterActivityByRegion,
    topCustomers: data.topCustomersByConsumption,
    consumptionTrend: data.consumptionTrend,
  });
});

router.get('/kpis', (_req, res) => res.json(data.smartMeterKpis));
router.get('/health-status', (_req, res) => res.json(data.meterHealthStatus));
router.get('/activity-by-region', (_req, res) => res.json(data.meterActivityByRegion));
router.get('/top-customers', (_req, res) => res.json(data.topCustomersByConsumption));

module.exports = router;
