const express = require('express');
const router = express.Router();
const data = require('../data');

router.get('/', (_req, res) => {
  res.json({
    kpis: data.customerKpis,
    complaintTypes: data.complaintTypes,
    complaintTrends: data.complaintTrends,
    complaintHeatmap: data.complaintHeatmap,
    recentComplaints: data.recentComplaints,
    customerList: data.customerList,
    customerDistributionSummary: data.customerDistributionSummary,
  });
});

router.get('/kpis', (_req, res) => res.json(data.customerKpis));
router.get('/complaint-types', (_req, res) => res.json(data.complaintTypes));
router.get('/complaint-trends', (_req, res) => res.json(data.complaintTrends));
router.get('/complaint-heatmap', (_req, res) => res.json(data.complaintHeatmap));
router.get('/recent-complaints', (_req, res) => res.json(data.recentComplaints));
router.get('/list', (_req, res) => res.json(data.customerList));
router.get('/distribution-summary', (_req, res) => res.json(data.customerDistributionSummary));

module.exports = router;
