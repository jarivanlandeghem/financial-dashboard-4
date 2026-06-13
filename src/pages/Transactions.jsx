import { useState } from 'react';
import { Plus, Search, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import MonthSelector from '../components/MonthSelector';

const fmt = (n) => (n >= 0 ? '+' : '') + '€' + Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function AddModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ description: '', amount: '', category: 'groceries', type: 'expense', date: new Date().toISOString().split('T')[0], account: 'KBC' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const submit = () => {
    if (!form.description || !form.amount) return;
    onAdd({ ...form, amount: form.type === 'expense' ? -Math.abs(parseFloat(form.amount)) : Math.abs(parseFloat(form.amount)), recurring: false });
    onClose();
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Add Transaction</div>
        <div className="input-group">
          <label className="input-label">Type</label>
          <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="expense">Expense</option><option value="income">Income</option>
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Description</label>
          <input className="input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Colruyt" />
        </div>
        <div className="input-group">
          <label className="input-label">Amount (€)</label>
          <input className="input" type="number" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" />
        </div>
        <div className="input-group">
          <label className="input-label">Category</label>
          <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
            {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Date</label>
          <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Account</label>
          <select className="input" value={form.account} onChange={e => set('account', e.target.value)}>
            <option>KBC</option><option>Saxobank</option><option>Bybit</option><option>Cash</option>
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>Add</button>
        </div>
      </div>
    </div>
  );
}

function TxRow({ tx, onDelete }) {
  const [open, setOpen] = useState(false);
  const cat = CATEGORIES[tx.category];

  return (
    <>
      <div
        className="clickable-row"
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: open ? 'none' : '1px solid var(--border)', background: open ? 'var(--accent-light)' : '' }}
      >
        <div className="cat-icon" style={{ background: cat?.color + '20' }}>{cat?.icon || '❓'}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{tx.description}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cat?.label} · {tx.account}</div>
        </div>
        {tx.recurring && <span className="badge badge-blue">Recurring</span>}
        <div className={tx.amount >= 0 ? 'amount-positive' : 'amount-negative'} style={{ fontSize: 15 }}>
          {fmt(tx.amount)}
        </div>
        {open ? <ChevronUp size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
      </div>

      {/* Accordion detail */}
      <div className={`accordion-detail${open ? ' open' : ''}`} style={{ borderBottom: open ? '1px solid var(--border)' : 'none' }}>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 12 }}>
            {[
              ['Category', cat?.label || tx.category],
              ['Account', tx.account],
              ['Type', tx.type?.charAt(0).toUpperCase() + tx.type?.slice(1)],
              ['Recurring', tx.recurring ? 'Yes' : 'No'],
              ['Date', tx.date],
              ['Reference', `TX-${String(tx.id).toString().padStart(5,'0')}`],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-danger" style={{ fontSize: 12, padding: '6px 12px' }} onClick={(e) => { e.stopPropagation(); onDelete(tx.id); }}>
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </>
  );
}

export default function Transactions() {
  const { filteredTransactions, addTransaction, deleteTransaction } = useApp();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = filteredTransactions.filter(t => {
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat && t.category !== filterCat) return false;
    if (filterType && t.type !== filterType) return false;
    return true;
  });

  const grouped = {};
  filtered.forEach(t => { if (!grouped[t.date]) grouped[t.date] = []; grouped[t.date].push(t); });

  const exportCSV = () => {
    const rows = [['Date','Description','Category','Amount','Account','Type']];
    filtered.forEach(t => rows.push([t.date, t.description, CATEGORIES[t.category]?.label || t.category, t.amount, t.account, t.type]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'transactions.csv'; a.click();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{filtered.length} transactions</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <MonthSelector />
          <button className="btn btn-ghost" onClick={exportCSV} style={{ fontSize: 13 }}>↓ CSV</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> Add</button>
        </div>
      </div>

      <div className="filters-row">
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingLeft: 34 }} placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ width: 'auto' }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All categories</option>
          {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
        <select className="input" style={{ width: 'auto' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {Object.keys(grouped).length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found.</div>
        ) : Object.entries(grouped).sort(([a],[b]) => b.localeCompare(a)).map(([date, txs]) => (
          <div key={date}>
            <div style={{ padding: '10px 16px 6px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
              {new Date(date + 'T12:00:00').toLocaleDateString('en-BE', { weekday: 'short', day: 'numeric', month: 'long' })}
            </div>
            {txs.map(tx => <TxRow key={tx.id} tx={tx} onDelete={deleteTransaction} />)}
          </div>
        ))}
      </div>

      {showModal && <AddModal onClose={() => setShowModal(false)} onAdd={addTransaction} />}
    </div>
  );
}
