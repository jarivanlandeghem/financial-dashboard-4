// Calculate who owes whom within a group
export function calculateBalances(groupId, expenses, settlements) {
  const balances = {}; // memberId -> net amount (positive = owed, negative = owes)

  for (const exp of expenses.filter(e => e.groupId === groupId)) {
    const payer = exp.paidBy;
    if (!balances[payer]) balances[payer] = 0;

    for (const split of exp.splits) {
      if (split.memberId === payer) continue;
      if (!balances[split.memberId]) balances[split.memberId] = 0;
      balances[payer] += split.amount;
      balances[split.memberId] -= split.amount;
    }
  }

  for (const s of settlements.filter(s => s.groupId === groupId)) {
    if (!balances[s.fromId]) balances[s.fromId] = 0;
    if (!balances[s.toId]) balances[s.toId] = 0;
    balances[s.fromId] += s.amount;
    balances[s.toId] -= s.amount;
  }

  return balances;
}

// Simplify debts: returns array of { from, to, amount }
export function simplifyDebts(balances) {
  const creditors = [];
  const debtors = [];

  for (const [id, amount] of Object.entries(balances)) {
    const rounded = Math.round(amount * 100) / 100;
    if (rounded > 0.005) creditors.push({ id, amount: rounded });
    else if (rounded < -0.005) debtors.push({ id, amount: -rounded });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions = [];

  let ci = 0, di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const credit = creditors[ci];
    const debt = debtors[di];
    const transfer = Math.min(credit.amount, debt.amount);

    transactions.push({
      from: debt.id,
      to: credit.id,
      amount: Math.round(transfer * 100) / 100,
    });

    credit.amount -= transfer;
    debt.amount -= transfer;

    if (credit.amount < 0.005) ci++;
    if (debt.amount < 0.005) di++;
  }

  return transactions;
}

// Calculate equal splits
export function splitEqually(amount, memberIds) {
  const each = Math.floor((amount / memberIds.length) * 100) / 100;
  const remainder = Math.round((amount - each * memberIds.length) * 100) / 100;
  return memberIds.map((memberId, i) => ({
    memberId,
    amount: i === 0 ? Math.round((each + remainder) * 100) / 100 : each,
  }));
}

// Calculate percentage splits
export function splitByPercentage(amount, splits) {
  return splits.map(s => ({
    memberId: s.memberId,
    amount: Math.round((amount * s.percentage / 100) * 100) / 100,
  }));
}

export function fmt(amount, currency = '€') {
  return `${currency}${Math.abs(amount).toFixed(2)}`;
}

export function fmtDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  const day = 86400000;
  if (diff < day && d.getDate() === now.getDate()) return 'Today';
  if (diff < 2 * day) return 'Yesterday';
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

export const CATEGORIES = [
  { id: 'general', label: 'General', emoji: '💳' },
  { id: 'food', label: 'Food', emoji: '🍕' },
  { id: 'drinks', label: 'Drinks', emoji: '🍺' },
  { id: 'transport', label: 'Transport', emoji: '🚗' },
  { id: 'accommodation', label: 'Stay', emoji: '🏨' },
  { id: 'groceries', label: 'Groceries', emoji: '🛒' },
  { id: 'entertainment', label: 'Fun', emoji: '🎮' },
  { id: 'sports', label: 'Sports', emoji: '⚽️' },
  { id: 'flights', label: 'Flights', emoji: '✈️' },
  { id: 'utilities', label: 'Utilities', emoji: '💡' },
  { id: 'rent', label: 'Rent', emoji: '🏠' },
  { id: 'gifts', label: 'Gifts', emoji: '🎁' },
];

export function categoryById(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
}

export const GROUP_COLORS = [
  '#007AFF', '#34C759', '#FF3B30', '#FF9500',
  '#AF52DE', '#FF2D55', '#5AC8FA', '#5856D6',
];

export const GROUP_EMOJIS = [
  '🏠', '🏖️', '✈️', '🎉', '🍕', '🎮', '💼', '🚗',
  '⛺️', '🎸', '🏋️', '🍺', '🎓', '💍', '🐾', '🌍',
];
