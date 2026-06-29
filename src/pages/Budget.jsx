import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/useT';
import { CATEGORIES } from '../data/mockData';
import MonthSelector from '../components/MonthSelector';
import SFIcon from '../components/SFIcon';

const fmt = (n) => (n < 0 ? '-' : '') + '€' + Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function BudgetRow({ budget, onUpdate }) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(budget.limit);
  const cat = CATEGORIES[budget.category];
  const pct = Math.min((budget.spent / budget.limit) * 100, 100);
  const isOver = budget.spent > budget.limit;
  const isClose = !isOver && pct >= 80;

  const color = isOver ? 'var(--red)' : isClose ? 'var(--yellow)' : 'var(--green)';
  const status = isOver ? t('budget_status_over') : isClose ? t('budget_status_warn') : t('budget_status_ok');
  const badgeClass = isOver ? 'badge-red' : isClose ? 'badge-yellow' : 'badge-green';

  return (
    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div className="cat-icon" style={{ background: cat?.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SFIcon name={cat?.icon} size={20} color={cat?.color || 'var(--text-secondary)'} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{cat?.label}</span>
            <span className={`badge ${badgeClass}`}>{status}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div>
            <span style={{ fontWeight: 600, color: isOver ? 'var(--red)' : 'var(--text-primary)' }}>{fmt(budget.spent)}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}> / </span>
            {editing ? (
              <input type="number" value={val} onChange={e => setVal(e.target.value)}
                data-squircle-r={8}
                style={{ width: 70, padding: '2px 6px', border: '1px solid var(--accent)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13 }} />
            ) : (
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{fmt(budget.limit)}</span>
            )}
          </div>
          {editing ? (
            <button className="btn-icon" onClick={() => { onUpdate(budget.id, parseFloat(val)); setEditing(false); }}>
              <SFIcon name="checkmark.svg" size={14} color="var(--green)" />
            </button>
          ) : (
            <button className="btn-icon" onClick={() => setEditing(true)}><SFIcon name="pencil.svg" size={14} color="currentColor" /></button>
          )}
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: pct + '%', background: color }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pct.toFixed(0)}{t('budget_pct_used')}</span>
        <span style={{ fontSize: 11, color: isOver ? 'var(--red)' : 'var(--text-muted)' }}>
          {isOver ? t('budget_over_by').replace('{n}', (budget.spent - budget.limit).toFixed(2)) : t('budget_left').replace('{n}', (budget.limit - budget.spent).toFixed(2))}
        </span>
      </div>
    </div>
  );
}

export default function Budget() {
  const t = useT();
  const { budgets, updateBudget, filteredTransactions } = useApp();

  // Sync actual spending
  const withSpending = budgets.map(b => {
    const spent = filteredTransactions
      .filter(t => t.category === b.category && t.amount < 0)
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    return { ...b, spent };
  });

  const totalBudget = withSpending.reduce((s, b) => s + b.limit, 0);
  const totalSpent = withSpending.reduce((s, b) => s + b.spent, 0);
  const overCount = withSpending.filter(b => b.spent > b.limit).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('budget_title')}</h1>
          <p className="page-subtitle">{t('budget_subtitle')}</p>
        </div>
        <MonthSelector />
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">{t('budget_total')}</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{fmt(totalBudget)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('budget_spent')}</div>
          <div className="stat-value" style={{ fontSize: 22, color: totalSpent > totalBudget ? 'var(--red)' : 'var(--text-primary)' }}>{fmt(totalSpent)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('budget_over')}</div>
          <div className="stat-value" style={{ fontSize: 22, color: overCount > 0 ? 'var(--red)' : 'var(--green)' }}>
            {overCount > 0 ? t('budget_cats').replace('{n}', overCount) : t('budget_none_over')}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {withSpending.map(b => (
          <BudgetRow key={b.id} budget={b} onUpdate={updateBudget} />
        ))}
      </div>
    </div>
  );
}
