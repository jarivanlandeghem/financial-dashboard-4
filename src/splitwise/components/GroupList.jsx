import { useState } from 'react';
import { Plus, ChevronRight, Users } from 'lucide-react';
import { useStore } from '../store/useStore';
import { calculateBalances, simplifyDebts, fmt } from '../utils/calculations';
import CreateGroup from './CreateGroup';

export default function GroupList({ onSelectGroup }) {
  const { groups, expenses, settlements } = useStore();
  const [showCreate, setShowCreate] = useState(false);

  function getGroupSummary(group) {
    const balances = calculateBalances(group.id, expenses, settlements);
    const debts = simplifyDebts(balances);
    const totalOwed = Object.values(balances).filter(b => b > 0.005).reduce((s, b) => s + b, 0);
    return { debts: debts.length, totalOwed };
  }

  return (
    <div style={{ flex: 1, paddingBottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))' }}>
      {/* Header */}
      <div style={{
        padding: '20px 20px 0',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 60px)',
        marginBottom: 8,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5, color: 'var(--label)' }}>
            Groups
          </h1>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--fill)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 4,
            }}
          >
            <Plus size={18} color="var(--blue)" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {groups.length === 0 ? (
          <EmptyState onAdd={() => setShowCreate(true)} />
        ) : (
          groups.map((group, i) => {
            const { debts, totalOwed } = getGroupSummary(group);
            return (
              <button
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                className="card animate-slideinright"
                style={{
                  width: '100%', textAlign: 'left',
                  padding: 0,
                  animationDelay: `${i * 40}ms`,
                }}
              >
                <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 16,
                    background: group.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, flexShrink: 0,
                    boxShadow: `0 4px 12px ${group.color}40`,
                  }}>
                    {group.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 2 }}>
                      {group.name}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--label-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users size={12} />
                      <span>{group.members.length} people</span>
                      {debts > 0 && (
                        <>
                          <span>·</span>
                          <span style={{ color: 'var(--orange)' }}>
                            {debts} unsettled
                          </span>
                        </>
                      )}
                      {debts === 0 && expenses.some(e => e.groupId === group.id) && (
                        <>
                          <span>·</span>
                          <span style={{ color: 'var(--green)' }}>All settled up</span>
                        </>
                      )}
                    </div>
                  </div>
                  {totalOwed > 0.005 && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--orange)' }}>
                        {fmt(totalOwed)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--label-tertiary)' }}>outstanding</div>
                    </div>
                  )}
                  <ChevronRight size={18} color="var(--label-tertiary)" />
                </div>
              </button>
            );
          })
        )}
      </div>

      {showCreate && (
        <CreateGroup
          onClose={() => setShowCreate(false)}
          onCreated={(id) => { setShowCreate(false); onSelectGroup(id); }}
        />
      )}
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 24px', gap: 16, textAlign: 'center',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 22,
        background: 'linear-gradient(135deg, #007AFF, #5856D6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36,
        boxShadow: '0 8px 24px rgba(0,122,255,0.35)',
      }}>
        🏠
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 8 }}>No groups yet</div>
        <div style={{ color: 'var(--label-secondary)', fontSize: 15, lineHeight: 1.5 }}>
          Create a group to start tracking shared expenses with friends.
        </div>
      </div>
      <button className="btn-primary" onClick={onAdd} style={{ marginTop: 8 }}>
        <Plus size={18} />
        New Group
      </button>
    </div>
  );
}
