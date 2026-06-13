import { useState } from 'react';
import { Plus, Target, Trash2 } from 'lucide-react';

const INITIAL_GOALS = [
  { id: 1, name: 'Vacation Italy', icon: '✈️', target: 2000, saved: 850, color: '#4F8EF7', deadline: '2026-08-01' },
  { id: 2, name: 'New MacBook', icon: '💻', target: 2499, saved: 1200, color: '#00C896', deadline: '2026-12-01' },
  { id: 3, name: 'Emergency Fund', icon: '🛡️', target: 5000, saved: 3200, color: '#FFB800', deadline: null },
];

function GoalCard({ goal, onAdd, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [amount, setAmount] = useState('');
  const pct = Math.min((goal.saved / goal.target) * 100, 100);
  const remaining = goal.target - goal.saved;
  const isComplete = goal.saved >= goal.target;

  const submit = () => {
    const v = parseFloat(amount);
    if (!v || v <= 0) return;
    onAdd(goal.id, v);
    setAmount('');
    setAdding(false);
  };

  return (
    <div className="card" style={{ position: 'relative' }}>
      <button onClick={() => onDelete(goal.id)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
        <Trash2 size={14} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: goal.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
          {goal.icon}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{goal.name}</div>
          {goal.deadline && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>By {new Date(goal.deadline).toLocaleDateString('en-BE', { month: 'long', year: 'numeric' })}</div>}
        </div>
        {isComplete && <span className="badge badge-green" style={{ marginLeft: 'auto', marginRight: 24 }}>🎉 Complete</span>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: goal.color }}>€{goal.saved.toLocaleString('nl-BE')}</span>
        <span style={{ fontSize: 14, color: 'var(--text-muted)', alignSelf: 'flex-end' }}>of €{goal.target.toLocaleString('nl-BE')}</span>
      </div>

      <div className="progress-bar" style={{ height: 12, marginBottom: 10 }}>
        <div className="progress-fill" style={{ width: pct + '%', background: isComplete ? 'var(--green)' : goal.color, transition: 'width 0.5s ease' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
        <span>{pct.toFixed(0)}% saved</span>
        <span>{isComplete ? 'Goal reached!' : `€${remaining.toLocaleString('nl-BE')} to go`}</span>
      </div>

      {adding ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" type="number" placeholder="Amount €" value={amount} onChange={e => setAmount(e.target.value)}
            style={{ flex: 1 }} autoFocus onKeyDown={e => e.key === 'Enter' && submit()} />
          <button className="btn btn-primary" onClick={submit}>Add</button>
          <button className="btn btn-ghost" onClick={() => setAdding(false)}>✕</button>
        </div>
      ) : (
        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed' }} onClick={() => setAdding(true)}>
          <Plus size={14} /> Add savings
        </button>
      )}
    </div>
  );
}

function AddGoalModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', icon: '🎯', target: '', deadline: '', color: '#4F8EF7' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const submit = () => {
    if (!form.name || !form.target) return;
    onAdd({ ...form, target: parseFloat(form.target), saved: 0, id: Date.now() });
    onClose();
  };
  const ICONS = ['🎯','✈️','💻','🛡️','🏠','🚗','📱','💍','🎓','🏖️'];
  const COLORS = ['#4F8EF7','#00C896','#FFB800','#FF4757','#A855F7','#EC4899'];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">New Savings Goal</div>
        <div className="input-group">
          <label className="input-label">Icon</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ICONS.map(ic => (
              <button key={ic} onClick={() => set('icon', ic)}
                style={{ width: 36, height: 36, fontSize: 18, borderRadius: 8, border: form.icon === ic ? '2px solid var(--accent)' : '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer' }}>
                {ic}
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
              <button key={c} onClick={() => set('color', c)}
                style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid var(--text-primary)' : '2px solid transparent', cursor: 'pointer' }} />
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
        <div><h1 className="page-title">Savings Goals</h1><p className="page-subtitle">{goals.filter(g => g.saved >= g.target).length} of {goals.length} goals complete</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> New Goal</button>
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
