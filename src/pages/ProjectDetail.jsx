import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/useT';
import SFIcon from '../components/SFIcon';

const fmt = (n) => (n < 0 ? '-' : '') + '€' + Math.abs(Number(n)).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const ENTRY_TYPE_DEFS = {
  material:  { icon: 'shippingbox.svg',           color: '#4F8EF7' },
  tool:      { icon: 'wrench.and.screwdriver.svg', color: '#F97316' },
  labor:     { icon: 'clock.svg',                  color: '#00C896' },
  transport: { icon: 'car.svg',                    color: '#A855F7' },
  service:   { icon: 'person.svg',                 color: '#EC4899' },
  other:     { icon: 'archivebox.svg',             color: '#6B7280' },
};

const STATUS_COLORS = {
  active:    { color: '#00C896', bg: '#00C89620', labelKey: 'proj_status_active' },
  paused:    { color: '#FFB800', bg: '#FFB80020', labelKey: 'proj_status_paused' },
  completed: { color: '#4F8EF7', bg: '#4F8EF720', labelKey: 'proj_status_done'   },
};

// Entry type label keys
const ENTRY_TYPE_KEYS = {
  material:  'pd_entry_material',
  tool:      'pd_entry_tool',
  labor:     'pd_entry_labor',
  transport: 'pd_entry_transport',
  service:   'pd_entry_service',
  other:     'pd_entry_other',
};

function EntryModal({ entry, projectId, onSave, onClose }) {
  const t = useT();
  const isEdit = !!entry?.id;
  const [form, setForm] = useState({
    date:        entry?.date        || new Date().toISOString().split('T')[0],
    description: entry?.description || '',
    type:        entry?.type        || 'material',
    amount:      entry?.amount      || '',
    hours:       entry?.hours       || '',
    note:        entry?.note        || '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const isLabor = form.type === 'labor';
  const computedAmount = isLabor && form.hours && form.amount
    ? (Number(form.hours) * Number(form.amount)).toFixed(2)
    : null;

  const submit = () => {
    if (!form.description.trim() || !form.amount) return;
    const finalAmount = isLabor && form.hours
      ? Number(form.hours) * Number(form.amount)
      : Number(form.amount);
    onSave({ ...form, projectId, amount: finalAmount, hours: form.hours ? Number(form.hours) : null });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">{isEdit ? t('pd_edit_entry') : t('pd_add_entry')}</div>

        <div className="input-group">
          <label className="input-label">{t('pd_entry_type')}</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {Object.entries(ENTRY_TYPE_DEFS).map(([k, v]) => {
              const label = t(ENTRY_TYPE_KEYS[k]) !== ENTRY_TYPE_KEYS[k] ? t(ENTRY_TYPE_KEYS[k]) : k;
              return (
                <button key={k}
                  style={{
                    padding: '8px 4px', borderRadius: 'var(--radius-sm)', border: '1.5px solid',
                    borderColor: form.type === k ? v.color : 'var(--border)',
                    background: form.type === k ? v.color + '18' : 'var(--bg-card-hover)',
                    cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    color: form.type === k ? v.color : 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}
                  onClick={() => set('type', k)}>
                  <SFIcon name={v.icon} size={14} color={form.type === k ? v.color : 'var(--text-secondary)'} /> {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">{t('pd_description')}</label>
          <input className="input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="..." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {isLabor ? (
            <>
              <div className="input-group">
                <label className="input-label">{t('pd_hourly')}</label>
                <input type="number" className="input" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="35" min="0" step="0.01" />
              </div>
              <div className="input-group">
                <label className="input-label">{t('pd_hours')}</label>
                <input type="number" className="input" value={form.hours} onChange={e => set('hours', e.target.value)} placeholder="4" min="0" step="0.5" />
              </div>
            </>
          ) : (
            <>
              <div className="input-group">
                <label className="input-label">{t('pd_amount')}</label>
                <input type="number" className="input" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0,00" min="0" step="0.01" />
              </div>
              <div className="input-group">
                <label className="input-label">{t('pd_date')}</label>
                <input type="date" className="input" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
            </>
          )}
        </div>

        {isLabor && (
          <>
            <div className="input-group">
              <label className="input-label">{t('pd_date')}</label>
              <input type="date" className="input" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            {computedAmount && (
              <div style={{ background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13, color: 'var(--accent)', fontWeight: 600, marginBottom: 12 }}>
                {t('pd_total')} {Number(form.hours)} u × €{Number(form.amount)} = €{computedAmount}
              </div>
            )}
          </>
        )}

        <div className="input-group">
          <label className="input-label">{t('pd_note')}</label>
          <input className="input" value={form.note} onChange={e => set('note', e.target.value)} placeholder="..." />
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={!form.description.trim() || !form.amount} onClick={submit}>
            {isEdit ? t('save') : t('add')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const t = useT();
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, updateProject, projectEntries, addProjectEntry, updateProjectEntry, deleteProjectEntry } = useApp();

  const project = projects.find(p => String(p.id) === id);
  const [entryModal, setEntryModal] = useState(null);
  const [delEntryId, setDelEntryId] = useState(null);

  const entries = useMemo(
    () => projectEntries.filter(e => String(e.projectId) === id).sort((a, b) => new Date(b.date) - new Date(a.date)),
    [projectEntries, id]
  );

  const total = entries.reduce((s, e) => s + Number(e.amount), 0);

  const byType = useMemo(() => {
    const m = {};
    entries.forEach(e => { m[e.type] = (m[e.type] || 0) + Number(e.amount); });
    return m;
  }, [entries]);

  if (!project) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{t('pd_not_found')}</div>
        <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate('/finance/projects')}>
          {t('pd_back')}
        </button>
      </div>
    );
  }

  const budget = Number(project.budget) || 0;
  const pct = budget > 0 ? Math.min(100, (total / budget) * 100) : 0;
  const overBudget = budget > 0 && total > budget;
  const st = STATUS_COLORS[project.status] || STATUS_COLORS.active;

  const handleSaveEntry = (data) => {
    if (entryModal?.id) updateProjectEntry(entryModal.id, data);
    else addProjectEntry(data);
    setEntryModal(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn btn-ghost" style={{ padding: '8px 10px' }} onClick={() => navigate('/finance/projects')}>
          <SFIcon name="arrow.left.svg" size={16} color="currentColor" />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SFIcon name={project.icon} size={26} color="var(--text-primary)" />
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{project.name}</h1>
              {project.description && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{project.description}</p>}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: st.bg, color: st.color, marginLeft: 4 }}>
              {t(st.labelKey)}
            </span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setEntryModal({ projectId: project.id })}>
          <SFIcon name="plus.svg" size={14} color="currentColor" /> {t('pd_add_entry')}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{t('pd_total_costs')}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--red)' }}>{fmt(total)}</div>
        </div>
        {budget > 0 && (
          <div className="card">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{t('pd_budget')}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: overBudget ? 'var(--red)' : 'var(--green)' }}>{fmt(budget)}</div>
            <div style={{ fontSize: 11, color: overBudget ? 'var(--red)' : 'var(--text-muted)' }}>
              {overBudget
                ? t('pd_over_budget').replace('{n}', fmt(total - budget))
                : t('pd_remaining').replace('{n}', fmt(budget - total))}
            </div>
          </div>
        )}
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{t('pd_entries_title')}</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{entries.length}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{t('pd_started')}</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{project.startDate}</div>
        </div>
      </div>

      {budget > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{t('pd_progress')}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: overBudget ? 'var(--red)' : 'var(--text-primary)' }}>{pct.toFixed(0)}%</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-primary)', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: pct + '%', background: overBudget ? 'var(--red)' : project.color, borderRadius: 100, transition: 'width 0.4s' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="section-title">{t('pd_entries_title')}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('pd_items_count').replace('{n}', entries.length)}</span>
          </div>
          {entries.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <SFIcon name="archivebox.svg" size={32} color="var(--text-muted)" />
              </div>
              {t('pd_empty')}
            </div>
          ) : (
            entries.map((e, i) => {
              const def = ENTRY_TYPE_DEFS[e.type] || ENTRY_TYPE_DEFS.other;
              const label = t(ENTRY_TYPE_KEYS[e.type]) !== ENTRY_TYPE_KEYS[e.type] ? t(ENTRY_TYPE_KEYS[e.type]) : e.type;
              return (
                <div key={e.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
                  borderBottom: i < entries.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: def.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <SFIcon name={def.icon} size={17} color={def.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{e.description}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      {e.date} · <span style={{ color: def.color, fontWeight: 600 }}>{label}</span>
                      {e.hours && ` · ${e.hours}u`}
                      {e.note && ` · ${e.note}`}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--red)', flexShrink: 0 }}>{fmt(e.amount)}</div>
                  <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                    <button className="btn-icon" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setEntryModal(e)}>
                      <SFIcon name="pencil.svg" size={11} color="currentColor" />
                    </button>
                    <button className="btn-icon" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setDelEntryId(e.id)}>
                      <SFIcon name="trash.svg" size={11} color="currentColor" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 14 }}>{t('pd_breakdown')}</div>
            {total === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>{t('pd_no_costs')}</div>
            ) : (
              Object.entries(ENTRY_TYPE_DEFS).map(([k, v]) => {
                const amt = byType[k] || 0;
                if (amt === 0) return null;
                const typePct = total > 0 ? (amt / total) * 100 : 0;
                const label = t(ENTRY_TYPE_KEYS[k]) !== ENTRY_TYPE_KEYS[k] ? t(ENTRY_TYPE_KEYS[k]) : k;
                return (
                  <div key={k} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                      <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}><SFIcon name={v.icon} size={13} color={v.color} /> {label}</span>
                      <span style={{ fontWeight: 700, color: v.color }}>{fmt(amt)}</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--bg-primary)', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: typePct + '%', background: v.color, borderRadius: 100 }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{typePct.toFixed(1)}%</div>
                  </div>
                );
              })
            )}
            {total > 0 && (
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700 }}>
                <span>{t('pd_total_col')}</span>
                <span style={{ color: 'var(--red)' }}>{fmt(total)}</span>
              </div>
            )}
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="section-title" style={{ marginBottom: 10 }}>{t('pd_status')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Object.entries(STATUS_COLORS).map(([k, v]) => (
                <button key={k}
                  style={{
                    padding: '9px 14px', borderRadius: 'var(--radius-sm)', border: '1.5px solid',
                    borderColor: project.status === k ? v.color : 'var(--border)',
                    background: project.status === k ? v.bg : 'transparent',
                    cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    color: project.status === k ? v.color : 'var(--text-secondary)',
                    textAlign: 'left',
                  }}
                  onClick={() => updateProject(project.id, { status: k })}>
                  {t(v.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {entryModal && (
        <EntryModal entry={entryModal?.id ? entryModal : null} projectId={project.id} onSave={handleSaveEntry} onClose={() => setEntryModal(null)} />
      )}

      {delEntryId && (
        <div className="modal-overlay" onClick={() => setDelEntryId(null)}>
          <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">{t('pd_delete_entry')}</div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDelEntryId(null)}>{t('cancel')}</button>
              <button className="btn" style={{ background: 'var(--red)', color: 'white' }}
                onClick={() => { deleteProjectEntry(delEntryId); setDelEntryId(null); }}>{t('delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
