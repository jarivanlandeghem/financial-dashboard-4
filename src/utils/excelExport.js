import * as XLSX from 'xlsx';
import { CATEGORIES, monthlyData } from '../data/mockData';

const fmt2 = (n) => parseFloat(Math.abs(n).toFixed(2));

export function downloadAnnualReport({ transactions, investments, mortgage, budgets, subscriptions }) {
  const wb = XLSX.utils.book_new();
  const year = new Date().getFullYear();

  // ── Sheet 1: Monthly Summary ──────────────────────────────────────────
  const summaryRows = [
    ['FinDash — Annual Report ' + year],
    [],
    ['Month', 'Income (€)', 'Expenses (€)', 'Net Savings (€)', 'Savings Rate'],
  ];
  monthlyData.forEach(m => {
    const net = m.income - m.expenses;
    summaryRows.push([m.month, m.income, m.expenses, net, ((net / m.income) * 100).toFixed(1) + '%']);
  });
  const totalIncome = monthlyData.reduce((s, m) => s + m.income, 0);
  const totalExp = monthlyData.reduce((s, m) => s + m.expenses, 0);
  const totalNet = totalIncome - totalExp;
  summaryRows.push([]);
  summaryRows.push(['TOTAL', totalIncome, totalExp, totalNet, ((totalNet / totalIncome) * 100).toFixed(1) + '%']);

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Monthly Summary');

  // ── Sheet 2: All Transactions ─────────────────────────────────────────
  const txRows = [['Date', 'Description', 'Category', 'Amount (€)', 'Type', 'Account', 'Recurring']];
  transactions
    .filter(t => new Date(t.date).getFullYear() === year)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(t => {
      txRows.push([
        t.date,
        t.description,
        CATEGORIES[t.category]?.label || t.category,
        t.amount,
        t.amount >= 0 ? 'Income' : 'Expense',
        t.account || 'KBC',
        t.recurring ? 'Yes' : 'No',
      ]);
    });

  const wsTx = XLSX.utils.aoa_to_sheet(txRows);
  wsTx['!cols'] = [{ wch: 12 }, { wch: 28 }, { wch: 16 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsTx, 'Transactions');

  // ── Sheet 3: Spending by Category ────────────────────────────────────
  const catSpend = {};
  transactions.filter(t => t.amount < 0 && new Date(t.date).getFullYear() === year).forEach(t => {
    const label = CATEGORIES[t.category]?.label || t.category;
    catSpend[label] = (catSpend[label] || 0) + Math.abs(t.amount);
  });
  const totalSpend = Object.values(catSpend).reduce((s, v) => s + v, 0);

  const catRows = [['Category', 'Total Spent (€)', '% of Expenses']];
  Object.entries(catSpend)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, val]) => {
      catRows.push([cat, fmt2(val), ((val / totalSpend) * 100).toFixed(1) + '%']);
    });
  catRows.push([]);
  catRows.push(['TOTAL', fmt2(totalSpend), '100%']);

  const wsCat = XLSX.utils.aoa_to_sheet(catRows);
  wsCat['!cols'] = [{ wch: 20 }, { wch: 16 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsCat, 'By Category');

  // ── Sheet 4: Investments ──────────────────────────────────────────────
  const invRows = [['Name', 'Ticker', 'Units', 'Buy Price', 'Current Price', 'Gain/Loss (€)', 'Return %']];
  [...investments.saxobank, ...investments.bybit].forEach(p => {
    const units = p.shares || p.amount;
    const cost = p.buyPrice * units;
    const curr = p.currentPrice * units;
    const gain = curr - cost;
    invRows.push([
      p.name, p.ticker, units,
      fmt2(p.buyPrice), fmt2(p.currentPrice),
      fmt2(gain), ((gain / cost) * 100).toFixed(1) + '%',
    ]);
  });

  const wsInv = XLSX.utils.aoa_to_sheet(invRows);
  wsInv['!cols'] = [{ wch: 20 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsInv, 'Investments');

  // ── Sheet 5: Subscriptions ────────────────────────────────────────────
  const subRows = [['Service', 'Monthly Cost (€)', 'Yearly Cost (€)', 'Category', 'Next Date']];
  subscriptions.forEach(s => {
    subRows.push([s.name, s.amount, fmt2(s.amount * 12), s.category, s.nextDate]);
  });
  const subTotal = subscriptions.reduce((t, s) => t + s.amount, 0);
  subRows.push([]);
  subRows.push(['TOTAL', fmt2(subTotal), fmt2(subTotal * 12), '', '']);

  const wsSub = XLSX.utils.aoa_to_sheet(subRows);
  wsSub['!cols'] = [{ wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsSub, 'Subscriptions');

  // ── Sheet 6: Mortgage ─────────────────────────────────────────────────
  const mortRows = [
    ['Mortgage Overview'],
    [],
    ['Original Amount', '€' + mortgage.originalAmount.toLocaleString()],
    ['Current Balance', '€' + mortgage.currentBalance.toLocaleString()],
    ['Paid Off', '€' + (mortgage.originalAmount - mortgage.currentBalance).toLocaleString()],
    ['Progress', ((1 - mortgage.currentBalance / mortgage.originalAmount) * 100).toFixed(1) + '%'],
    ['Interest Rate', mortgage.interestRate + '%'],
    ['Monthly Payment', '€' + mortgage.monthlyPayment],
    ['Start Date', mortgage.startDate],
    ['End Date', mortgage.endDate],
  ];

  const wsMort = XLSX.utils.aoa_to_sheet(mortRows);
  wsMort['!cols'] = [{ wch: 20 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsMort, 'Mortgage');

  // ── Download ──────────────────────────────────────────────────────────
  XLSX.writeFile(wb, `FinDash_Annual_Report_${year}.xlsx`);
}
