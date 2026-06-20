const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM transactions ORDER BY date DESC, id DESC').all();
  res.json(rows.map(r => ({ ...r, recurring: !!r.recurring })));
});

router.post('/', (req, res) => {
  const { date, description, category, amount, account = 'KBC', type, recurring = false } = req.body;
  const result = db.prepare(
    'INSERT INTO transactions (date,description,category,amount,account,type,recurring) VALUES (?,?,?,?,?,?,?)'
  ).run(date, description, category, amount, account, type, recurring ? 1 : 0);
  res.json({ id: result.lastInsertRowid, date, description, category, amount, account, type, recurring });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
