import { useState } from 'react';
import { Plus, Search, ChevronDown, ChevronUp, Trash2, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import MonthSelector from '../components/MonthSelector';
import CategoryIcon from '../components/CategoryIcon';

const fmt = (n) => (n >= 0 ? '+' : '') + '€' + Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const SW = 1.5;

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
          <div style={{ display: 'flex', gap: 8 }}>
            {[{v:'expense',l:'Expense'},{v:'income',l:'Income'}].map(t => (
              <button key={t.v} className={`btn ${form.type === t.v ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }} onClick={() => set('type', t.v)}>{t.l}</button>
            ))}
          </div>
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
            {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
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

function ExportModal({ transactions, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [type, setType] = useState('all');
  const [period, setPeriod] = useState('this_month');
  const [from, setFrom] = useState(firstDay);
  const [to, setTo] = useState(today);

  const getFiltered = () => {
    let start, end;
    const now = new Date();
    if (period === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (period === 'last_month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (period === 'this_year') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
    } else {
      start = new Date(from);
      end = new Date(to);
    }

    return transactions.filter(t => {
      const d = new Date(t.date);
      if (d < start || d > end) return false;
      if (type === 'income' && t.amount < 0) return false;
      if (type === 'expense' && t.amount > 0) return false;
      return true;
    });
  };

  const doExport = () => {
    const filtered = getFiltered();
    const rows = [['Date','Description','Category','Amount (€)','Account','Type']];
    filtered.forEach(t => rows.push([
      t.date, t.description,
      CATEGORIES[t.category]?.label || t.category,
      t.amount.toFixed(2), t.account, t.type
    ]));
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `transactions-export.csv`;
    a.click();
    onClose();
  };

  const count = getFiltered().length;

  const PERIODS = [
    { v: 'this_month', l: 'This month' },
    { v: 'last_month', l: 'Last month' },
    { v: 'this_year', l: 'This year' },
    { v: 'custom', l: 'Custom range' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Export to CSV</div>

        <div className="input-group">
          <label className="input-label">Type</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{v:'all',l:'All'},{v:'income',l:'Income'},{v:'expense',l:'Expenses'}].map(t => (
              <button key={t.v} className={`btn ${type === t.v ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }} onClick={() => setType(t.v)}>{t.l}</button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Period</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {PERIODS.map(p => (
              <button key={p.v} className={`btn ${period === p.v ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPeriod(p.v)}>{p.l}</button>
            ))}
          </div>
        </div>

        {period === 'custom' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">From</label>
              <input className="input" type="date" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">To</label>
              <input className="input" type="date" value={to} onChange={e => setTo(e.target.value)} />
            </div>
          </div>
        )}

        <div style={{ padding: '10px 14px', background: 'var(--accent-light)', borderRadius: 8, fontSize: 13, color: 'var(--accent)', marginBottom: 4 }}>
          {count} transactions will be exported
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={doExport} disabled={count === 0}>
            <Download size={14} strokeWidth={SW} /> Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}

function TxRow({ tx, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="clickable-row" onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: open ? 'none' : '1px solid var(--border)', background: open ? 'var(--accent-light)' : '' }}>
        <CategoryIcon category={tx.category} size={36} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{tx.description}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{CATEGORIES[tx.category]?.label} · {tx.account}</div>
        </div>
        {tx.recurring && <span className="badge badge-blue">Recurring</span>}
        <div className={tx.amount >= 0 ? 'amount-positive' : 'amount-negative'} style={{ fontSize: 15 }}>{fmt(tx.amount)}</div>
        {open ? <ChevronUp size={16} strokeWidth={SW} style={{ color: 'var(--accent)', flexShrink: 0 }} />
               : <ChevronDown size={16} strokeWidth={SW} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
      </div>
      <div className={`accordion-detail${open ? ' open' : ''}`} style={{ borderBottom: open ? '1px solid var(--border)' : 'none' }}>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 14 }}>
            {[['Category', CATEGORIES[tx.category]?.label || tx.category], ['Account', tx.account], ['Type', tx.type?.charAt(0).toUpperCase() + tx.type?.slice(1)],
              ['Recurring', tx.recurring ? 'Yes' : 'No'], ['Date', tx.date], ['Reference', `TX-${String(tx.id).padStart(5,'0')}`]].map(([k,v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-danger" style={{ fontSize: 12, padding: '6px 12px' }} onClick={e => { e.stopPropagation(); onDelete(tx.id); }}>
            <Trash2 size={12} strokeWidth={SW} /> Delete
          </button>
        </div>
      </div>
    </>
  );
}

export default function Transactions() {
  const { filteredTransactions, transactions, addTransaction, deleteTransaction } = useApp();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const filtered = filteredTransactions.filter(t => {
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat && t.category !== filterCat) return false;
    if (filterType && t.type !== filterType) return false;
    return true;
  });

  const grouped = {};
  filtered.forEach(t => { if (!grouped[t.date]) grouped[t.date] = []; grouped[t.date].push(t); });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{filtered.length} transactions</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <MonthSelector />
          <button className="btn btn-ghost" onClick={() => setShowExport(true)} style={{ fontSize: 13 }}>
            <Download size={14} strokeWidth={SW} /> Export
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={14} strokeWidth={SW} /> Add
          </button>
        </div>
      </div>

      <div className="filters-row">
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} strokeWidth={SW} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingLeft: 34 }} placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ width: 'auto' }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All categories</option>
          {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="input" style={{ width: 'auto' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {Object.keys(grouped).length === 0
          ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found.</div>
          : Object.entries(grouped).sort(([a],[b]) => b.localeCompare(a)).map(([date, txs]) => (
            <div key={date}>
              <div style={{ padding: '10px 16px 6px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
                {new Date(date + 'T12:00:00').toLocaleDateString('en-BE', { weekday: 'short', day: 'numeric', month: 'long' })}
              </div>
              {txs.map(tx => <TxRow key={tx.id} tx={tx} onDelete={deleteTransaction} />)}
            </div>
          ))
        }
      </div>

      {showModal && <AddModal onClose={() => setShowModal(false)} onAdd={addTransaction} />}
      {showExport && <ExportModal transactions={transactions} onClose={() => setShowExport(false)} />}
    </div>
  );
}
