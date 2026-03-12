const express = require('express');
const cors = require('cors');

const dashboardRoutes = require('./routes/dashboard');
const digitalTwinRoutes = require('./routes/digitalTwin');
const smartMetersRoutes = require('./routes/smartMeters');
const revenueRoutes = require('./routes/revenue');
const safetyRoutes = require('./routes/safety');
const customersRoutes = require('./routes/customers');
const workforceRoutes = require('./routes/workforce');
const assetsRoutes = require('./routes/assets');
const alertsRoutes = require('./routes/alerts');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/digital-twin', digitalTwinRoutes);
app.use('/api/smart-meters', smartMetersRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/workforce', workforceRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/alerts', alertsRoutes);

app.listen(PORT, () => {
  console.log(`Gas Command Center API running on http://localhost:${PORT}`);
});
