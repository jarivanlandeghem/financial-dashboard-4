import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'splitwise_data';

const defaultState = {
  groups: [],
  expenses: [],
  settlements: [],
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultState;
  } catch {
    return defaultState;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

let _state = loadState();
let _listeners = [];

function notify() {
  _listeners.forEach(fn => fn(_state));
}

function setState(updater) {
  _state = typeof updater === 'function' ? updater(_state) : updater;
  saveState(_state);
  notify();
}

export const store = {
  getState: () => _state,

  createGroup(name, iconId, color, members) {
    const group = {
      id: uuid(),
      name,
      iconId: iconId || 'home',
      color: color || '#007AFF',
      members: members.map(m => ({
        id: uuid(),
        name: m,
        color: randomColor(),
      })),
      createdAt: new Date().toISOString(),
    };
    setState(s => ({ ...s, groups: [group, ...s.groups] }));
    return group.id;
  },

  addMemberToGroup(groupId, name) {
    setState(s => ({
      ...s,
      groups: s.groups.map(g =>
        g.id === groupId
          ? { ...g, members: [...g.members, { id: uuid(), name, color: randomColor() }] }
          : g
      ),
    }));
  },

  deleteGroup(groupId) {
    setState(s => ({
      ...s,
      groups: s.groups.filter(g => g.id !== groupId),
      expenses: s.expenses.filter(e => e.groupId !== groupId),
      settlements: s.settlements.filter(s2 => s2.groupId !== groupId),
    }));
  },

  addExpense(groupId, { description, amount, paidBy, splitType, splits, category, date }) {
    const expense = {
      id: uuid(),
      groupId,
      description,
      amount: parseFloat(amount),
      paidBy,
      splitType,
      splits,
      category: category || 'general',
      date: date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setState(s => ({ ...s, expenses: [expense, ...s.expenses] }));
    return expense.id;
  },

  deleteExpense(expenseId) {
    setState(s => ({ ...s, expenses: s.expenses.filter(e => e.id !== expenseId) }));
  },

  addSettlement(groupId, fromId, toId, amount) {
    const settlement = {
      id: uuid(),
      groupId,
      fromId,
      toId,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
    };
    setState(s => ({ ...s, settlements: [settlement, ...s.settlements] }));
  },

  deleteSettlement(settlementId) {
    setState(s => ({ ...s, settlements: s.settlements.filter(s2 => s2.id !== settlementId) }));
  },
};

export function useStore() {
  const [state, setLocalState] = useState(_state);

  useEffect(() => {
    const listener = (newState) => setLocalState({ ...newState });
    _listeners.push(listener);
    return () => {
      _listeners = _listeners.filter(l => l !== listener);
    };
  }, []);

  return state;
}

function randomColor() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#82E0AA', '#F1948A', '#FAD7A0', '#A9CCE3', '#A3E4D7'];
  return colors[Math.floor(Math.random() * colors.length)];
}
