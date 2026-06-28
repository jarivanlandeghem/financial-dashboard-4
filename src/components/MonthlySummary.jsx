import { useApp } from '../context/AppContext';
import { useT } from '../i18n/useT';
import { CATEGORIES, monthlyData } from '../data/mockData';
import SFIcon from './SFIcon';

const fmt = (n) => (n < 0 ? '-' : '') + '€' + Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const LOCALE_MAP = { nl: 'nl-NL', en: 'en-US', fr: 'fr-FR', de: 'de-DE' };

export default function MonthlySummary() {
  const t = useT();
  const { income, expenses, net, filteredTransactions, selectedMonth, budgets, language } = useApp();

  const locale = LOCALE_MAP[language] || 'nl-NL';
  const monthName = selectedMonth.toLocaleString(locale, { month: 'long' });

  const catSpend = {};
  filteredTransactions.filter(tx => tx.amount < 0).forEach(tx => {
    catSpend[tx.category] = (catSpend[tx.category] || 0) + Math.abs(tx.amount);
  });
  const topCat = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0];
  const topCatLabel = topCat ? CATEGORIES[topCat[0]]?.label || topCat[0] : null;

  const now = new Date();
  const isCurrentMonth = selectedMonth.getMonth() === now.getMonth() && selectedMonth.getFullYear() === now.getFullYear();
  const prevMonthData = monthlyData[monthlyData.length - 2];
  const diffExpenses = prevMonthData ? expenses - prevMonthData.expenses : 0;

  const savingsRate = income > 0 ? ((net / income) * 100).toFixed(0) : 0;
  const overBudget = budgets.filter(b => b.spent > b.limit);
  const nearBudget = budgets.filter(b => b.spent > b.limit * 0.85 && b.spent <= b.limit);

  const avgByCategory = {};
  Object.keys(catSpend).forEach(cat => {
    const txs = filteredTransactions.filter(tx => tx.category === cat && tx.amount < 0);
    avgByCategory[cat] = txs.length > 1 ? catSpend[cat] / txs.length : null;
  });
  const unusual = filteredTransactions.filter(tx => {
    if (tx.amount >= 0) return false;
    const avg = avgByCategory[tx.category];
    return avg && Math.abs(tx.amount) > avg * 2.2;
  });

  const insights = [];

  if (income > 0) {
    insights.push({
      type: net >= 0 ? 'positive' : 'negative',
      text: t('ms_savings_rate').replace('{pct}', savingsRate).replace('{amount}', fmt(net)),
    });
  }

  if (topCat) {
    insights.push({
      type: 'neutral',
      text: t('ms_top_category').replace('{cat}', topCatLabel).replace('{amount}', fmt(topCat[1])),
    });
  }

  if (isCurrentMonth && diffExpenses !== 0) {
    insights.push({
      type: diffExpenses < 0 ? 'positive' : 'negative',
      text: diffExpenses < 0
        ? t('ms_spent_less').replace('{n}', fmt(Math.abs(diffExpenses)))
        : t('ms_spent_more').replace('{n}', fmt(diffExpenses)),
    });
  }

  if (overBudget.length > 0) {
    insights.push({ type: 'negative', text: t('ms_budgets_exceeded').replace('{n}', overBudget.length) });
  } else if (nearBudget.length > 0) {
    insights.push({ type: 'warning', text: t('ms_budgets_warning').replace('{n}', nearBudget.length) });
  } else if (budgets.length > 0) {
    insights.push({ type: 'positive', text: t('ms_budgets_ok') });
  }

  if (unusual.length > 0) {
    insights.push({
      type: 'warning',
      text: t('ms_unusual').replace('{desc}', unusual[0].description).replace('{amount}', fmt(Math.abs(unusual[0].amount))),
    });
  }

  const dotColor = { positive: 'var(--green)', negative: 'var(--red)', neutral: 'var(--text-muted)', warning: 'var(--yellow)' };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <SFIcon name="sparkle.svg" size={14} color="var(--text-secondary)" />
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          {t('ms_title').replace('{month}', monthName.charAt(0).toUpperCase() + monthName.slice(1))}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {insights.length === 0 ? (
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('ms_no_tx')}</span>
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
