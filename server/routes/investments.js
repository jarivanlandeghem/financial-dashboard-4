const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const stocks = db.prepare('SELECT * FROM investments_stocks ORDER BY id').all();
  const crypto = db.prepare('SELECT * FROM investments_crypto ORDER BY id').all();
  res.json({
    saxobank: stocks.map(r => ({
      id: r.id, name: r.name, ticker: r.ticker,
      shares: r.shares, buyPrice: r.buy_price, currentPrice: r.current_price, currency: r.currency,
    })),
    bybit: crypto.map(r => ({
      id: r.id, name: r.name, ticker: r.ticker,
      amount: r.amount, buyPrice: r.buy_price, currentPrice: r.current_price, currency: r.currency,
    })),
  });
});

router.put('/stocks/:id', (req, res) => {
  const { currentPrice } = req.body;
  db.prepare('UPDATE investments_stocks SET current_price = ? WHERE id = ?').run(currentPrice, req.params.id);
  res.json({ ok: true });
});

router.put('/crypto/:id', (req, res) => {
  const { currentPrice } = req.body;
  db.prepare('UPDATE investments_crypto SET current_price = ? WHERE id = ?').run(currentPrice, req.params.id);
  res.json({ ok: true });
});

module.exports = router;
