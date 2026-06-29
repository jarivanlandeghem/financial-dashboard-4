import { useState } from 'react';
import SFIcon from '../components/SFIcon';
import { useT } from '../i18n/useT';
import { useApp } from '../context/AppContext';

const SW = 1.5;

const LOCALE_MAP = { nl: 'nl-NL', en: 'en-US', fr: 'fr-FR', de: 'de-DE' };

const GOAL_ICONS = [
  { key: 'target',  icon: 'target.svg',                              color: '#007AFF' },
  { key: 'plane',   icon: 'airplane.svg',                            color: '#5856D6' },
  { key: 'monitor', icon: 'laptopcomputer.svg',                      color: '#34C759' },
  { key: 'shield',  icon: 'shield.svg',                              color: '#FF9500' },
  { key: 'home',    icon: 'house.svg',                               color: '#007AFF' },
  { key: 'car',     icon: 'car.svg',                                 color: '#FF6900' },
  { key: 'phone',   icon: 'iphone.svg',                              color: '#5AC8FA' },
  { key: 'edu',     icon: 'graduationcap.svg',                       color: '#5856D6' },
  { key: 'health',  icon: 'heart.svg',                               color: '#FF2D55' },
  { key: 'beach',   icon: 'sun.max.svg',                             color: '#30D158' },
];

const INITIAL_GOALS = [
  { id: 1, iconKey: 'plane', target: 2000, saved: 850, color: '#5856D6', name: 'Vacation Italy', deadline: '2026-08-01' },
  { id: 2, iconKey: 'monitor', target: 2499, saved: 1200, color: '#34C759', name: 'New MacBook', deadline: '2026-12-01' },
  { id: 3, iconKey: 'shield', target: 5000, saved: 3200, color: '#FF9500', name: 'Emergency Fund', deadline: null },
];

function GoalCard({ goal, onAdd, onDelete }) {
  const t = useT();
  const { language } = useApp();
  const [adding, setAdding] = useState(false);
  const [amount, setAmount] = useState('');
  const pct = Math.min((goal.saved / goal.target) * 100, 100);
  const isComplete = goal.saved >= goal.target;
  const iconEntry = GOAL_ICONS.find(i => i.key === goal.iconKey) || GOAL_ICONS[0];

  const submit = () => {
    const v = parseFloat(amount);
    if (!v || v <= 0) return;
    onAdd(goal.id, v);
    setAmount('');
    setAdding(false);
  };

  return (
    <div className="card" style={{ position: 'relative' }}>
      <button onClick={() => onDelete(goal.id)} style={{
        position: 'absolute', top: 14, right: 14,
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-muted)', padding: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }} data-squircle-r="8">
        <SFIcon name="trash.svg" size={14} color="var(--text-muted)" />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44,
          background: goal.color + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} data-squircle-r="20">
          <SFIcon name={iconEntry.icon} size={20} color={goal.color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{goal.name}</div>
          {goal.deadline && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {t('goals_by').replace('{date}', new Date(goal.deadline).toLocaleDateString(LOCALE_MAP[language] || 'nl-NL', { month: 'long', year: 'numeric' }))}
            </div>
          )}
        </div>
        {isComplete && <span className="badge badge-green"><SFIcon name="checkmark.svg" size={10} color="currentColor" /> {t('goals_done')}</span>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: goal.color, letterSpacing: '-0.4px' }}>
          €{goal.saved.toLocaleString('nl-BE')}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', alignSelf: 'flex-end' }}>
          {t('goals_of').replace('{n}', goal.target.toLocaleString())}
        </span>
      </div>

      <div className="progress-bar" style={{ height: 6, marginBottom: 8 }}>
        <div className="progress-fill" style={{ width: pct + '%', background: isComplete ? 'var(--green)' : goal.color }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
        <span>{pct.toFixed(0)}{t('goals_pct_complete')}</span>
        <span>{isComplete ? t('goals_reached') : t('goals_to_go').replace('{n}', (goal.target - goal.saved).toLocaleString())}</span>
      </div>

      {adding ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="input-wrap" style={{ flex: 1 }}><input className="input" type="number" placeholder={t('goals_add_amount')} value={amount}
            onChange={e => setAmount(e.target.value)} autoFocus
            onKeyDown={e => e.key === 'Enter' && submit()} /></div>
          <button className="btn btn-primary" onClick={submit}>{t('goals_add_btn')}</button>
          <button className="btn btn-ghost" onClick={() => setAdding(false)}>{t('goals_cancel')}</button>
        </div>
      ) : (
        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed' }} onClick={() => setAdding(true)}>
          <SFIcon name="plus.svg" size={14} color="currentColor" /> {t('goals_add_savings')}
        </button>
      )}
    </div>
  );
}

function AddGoalModal({ onClose, onAdd }) {
  const t = useT();
  const [form, setForm] = useState({ name: '', iconKey: 'target', target: '', deadline: '', color: '#007AFF' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const COLORS = ['#007AFF','#34C759','#FF9500','#FF3B30','#AF52DE','#FF2D55','#5856D6','#30D158'];

  const submit = () => {
    if (!form.name || !form.target) return;
    onAdd({ ...form, target: parseFloat(form.target), saved: 0, id: Date.now() });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{t('goals_new_title')}</div>
        <div className="input-group">
          <label className="input-label">{t('goals_icon')}</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {GOAL_ICONS.map(({ key, icon, color }) => (
              <button key={key} onClick={() => set('iconKey', key)} style={{
                width: 40, height: 40,
                border: form.iconKey === key ? '2px solid var(--accent)' : '1px solid var(--border)',
                background: form.iconKey === key ? 'var(--accent-light)' : 'var(--bg-card)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }} data-squircle-r="8">
                <SFIcon name={icon} size={18} color={form.iconKey === key ? 'var(--accent)' : color} />
              </button>
            ))}
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">{t('goals_name')}</label>
          <div className="input-wrap"><input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Vacation Italy" /></div>
        </div>
        <div className="input-group">
          <label className="input-label">{t('goals_target')}</label>
          <div className="input-wrap"><input className="input" type="number" value={form.target} onChange={e => set('target', e.target.value)} placeholder="2000" /></div>
        </div>
        <div className="input-group">
          <label className="input-label">{t('goals_deadline')}</label>
          <div className="input-wrap"><input className="input" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} /></div>
        </div>
        <div className="input-group">
          <label className="input-label">{t('goals_color')}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => set('color', c)} style={{
                width: 26, height: 26, borderRadius: '50%', background: c, cursor: 'pointer',
                border: form.color === c ? '3px solid var(--text-primary)' : '2px solid transparent',
                outline: form.color === c ? '2px solid var(--bg-card)' : 'none',
                outlineOffset: '-4px',
              }} />
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>{t('goals_cancel')}</button>
          <button className="btn btn-primary" onClick={submit}>{t('goals_create')}</button>
        </div>
      </div>
    </div>
  );
}

export default function SavingsGoals() {
  const t = useT();
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [showModal, setShowModal] = useState(false);

  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('goals_title')}</h1>
          <p className="page-subtitle">{t('goals_subtitle').replace('{done}', goals.filter(g => g.saved >= g.target).length).replace('{total}', goals.length)}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <SFIcon name="plus.svg" size={14} color="currentColor" /> {t('goals_new')}
        </button>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">{t('goals_total_saved')}</div>
          <div className="stat-value" style={{ fontSize: 22, color: 'var(--amount-positive)' }}>€{totalSaved.toLocaleString('nl-BE')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('goals_total_target')}</div>
          <div className="stat-value" style={{ fontSize: 22 }}>€{totalTarget.toLocaleString('nl-BE')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('goals_overall_pct')}</div>
          <div className="stat-value" style={{ fontSize: 22, color: 'var(--green)' }}>{((totalSaved/totalTarget)*100).toFixed(0)}%</div>
          <div className="progress-bar" style={{ marginTop: 8 }}>
            <div className="progress-fill" style={{ width: ((totalSaved/totalTarget)*100)+'%', background: 'var(--green)' }} />
          </div>
        </div>
      </div>

      <div className="grid-3">
        {goals.map(g => (
          <GoalCard key={g.id} goal={g}
            onAdd={(id, amt) => setGoals(prev => prev.map(g => g.id === id ? { ...g, saved: Math.min(g.saved + amt, g.target) } : g))}
            onDelete={id => setGoals(prev => prev.filter(g => g.id !== id))}
          />
        ))}
      </div>

      {showModal && <AddGoalModal onClose={() => setShowModal(false)} onAdd={g => setGoals(prev => [...prev, g])} />}
    </div>
  );
}
