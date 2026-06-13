import { useState } from 'react';
import { Plus, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';

const fmt = (n) => '€' + Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function AddCashModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ type: 'out', description: '', amount: '', category: 'groceries', date: new Date().toISOString().split('T')[0] });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = () => {
    if (!form.description || !form.amount) return;
    onAdd({ ...form, amount: parseFloat(form.amount) });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Add Cash Transaction</div>
        <div className="input-group">
          <label className="input-label">Type</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['in', 'out'].map(t => (
              <button key={t} className={`btn ${form.type === t ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }} onClick={() => set('type', t)}>
                {t === 'in' ? '💵 Cash In' : '💸 Cash Out'}
              </button>
            ))}
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">Description</label>
          <input className="input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Bakery" />
        </div>
        <div className="input-group">
          <label className="input-label">Amount (€)</label>
          <input className="input" type="number" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" />
        </div>
        {form.type === 'out' && (
          <div className="input-group">
            <label className="input-label">Category</label>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
              {Object.entries(CATEGORIES).filter(([k]) => !['salary','investment','extra','transfer'].includes(k)).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
          </div>
        )}
        <div className="input-group">
          <label className="input-label">Date</label>
          <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>Add</button>
        </div>
      </div>
    </div>
  );
}

export default function Cash() {
  const { cash, addCashTransaction } = useApp();
  const [showModal, setShowModal] = useState(false);

  const totalIn = cash.transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = cash.transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Cash</h1>
          <p className="page-subtitle">Track your physical cash</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Add
        </button>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div className="stat-label">Cash Balance</div>
          <div className="stat-value" style={{ color: 'var(--accent)', fontSize: 32 }}>💵 {fmt(cash.balance)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total In</div>
          <div className="stat-value" style={{ fontSize: 22, color: 'var(--green)' }}>+{fmt(totalIn)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Out</div>
          <div className="stat-value" style={{ fontSize: 22, color: 'var(--red)' }}>-{fmt(totalOut)}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <span className="section-title">Cash Transactions</span>
        </div>
        {cash.transactions.map(tx => (
          <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: tx.amount > 0 ? 'var(--green-light)' : 'var(--red-light)' }}>
              {tx.amount > 0
                ? <ArrowDownLeft size={16} style={{ color: 'var(--green)' }} />
                : <ArrowUpRight size={16} style={{ color: 'var(--red)' }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{tx.description}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {tx.category ? CATEGORIES[tx.category]?.label + ' · ' : ''}{tx.date}
              </div>
            </div>
            <div className={tx.amount >= 0 ? 'amount-positive' : 'amount-negative'}>
              {tx.amount >= 0 ? '+' : '-'}{fmt(tx.amount)}
            </div>
          </div>
        ))}
        {cash.transactions.length === 0 && (
          <div className="empty-state"><p>No cash transactions yet.</p></div>
        )}
      </div>

      {showModal && <AddCashModal onClose={() => setShowModal(false)} onAdd={addCashTransaction} />}
    </div>
  );
}
