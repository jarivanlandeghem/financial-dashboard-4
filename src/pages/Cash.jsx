import { useState } from 'react';
import SFIcon from '../components/SFIcon';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';

const fmt = (n) => (n < 0 ? '-' : '') + '€' + Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const SW = 1.5;

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
            {[
              { key: 'in', label: 'Cash In' },
              { key: 'out', label: 'Cash Out' },
            ].map(t => (
              <button key={t.key} className={`btn ${form.type === t.key ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }} onClick={() => set('type', t.key)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">Description</label>
          <input className="input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Bakkerij" />
        </div>
        <div className="input-group">
          <label className="input-label">Amount (€)</label>
          <input className="input" type="number" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" />
        </div>
        {form.type === 'out' && (
          <div className="input-group">
            <label className="input-label">Category</label>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
              {Object.entries(CATEGORIES).filter(([k]) => !['salary','investment','extra','transfer'].includes(k)).map(([k,v]) => (
                <option key={k} value={k}>{v.label}</option>
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

function EditBalanceModal({ current, onClose, onSave }) {
  const [val, setVal] = useState(current);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Edit Cash Balance</div>
        <div className="input-group">
          <label className="input-label">Current Balance (€)</label>
          <input className="input" type="number" step="0.01" value={val} onChange={e => setVal(e.target.value)} autoFocus />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { onSave(parseFloat(val)); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

function CashRow({ tx }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div onClick={() => setOpen(o => !o)} className="clickable-row"
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: open ? 'none' : '1px solid var(--border)', background: open ? 'var(--accent-light)' : '' }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: tx.amount > 0 ? 'var(--green-light)' : 'var(--red-light)', flexShrink: 0 }}>
          <SFIcon name={tx.amount > 0 ? 'arrow.down.left.svg' : 'arrow.up.right.svg'} size={16} color={tx.amount > 0 ? 'var(--green)' : 'var(--red)'} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{tx.description}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {tx.category ? (CATEGORIES[tx.category]?.label + ' · ') : ''}{tx.date}
          </div>
        </div>
        <div className={tx.amount >= 0 ? 'amount-positive' : 'amount-negative'}>
          {tx.amount >= 0 ? '+' : '-'}{fmt(tx.amount)}
        </div>
        {open
          ? <SFIcon name="chevron.up.svg" size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
          : <SFIcon name="chevron.down.svg" size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />}
      </div>
      <div className={`accordion-detail${open ? ' open' : ''}`} style={{ borderBottom: open ? '1px solid var(--border)' : 'none' }}>
        <div style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[['Date', tx.date], ['Type', tx.amount > 0 ? 'Cash In' : 'Cash Out'], ['Category', tx.category ? CATEGORIES[tx.category]?.label : '—']].map(([k,v]) => (
            <div key={k}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{k}</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function Cash() {
  const { cash, addCashTransaction, setCashBalance } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const totalIn = cash.transactions.filter(t => t.amount > 0).reduce((s,t) => s + t.amount, 0);
  const totalOut = cash.transactions.filter(t => t.amount < 0).reduce((s,t) => s + Math.abs(t.amount), 0);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Cash</h1><p className="page-subtitle">Track your physical cash</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <SFIcon name="plus.svg" size={14} color="currentColor" /> Add
        </button>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        {/* Cash Balance — same layout as other stat cards */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="stat-label">Cash Balance</div>
            <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SFIcon name="banknote.svg" size={14} color="var(--accent)" />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{fmt(cash.balance)}</div>
          <button className="stat-change neutral" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={() => setShowEdit(true)}>
            <SFIcon name="pencil.svg" size={11} color="currentColor" /> Edit balance
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total In</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>+{fmt(totalIn)}</div>
          <div className="stat-change positive">{cash.transactions.filter(t => t.amount > 0).length} transactions</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Out</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>-{fmt(totalOut)}</div>
          <div className="stat-change negative">{cash.transactions.filter(t => t.amount < 0).length} transactions</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span className="section-title">Cash Transactions</span>
        </div>
        {cash.transactions.map(tx => <CashRow key={tx.id} tx={tx} />)}
        {cash.transactions.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No cash transactions yet.</div>
        )}
      </div>

      {showModal && <AddCashModal onClose={() => setShowModal(false)} onAdd={addCashTransaction} />}
      {showEdit && <EditBalanceModal current={cash.balance} onClose={() => setShowEdit(false)} onSave={v => addCashTransaction({ type: v > cash.balance ? 'in' : 'out', description: 'Balance adjustment', amount: Math.abs(v - cash.balance), date: new Date().toISOString().split('T')[0] })} />}
    </div>
  );
}
