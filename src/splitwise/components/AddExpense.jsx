import { useState, useEffect } from 'react';
import { store } from '../store/useStore';
import { splitEqually, splitByPercentage, CATEGORIES, categoryById } from '../utils/calculations';
import SFIcon from '../../components/SFIcon';

const SPLIT_TYPES = [
  { id: 'equal', label: 'Equally' },
  { id: 'exact', label: 'Exact amounts' },
  { id: 'percentage', label: 'Percentages' },
  { id: 'shares', label: 'Shares' },
];

export default function AddExpense({ group, onClose, editExpense }) {
  const [description, setDescription] = useState(editExpense?.description || '');
  const [amount, setAmount] = useState(editExpense?.amount?.toString() || '');
  const [paidBy, setPaidBy] = useState(editExpense?.paidBy || group.members[0]?.id || '');
  const [splitType, setSplitType] = useState(editExpense?.splitType || 'equal');
  const [category, setCategory] = useState(editExpense?.category || 'general');
  const [date, setDate] = useState(editExpense?.date ? editExpense.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showPaidBy, setShowPaidBy] = useState(false);
  const [showSplitType, setShowSplitType] = useState(false);

  const [exactAmounts, setExactAmounts] = useState({});
  const [percentages, setPercentages] = useState({});
  const [shares, setShares] = useState({});
  const [includedMembers, setIncludedMembers] = useState(
    new Set(group.members.map(m => m.id))
  );

  const numAmount = parseFloat(amount) || 0;
  const cat = categoryById(category);
  const payer = group.members.find(m => m.id === paidBy);

  // Init per-member split values
  useEffect(() => {
    const ea = {};
    const pct = {};
    const sh = {};
    const n = group.members.length;
    group.members.forEach(m => {
      ea[m.id] = (numAmount / n).toFixed(2);
      pct[m.id] = (100 / n).toFixed(1);
      sh[m.id] = '1';
    });
    setExactAmounts(ea);
    setPercentages(pct);
    setShares(sh);
  }, [group.members]);

  function computeSplits() {
    const included = group.members.filter(m => includedMembers.has(m.id)).map(m => m.id);
    if (splitType === 'equal') {
      return splitEqually(numAmount, included);
    }
    if (splitType === 'exact') {
      return included.map(id => ({ memberId: id, amount: parseFloat(exactAmounts[id]) || 0 }));
    }
    if (splitType === 'percentage') {
      return included.map(id => ({
        memberId: id,
        amount: Math.round(numAmount * (parseFloat(percentages[id]) || 0) / 100 * 100) / 100,
      }));
    }
    if (splitType === 'shares') {
      const totalShares = included.reduce((s, id) => s + (parseInt(shares[id]) || 0), 0);
      return included.map(id => ({
        memberId: id,
        amount: totalShares > 0 ? Math.round(numAmount * (parseInt(shares[id]) || 0) / totalShares * 100) / 100 : 0,
      }));
    }
    return [];
  }

  function getSplitTotal() {
    return computeSplits().reduce((s, sp) => s + sp.amount, 0);
  }

  function handleSave() {
    if (!description.trim() || numAmount <= 0 || !paidBy) return;
    const splits = computeSplits();

    if (editExpense) {
      store.deleteExpense(editExpense.id);
    }

    store.addExpense(group.id, {
      description: description.trim(),
      amount: numAmount,
      paidBy,
      splitType,
      splits,
      category,
      date: new Date(date).toISOString(),
    });
    onClose();
  }

  const splitTotal = getSplitTotal();
  const splitDiff = Math.abs(splitTotal - numAmount);
  const splitValid = splitDiff < 0.02;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
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
      }}>
        <button onClick={onClose} style={{ color: 'var(--red)', fontSize: 17 }}>
          Cancel
        </button>
        <span style={{ fontWeight: 600, fontSize: 17 }}>
          {editExpense ? 'Edit Expense' : 'Add Expense'}
        </span>
        <button
          onClick={handleSave}
          disabled={!description.trim() || numAmount <= 0 || !splitValid}
          style={{
            color: description.trim() && numAmount > 0 && splitValid ? 'var(--blue)' : 'var(--label-tertiary)',
            fontSize: 17, fontWeight: 600,
          }}
        >
          {editExpense ? 'Update' : 'Add'}
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        {/* Amount + Description */}
        <div className="card" style={{ marginBottom: 16 }}>
          {/* Category + Amount */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 0,
            borderBottom: '0.5px solid var(--separator)',
          }}>
            <button
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
              style={{
                padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 8,
                borderRight: '0.5px solid var(--separator)',
                flexShrink: 0,
              }}
            >
              <SFIcon name={cat.icon} size={22} color="var(--label-secondary)" />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '0 12px' }}>
              <span style={{ color: 'var(--label-secondary)', fontSize: 20, marginRight: 4 }}>€</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                style={{ flex: 1, fontSize: 28, fontWeight: 600, letterSpacing: -0.5 }}
                inputMode="decimal"
              />
            </div>
          </div>

          {/* Category picker */}
          {showCategoryPicker && (
            <div style={{
              padding: 12,
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
              borderBottom: '0.5px solid var(--separator)',
            }}>
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setCategory(c.id); setShowCategoryPicker(false); }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '8px 4px', borderRadius: 'var(--shape-md)',
                    background: category === c.id ? 'var(--fill)' : 'transparent',
                    border: category === c.id ? '1.5px solid var(--blue)' : '1.5px solid transparent',
                  }}
                >
                  <SFIcon name={c.icon} size={22} color={category === c.id ? 'var(--blue)' : 'var(--label-secondary)'} />
                  <span style={{ fontSize: 10, color: 'var(--label-secondary)' }}>{c.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <div style={{ padding: '12px 16px' }}>
            <input
              placeholder="What's this for?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ width: '100%', fontSize: 17 }}
            />
          </div>

          {/* Date */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderTop: '0.5px solid var(--separator)',
          }}>
            <span style={{ color: 'var(--label-secondary)', fontSize: 15, minWidth: 48 }}>Date</span>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ flex: 1, fontSize: 15, color: 'var(--label)' }}
            />
          </div>
        </div>

        {/* Paid by */}
        <div className="card" style={{ marginBottom: 16 }}>
          <button
            onClick={() => setShowPaidBy(!showPaidBy)}
            style={{
              width: '100%', padding: '14px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <span style={{ color: 'var(--label-secondary)', fontSize: 15 }}>Paid by</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {payer && (
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: payer.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff',
                }}>
                  {payer.name[0].toUpperCase()}
                </div>
              )}
              <span style={{ fontWeight: 600 }}>{payer?.name || 'Select'}</span>
              <SFIcon name="chevron.down.svg" size={16} color="var(--label-tertiary)" />
            </div>
          </button>
          {showPaidBy && (
            <div style={{ borderTop: '0.5px solid var(--separator)' }}>
              {group.members.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setPaidBy(m.id); setShowPaidBy(false); }}
                  style={{
                    width: '100%', padding: '12px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    borderBottom: '0.5px solid var(--separator)',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: m.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: '#fff',
                  }}>
                    {m.name[0].toUpperCase()}
                  </div>
                  <span style={{ flex: 1, textAlign: 'left', fontSize: 17 }}>{m.name}</span>
                  {paidBy === m.id && <SFIcon name="checkmark.svg" size={18} color="var(--blue)" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Split type */}
        <div className="card" style={{ marginBottom: 16 }}>
          <button
            onClick={() => setShowSplitType(!showSplitType)}
            style={{
              width: '100%', padding: '14px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: showSplitType ? '0.5px solid var(--separator)' : 'none',
            }}
          >
            <span style={{ color: 'var(--label-secondary)', fontSize: 15 }}>Split</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 600 }}>{SPLIT_TYPES.find(s => s.id === splitType)?.label}</span>
              <SFIcon name="chevron.down.svg" size={16} color="var(--label-tertiary)" />
            </div>
          </button>

          {showSplitType && (
            <div>
              {SPLIT_TYPES.map((st, i) => (
                <button
                  key={st.id}
                  onClick={() => { setSplitType(st.id); setShowSplitType(false); }}
                  style={{
                    width: '100%', padding: '12px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: i < SPLIT_TYPES.length - 1 ? '0.5px solid var(--separator)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 17 }}>{st.label}</span>
                  {splitType === st.id && <SFIcon name="checkmark.svg" size={18} color="var(--blue)" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Per-member splits */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ padding: '12px 16px', borderBottom: '0.5px solid var(--separator)' }}>
            <span style={{ fontSize: 13, color: 'var(--label-secondary)', fontWeight: 500 }}>
              SPLIT DETAILS
            </span>
          </div>

          {group.members.map((m, i) => {
            const included = includedMembers.has(m.id);
            const splitAmt = computeSplits().find(s => s.memberId === m.id)?.amount || 0;

            return (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px',
                borderBottom: i < group.members.length - 1 ? '0.5px solid var(--separator)' : 'none',
                opacity: included ? 1 : 0.4,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: m.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {m.name[0].toUpperCase()}
                </div>
                <span style={{ flex: 1, fontSize: 16 }}>{m.name}</span>

                {splitType === 'equal' && (
                  <button
                    onClick={() => {
                      const next = new Set(includedMembers);
                      if (next.has(m.id)) { if (next.size > 1) next.delete(m.id); }
                      else next.add(m.id);
                      setIncludedMembers(next);
                    }}
                    style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: included ? 'var(--blue)' : 'var(--fill)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {included && <SFIcon name="checkmark.svg" size={14} color="#fff" />}
                  </button>
                )}

                {splitType === 'exact' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: 'var(--label-secondary)' }}>€</span>
                    <input
                      type="number"
                      value={exactAmounts[m.id] || ''}
                      onChange={e => setExactAmounts(ea => ({ ...ea, [m.id]: e.target.value }))}
                      style={{ width: 72, textAlign: 'right', fontSize: 17, fontWeight: 500 }}
                      inputMode="decimal"
                    />
                  </div>
                )}

                {splitType === 'percentage' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      type="number"
                      value={percentages[m.id] || ''}
                      onChange={e => setPercentages(p => ({ ...p, [m.id]: e.target.value }))}
                      style={{ width: 56, textAlign: 'right', fontSize: 17, fontWeight: 500 }}
                      inputMode="decimal"
                    />
                    <span style={{ color: 'var(--label-secondary)' }}>%</span>
                  </div>
                )}

                {splitType === 'shares' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => setShares(sh => ({ ...sh, [m.id]: Math.max(0, (parseInt(sh[m.id]) || 0) - 1).toString() }))}
                      style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--fill)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <span style={{ fontSize: 18, color: 'var(--label)' }}>−</span>
                    </button>
                    <span style={{ fontSize: 17, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>
                      {shares[m.id] || '0'}
                    </span>
                    <button
                      onClick={() => setShares(sh => ({ ...sh, [m.id]: ((parseInt(sh[m.id]) || 0) + 1).toString() }))}
                      style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--fill)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <span style={{ fontSize: 18, color: 'var(--blue)' }}>+</span>
                    </button>
                  </div>
                )}

                {splitType !== 'equal' && (
                  <span style={{ fontSize: 14, color: 'var(--label-secondary)', minWidth: 52, textAlign: 'right' }}>
                    €{splitAmt.toFixed(2)}
                  </span>
                )}

                {splitType === 'equal' && included && (
                  <span style={{ fontSize: 14, color: 'var(--label-secondary)', minWidth: 52, textAlign: 'right' }}>
                    €{splitAmt.toFixed(2)}
                  </span>
                )}
              </div>
            );
          })}

          {splitType !== 'equal' && (
            <div style={{
              padding: '12px 16px',
              borderTop: '0.5px solid var(--separator)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 13, color: 'var(--label-secondary)' }}>Total</span>
              <span style={{
                fontSize: 15, fontWeight: 600,
                color: splitValid ? 'var(--green)' : 'var(--red)',
              }}>
                €{splitTotal.toFixed(2)} / €{numAmount.toFixed(2)}
                {!splitValid && ` (${splitDiff > 0 ? '+' : ''}${(splitTotal - numAmount).toFixed(2)})`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
