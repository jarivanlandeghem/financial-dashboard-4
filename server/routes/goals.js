const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM goals ORDER BY id').all();
  res.json(rows.map(r => ({
    id: r.id, iconKey: r.icon_key, name: r.name,
    target: r.target, saved: r.saved, color: r.color, deadline: r.deadline,
  })));
});

router.post('/', (req, res) => {
  const { iconKey, name, target, saved = 0, color = '#007AFF', deadline } = req.body;
  const result = db.prepare(
    'INSERT INTO goals (icon_key,name,target,saved,color,deadline) VALUES (?,?,?,?,?,?)'
  ).run(iconKey, name, target, saved, color, deadline || null);
  res.json({ id: result.lastInsertRowid, iconKey, name, target, saved, color, deadline });
});

router.patch('/:id/add', (req, res) => {
  const { amount } = req.body;
  db.prepare('UPDATE goals SET saved = saved + ? WHERE id = ?').run(amount, req.params.id);
  const row = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id);
  res.json({ saved: row.saved });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM goals WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
