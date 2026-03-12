const path = require('path');

// Tell csvLoader where the data directory is at runtime.
// With Netlify's included_files, CSV files are placed alongside this
// bundled function file, so __dirname/data is the correct path.
process.env.GCC_DATA_DIR = path.join(__dirname, 'data');

const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');

const dashboardRoutes = require('../../server/routes/dashboard');
const digitalTwinRoutes = require('../../server/routes/digitalTwin');
const smartMetersRoutes = require('../../server/routes/smartMeters');
const revenueRoutes = require('../../server/routes/revenue');
const safetyRoutes = require('../../server/routes/safety');
const customersRoutes = require('../../server/routes/customers');
const workforceRoutes = require('../../server/routes/workforce');
const assetsRoutes = require('../../server/routes/assets');
const alertsRoutes = require('../../server/routes/alerts');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/digital-twin', digitalTwinRoutes);
app.use('/api/smart-meters', smartMetersRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/workforce', workforceRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/alerts', alertsRoutes);

module.exports.handler = serverless(app);
