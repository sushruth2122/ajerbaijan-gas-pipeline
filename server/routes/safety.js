const express = require('express');
const router = express.Router();
const data = require('../data');

router.get('/', (_req, res) => {
  res.json({
    kpis: data.safetyKpis,
    pressureTrends: data.gasPressureTrends,
    leakDetection: data.leakDetectionActivity,
    alerts: data.safetyAlerts,
  });
});

router.get('/kpis', (_req, res) => res.json(data.safetyKpis));
router.get('/pressure-trends', (_req, res) => res.json(data.gasPressureTrends));
router.get('/leak-detection', (_req, res) => res.json(data.leakDetectionActivity));
router.get('/alerts', (_req, res) => res.json(data.safetyAlerts));

module.exports = router;
