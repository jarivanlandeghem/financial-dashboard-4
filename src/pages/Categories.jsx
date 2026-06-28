import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import SFIcon from '../components/SFIcon';
import { useT } from '../i18n/useT';

const SW = 1.5;
const fmt = (n) => (n < 0 ? '-' : '') + '€' + Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const COLORS = ['#4F8EF7','#00C896','#FFB800','#FF4757','#A855F7','#EC4899','#06B6D4','#8B5CF6',
  '#F97316','#EF4444','#10B981','#3B82F6','#F59E0B','#84CC16','#0EA5E9','#64748B'];
const ICONS = [
  'house.svg','cart.svg','car.svg','pill.svg','gamecontroller.svg','bag.svg','airplane.svg',
  'book.closed.svg','person.svg','iphone.svg','pawprint.svg','figure.and.child.holdinghands.svg',
  'building.svg','giftcard.svg','dollarsign.svg','briefcase.svg','chart.line.uptrend.xyaxis.svg',
  'house.svg','bolt.svg','questionmark.folder.svg','fork.knife.svg','fuelpump.svg','stethoscope.svg',
  'figure.strengthtraining.traditional.svg','tv.svg','tshirt.svg','scissors.svg','laptopcomputer.svg',
  'newspaper.svg','icloud.svg','music.note.list.svg','creditcard.svg','film.stack.svg','soccerball.svg',
  'book.svg','shield.svg','gear.svg','lightbulb.svg','wrench.and.screwdriver.svg','sofa.svg',
  'cup.and.saucer.svg','takeoutbag.and.cup.and.straw.svg','bus.svg','parkingsign.svg','wineglass.svg',
  'wifi.svg','heart.svg','globe.svg','tent.svg','trophy.svg','banknote.svg','chart.bar.xaxis.ascending.svg',
  'bitcoinsign.svg','paintbrush.svg','headphones.svg','bed.double.svg','graduationcap.svg','archivebox.svg',
  'shippingbox.svg','sun.max.svg','building.2.svg','map.svg','cloud.svg','sparkle.svg','mug.svg',
];

function CategoryModal({ cat, parentOptions, onSave, onClose }) {
  const t = useT();
  const isEdit = !!cat?.id;
  const [form, setForm] = useState({
    key:       cat?.key       || '',
    label:     cat?.label     || '',
    icon:      cat?.icon      || 'questionmark.folder.svg',
    color:     cat?.color     || '#4F8EF7',
    type:      cat?.type      || 'expense',
    parent_id: cat?.parent_id ?? '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = () => {
    if (!form.label.trim()) return;
    const key = form.key.trim() || form.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    onSave({ ...form, key, parent_id: form.parent_id || null });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">{isEdit ? t('cat_edit_title') : t('cat_add_title')}</div>

        {/* Parent */}
        <div className="input-group">
          <label className="input-label">{t('cat_parent')}</label>
          <select className="input" value={form.parent_id} onChange={e => set('parent_id', e.target.value)}>
            <option value="">{t('cat_no_parent')}</option>
            {parentOptions.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>

        {/* Label */}
        <div className="input-group">
          <label className="input-label">{t('cat_name')}</label>
          <input className="input" value={form.label} onChange={e => set('label', e.target.value)} placeholder="bijv. Elektriciteit" />
        </div>

        {/* Type */}
        <div className="input-group">
          <label className="input-label">Type</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['expense','Uitgave'],['income','Inkomst'],['both','Beide']].map(([v, l]) => (
              <button key={v} className={`btn ${form.type === v ? 'btn-primary' : 'btn-ghost'}`}
                style={{ flex: 1 }} onClick={() => set('type', v)}>{l}</button>
            ))}
          </div>
        </div>

        {/* Icon picker */}
        <div className="input-group">
          <label className="input-label">Icoon</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ICONS.map(ic => (
              <button key={ic} onClick={() => set('icon', ic)}
                style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                  border: form.icon === ic ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: form.icon === ic ? 'var(--accent-light)' : 'var(--bg-card-hover)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <SFIcon name={ic} size={18} color={form.icon === ic ? 'var(--accent)' : 'var(--text-secondary)'} />
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div className="input-group">
          <label className="input-label">Kleur</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => set('color', c)}
                style={{
                  width: 28, height: 28, borderRadius: '50%', background: c,
                  border: form.color === c ? '3px solid var(--text-primary)' : '2px solid transparent',
                  cursor: 'pointer',
                }}>
                {form.color === c && <SFIcon name="checkmark.svg" size={12} color="white" />}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Annuleer</button>
          <button className="btn btn-primary" onClick={submit}>{isEdit ? 'Opslaan' : 'Toevoegen'}</button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ cat, hasChildren, onConfirm, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">Categorie verwijderen</div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Verwijder <strong>{cat.label}</strong>?
          {hasChildren && <span style={{ color: 'var(--red)', display: 'block', marginTop: 8 }}>
            Alle ondercategorieën worden ook verwijderd.
          </span>}
        </p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Annuleer</button>
          <button className="btn" style={{ background: 'var(--red)', color: 'white' }} onClick={onConfirm}>Verwijderen</button>
        </div>
      </div>
    </div>
  );
}

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory, transactions } = useApp();
  const [expanded, setExpanded] = useState({});
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit', cat }
  const [delModal, setDelModal] = useState(null);

  const parents  = categories.filter(c => !c.parent_id);
  const children = (parentId) => categories.filter(c => c.parent_id == parentId);

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  // Spending per category (all time)
  const spendMap = useMemo(() => {
    const m = {};
    transactions.forEach(t => {
      m[t.category] = (m[t.category] || 0) + t.amount;
    });
    return m;
  }, [transactions]);

  const catTotal = (cat) => {
    const kids = children(cat.id);
    if (kids.length === 0) return spendMap[cat.key] || 0;
    return kids.reduce((s, k) => s + (spendMap[k.key] || 0), 0) + (spendMap[cat.key] || 0);
  };

  // Selected category transactions
  const selectedTxs = useMemo(() => {
    if (!selected) return [];
    const kids = children(selected.id).map(c => c.key);
    return transactions.filter(t => t.category === selected.key || kids.includes(t.category))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selected, transactions, categories]);

  // CRUD
  const handleSave = async (data) => {
    if (modal?.mode === 'edit') await updateCategory(modal.cat.id, data);
    else await addCategory(data);
    setModal(null);
  };

  const handleDelete = async () => {
    await deleteCategory(delModal.id);
    if (selected?.id === delModal.id) setSelected(null);
    setDelModal(null);
  };

  const parentOptions = categories.filter(c => !c.parent_id);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categorieën</h1>
          <p className="page-subtitle">{categories.filter(c => !c.parent_id).length} hoofdcategorieën · {categories.filter(c => c.parent_id).length} ondercategorieën</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ mode: 'add', cat: null })}>
          <SFIcon name="plus.svg" size={14} color="currentColor" /> Categorie
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── Category tree ── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)' }}>
            <span className="section-title">Alle categorieën</span>
          </div>
          <div style={{ maxHeight: 680, overflowY: 'auto' }}>
            {parents.map(parent => {
              const kids = children(parent.id);
              const isOpen = expanded[parent.id];
              const total = catTotal(parent);
              const isSelected = selected?.id === parent.id;

              return (
                <div key={parent.id}>
                  {/* Parent row */}
                  <div
                    onClick={() => { setSelected(parent); if (kids.length) toggle(parent.id); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '11px 16px', cursor: 'pointer',
                      background: isSelected ? 'var(--accent-light)' : 'transparent',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: parent.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <SFIcon name={parent.icon} size={16} color={parent.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>{parent.label}</div>
                      {kids.length > 0 && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{kids.length} subcategorieën</div>}
                    </div>
                    {total !== 0 && (
                      <span style={{ fontSize: 12, fontWeight: 600, color: total < 0 ? 'var(--red)' : 'var(--green)', flexShrink: 0 }}>
                        {total < 0 ? '-' : '+'}{fmt(total)}
                      </span>
                    )}
                    <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                      <button className="btn-icon" style={{ width: 26, height: 26, padding: 0 }}
                        onClick={e => { e.stopPropagation(); setModal({ mode: 'edit', cat: parent }); }}>
                        <SFIcon name="pencil.svg" size={11} color="currentColor" />
                      </button>
                      <button className="btn-icon" style={{ width: 26, height: 26, padding: 0 }}
                        onClick={e => { e.stopPropagation(); setDelModal(parent); }}>
                        <SFIcon name="trash.svg" size={11} color="currentColor" />
                      </button>
                      {kids.length > 0 && (
                        <button className="btn-icon" style={{ width: 26, height: 26, padding: 0 }}
                          onClick={e => { e.stopPropagation(); toggle(parent.id); }}>
                          {isOpen ? <SFIcon name="chevron.down.svg" size={11} color="currentColor" /> : <SFIcon name="chevron.right.svg" size={11} color="currentColor" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Children */}
                  {isOpen && kids.map(kid => {
                    const kidSelected = selected?.id === kid.id;
                    const kidTotal = spendMap[kid.key] || 0;
                    return (
                      <div key={kid.id}
                        onClick={() => setSelected(kid)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '9px 16px 9px 48px', cursor: 'pointer',
                          background: kidSelected ? 'var(--accent-light)' : 'var(--bg-primary)',
                          borderBottom: '1px solid var(--border)',
                        }}
                      >
                        <div style={{ width: 26, height: 26, borderRadius: 'var(--radius-sm)', background: kid.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <SFIcon name={kid.icon} size={13} color={kid.color} />
                        </div>
                        <div style={{ flex: 1, fontSize: 13, color: kidSelected ? 'var(--accent)' : 'var(--text-primary)', fontWeight: kidSelected ? 600 : 400 }}>
                          {kid.label}
                        </div>
                        {kidTotal !== 0 && (
                          <span style={{ fontSize: 12, fontWeight: 600, color: kidTotal < 0 ? 'var(--red)' : 'var(--green)', flexShrink: 0 }}>
                            {kidTotal < 0 ? '-' : '+'}{fmt(kidTotal)}
                          </span>
                        )}
                        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                          <button className="btn-icon" style={{ width: 24, height: 24, padding: 0 }}
                            onClick={e => { e.stopPropagation(); setModal({ mode: 'edit', cat: kid }); }}>
                            <SFIcon name="pencil.svg" size={10} color="currentColor" />
                          </button>
                          <button className="btn-icon" style={{ width: 24, height: 24, padding: 0 }}
                            onClick={e => { e.stopPropagation(); setDelModal(kid); }}>
                            <SFIcon name="trash.svg" size={10} color="currentColor" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add subcategory */}
                  {isOpen && (
                    <div
                      onClick={() => setModal({ mode: 'add', cat: { parent_id: parent.id } })}
                      style={{ padding: '8px 16px 8px 48px', cursor: 'pointer', borderBottom: '1px solid var(--border)', color: 'var(--accent)', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <SFIcon name="plus.svg" size={12} color="var(--accent)" /> Ondercategorie toevoegen
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Detail panel ── */}
        <div>
          {!selected ? (
            <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <SFIcon name="arrow.left.arrow.right.svg" size={40} color="var(--text-muted)" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>Klik op een categorie</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>om uitgaven & transacties te bekijken</div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 'var(--radius)', background: selected.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <SFIcon name={selected.icon} size={26} color={selected.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{selected.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                      {selected.type === 'expense' ? 'Uitgave' : selected.type === 'income' ? 'Inkomst' : 'Beide'} ·{' '}
                      {selected.parent_id
                        ? `Subcategorie van ${categories.find(c => c.id == selected.parent_id)?.label}`
                        : 'Hoofdcategorie'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Totaal (alle tijd)</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: catTotal(selected) < 0 ? 'var(--red)' : 'var(--green)' }}>
                      {catTotal(selected) < 0 ? '-' : '+'}{fmt(catTotal(selected))}
                    </div>
                  </div>
                </div>

                {/* Sub breakdown if parent */}
                {children(selected.id).length > 0 && (
                  <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                    {children(selected.id).map(kid => {
                      const t = spendMap[kid.key] || 0;
                      return (
                        <div key={kid.id}
                          onClick={() => setSelected(kid)}
                          style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', cursor: 'pointer' }}>
                          <div style={{ marginBottom: 4, display: 'flex' }}><SFIcon name={kid.icon} size={18} color={kid.color} /></div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{kid.label}</div>
                          {t !== 0 && <div style={{ fontSize: 12, color: t < 0 ? 'var(--red)' : 'var(--green)', fontWeight: 600, marginTop: 2 }}>
                            {t < 0 ? '-' : '+'}{fmt(t)}
                          </div>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Transactions */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="section-title">Transacties</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedTxs.length} totaal</span>
                </div>
                {selectedTxs.length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                    Geen transacties gevonden
                  </div>
                ) : (
                  <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                    {selectedTxs.map((tx, i) => (
                      <div key={tx.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 20px',
                        borderBottom: i < selectedTxs.length - 1 ? '1px solid var(--border)' : 'none',
                      }}>
                        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: selected.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <SFIcon name={categories.find(c => c.key === tx.category)?.icon || selected.icon} size={16} color={selected.color} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{tx.description}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {tx.date} · {categories.find(c => c.key === tx.category)?.label || tx.category}
                          </div>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: tx.amount >= 0 ? 'var(--green)' : 'var(--red)' }}>
                          {tx.amount >= 0 ? '+' : '-'}{fmt(tx.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <CategoryModal
          cat={modal.mode === 'edit' ? modal.cat : (modal.cat?.parent_id ? { parent_id: modal.cat.parent_id } : null)}
          parentOptions={parentOptions}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {delModal && (
        <DeleteConfirm
          cat={delModal}
          hasChildren={children(delModal.id).length > 0}
          onConfirm={handleDelete}
          onClose={() => setDelModal(null)}
        />
      )}
    </div>
  );
}
