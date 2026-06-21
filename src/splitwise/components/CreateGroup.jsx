import { useState } from 'react';
import { X, Plus, Trash2, ChevronLeft } from 'lucide-react';
import { store } from '../store/useStore';
import { GROUP_COLORS, GROUP_EMOJIS } from '../utils/calculations';

export default function CreateGroup({ onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🏠');
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
    const id = store.createGroup(name.trim(), emoji, color, validMembers);
    onCreated(id);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      maxWidth: 430, margin: '0 auto',
    }} className="animate-slideup">
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        borderBottom: '0.5px solid var(--separator)',
        background: 'rgba(var(--bg-card), 0.9)',
      }}>
        <button onClick={onClose} style={{ color: 'var(--blue)', fontSize: 17, width: 44 }}>
          Cancel
        </button>
        <span style={{ fontWeight: 600, fontSize: 17 }}>New Group</span>
        <button
          onClick={step === 1 ? () => setStep(2) : handleCreate}
          style={{
            color: (step === 1 ? name.trim() : members.filter(m => m.trim()).length >= 2)
              ? 'var(--blue)' : 'var(--label-tertiary)',
            fontSize: 17, fontWeight: 600, width: 44, textAlign: 'right',
          }}
          disabled={step === 1 ? !name.trim() : members.filter(m => m.trim()).length < 2}
        >
          {step === 1 ? 'Next' : 'Done'}
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 20px' }}>
        {step === 1 ? (
          <>
            {/* Emoji + Color picker */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <div style={{
                width: 80, height: 80, borderRadius: 24,
                background: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, boxShadow: `0 8px 24px ${color}50`,
                transition: 'background 0.2s, box-shadow 0.2s',
              }}>
                {emoji}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                {GROUP_EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: emoji === e ? 'var(--fill)' : 'transparent',
                      fontSize: 22,
                      border: emoji === e ? `2px solid ${color}` : '2px solid transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                {GROUP_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: c,
                      border: color === c ? `3px solid ${c}` : '3px solid transparent',
                      outline: color === c ? '2px solid var(--label)' : 'none',
                      outlineOffset: 2,
                      transition: 'all 0.15s',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Group name */}
            <div className="card" style={{ padding: 0, marginBottom: 24 }}>
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'var(--label-secondary)', fontSize: 15, minWidth: 80 }}>Name</span>
                <input
                  autoFocus
                  placeholder="Trip to Amsterdam..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ flex: 1, fontSize: 17 }}
                  maxLength={50}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <p style={{ color: 'var(--label-secondary)', fontSize: 15, marginBottom: 16 }}>
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
                    width: 32, height: 32, borderRadius: '50%',
                    background: color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 14, fontWeight: 600, flexShrink: 0,
                  }}>
                    {m.trim() ? m.trim()[0].toUpperCase() : '?'}
                  </div>
                  <input
                    placeholder={`Person ${i + 1}`}
                    value={m}
                    onChange={e => setMembers(ms => ms.map((mm, ii) => ii === i ? e.target.value : mm))}
                    style={{ flex: 1, fontSize: 17 }}
                  />
                  {members.length > 2 && (
                    <button onClick={() => removeMember(i)}>
                      <Trash2 size={18} color="var(--red)" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--fill)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Plus size={16} color="var(--blue)" />
                </div>
                <input
                  placeholder="Add person..."
                  value={newMember}
                  onChange={e => setNewMember(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addMember()}
                  style={{ flex: 1, fontSize: 17, color: 'var(--blue)' }}
                />
                {newMember.trim() && (
                  <button onClick={addMember} style={{ color: 'var(--blue)', fontSize: 15, fontWeight: 600 }}>
                    Add
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
