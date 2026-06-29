import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/useT';
import SFIcon from '../components/SFIcon';

const fmt = (n) => (n < 0 ? '-' : '') + '€' + Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SUB_COLORS = {
  'Netflix':       '#E50914',
  'Spotify':       '#1DB954',
  'Apple Music':   '#FA243C',
  'Gym':           '#FF6900',
  'Internet':      '#007AFF',
  'Cloud Storage': '#5AC8FA',
  'Adobe CC':      '#FF0000',
};

function SubIcon({ sub, size = 36 }) {
  const color = SUB_COLORS[sub.name] || 'var(--accent)';
  const icon = sub.icon || 'play.svg';
  return (
    <div data-squircle-r={Math.round(size * 0.26)} style={{ width: size, height: size, background: (SUB_COLORS[sub.name] || 'var(--accent)') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <SFIcon name={icon} size={size * 0.5} color={color} />
    </div>
  );
}

export default function Subscriptions() {
  const t = useT();
  const { subscriptions, toggleSubscriptionCancel } = useApp();

  const active = subscriptions.filter(s => !s.markedForCancel);
  const markedCancel = subscriptions.filter(s => s.markedForCancel);
  const totalMonthly = active.reduce((s, sub) => s + sub.amount, 0);
  const totalYearly = totalMonthly * 12;
  const savingsIfCancel = markedCancel.reduce((s, sub) => s + sub.amount, 0);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">{t('sub_title')}</h1><p className="page-subtitle">{t('sub_subtitle')}</p></div>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">{t('sub_monthly_total')}</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{fmt(totalMonthly)}</div>
          <div className="stat-change neutral">{t('sub_active_count').replace('{n}', active.length)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('sub_yearly')}</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{fmt(totalYearly)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('sub_savings')}</div>
          <div className="stat-value" style={{ fontSize: 22, color: savingsIfCancel > 0 ? 'var(--green)' : 'var(--text-muted)' }}>
            {fmt(savingsIfCancel)}<span style={{ fontSize: 13, fontWeight: 400 }}>/mo</span>
          </div>
          <div className="stat-change positive">
            {savingsIfCancel > 0 ? t('sub_saves_year').replace('{n}', fmt(savingsIfCancel * 12)) : t('sub_no_cancel')}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, marginBottom: 20 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span className="section-title">{t('sub_active')}</span>
        </div>
        {active.map(sub => (
          <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <SubIcon sub={sub} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{sub.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {t('sub_next').replace('{date}', sub.nextDate).replace('{cycle}', sub.billing)}
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, marginRight: 12 }}>
              {fmt(sub.amount)}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>/mo</span>
            </div>
            {sub.canCancel ? (
              <button className="btn btn-ghost" style={{ fontSize: 12, color: 'var(--red)', borderColor: 'var(--red-light)' }}
                onClick={() => toggleSubscriptionCancel(sub.id)}>
                <SFIcon name="xmark.svg" size={12} color="currentColor" /> {t('sub_cancel')}
              </button>
            ) : (
              <span className="badge badge-blue">{t('sub_essential')}</span>
            )}
          </div>
        ))}
      </div>

      {markedCancel.length > 0 && (
        <div className="card" style={{ padding: 0, border: '1px solid var(--green-light)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="section-title">{t('sub_marked_cancel')}</span>
            <span className="badge badge-green">{t('sub_save_mo').replace('{n}', fmt(savingsIfCancel))}</span>
          </div>
          {markedCancel.map(sub => (
            <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--border)', opacity: 0.6 }}>
              <SubIcon sub={sub} />
              <div style={{ flex: 1, textDecoration: 'line-through' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{sub.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {t('sub_saves_year').replace('{n}', fmt(sub.amount * 12))}
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginRight: 12, textDecoration: 'line-through', color: 'var(--text-muted)' }}>{fmt(sub.amount)}/mo</div>
              <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => toggleSubscriptionCancel(sub.id)}>
                <SFIcon name="checkmark.svg" size={12} color="currentColor" /> {t('sub_keep')}
              </button>
            </div>
          ))}
          <div style={{ padding: '14px 20px', background: 'var(--green-light)', borderRadius: '0 0 var(--radius) var(--radius)' }}>
            <div style={{ color: 'var(--green)', fontWeight: 600, fontSize: 14 }}>
              {t('sub_cancel_saves').replace('{mo}', fmt(savingsIfCancel)).replace('{yr}', fmt(savingsIfCancel * 12))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
