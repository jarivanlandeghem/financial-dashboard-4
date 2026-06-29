import { useStore } from '../store/useStore';
import { categoryById, fmt, fmtDate } from '../utils/calculations';
import SFIcon from '../../components/SFIcon';

export default function Activity() {
  const { groups, expenses, settlements } = useStore();

  const allItems = [
    ...expenses.map(e => ({ ...e, type: 'expense' })),
    ...settlements.map(s => ({ ...s, type: 'settlement' })),
  ].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

  function getGroup(id) { return groups.find(g => g.id === id); }
  function getMember(groupId, memberId) {
    return getGroup(groupId)?.members.find(m => m.id === memberId);
  }

  const grouped = {};
  allItems.forEach(item => {
    const label = fmtDate(item.createdAt || item.date);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(item);
  });

  return (
    <div style={{ flex: 1 }}>
      <div style={{ padding: '28px 24px 0', marginBottom: 8 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, color: 'var(--label)', margin: 0 }}>
          Activity
        </h1>
      </div>

      <div style={{ padding: '12px 24px' }}>
        {allItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--label-secondary)' }}>
            <div data-squircle-r={20} style={{
              width: 56, height: 56,
              background: 'var(--fill)', margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <SFIcon name="list.clipboard.svg" size={26} color="var(--label-tertiary)" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No activity yet</div>
            <div style={{ fontSize: 14 }}>Add expenses to a group to see activity here.</div>
          </div>
        ) : (
          Object.entries(grouped).map(([label, items]) => (
            <div key={label}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: 'var(--label-secondary)',
                padding: '8px 4px', letterSpacing: 0.5, textTransform: 'uppercase',
              }}>
                {label}
              </div>
              <div className="card" style={{ marginBottom: 12 }}>
                {items.map((item, i) => {
                  const group = getGroup(item.groupId);
                  if (!group) return null;
                  const isLast = i === items.length - 1;

                  if (item.type === 'expense') {
                    const cat = categoryById(item.category);
                    const payer = getMember(item.groupId, item.paidBy);
                    return (
                      <div key={item.id} style={{
                        padding: '13px 16px',
                        display: 'flex', alignItems: 'center', gap: 12,
                        borderBottom: isLast ? 'none' : '0.5px solid var(--separator)',
                      }}>
                        <div data-squircle-r={16} style={{
                          width: 40, height: 40,
                          background: 'var(--fill)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <SFIcon name={cat.icon || 'creditcard.svg'} size={18} color="var(--label-secondary)" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>{item.description}</div>
                          <div style={{ fontSize: 12, color: 'var(--label-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{
                              width: 8, height: 8, borderRadius: '50%',
                              background: group.color, flexShrink: 0,
                            }} />
                            {group.name} · {payer?.name}
                          </div>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{fmt(item.amount)}</span>
                      </div>
                    );
                  }

                  if (item.type === 'settlement') {
                    const from = getMember(item.groupId, item.fromId);
                    const to = getMember(item.groupId, item.toId);
                    return (
                      <div key={item.id} style={{
                        padding: '13px 16px',
                        display: 'flex', alignItems: 'center', gap: 12,
                        borderBottom: isLast ? 'none' : '0.5px solid var(--separator)',
                      }}>
                        <div data-squircle-r={16} style={{
                          width: 40, height: 40,
                          background: 'rgba(52,199,89,0.12)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <SFIcon name="arrow.left.arrow.right.svg" size={17} color="var(--green)" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>
                            {from?.name} → {to?.name}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--label-secondary)' }}>
                            {group.name} · Settlement
                          </div>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--green)' }}>
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
