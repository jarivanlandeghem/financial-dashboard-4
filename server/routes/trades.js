const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM trades ORDER BY date DESC, id DESC').all());
});

router.post('/', (req, res) => {
  const { date, pair, type, entry, exit, size, pnl, duration, strategy, rr, notes } = req.body;
  const result = db.prepare(
    'INSERT INTO trades (date,pair,type,entry,exit,size,pnl,duration,strategy,rr,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)'
  ).run(date, pair, type, entry, exit, size, pnl, duration, strategy, rr, notes);
  res.json({ id: result.lastInsertRowid, date, pair, type, entry, exit, size, pnl, duration, strategy, rr, notes });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM trades WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
