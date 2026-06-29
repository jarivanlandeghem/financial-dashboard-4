import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/useT';
import SFIcon from '../components/SFIcon';

const fmt = (n) => (n < 0 ? '-' : '') + '€' + Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PROJECT_ICONS = [
  'house.svg','car.svg','wrench.and.screwdriver.svg','laptopcomputer.svg','figure.walk.svg',
  'paintbrush.svg','gear.svg','shippingbox.svg','sofa.svg','bolt.svg','figure.run.svg',
  'figure.strengthtraining.traditional.svg','headphones.svg','figure.and.child.holdinghands.svg',
  'scissors.svg','sun.max.svg','bicycle.svg','airplane.svg','archivebox.svg','network.svg',
];
const PROJECT_COLORS = ['#4F8EF7','#00C896','#FFB800','#FF4757','#A855F7','#EC4899','#F97316','#0EA5E9','#10B981','#64748B'];

function ProjectModal({ project, onSave, onClose }) {
  const t = useT();
  const isEdit = !!project?.id;
  const [form, setForm] = useState({
    name:        project?.name        || '',
    description: project?.description || '',
    icon:        project?.icon        || 'wrench.and.screwdriver.svg',
    color:       project?.color       || '#4F8EF7',
    status:      project?.status      || 'active',
    budget:      project?.budget      || '',
    startDate:   project?.startDate   || new Date().toISOString().split('T')[0],
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const statusOptions = [
    { key: 'active',    labelKey: 'proj_status_active' },
    { key: 'paused',    labelKey: 'proj_status_paused' },
    { key: 'completed', labelKey: 'proj_status_done'   },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">{isEdit ? t('proj_edit_title') : t('proj_new_title')}</div>

        <div className="input-group">
          <label className="input-label">{t('proj_name')}</label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder={t('proj_name_ph')} />
        </div>

        <div className="input-group">
          <label className="input-label">{t('proj_description')}</label>
          <input className="input" value={form.description} onChange={e => set('description', e.target.value)} placeholder={t('proj_description_ph')} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="input-group">
            <label className="input-label">{t('proj_start')}</label>
            <input type="date" className="input" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">{t('proj_budget')}</label>
            <input type="number" className="input" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="€ 0,00" />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">{t('proj_status')}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {statusOptions.map(({ key, labelKey }) => (
              <button key={key} className={`btn ${form.status === key ? 'btn-primary' : 'btn-ghost'}`}
                style={{ flex: 1, fontSize: 12 }} onClick={() => set('status', key)}>{t(labelKey)}</button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">{t('proj_icon')}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {PROJECT_ICONS.map(ic => (
              <button key={ic} onClick={() => set('icon', ic)}
                style={{ width: 36, height: 36, border: form.icon === ic ? '2px solid var(--accent)' : '1px solid var(--border)', background: form.icon === ic ? 'var(--accent-light)' : 'var(--bg-card-hover)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} data-squircle-r="8">
                <SFIcon name={ic} size={18} color={form.icon === ic ? 'var(--accent)' : 'var(--text-secondary)'} />
              </button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">{t('proj_color')}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PROJECT_COLORS.map(c => (
              <button key={c} onClick={() => set('color', c)}
                style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid var(--text-primary)' : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {form.color === c && <SFIcon name="checkmark.svg" size={12} color="white" />}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={!form.name.trim()} onClick={() => onSave(form)}>
            {isEdit ? t('proj_save') : t('proj_create')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const t = useT();
  const { projects, addProject, updateProject, deleteProject, projectEntries } = useApp();
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [delId, setDelId] = useState(null);

  const entriesFor = (id) => projectEntries.filter(e => e.projectId === id);
  const totalFor   = (id) => entriesFor(id).reduce((s, e) => s + Number(e.amount), 0);

  const handleSave = (data) => {
    if (modal?.id) updateProject(modal.id, data);
    else addProject(data);
    setModal(null);
  };

  const totalSpent = projects.reduce((s, p) => s + totalFor(p.id), 0);
  const activeCount = projects.filter(p => p.status === 'active').length;

  const statusColors = {
    active:    { color: '#00C896', bg: '#00C89620', labelKey: 'proj_status_active' },
    paused:    { color: '#FFB800', bg: '#FFB80020', labelKey: 'proj_status_paused' },
    completed: { color: '#4F8EF7', bg: '#4F8EF720', labelKey: 'proj_status_done'   },
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('proj_title')}</h1>
          <p className="page-subtitle">
            {t('proj_subtitle').replace('{n}', projects.length).replace('{active}', activeCount).replace('{total}', fmt(totalSpent))}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}>
          <SFIcon name="plus.svg" size={14} color="currentColor" /> {t('proj_new')}
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <div style={{ margin: '0 auto 16px', opacity: 0.3 }}><SFIcon name="briefcase.svg" size={40} color="currentColor" /></div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{t('proj_empty')}</div>
          <div style={{ fontSize: 14, marginBottom: 20 }}>{t('proj_empty_sub')}</div>
          <button className="btn btn-primary" onClick={() => setModal({})}>
            <SFIcon name="plus.svg" size={14} color="currentColor" /> {t('proj_first')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {projects.map(p => {
            const entries = entriesFor(p.id);
            const total   = totalFor(p.id);
            const budget  = Number(p.budget) || 0;
            const pct     = budget > 0 ? Math.min(100, (total / budget) * 100) : 0;
            const st      = statusColors[p.status] || statusColors.active;
            const overBudget = budget > 0 && total > budget;

            return (
              <div key={p.id} className="card" style={{ cursor: 'pointer', position: 'relative' }}
                onClick={() => navigate(`/finance/projects/${p.id}`)}>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, background: p.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} data-squircle-r="20">
                    <SFIcon name={p.icon} size={22} color={p.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 'var(--shape-full)', background: st.bg, color: st.color, flexShrink: 0 }}>
                    {t(st.labelKey)}
                  </span>
                </div>

                {budget > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>
                      <span>{t('proj_budget_lbl')}</span>
                      <span style={{ color: overBudget ? 'var(--red)' : 'var(--text-secondary)', fontWeight: 600 }}>
                        {fmt(total)} / {fmt(budget)}
                      </span>
                    </div>
                    <div style={{ height: 5, background: 'var(--bg-primary)', borderRadius: 'var(--shape-full)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: pct + '%', background: overBudget ? 'var(--red)' : p.color, borderRadius: 'var(--shape-full)', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{t('proj_total')}</div>
                    <div style={{ fontWeight: 700, color: 'var(--red)' }}>{fmt(total)}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{t('proj_entries')}</div>
                    <div style={{ fontWeight: 600 }}>{entries.length}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{t('proj_start_col')}</div>
                    <div style={{ fontWeight: 500 }}>{p.startDate}</div>
                  </div>
                </div>

                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 4 }}
                  onClick={e => e.stopPropagation()}>
                  <button className="btn-icon" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setModal(p)}>
                    <SFIcon name="pencil.svg" size={12} color="currentColor" />
                  </button>
                  <button className="btn-icon" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setDelId(p.id)}>
                    <SFIcon name="trash.svg" size={12} color="currentColor" />
                  </button>
                  <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <SFIcon name="chevron.right.svg" size={14} color="currentColor" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <ProjectModal project={modal?.id ? modal : null} onSave={handleSave} onClose={() => setModal(null)} />
      )}

      {delId && (
        <div className="modal-overlay" onClick={() => setDelId(null)}>
          <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">{t('proj_delete_title')}</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>
              {t('proj_delete_warn')}
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDelId(null)}>{t('cancel')}</button>
              <button className="btn" style={{ background: 'var(--red)', color: 'white' }}
                onClick={() => { deleteProject(delId); setDelId(null); }}>{t('delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
