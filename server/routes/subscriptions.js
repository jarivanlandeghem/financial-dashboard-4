const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM subscriptions ORDER BY next_date ASC').all();
  res.json(rows.map(r => ({
    id: r.id, name: r.name, amount: r.amount, category: r.category,
    icon: r.icon, billing: r.billing, nextDate: r.next_date,
    canCancel: !!r.can_cancel, markedForCancel: !!r.marked_for_cancel,
  })));
});

router.post('/', (req, res) => {
  const { name, amount, category, icon = '📱', billing = 'monthly', nextDate, canCancel = true } = req.body;
  const result = db.prepare(
    'INSERT INTO subscriptions (name,amount,category,icon,billing,next_date,can_cancel) VALUES (?,?,?,?,?,?,?)'
  ).run(name, amount, category, icon, billing, nextDate, canCancel ? 1 : 0);
  res.json({ id: result.lastInsertRowid, name, amount, category, icon, billing, nextDate, canCancel, markedForCancel: false });
});

router.patch('/:id/cancel', (req, res) => {
  const row = db.prepare('SELECT marked_for_cancel FROM subscriptions WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const toggled = row.marked_for_cancel ? 0 : 1;
  db.prepare('UPDATE subscriptions SET marked_for_cancel = ? WHERE id = ?').run(toggled, req.params.id);
  res.json({ markedForCancel: !!toggled });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM subscriptions WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
