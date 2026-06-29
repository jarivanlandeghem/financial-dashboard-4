import { useState } from 'react';
import { useStore, store } from '../store/useStore';
import { calculateBalances, simplifyDebts, fmt, fmtDate, categoryById } from '../utils/calculations';
import { getGroupIconSvg } from '../utils/groupIcons';
import AddExpense from './AddExpense';
import SettleUp from './SettleUp';
import SFIcon from '../../components/SFIcon';

export default function GroupDetail({ groupId, onBack }) {
  const { groups, expenses, settlements } = useStore();
  const group = groups.find(g => g.id === groupId);
  const [showAdd, setShowAdd] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [showSettle, setShowSettle] = useState(false);
  const [showMenu, setShowMenu] = useState(null); // expense id
  const [tab, setTab] = useState('expenses'); // 'expenses' | 'balances'

  if (!group) return null;

  const groupExpenses = expenses.filter(e => e.groupId === groupId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const groupSettlements = settlements.filter(s => s.groupId === groupId);
  const balances = calculateBalances(groupId, expenses, settlements);
  const debts = simplifyDebts(balances);

  const totalSpent = groupExpenses.reduce((s, e) => s + e.amount, 0);

  function getMemberById(id) {
    return group.members.find(m => m.id === id);
  }

  return (
    <div style={{
      flex: 1,
      paddingBottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        background: group.color,
        padding: '16px 20px 0',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={onBack} style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
            <SFIcon name="chevron.left.svg" size={22} color="#fff" />
            <span style={{ fontSize: 17 }}>Groups</span>
          </button>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setShowSettle(true)}
              data-squircle-r={20}
              style={{
                background: 'rgba(255,255,255,0.25)', color: '#fff',
                padding: '6px 14px', fontSize: 14, fontWeight: 600,
              }}
            >
              Settle up
            </button>
            <button
              onClick={() => setShowAdd(true)}
              style={{
                background: 'rgba(255,255,255,0.25)',
                width: 34, height: 34, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <SFIcon name="plus.svg" size={18} color="#fff" />
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 8, display: 'flex' }}>
            <SFIcon name={getGroupIconSvg(group.iconId)} size={40} color="white" />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: -0.5, marginBottom: 4 }}>
            {group.name}
          </h2>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, display: 'flex', gap: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><SFIcon name="person.2.svg" size={12} color="rgba(255,255,255,0.75)" />{group.members.length} people</span>
            <span>€{totalSpent.toFixed(2)} total</span>
          </div>
        </div>

        {/* Member avatars */}
        <div style={{ display: 'flex', gap: -4, marginBottom: 20 }}>
          {group.members.map((m, i) => (
            <div key={m.id} style={{
              width: 32, height: 32, borderRadius: '50%',
              background: m.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff',
              border: '2px solid ' + group.color,
              marginLeft: i > 0 ? -8 : 0,
              zIndex: group.members.length - i,
            }}>
              {m.name[0].toUpperCase()}
            </div>
          ))}
          <div style={{
            fontSize: 12, color: 'rgba(255,255,255,0.8)',
            marginLeft: 12, display: 'flex', alignItems: 'center',
          }}>
            {group.members.map(m => m.name).join(', ')}
          </div>
        </div>

        {/* Tabs */}
        <div data-squircle-r={12} style={{ display: 'flex', background: 'rgba(0,0,0,0.15)', padding: 3, marginBottom: -1 }}>
          {['expenses', 'balances'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              data-squircle-r={8}
              style={{
                flex: 1, padding: '6px 0',
                background: tab === t ? 'rgba(255,255,255,0.95)' : 'transparent',
                color: tab === t ? group.color : 'rgba(255,255,255,0.75)',
                fontWeight: 600, fontSize: 14,
                textTransform: 'capitalize',
                transition: 'all 0.2s',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        {tab === 'expenses' ? (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {groupExpenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--label-secondary)' }}>
                <div style={{ marginBottom: 12 }}><SFIcon name="banknote.svg" size={40} color="var(--label-secondary)" /></div>
                <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>No expenses yet</div>
                <div style={{ fontSize: 14 }}>Tap + to add the first expense</div>
              </div>
            ) : (
              groupExpenses.map((exp, i) => {
                const payer = getMemberById(exp.paidBy);
                const cat = categoryById(exp.category);
                return (
                  <div key={exp.id} className="card animate-fadein" style={{ animationDelay: `${i * 30}ms` }}>
                    <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div data-squircle-r={16} style={{
                        width: 44, height: 44,
                        background: 'var(--fill)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <SFIcon name={cat.icon} size={22} color="var(--label-secondary)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 2 }}>
                          {exp.description}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--label-secondary)' }}>
                          {payer?.name} paid · {fmtDate(exp.date)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--label)' }}>
                            {fmt(exp.amount)}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--label-tertiary)' }}>
                            {fmt(exp.amount / group.members.length)}/person
                          </div>
                        </div>
                        <button
                          onClick={() => setShowMenu(showMenu === exp.id ? null : exp.id)}
                          style={{ padding: 4 }}
                        >
                          <SFIcon name="ellipsis.svg" size={18} color="var(--label-tertiary)" />
                        </button>
                      </div>
                    </div>

                    {showMenu === exp.id && (
                      <div style={{
                        borderTop: '0.5px solid var(--separator)',
                        display: 'flex',
                      }}>
                        <button
                          onClick={() => { setEditExpense(exp); setShowMenu(null); setShowAdd(true); }}
                          style={{
                            flex: 1, padding: '12px 0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            color: 'var(--blue)', fontSize: 15, fontWeight: 500,
                            borderRight: '0.5px solid var(--separator)',
                          }}
                        >
                          <SFIcon name="pencil.svg" size={15} color="var(--blue)" /> Edit
                        </button>
                        <button
                          onClick={() => { store.deleteExpense(exp.id); setShowMenu(null); }}
                          style={{
                            flex: 1, padding: '12px 0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            color: 'var(--red)', fontSize: 15, fontWeight: 500,
                          }}
                        >
                          <SFIcon name="trash.svg" size={15} color="var(--red)" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div style={{ padding: '16px 20px' }}>
            {debts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--label-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <SFIcon name="sparkle.svg" size={40} color="var(--green)" />
                </div>
                <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>All settled up!</div>
                <div style={{ fontSize: 14 }}>No outstanding balances</div>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 13, color: 'var(--label-secondary)', marginBottom: 12, fontWeight: 500 }}>
                  SUGGESTED PAYMENTS
                </p>
                {debts.map((d, i) => {
                  const from = getMemberById(d.from);
                  const to = getMemberById(d.to);
                  return (
                    <div key={i} className="card" style={{ marginBottom: 10, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: from?.color, color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 15, fontWeight: 700, flexShrink: 0,
                        }}>
                          {from?.name[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 600 }}>{from?.name}</span>
                          <span style={{ color: 'var(--label-secondary)' }}> owes </span>
                          <span style={{ fontWeight: 600 }}>{to?.name}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--red)' }}>
                          {fmt(d.amount)}
                        </div>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: to?.color, color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 15, fontWeight: 700, flexShrink: 0,
                        }}>
                          {to?.name[0].toUpperCase()}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <p style={{ fontSize: 13, color: 'var(--label-secondary)', margin: '20px 0 12px', fontWeight: 500 }}>
                  INDIVIDUAL BALANCES
                </p>
                {group.members.map(m => {
                  const balance = balances[m.id] || 0;
                  return (
                    <div key={m.id} className="card" style={{ marginBottom: 8, padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: m.color, color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 15, fontWeight: 700,
                        }}>
                          {m.name[0].toUpperCase()}
                        </div>
                        <span style={{ flex: 1, fontWeight: 500 }}>{m.name}</span>
                        <span style={{
                          fontWeight: 700, fontSize: 16,
                          color: balance > 0.005 ? 'var(--green)' : balance < -0.005 ? 'var(--red)' : 'var(--label-secondary)',
                        }}>
                          {balance > 0.005 ? '+' : ''}{fmt(balance)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Settlements history */}
            {groupSettlements.length > 0 && (
              <>
                <p style={{ fontSize: 13, color: 'var(--label-secondary)', margin: '20px 0 12px', fontWeight: 500 }}>
                  SETTLEMENT HISTORY
                </p>
                {groupSettlements.map(s => {
                  const from = getMemberById(s.fromId);
                  const to = getMemberById(s.toId);
                  return (
                    <div key={s.id} className="card" style={{ marginBottom: 8 }}>
                      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <SFIcon name="banknote.svg" size={20} color="var(--green)" />
                        <div style={{ flex: 1, fontSize: 14, color: 'var(--label-secondary)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--label)' }}>{from?.name}</span>
                          {' paid '}
                          <span style={{ fontWeight: 600, color: 'var(--label)' }}>{to?.name}</span>
                          <div style={{ fontSize: 12, marginTop: 2 }}>{fmtDate(s.date)}</div>
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--green)' }}>{fmt(s.amount)}</span>
                        <button
                          onClick={() => store.deleteSettlement(s.id)}
                          style={{ padding: 4 }}
                        >
                          <SFIcon name="trash.svg" size={15} color="var(--label-tertiary)" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      {showAdd && (
        <AddExpense
          group={group}
          editExpense={editExpense}
          onClose={() => { setShowAdd(false); setEditExpense(null); }}
        />
      )}

      {showSettle && (
        <SettleUp
          group={group}
          debts={debts}
          onClose={() => setShowSettle(false)}
        />
      )}
    </div>
  );
}
