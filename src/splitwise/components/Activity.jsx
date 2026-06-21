import { useStore } from '../store/useStore';
import { categoryById, fmt, fmtDate } from '../utils/calculations';

export default function Activity() {
  const { groups, expenses, settlements } = useStore();

  const allItems = [
    ...expenses.map(e => ({ ...e, type: 'expense' })),
    ...settlements.map(s => ({ ...s, type: 'settlement' })),
  ].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

  function getGroup(id) {
    return groups.find(g => g.id === id);
  }

  function getMember(groupId, memberId) {
    const g = getGroup(groupId);
    return g?.members.find(m => m.id === memberId);
  }

  // Group by date label
  const grouped = {};
  allItems.forEach(item => {
    const label = fmtDate(item.createdAt || item.date);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(item);
  });

  return (
    <div style={{ flex: 1, paddingBottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))' }}>
      <div style={{
        padding: '20px 20px 0',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 60px)',
        marginBottom: 8,
      }}>
        <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>Activity</h1>
      </div>

      <div style={{ padding: '12px 20px' }}>
        {allItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--label-secondary)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>No activity yet</div>
            <div style={{ fontSize: 14 }}>Add expenses to a group to see activity here.</div>
          </div>
        ) : (
          Object.entries(grouped).map(([label, items]) => (
            <div key={label}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: 'var(--label-secondary)',
                padding: '8px 4px', letterSpacing: 0.3,
              }}>
                {label.toUpperCase()}
              </div>
              <div className="card" style={{ marginBottom: 12 }}>
                {items.map((item, i) => {
                  const group = getGroup(item.groupId);
                  if (!group) return null;

                  if (item.type === 'expense') {
                    const cat = categoryById(item.category);
                    const payer = getMember(item.groupId, item.paidBy);
                    return (
                      <div key={item.id} style={{
                        padding: '14px 16px',
                        display: 'flex', alignItems: 'center', gap: 12,
                        borderBottom: i < items.length - 1 ? '0.5px solid var(--separator)' : 'none',
                      }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 14,
                          background: 'var(--fill)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 22, flexShrink: 0,
                        }}>
                          {cat.emoji}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 16 }}>{item.description}</div>
                          <div style={{ fontSize: 13, color: 'var(--label-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{
                              width: 14, height: 14, borderRadius: '50%',
                              background: group.color,
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 8,
                            }}>
                              {group.emoji}
                            </div>
                            {group.name} · {payer?.name}
                          </div>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 17 }}>{fmt(item.amount)}</span>
                      </div>
                    );
                  }

                  if (item.type === 'settlement') {
                    const from = getMember(item.groupId, item.fromId);
                    const to = getMember(item.groupId, item.toId);
                    return (
                      <div key={item.id} style={{
                        padding: '14px 16px',
                        display: 'flex', alignItems: 'center', gap: 12,
                        borderBottom: i < items.length - 1 ? '0.5px solid var(--separator)' : 'none',
                      }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 14,
                          background: 'rgba(52,199,89,0.12)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 22, flexShrink: 0,
                        }}>
                          💸
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>
                            {from?.name} paid {to?.name}
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--label-secondary)' }}>
                            {group.name} · Settlement
                          </div>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--green)' }}>
                          {fmt(item.amount)}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
