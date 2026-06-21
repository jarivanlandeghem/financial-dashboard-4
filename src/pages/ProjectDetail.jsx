import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2, Clock, Package, Wrench, Car, Users, MoreHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SW = 1.5;
const fmt = (n) => '€' + Number(n).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const ENTRY_TYPES = {
  material:  { label: 'Materiaal',   icon: '🧱', color: '#4F8EF7',  LIcon: Package },
  tool:      { label: 'Gereedschap', icon: '🔧', color: '#F97316',  LIcon: Wrench  },
  labor:     { label: 'Arbeidsuren', icon: '⏱️', color: '#00C896',  LIcon: Clock   },
  transport: { label: 'Transport',   icon: '🚗', color: '#A855F7',  LIcon: Car     },
  service:   { label: 'Diensten',    icon: '👷', color: '#EC4899',  LIcon: Users   },
  other:     { label: 'Overige',     icon: '📦', color: '#6B7280',  LIcon: MoreHorizontal },
};

const STATUS_COLORS = {
  active:    { label: 'Actief',     color: '#00C896', bg: '#00C89620' },
  paused:    { label: 'Gepauzeerd', color: '#FFB800', bg: '#FFB80020' },
  completed: { label: 'Afgerond',   color: '#4F8EF7', bg: '#4F8EF720' },
};

function EntryModal({ entry, projectId, onSave, onClose }) {
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
        <div className="modal-title">{isEdit ? 'Kostenpost bewerken' : 'Kostenpost toevoegen'}</div>

        {/* Type selector */}
        <div className="input-group">
          <label className="input-label">Type</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {Object.entries(ENTRY_TYPES).map(([k, v]) => (
              <button key={k}
                style={{
                  padding: '8px 4px', borderRadius: 'var(--radius-sm)', border: '1.5px solid',
                  borderColor: form.type === k ? v.color : 'var(--border)',
                  background: form.type === k ? v.color + '18' : 'var(--bg-card-hover)',
                  cursor: 'pointer', fontSize: 12, fontWeight: 600, color: form.type === k ? v.color : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}
                onClick={() => set('type', k)}>
                <span>{v.icon}</span> {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Omschrijving *</label>
          <input className="input" value={form.description} onChange={e => set('description', e.target.value)}
            placeholder={isLabor ? 'bijv. Schilderwerk' : 'bijv. Verf 5L'} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isLabor ? '1fr 1fr' : '1fr 1fr', gap: 12 }}>
          {isLabor ? (
            <>
              <div className="input-group">
                <label className="input-label">Uurloon (€/u)</label>
                <input type="number" className="input" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="35" min="0" step="0.01" />
              </div>
              <div className="input-group">
                <label className="input-label">Aantal uren</label>
                <input type="number" className="input" value={form.hours} onChange={e => set('hours', e.target.value)} placeholder="4" min="0" step="0.5" />
              </div>
            </>
          ) : (
            <>
              <div className="input-group">
                <label className="input-label">Bedrag (€) *</label>
                <input type="number" className="input" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0,00" min="0" step="0.01" />
              </div>
              <div className="input-group">
                <label className="input-label">Datum</label>
                <input type="date" className="input" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
            </>
          )}
        </div>

        {isLabor && (
          <>
            <div className="input-group">
              <label className="input-label">Datum</label>
              <input type="date" className="input" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            {computedAmount && (
              <div style={{ background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13, color: 'var(--accent)', fontWeight: 600, marginBottom: 12 }}>
                Totaal: {Number(form.hours)} u × €{Number(form.amount)} = €{computedAmount}
              </div>
            )}
          </>
        )}

        <div className="input-group">
          <label className="input-label">Notitie</label>
          <input className="input" value={form.note} onChange={e => set('note', e.target.value)} placeholder="Optionele opmerking" />
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Annuleer</button>
          <button className="btn btn-primary" disabled={!form.description.trim() || !form.amount} onClick={submit}>
            {isEdit ? 'Opslaan' : 'Toevoegen'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
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
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Project niet gevonden</div>
        <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate('/projects')}>
          Terug naar projecten
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
      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn btn-ghost" style={{ padding: '8px 10px' }} onClick={() => navigate('/projects')}>
          <ArrowLeft size={16} strokeWidth={SW} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 26 }}>{project.icon}</span>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{project.name}</h1>
              {project.description && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{project.description}</p>}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: st.bg, color: st.color, marginLeft: 4 }}>
              {st.label}
            </span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setEntryModal({ projectId: project.id })}>
          <Plus size={14} strokeWidth={SW} /> Kostenpost
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Totale kosten</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--red)' }}>{fmt(total)}</div>
        </div>
        {budget > 0 && (
          <div className="card">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Budget</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: overBudget ? 'var(--red)' : 'var(--green)' }}>{fmt(budget)}</div>
            <div style={{ fontSize: 11, color: overBudget ? 'var(--red)' : 'var(--text-muted)' }}>
              {overBudget ? `${fmt(total - budget)} over budget` : `${fmt(budget - total)} over`}
            </div>
          </div>
        )}
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Kostenposten</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{entries.length}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Gestart</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{project.startDate}</div>
        </div>
      </div>

      {/* Budget bar */}
      {budget > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Budgetvoortgang</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: overBudget ? 'var(--red)' : 'var(--text-primary)' }}>
              {pct.toFixed(0)}%
            </span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-primary)', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: pct + '%', background: overBudget ? 'var(--red)' : project.color, borderRadius: 100, transition: 'width 0.4s' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

        {/* Entries list */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="section-title">Alle kostenposten</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{entries.length} items</span>
          </div>
          {entries.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
              Nog geen kostenposten — voeg er een toe!
            </div>
          ) : (
            entries.map((e, i) => {
              const t = ENTRY_TYPES[e.type] || ENTRY_TYPES.other;
              return (
                <div key={e.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
                  borderBottom: i < entries.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: t.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
                    {t.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{e.description}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      {e.date} · <span style={{ color: t.color, fontWeight: 600 }}>{t.label}</span>
                      {e.hours && ` · ${e.hours}u`}
                      {e.note && ` · ${e.note}`}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--red)', flexShrink: 0 }}>
                    {fmt(e.amount)}
                  </div>
                  <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                    <button className="btn-icon" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setEntryModal(e)}>
                      <Edit2 size={11} strokeWidth={SW} />
                    </button>
                    <button className="btn-icon" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setDelEntryId(e.id)}>
                      <Trash2 size={11} strokeWidth={SW} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Type breakdown */}
        <div>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 14 }}>Verdeling per type</div>
            {total === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Geen kosten</div>
            ) : (
              Object.entries(ENTRY_TYPES).map(([k, v]) => {
                const amt = byType[k] || 0;
                if (amt === 0) return null;
                const pct = total > 0 ? (amt / total) * 100 : 0;
                return (
                  <div key={k} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                      <span style={{ fontWeight: 500 }}>{v.icon} {v.label}</span>
                      <span style={{ fontWeight: 700, color: v.color }}>{fmt(amt)}</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--bg-primary)', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: pct + '%', background: v.color, borderRadius: 100 }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{pct.toFixed(1)}%</div>
                  </div>
                );
              })
            )}

            {total > 0 && (
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700 }}>
                <span>Totaal</span>
                <span style={{ color: 'var(--red)' }}>{fmt(total)}</span>
              </div>
            )}
          </div>

          {/* Status change */}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="section-title" style={{ marginBottom: 10 }}>Status</div>
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
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {entryModal && (
        <EntryModal
          entry={entryModal?.id ? entryModal : null}
          projectId={project.id}
          onSave={handleSaveEntry}
          onClose={() => setEntryModal(null)}
        />
      )}

      {delEntryId && (
        <div className="modal-overlay" onClick={() => setDelEntryId(null)}>
          <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">Kostenpost verwijderen?</div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDelEntryId(null)}>Annuleer</button>
              <button className="btn" style={{ background: 'var(--red)', color: 'white' }}
                onClick={() => { deleteProjectEntry(delEntryId); setDelEntryId(null); }}>Verwijderen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
