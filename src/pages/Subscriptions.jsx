import { useState } from 'react';
import { X, Check, Plus, Tv, Music, Apple, Dumbbell, Wifi, Cloud, Palette, Play, Radio, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';

const fmt = (n) => '€' + n.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const SW = 1.5;

const SUB_ICONS = {
  'Netflix': { Icon: Tv, color: '#E50914' },
  'Spotify': { Icon: Music, color: '#1DB954' },
  'Apple Music': { Icon: Music, color: '#FA243C' },
  'Gym': { Icon: Dumbbell, color: '#FF6900' },
  'Internet': { Icon: Wifi, color: '#007AFF' },
  'Cloud Storage': { Icon: Cloud, color: '#5AC8FA' },
  'Adobe CC': { Icon: Palette, color: '#FF0000' },
};

function SubIcon({ name, size = 36 }) {
  const entry = SUB_ICONS[name];
  if (!entry) return (
    <div style={{ width: size, height: size, borderRadius: size * 0.26, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Play size={size * 0.44} strokeWidth={SW} color="var(--accent)" />
    </div>
  );
  const { Icon, color } = entry;
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.26, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={size * 0.44} strokeWidth={SW} color={color} />
    </div>
  );
}

export default function Subscriptions() {
  const { subscriptions, toggleSubscriptionCancel } = useApp();

  const active = subscriptions.filter(s => !s.markedForCancel);
  const markedCancel = subscriptions.filter(s => s.markedForCancel);
  const totalMonthly = active.reduce((s, sub) => s + sub.amount, 0);
  const totalYearly = totalMonthly * 12;
  const savingsIfCancel = markedCancel.reduce((s, sub) => s + sub.amount, 0);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Subscriptions</h1><p className="page-subtitle">Your recurring monthly costs</p></div>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Monthly Total</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{fmt(totalMonthly)}</div>
          <div className="stat-change neutral">{active.length} active</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Yearly Cost</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{fmt(totalYearly)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Potential Savings</div>
          <div className="stat-value" style={{ fontSize: 22, color: savingsIfCancel > 0 ? 'var(--green)' : 'var(--text-muted)' }}>
            {fmt(savingsIfCancel)}<span style={{ fontSize: 13, fontWeight: 400 }}>/mo</span>
          </div>
          <div className="stat-change positive">{savingsIfCancel > 0 ? `${fmt(savingsIfCancel * 12)}/year saved` : 'No cancellations marked'}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, marginBottom: 20 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span className="section-title">Active Subscriptions</span>
        </div>
        {active.map(sub => (
          <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <SubIcon name={sub.name} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{sub.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Next: {sub.nextDate} · {sub.billing}</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, marginRight: 12 }}>
              {fmt(sub.amount)}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>/mo</span>
            </div>
            {sub.canCancel ? (
              <button className="btn btn-ghost" style={{ fontSize: 12, color: 'var(--red)', borderColor: 'var(--red-light)' }}
                onClick={() => toggleSubscriptionCancel(sub.id)}>
                <X size={12} strokeWidth={SW} /> Cancel
              </button>
            ) : (
              <span className="badge badge-blue">Essential</span>
            )}
          </div>
        ))}
      </div>

      {markedCancel.length > 0 && (
        <div className="card" style={{ padding: 0, border: '1px solid var(--green-light)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="section-title">Marked for Cancellation</span>
            <span className="badge badge-green">Save {fmt(savingsIfCancel)}/mo</span>
          </div>
          {markedCancel.map(sub => (
            <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--border)', opacity: 0.6 }}>
              <SubIcon name={sub.name} />
              <div style={{ flex: 1, textDecoration: 'line-through' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{sub.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Saves {fmt(sub.amount * 12)}/year</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginRight: 12, textDecoration: 'line-through', color: 'var(--text-muted)' }}>{fmt(sub.amount)}/mo</div>
              <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => toggleSubscriptionCancel(sub.id)}>
                <Check size={12} strokeWidth={SW} /> Keep
              </button>
            </div>
          ))}
          <div style={{ padding: '14px 20px', background: 'var(--green-light)', borderRadius: '0 0 var(--radius) var(--radius)' }}>
            <div style={{ color: 'var(--green)', fontWeight: 600, fontSize: 14 }}>
              Cancelling saves you {fmt(savingsIfCancel)}/month · {fmt(savingsIfCancel * 12)}/year
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
