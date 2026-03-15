const express = require('express');
const router = express.Router();
const data = require('../data');

router.get('/', (_req, res) => {
  res.json({
    kpis: data.assetKpis,
    ageDistribution: data.assetAgeDistribution,
    maintenanceHistory: data.maintenanceHistory,
    failureFrequency: data.failureFrequency,
    // Asset intelligence additions
    intelKpis: data.assetIntelKpis,
    assetIntel: data.assetIntel,
    predictiveFailures: data.predictiveFailures,
    expiryItems: data.expiryItems,
    meterCorrelation: data.meterCorrelation,
    recommendedActions: data.recommendedActions,
    aiAdvisory: data.aiAdvisory,
  });
});

router.get('/kpis', (_req, res) => res.json(data.assetKpis));
router.get('/age-distribution', (_req, res) => res.json(data.assetAgeDistribution));
router.get('/maintenance-history', (_req, res) => res.json(data.maintenanceHistory));
router.get('/failure-frequency', (_req, res) => res.json(data.failureFrequency));

// Asset Intelligence sub-endpoints
router.get('/intel-kpis', (_req, res) => res.json(data.assetIntelKpis));
router.get('/intel', (_req, res) => res.json(data.assetIntel));
router.get('/predictive-failures', (_req, res) => res.json(data.predictiveFailures));
router.get('/expiry', (_req, res) => res.json(data.expiryItems));
router.get('/meter-correlation', (_req, res) => res.json(data.meterCorrelation));
router.get('/recommended-actions', (_req, res) => res.json(data.recommendedActions));
router.get('/ai-advisory', (_req, res) => res.json(data.aiAdvisory));

module.exports = router;
