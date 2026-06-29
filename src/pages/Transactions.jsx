import { useState } from 'react';
import SFIcon from '../components/SFIcon';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import MonthSelector from '../components/MonthSelector';
import CategoryIcon from '../components/CategoryIcon';
import { useT } from '../i18n/useT';

const fmt = (n) => (n >= 0 ? '+' : '-') + '€' + Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const SW = 1.5;

function AddModal({ onClose, onAdd }) {
  const t = useT();
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
        <div className="modal-title">{t('tx_add_title')}</div>
        <div className="input-group">
          <label className="input-label">{t('tx_type')}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{v:'expense',l:t('tx_type_expense')},{v:'income',l:t('tx_type_income')}].map(opt => (
              <button key={opt.v} className={`btn ${form.type === opt.v ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }} onClick={() => set('type', opt.v)}>{opt.l}</button>
            ))}
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">{t('tx_description')}</label>
          <input className="input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Colruyt" />
        </div>
        <div className="input-group">
          <label className="input-label">{t('tx_amount')}</label>
          <input className="input" type="number" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" />
        </div>
        <div className="input-group">
          <label className="input-label">{t('tx_category')}</label>
          <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
            {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">{t('tx_date')}</label>
          <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">{t('tx_account')}</label>
          <select className="input" value={form.account} onChange={e => set('account', e.target.value)}>
            <option>KBC</option><option>Saxobank</option><option>Bybit</option><option>Cash</option>
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>{t('cancel')}</button>
          <button className="btn btn-primary" onClick={submit}>{t('tx_add')}</button>
        </div>
      </div>
    </div>
  );
}

function ExportModal({ transactions, onClose }) {
  const t = useT();
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
    { v: 'this_month', l: t('tx_this_month') },
    { v: 'last_month', l: t('tx_last_month') },
    { v: 'this_year', l: t('tx_this_year') },
    { v: 'custom', l: t('tx_custom_range') },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{t('tx_export_title')}</div>

        <div className="input-group">
          <label className="input-label">{t('tx_type')}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{v:'all',l:t('all')},{v:'income',l:t('tx_filter_income')},{v:'expense',l:t('tx_filter_expenses')}].map(opt => (
              <button key={opt.v} className={`btn ${type === opt.v ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }} onClick={() => setType(opt.v)}>{opt.l}</button>
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
              <label className="input-label">{t('tx_export_from')}</label>
              <input className="input" type="date" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">{t('tx_export_to')}</label>
              <input className="input" type="date" value={to} onChange={e => setTo(e.target.value)} />
            </div>
          </div>
        )}

        <div style={{ padding: '10px 14px', background: 'var(--accent-light)', fontSize: 13, color: 'var(--accent)', marginBottom: 4 }} data-squircle-r="8">
          {count} transactions will be exported
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>{t('cancel')}</button>
          <button className="btn btn-primary" onClick={doExport} disabled={count === 0}>
            <SFIcon name="square.and.arrow.down.svg" size={14} color="currentColor" /> {t('tx_download_csv')}
          </button>
        </div>
      </div>
    </div>
  );
}

function TxRow({ tx, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className={`tx-card${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)}>
        <CategoryIcon category={tx.category} size={36} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{tx.description}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{CATEGORIES[tx.category]?.label} · {tx.account}</div>
        </div>
        {tx.recurring && <span className="badge badge-blue">Recurring</span>}
        <div className={tx.amount >= 0 ? 'amount-positive' : 'amount-negative'} style={{ fontSize: 15, minWidth: 80, textAlign: 'right' }}>{fmt(tx.amount)}</div>
        {open ? <SFIcon name="chevron.up.svg" size={15} color="var(--accent)" style={{ flexShrink: 0 }} />
               : <SFIcon name="chevron.down.svg" size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />}
      </div>
      <div className={`tx-accordion${open ? ' open' : ''}`}>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }}>
            {[['Category', CATEGORIES[tx.category]?.label || tx.category], ['Account', tx.account], ['Type', tx.type?.charAt(0).toUpperCase() + tx.type?.slice(1)],
              ['Recurring', tx.recurring ? 'Yes' : 'No'], ['Date', tx.date], ['Reference', `TX-${String(tx.id).padStart(5,'0')}`]].map(([k,v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-danger" style={{ fontSize: 12, padding: '6px 12px' }} onClick={e => { e.stopPropagation(); onDelete(tx.id); }}>
            <SFIcon name="trash.svg" size={12} color="currentColor" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Transactions() {
  const t = useT();
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
          <h1 className="page-title">{t('tx_title')}</h1>
          <p className="page-subtitle">{filtered.length} transactions</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <MonthSelector />
          <button className="btn btn-ghost" onClick={() => setShowExport(true)} style={{ fontSize: 13 }}>
            <SFIcon name="square.and.arrow.down.svg" size={14} color="currentColor" /> {t('tx_export')}
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <SFIcon name="plus.svg" size={14} color="currentColor" /> {t('tx_add')}
          </button>
        </div>
      </div>

      <div className="filters-row">
        <div data-squircle-r="20" style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <SFIcon name="magnifyingglass.svg" size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
          <input className="input" style={{ paddingLeft: 34, borderRadius: 0 }} placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div data-squircle-r="20" style={{ display: 'inline-flex' }}>
          <select className="input" style={{ width: 'auto', borderRadius: 0 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">{t('tx_all_categories')}</option>
            {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div data-squircle-r="20" style={{ display: 'inline-flex' }}>
          <select className="input" style={{ width: 'auto', borderRadius: 0 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">{t('tx_all_types')}</option>
            <option value="income">{t('tx_filter_income')}</option>
            <option value="expense">{t('tx_filter_expenses')}</option>
          </select>
        </div>
      </div>

      <div>
        {Object.keys(grouped).length === 0
          ? <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>{t('tx_not_found')}</div>
          : Object.entries(grouped).sort(([a],[b]) => b.localeCompare(a)).map(([date, txs]) => (
            <div key={date} className="tx-group">
              <div className="tx-date-header">
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
