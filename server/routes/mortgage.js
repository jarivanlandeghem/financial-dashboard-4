const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const row = db.prepare('SELECT * FROM mortgage WHERE id = 1').get();
  if (!row) return res.status(404).json({ error: 'No mortgage data' });
  res.json({
    originalAmount: row.original_amount,
    startDate: row.start_date,
    endDate: row.end_date,
    interestRate: row.interest_rate,
    monthlyPayment: row.monthly_payment,
    currentBalance: row.current_balance,
  });
});

router.put('/', (req, res) => {
  const { currentBalance, monthlyPayment, interestRate } = req.body;
  db.prepare(
    'UPDATE mortgage SET current_balance = ?, monthly_payment = ?, interest_rate = ? WHERE id = 1'
  ).run(currentBalance, monthlyPayment, interestRate);
  res.json({ ok: true });
});

module.exports = router;
