import { useState } from 'react';
import { Edit2, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import MonthSelector from '../components/MonthSelector';

const fmt = (n) => '€' + n.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function BudgetRow({ budget, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(budget.limit);
  const cat = CATEGORIES[budget.category];
  const pct = Math.min((budget.spent / budget.limit) * 100, 100);
  const isOver = budget.spent > budget.limit;
  const isClose = !isOver && pct >= 80;

  const color = isOver ? 'var(--red)' : isClose ? 'var(--yellow)' : 'var(--green)';
  const status = isOver ? 'Over budget' : isClose ? 'Almost there' : 'On track';
  const badgeClass = isOver ? 'badge-red' : isClose ? 'badge-yellow' : 'badge-green';

  return (
    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div className="cat-icon" style={{ background: cat?.color + '20' }}>{cat?.icon}</div>
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
                style={{ width: 70, padding: '2px 6px', borderRadius: 6, border: '1px solid var(--accent)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13 }} />
            ) : (
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{fmt(budget.limit)}</span>
            )}
          </div>
          {editing ? (
            <button className="btn-icon" onClick={() => { onUpdate(budget.id, parseFloat(val)); setEditing(false); }}>
              <Check size={14} style={{ color: 'var(--green)' }} />
            </button>
          ) : (
            <button className="btn-icon" onClick={() => setEditing(true)}><Edit2 size={14} /></button>
          )}
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: pct + '%', background: color }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pct.toFixed(0)}% used</span>
        <span style={{ fontSize: 11, color: isOver ? 'var(--red)' : 'var(--text-muted)' }}>
          {isOver ? `€${(budget.spent - budget.limit).toFixed(2)} over` : `€${(budget.limit - budget.spent).toFixed(2)} left`}
        </span>
      </div>
    </div>
  );
}

export default function Budget() {
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
          <h1 className="page-title">Budget</h1>
          <p className="page-subtitle">Set and track your spending limits</p>
        </div>
        <MonthSelector />
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Total Budget</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{fmt(totalBudget)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Spent</div>
          <div className="stat-value" style={{ fontSize: 22, color: totalSpent > totalBudget ? 'var(--red)' : 'var(--text-primary)' }}>{fmt(totalSpent)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Over Budget</div>
          <div className="stat-value" style={{ fontSize: 22, color: overCount > 0 ? 'var(--red)' : 'var(--green)' }}>
            {overCount > 0 ? `${overCount} categories` : 'None 🎉'}
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
