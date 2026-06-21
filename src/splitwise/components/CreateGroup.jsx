import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { store } from '../store/useStore';
import { GROUP_COLORS } from '../utils/calculations';
import { GROUP_ICONS, getGroupIcon } from '../utils/groupIcons';

const SW = 1.5;

export default function CreateGroup({ onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [iconId, setIconId] = useState('home');
  const [color, setColor] = useState('#007AFF');
  const [members, setMembers] = useState(['', '']);
  const [newMember, setNewMember] = useState('');

  function addMember() {
    if (newMember.trim()) {
      setMembers(m => [...m, newMember.trim()]);
      setNewMember('');
    }
  }

  function removeMember(i) {
    setMembers(m => m.filter((_, idx) => idx !== i));
  }

  function handleCreate() {
    const validMembers = members.filter(m => m.trim());
    if (!name.trim() || validMembers.length < 2) return;
    const id = store.createGroup(name.trim(), iconId, color, validMembers);
    onCreated(id);
  }

  const SelectedIcon = getGroupIcon(iconId);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)',
    }} onClick={onClose} className="animate-fadein">
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        width: 'min(520px, 92vw)',
        maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }} onClick={e => e.stopPropagation()} className="animate-scalein">

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '0.5px solid var(--separator)',
        }}>
          <button onClick={onClose} style={{ color: 'var(--blue)', fontSize: 15, width: 60 }}>
            Cancel
          </button>
          <span style={{ fontWeight: 600, fontSize: 16 }}>New Group</span>
          <button
            onClick={step === 1 ? () => setStep(2) : handleCreate}
            style={{
              color: (step === 1 ? name.trim() : members.filter(m => m.trim()).length >= 2)
                ? 'var(--blue)' : 'var(--label-tertiary)',
              fontSize: 15, fontWeight: 600, width: 60, textAlign: 'right',
            }}
            disabled={step === 1 ? !name.trim() : members.filter(m => m.trim()).length < 2}
          >
            {step === 1 ? 'Next' : 'Done'}
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '24px 20px' }}>
          {step === 1 ? (
            <>
              {/* Preview icon */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, marginBottom: 28 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 22,
                  background: color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 6px 20px ${color}50`,
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}>
                  <SelectedIcon size={32} strokeWidth={1.5} color="white" />
                </div>

                {/* Icon picker */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--label-secondary)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10, textAlign: 'center' }}>
                    Icon
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 340 }}>
                    {GROUP_ICONS.map(({ id, Icon, label }) => (
                      <button
                        key={id}
                        onClick={() => setIconId(id)}
                        title={label}
                        style={{
                          width: 40, height: 40, borderRadius: 11,
                          background: iconId === id ? color + '20' : 'var(--fill-secondary)',
                          border: iconId === id ? `2px solid ${color}` : '2px solid transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.12s',
                          cursor: 'pointer',
                        }}
                      >
                        <Icon size={18} strokeWidth={SW} color={iconId === id ? color : 'var(--label-secondary)'} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color picker */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--label-secondary)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10, textAlign: 'center' }}>
                    Kleur
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {GROUP_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: c,
                          border: color === c ? `3px solid ${c}` : '3px solid transparent',
                          outline: color === c ? '2px solid var(--label)' : 'none',
                          outlineOffset: 2,
                          transition: 'all 0.15s', cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Group name */}
              <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'var(--label-secondary)', fontSize: 14, minWidth: 60 }}>Name</span>
                  <input
                    autoFocus
                    placeholder="Trip to Amsterdam..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ flex: 1, fontSize: 15 }}
                    maxLength={50}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <p style={{ color: 'var(--label-secondary)', fontSize: 14, marginBottom: 16 }}>
                Add people to <strong style={{ color: 'var(--label)' }}>{name}</strong>
              </p>

              <div className="card" style={{ marginBottom: 16 }}>
                {members.map((m, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px',
                    borderBottom: i < members.length - 1 ? '0.5px solid var(--separator)' : 'none',
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 13, fontWeight: 600, flexShrink: 0,
                    }}>
                      {m.trim() ? m.trim()[0].toUpperCase() : '?'}
                    </div>
                    <input
                      placeholder={`Person ${i + 1}`}
                      value={m}
                      onChange={e => setMembers(ms => ms.map((mm, ii) => ii === i ? e.target.value : mm))}
                      style={{ flex: 1, fontSize: 15 }}
                    />
                    {members.length > 2 && (
                      <button onClick={() => removeMember(i)}>
                        <Trash2 size={16} color="var(--red)" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'var(--fill)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Plus size={14} color="var(--blue)" />
                  </div>
                  <input
                    placeholder="Add person..."
                    value={newMember}
                    onChange={e => setNewMember(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addMember()}
                    style={{ flex: 1, fontSize: 15, color: 'var(--blue)' }}
                  />
                  {newMember.trim() && (
                    <button onClick={addMember} style={{ color: 'var(--blue)', fontSize: 14, fontWeight: 600 }}>
                      Add
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
