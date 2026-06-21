const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, label ASC').all();
  res.json(rows.map(r => ({ ...r, parent_id: r.parent_id ?? null })));
});

router.post('/', (req, res) => {
  const { key, label, icon, color, type, parent_id, sort_order = 0 } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO categories (key,label,icon,color,type,parent_id,sort_order) VALUES (?,?,?,?,?,?,?)'
    ).run(key, label, icon, color, type, parent_id ?? null, sort_order);
    res.json({ id: result.lastInsertRowid, key, label, icon, color, type, parent_id: parent_id ?? null, sort_order });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', (req, res) => {
  const { label, icon, color, type, sort_order } = req.body;
  db.prepare('UPDATE categories SET label=?,icon=?,color=?,type=?,sort_order=? WHERE id=?')
    .run(label, icon, color, type, sort_order ?? 0, req.params.id);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  // also deletes children via CASCADE
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
