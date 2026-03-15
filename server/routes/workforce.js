const express = require('express');
const router = express.Router();
const data = require('../data');

router.get('/', (_req, res) => {
  res.json({
    kpis: data.workforceKpis,
    activeTasks: data.activeTasks,
    workOrderMapData: data.workOrderMapData,
    crewVehicles: data.crewVehicles,
    distribution: data.workforceDistribution,
  });
});

router.get('/kpis', (_req, res) => res.json(data.workforceKpis));
router.get('/active-tasks', (_req, res) => res.json(data.activeTasks));
router.get('/map-data', (_req, res) => res.json(data.workOrderMapData));
router.get('/crews', (_req, res) => res.json(data.crewVehicles));
router.get('/distribution', (_req, res) => res.json(data.workforceDistribution));

module.exports = router;
