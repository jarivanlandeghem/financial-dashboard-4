import { useState } from 'react';
import SFIcon from '../components/SFIcon';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/useT';
import { CATEGORIES } from '../data/mockData';

const fmt = (n) => (n < 0 ? '-' : '') + '€' + Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function AddCashModal({ onClose, onAdd }) {
  const t = useT();
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
        <div className="modal-title">{t('cash_add_title')}</div>
        <div className="input-group">
          <label className="input-label">{t('cash_type')}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { key: 'in', label: t('cash_type_in') },
              { key: 'out', label: t('cash_type_out') },
            ].map(opt => (
              <button key={opt.key} className={`btn ${form.type === opt.key ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }} onClick={() => set('type', opt.key)}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">{t('cash_description')}</label>
          <input className="input" value={form.description} onChange={e => set('description', e.target.value)} placeholder={t('cash_description_ph')} />
        </div>
        <div className="input-group">
          <label className="input-label">{t('cash_amount')}</label>
          <input className="input" type="number" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" />
        </div>
        {form.type === 'out' && (
          <div className="input-group">
            <label className="input-label">{t('cash_category')}</label>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
              {Object.entries(CATEGORIES).filter(([k]) => !['salary','investment','extra','transfer'].includes(k)).map(([k,v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        )}
        <div className="input-group">
          <label className="input-label">{t('cash_date')}</label>
          <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>{t('cancel')}</button>
          <button className="btn btn-primary" onClick={submit}>{t('add')}</button>
        </div>
      </div>
    </div>
  );
}

function EditBalanceModal({ current, onClose, onSave }) {
  const t = useT();
  const [val, setVal] = useState(current);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{t('cash_edit_title')}</div>
        <div className="input-group">
          <label className="input-label">{t('cash_current_bal')}</label>
          <input className="input" type="number" step="0.01" value={val} onChange={e => setVal(e.target.value)} autoFocus />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>{t('cancel')}</button>
          <button className="btn btn-primary" onClick={() => { onSave(parseFloat(val)); onClose(); }}>{t('save')}</button>
        </div>
      </div>
    </div>
  );
}

function CashRow({ tx }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div onClick={() => setOpen(o => !o)} className="clickable-row"
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: open ? 'none' : '1px solid var(--border)', background: open ? 'var(--accent-light)' : '' }}>
        <div data-squircle-r={8} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
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
          {[
            [t('cash_date_col'), tx.date],
            [t('cash_type_col'), tx.amount > 0 ? t('cash_type_in') : t('cash_type_out')],
            [t('cash_cat_col'), tx.category ? CATEGORIES[tx.category]?.label : '—'],
          ].map(([k,v]) => (
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
  const t = useT();
  const { cash, addCashTransaction } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const totalIn  = cash.transactions.filter(tx => tx.amount > 0).reduce((s,tx) => s + tx.amount, 0);
  const totalOut = cash.transactions.filter(tx => tx.amount < 0).reduce((s,tx) => s + Math.abs(tx.amount), 0);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">{t('cash_title')}</h1><p className="page-subtitle">{t('cash_subtitle')}</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <SFIcon name="plus.svg" size={14} color="currentColor" /> {t('cash_add')}
        </button>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="stat-label">{t('cash_balance')}</div>
            <div data-squircle-r={8} style={{ width: 28, height: 28, background: 'rgba(52,199,89,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SFIcon name="banknote.svg" size={14} color="#34C759" />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--amount-positive)' }}>{fmt(cash.balance)}</div>
          <button className="stat-change neutral" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={() => setShowEdit(true)}>
            <SFIcon name="pencil.svg" size={11} color="currentColor" /> {t('cash_edit_balance')}
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-label">{t('cash_total_in')}</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>+{fmt(totalIn)}</div>
          <div className="stat-change positive">{cash.transactions.filter(tx => tx.amount > 0).length} {t('tx_count').replace('{n}', '')}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">{t('cash_total_out')}</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>-{fmt(totalOut)}</div>
          <div className="stat-change negative">{cash.transactions.filter(tx => tx.amount < 0).length} {t('tx_count').replace('{n}', '')}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span className="section-title">{t('cash_history')}</span>
        </div>
        {cash.transactions.map(tx => <CashRow key={tx.id} tx={tx} />)}
        {cash.transactions.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>{t('cash_empty')}</div>
        )}
      </div>

      {showModal && <AddCashModal onClose={() => setShowModal(false)} onAdd={addCashTransaction} />}
      {showEdit && <EditBalanceModal current={cash.balance} onClose={() => setShowEdit(false)} onSave={v => addCashTransaction({ type: v > cash.balance ? 'in' : 'out', description: 'Balance adjustment', amount: Math.abs(v - cash.balance), date: new Date().toISOString().split('T')[0] })} />}
    </div>
  );
}
