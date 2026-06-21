const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM budgets ORDER BY id').all();
  res.json(rows.map(r => ({ id: r.id, category: r.category, limit: r.limit, spent: r.spent })));
});

router.put('/:id', (req, res) => {
  const { limit } = req.body;
  db.prepare('UPDATE budgets SET "limit" = ? WHERE id = ?').run(limit, req.params.id);
  res.json({ ok: true });
});

// Recalculate spent from transactions (call after adding/deleting transactions)
router.post('/recalculate', (req, res) => {
  const { year, month } = req.body; // e.g. 2026, 6
  const pad = String(month).padStart(2, '0');
  const prefix = `${year}-${pad}`;
  const budgets = db.prepare('SELECT id, category FROM budgets').all();
  const update = db.prepare('UPDATE budgets SET spent = ? WHERE id = ?');
  const updateMany = db.transaction(() => {
    budgets.forEach(b => {
      const row = db.prepare(
        `SELECT COALESCE(SUM(ABS(amount)),0) as total FROM transactions
         WHERE category = ? AND type = 'expense' AND date LIKE ?`
      ).get(b.category, `${prefix}%`);
      update.run(row.total, b.id);
    });
  });
  updateMany();
  res.json({ ok: true });
});

module.exports = router;
