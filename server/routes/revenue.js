const express = require('express');
const router = express.Router();
const data = require('../data');

router.get('/', (_req, res) => {
  res.json({
    kpis: data.revenueKpis,
    areaWiseRevenue: data.areaWiseRevenue,
    consumptionVsBilled: data.consumptionVsBilled,
    tamperingAlerts: data.tamperingAlerts,
  });
});

router.get('/kpis', (_req, res) => res.json(data.revenueKpis));
router.get('/area-wise', (_req, res) => res.json(data.areaWiseRevenue));
router.get('/consumption-vs-billed', (_req, res) => res.json(data.consumptionVsBilled));
router.get('/tampering-alerts', (_req, res) => res.json(data.tamperingAlerts));

module.exports = router;
