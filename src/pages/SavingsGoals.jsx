import { useState } from 'react';
import { Plus, Trash2, Plane, Monitor, Shield, Home, Car, Smartphone, GraduationCap, Heart, Palmtree, Target, Check } from 'lucide-react';

const SW = 1.5;

const GOAL_ICONS = [
  { key: 'target', Icon: Target, color: '#007AFF' },
  { key: 'plane', Icon: Plane, color: '#5856D6' },
  { key: 'monitor', Icon: Monitor, color: '#34C759' },
  { key: 'shield', Icon: Shield, color: '#FF9500' },
  { key: 'home', Icon: Home, color: '#007AFF' },
  { key: 'car', Icon: Car, color: '#FF6900' },
  { key: 'phone', Icon: Smartphone, color: '#5AC8FA' },
  { key: 'edu', Icon: GraduationCap, color: '#5856D6' },
  { key: 'health', Icon: Heart, color: '#FF2D55' },
  { key: 'beach', Icon: Palmtree, color: '#30D158' },
];

const INITIAL_GOALS = [
  { id: 1, iconKey: 'plane', target: 2000, saved: 850, color: '#5856D6', name: 'Vacation Italy', deadline: '2026-08-01' },
  { id: 2, iconKey: 'monitor', target: 2499, saved: 1200, color: '#34C759', name: 'New MacBook', deadline: '2026-12-01' },
  { id: 3, iconKey: 'shield', target: 5000, saved: 3200, color: '#FF9500', name: 'Emergency Fund', deadline: null },
];

function GoalCard({ goal, onAdd, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [amount, setAmount] = useState('');
  const pct = Math.min((goal.saved / goal.target) * 100, 100);
  const isComplete = goal.saved >= goal.target;
  const iconEntry = GOAL_ICONS.find(i => i.key === goal.iconKey) || GOAL_ICONS[0];
  const { Icon } = iconEntry;

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
        color: 'var(--text-muted)', padding: 4, borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Trash2 size={14} strokeWidth={SW} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: goal.color + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} strokeWidth={SW} color={goal.color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{goal.name}</div>
          {goal.deadline && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              By {new Date(goal.deadline).toLocaleDateString('en-BE', { month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>
        {isComplete && <span className="badge badge-green"><Check size={10} strokeWidth={2} /> Done</span>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: goal.color, letterSpacing: '-0.4px' }}>
          €{goal.saved.toLocaleString('nl-BE')}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', alignSelf: 'flex-end' }}>
          of €{goal.target.toLocaleString('nl-BE')}
        </span>
      </div>

      <div className="progress-bar" style={{ height: 6, marginBottom: 8 }}>
        <div className="progress-fill" style={{ width: pct + '%', background: isComplete ? 'var(--green)' : goal.color }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
        <span>{pct.toFixed(0)}% complete</span>
        <span>{isComplete ? 'Goal reached!' : `€${(goal.target - goal.saved).toLocaleString('nl-BE')} to go`}</span>
      </div>

      {adding ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" type="number" placeholder="Amount €" value={amount}
            onChange={e => setAmount(e.target.value)} style={{ flex: 1 }} autoFocus
            onKeyDown={e => e.key === 'Enter' && submit()} />
          <button className="btn btn-primary" onClick={submit}>Add</button>
          <button className="btn btn-ghost" onClick={() => setAdding(false)}>✕</button>
        </div>
      ) : (
        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed' }} onClick={() => setAdding(true)}>
          <Plus size={14} strokeWidth={SW} /> Add savings
        </button>
      )}
    </div>
  );
}

function AddGoalModal({ onClose, onAdd }) {
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
        <div className="modal-title">New Savings Goal</div>
        <div className="input-group">
          <label className="input-label">Icon</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {GOAL_ICONS.map(({ key, Icon, color }) => (
              <button key={key} onClick={() => set('iconKey', key)} style={{
                width: 40, height: 40, borderRadius: 10,
                border: form.iconKey === key ? '2px solid var(--accent)' : '1px solid var(--border)',
                background: form.iconKey === key ? 'var(--accent-light)' : 'var(--bg-card)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} strokeWidth={SW} color={form.iconKey === key ? 'var(--accent)' : color} />
              </button>
            ))}
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">Goal Name</label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Vacation Italy" />
        </div>
        <div className="input-group">
          <label className="input-label">Target Amount (€)</label>
          <input className="input" type="number" value={form.target} onChange={e => set('target', e.target.value)} placeholder="2000" />
        </div>
        <div className="input-group">
          <label className="input-label">Deadline (optional)</label>
          <input className="input" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Color</label>
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
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>Create Goal</button>
        </div>
      </div>
    </div>
  );
}

export default function SavingsGoals() {
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [showModal, setShowModal] = useState(false);

  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">{goals.filter(g => g.saved >= g.target).length} of {goals.length} complete</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={14} strokeWidth={SW} /> New Goal
        </button>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Total Saved</div>
          <div className="stat-value" style={{ fontSize: 22, color: 'var(--accent)' }}>€{totalSaved.toLocaleString('nl-BE')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Target</div>
          <div className="stat-value" style={{ fontSize: 22 }}>€{totalTarget.toLocaleString('nl-BE')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overall Progress</div>
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
