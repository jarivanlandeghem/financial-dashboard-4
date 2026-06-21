import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { store } from '../store/useStore';
import { fmt } from '../utils/calculations';
import SFIcon from '../../components/SFIcon';

export default function SettleUp({ group, debts, onClose }) {
  const [selected, setSelected] = useState(null); // { from, to, amount }
  const [customAmount, setCustomAmount] = useState('');
  const [done, setDone] = useState(false);

  function handleSettle() {
    const target = selected;
    const amount = parseFloat(customAmount) || target.amount;
    if (amount <= 0) return;
    store.addSettlement(group.id, target.from, target.to, amount);
    setDone(true);
    setTimeout(onClose, 1200);
  }

  if (done) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div className="animate-scalein" style={{
          background: 'var(--bg-card)',
          borderRadius: 24, padding: 40,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          margin: 24,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Check size={32} color="#fff" strokeWidth={3} />
          </div>
          <div style={{ fontWeight: 700, fontSize: 20 }}>Settlement recorded!</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 400,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <div
        className="animate-slideup"
        style={{
          width: '100%', maxWidth: 430,
          background: 'var(--bg-card)',
          borderRadius: '24px 24px 0 0',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Settle Up</h2>
            <button onClick={onClose}>
              <X size={24} color="var(--label-secondary)" />
            </button>
          </div>

          {debts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--label-secondary)' }}>
              <div style={{ marginBottom: 12 }}><SFIcon name="sparkle.svg" size={36} color="var(--green)" /></div>
              <div style={{ fontWeight: 600 }}>All settled up!</div>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 13, color: 'var(--label-secondary)', marginBottom: 12, fontWeight: 500 }}>
                SELECT PAYMENT
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {debts.map((d, i) => {
                  const from = group.members.find(m => m.id === d.from);
                  const to = group.members.find(m => m.id === d.to);
                  const isSelected = selected?.from === d.from && selected?.to === d.to;

                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setSelected(d);
                        setCustomAmount(d.amount.toFixed(2));
                      }}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 14,
                        border: `2px solid ${isSelected ? 'var(--blue)' : 'var(--separator-opaque)'}`,
                        background: isSelected ? 'rgba(0,122,255,0.06)' : 'var(--bg-card)',
                        display: 'flex', alignItems: 'center', gap: 10,
                        textAlign: 'left', transition: 'all 0.15s',
                      }}
                    >
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: from?.color, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700,
                      }}>
                        {from?.name[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>{from?.name}</span>
                        <span style={{ color: 'var(--label-secondary)', fontSize: 14 }}> → </span>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>{to?.name}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--red)', fontSize: 17 }}>
                        {fmt(d.amount)}
                      </span>
                      {isSelected && <Check size={16} color="var(--blue)" />}
                    </button>
                  );
                })}
              </div>

              {selected && (
                <div className="card" style={{ marginBottom: 20 }}>
                  <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: 'var(--label-secondary)', fontSize: 15, minWidth: 80 }}>Amount</span>
                    <span style={{ color: 'var(--label-secondary)', fontSize: 20 }}>€</span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={e => setCustomAmount(e.target.value)}
                      style={{ flex: 1, fontSize: 24, fontWeight: 600 }}
                      inputMode="decimal"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {selected && debts.length > 0 && (
          <div style={{ padding: '0 20px 20px' }}>
            <button className="btn-primary" onClick={handleSettle} style={{ width: '100%' }}>
              <Check size={18} />
              Record Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
