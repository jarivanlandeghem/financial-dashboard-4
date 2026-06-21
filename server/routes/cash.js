const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const txs = db.prepare('SELECT * FROM cash_transactions ORDER BY date DESC, id DESC').all();
  const balance = txs.reduce((sum, t) => sum + t.amount, 0);
  res.json({
    balance: Math.round(balance * 100) / 100,
    transactions: txs,
  });
});

router.post('/transaction', (req, res) => {
  const { date, description, amount, category, type } = req.body;
  const signed = type === 'out' ? -Math.abs(amount) : Math.abs(amount);
  const result = db.prepare(
    'INSERT INTO cash_transactions (date,description,amount,category,type) VALUES (?,?,?,?,?)'
  ).run(date, description, signed, category || null, type);
  res.json({ id: result.lastInsertRowid, date, description, amount: signed, category, type });
});

module.exports = router;
