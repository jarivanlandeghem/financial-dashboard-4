import { useStore } from '../store/useStore';
import { calculateBalances, simplifyDebts, fmt } from '../utils/calculations';
import { getGroupIconSvg } from '../utils/groupIcons';
import SFIcon from '../../components/SFIcon';

export default function AllBalances() {
  const { groups, expenses, settlements } = useStore();

  const allDebts = [];
  groups.forEach(group => {
    const balances = calculateBalances(group.id, expenses, settlements);
    const debts = simplifyDebts(balances);
    debts.forEach(d => {
      const from = group.members.find(m => m.id === d.from);
      const to = group.members.find(m => m.id === d.to);
      allDebts.push({ ...d, group, from, to });
    });
  });

  const totalOwed = allDebts.reduce((s, d) => s + d.amount, 0);

  return (
    <div style={{ flex: 1, paddingBottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))' }}>
      <div style={{
        padding: '20px 20px 0',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 60px)',
        marginBottom: 8,
      }}>
        <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>Balances</h1>
      </div>

      <div style={{ padding: '12px 20px' }}>
        {/* Summary card */}
        {allDebts.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, var(--blue), var(--indigo))',
            borderRadius: 'var(--radius-widget)', padding: '20px 20px', marginBottom: 20,
            boxShadow: '0 8px 24px rgba(0,122,255,0.3)',
          }}>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>
              TOTAL OUTSTANDING
            </div>
            <div style={{ color: '#fff', fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>
              {fmt(totalOwed)}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>
              across {allDebts.length} payment{allDebts.length !== 1 ? 's' : ''} · {groups.length} group{groups.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {allDebts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--label-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <SFIcon name="sparkle.svg" size={48} color="var(--green)" />
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>All settled up!</div>
            <div style={{ fontSize: 14 }}>No outstanding balances across all groups.</div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: 'var(--label-secondary)', marginBottom: 12, fontWeight: 500 }}>
              ALL OUTSTANDING PAYMENTS
            </p>
            {groups.map(group => {
              const groupDebts = allDebts.filter(d => d.group.id === group.id);
              if (groupDebts.length === 0) return null;

              return (
                <div key={group.id} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 'var(--shape-sm)',
                      background: group.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <SFIcon name={getGroupIconSvg(group.iconId)} size={13} color="white" />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--label-secondary)' }}>
                      {group.name}
                    </span>
                  </div>
                  <div className="card">
                    {groupDebts.map((d, i) => (
                      <div key={i} style={{
                        padding: '14px 16px',
                        display: 'flex', alignItems: 'center', gap: 10,
                        borderBottom: i < groupDebts.length - 1 ? '0.5px solid var(--separator)' : 'none',
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: d.from?.color, color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700, flexShrink: 0,
                        }}>
                          {d.from?.name[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 600 }}>{d.from?.name}</span>
                          <span style={{ color: 'var(--label-secondary)', fontSize: 14 }}> owes </span>
                          <span style={{ fontWeight: 600 }}>{d.to?.name}</span>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--red)' }}>
                          {fmt(d.amount)}
                        </span>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: d.to?.color, color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700, flexShrink: 0,
                        }}>
                          {d.to?.name[0].toUpperCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
