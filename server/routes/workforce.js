const express = require('express');
const router = express.Router();
const data = require('../data');

router.get('/', (_req, res) => {
  res.json({
    kpis: data.workforceKpis,
    activeTasks: data.activeTasks,
  });
});

router.get('/kpis', (_req, res) => res.json(data.workforceKpis));
router.get('/active-tasks', (_req, res) => res.json(data.activeTasks));

module.exports = router;
