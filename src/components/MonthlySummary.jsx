import { Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, monthlyData } from '../data/mockData';

const fmt = (n) => '€' + Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function MonthlySummary() {
  const { income, expenses, net, filteredTransactions, selectedMonth, budgets } = useApp();

  const monthName = selectedMonth.toLocaleString('en-US', { month: 'long' });

  // Biggest spending category
  const catSpend = {};
  filteredTransactions.filter(t => t.amount < 0).forEach(t => {
    catSpend[t.category] = (catSpend[t.category] || 0) + Math.abs(t.amount);
  });
  const topCat = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0];
  const topCatLabel = topCat ? CATEGORIES[topCat[0]]?.label || topCat[0] : null;

  // vs last month from static data (use monthlyData as proxy)
  const now = new Date();
  const isCurrentMonth = selectedMonth.getMonth() === now.getMonth() && selectedMonth.getFullYear() === now.getFullYear();
  const prevMonthData = monthlyData[monthlyData.length - 2];
  const diffExpenses = prevMonthData ? expenses - prevMonthData.expenses : 0;

  // Savings rate
  const savingsRate = income > 0 ? ((net / income) * 100).toFixed(0) : 0;

  // Budget alerts
  const overBudget = budgets.filter(b => b.spent > b.limit);
  const nearBudget = budgets.filter(b => b.spent > b.limit * 0.85 && b.spent <= b.limit);

  // Unusual transactions: amount > 2× average of its category
  const avgByCategory = {};
  Object.keys(catSpend).forEach(cat => {
    const txs = filteredTransactions.filter(t => t.category === cat && t.amount < 0);
    avgByCategory[cat] = txs.length > 1 ? catSpend[cat] / txs.length : null;
  });
  const unusual = filteredTransactions.filter(t => {
    if (t.amount >= 0) return false;
    const avg = avgByCategory[t.category];
    return avg && Math.abs(t.amount) > avg * 2.2;
  });

  const insights = [];

  if (income > 0) {
    insights.push({
      type: net >= 0 ? 'positive' : 'negative',
      text: `Your savings rate this month is ${savingsRate}% — you put aside ${fmt(net)}.`,
    });
  }

  if (topCat) {
    insights.push({
      type: 'neutral',
      text: `Biggest spending category: ${topCatLabel} at ${fmt(topCat[1])}.`,
    });
  }

  if (isCurrentMonth && diffExpenses !== 0) {
    insights.push({
      type: diffExpenses < 0 ? 'positive' : 'negative',
      text: diffExpenses < 0
        ? `You spent ${fmt(Math.abs(diffExpenses))} less than last month. Good job.`
        : `You spent ${fmt(diffExpenses)} more than last month.`,
    });
  }

  if (overBudget.length > 0) {
    insights.push({
      type: 'negative',
      text: `${overBudget.length} budget${overBudget.length > 1 ? 's' : ''} exceeded this month.`,
    });
  } else if (nearBudget.length > 0) {
    insights.push({
      type: 'warning',
      text: `${nearBudget.length} budget${nearBudget.length > 1 ? 's' : ''} almost reached — watch your spending.`,
    });
  } else if (budgets.length > 0) {
    insights.push({ type: 'positive', text: 'All budgets are on track.' });
  }

  if (unusual.length > 0) {
    insights.push({
      type: 'warning',
      text: `Unusual spend: "${unusual[0].description}" (${fmt(Math.abs(unusual[0].amount))}) is above your average for that category.`,
    });
  }

  const dotColor = { positive: 'var(--green)', negative: 'var(--red)', neutral: 'var(--accent)', warning: 'var(--yellow)' };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Sparkles size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>{monthName} — Smart Summary</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {insights.length === 0 ? (
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No transactions this month yet.</span>
        ) : insights.map((ins, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0, marginTop: 5,
              background: dotColor[ins.type] || 'var(--text-muted)',
            }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ins.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
