require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// ── API routes ───────────────────────────────────────────────────────────────
app.use('/api/transactions',  require('./routes/transactions'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/investments',   require('./routes/investments'));
app.use('/api/budgets',       require('./routes/budgets'));
app.use('/api/cash',          require('./routes/cash'));
app.use('/api/mortgage',      require('./routes/mortgage'));
app.use('/api/goals',         require('./routes/goals'));
app.use('/api/trades',        require('./routes/trades'));
app.use('/api/categories',    require('./routes/categories'));

// ── Serve built frontend in production (on Pi) ───────────────────────────────
const distPath = path.join(__dirname, '../dist');
if (require('fs').existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`✓ API server running on http://localhost:${PORT}`);
});
