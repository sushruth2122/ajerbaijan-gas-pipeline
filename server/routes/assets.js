const express = require('express');
const router = express.Router();
const data = require('../data');

router.get('/', (_req, res) => {
  res.json({
    kpis: data.assetKpis,
    ageDistribution: data.assetAgeDistribution,
    maintenanceHistory: data.maintenanceHistory,
    failureFrequency: data.failureFrequency,
  });
});

router.get('/kpis', (_req, res) => res.json(data.assetKpis));
router.get('/age-distribution', (_req, res) => res.json(data.assetAgeDistribution));
router.get('/maintenance-history', (_req, res) => res.json(data.maintenanceHistory));
router.get('/failure-frequency', (_req, res) => res.json(data.failureFrequency));

module.exports = router;
