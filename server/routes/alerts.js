const express = require('express');
const router = express.Router();
const data = require('../data');

router.get('/', (_req, res) => {
  const { severity, category } = _req.query;
  let filtered = data.allAlerts;
  if (severity) filtered = filtered.filter(a => a.severity === severity);
  if (category) filtered = filtered.filter(a => a.category === category);
  res.json(filtered);
});

module.exports = router;
