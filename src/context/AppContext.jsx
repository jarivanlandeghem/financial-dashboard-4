import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockTransactions, mockSubscriptions, mockInvestments, mockMortgage, mockCash, mockBudgets } from '../data/mockData';

const AppContext = createContext();

const API = '/api';

async function apiFetch(path, options) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [apiOnline, setApiOnline] = useState(false);

  // Data state — start met mock data als fallback
  const [transactions, setTransactions]   = useState(mockTransactions);
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
  const [investments, setInvestments]     = useState(mockInvestments);
  const [mortgage, setMortgage]           = useState(mockMortgage);
  const [cash, setCash]                   = useState(mockCash);
  const [budgets, setBudgets]             = useState(mockBudgets);
  const [goals, setGoals]                 = useState([]);
  const [trades, setTrades]               = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [privateMode, setPrivateMode]     = useState(false);

  // ── Dark mode ──────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => { if (localStorage.getItem('darkMode') === null) setDarkMode(e.matches); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Load all data from API ─────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    try {
      const [txs, subs, inv, mort, cashData, budg, goalData, tradeData] = await Promise.all([
        apiFetch('/transactions'),
        apiFetch('/subscriptions'),
        apiFetch('/investments'),
        apiFetch('/mortgage'),
        apiFetch('/cash'),
        apiFetch('/budgets'),
        apiFetch('/goals'),
        apiFetch('/trades'),
      ]);
      setTransactions(txs);
      setSubscriptions(subs);
      setInvestments(inv);
      setMortgage(mort);
      setCash(cashData);
      setBudgets(budg);
      setGoals(goalData);
      setTrades(tradeData);
      setApiOnline(true);
    } catch {
      // API offline → gebruik mock data (dev zonder backend)
      setApiOnline(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Transactions ───────────────────────────────────────────────────────────
  const addTransaction = async (tx) => {
    if (apiOnline) {
      const saved = await apiFetch('/transactions', { method: 'POST', body: JSON.stringify(tx) });
      setTransactions(prev => [saved, ...prev]);
    } else {
      setTransactions(prev => [{ ...tx, id: Date.now() }, ...prev]);
    }
  };

  const deleteTransaction = async (id) => {
    if (apiOnline) await apiFetch(`/transactions/${id}`, { method: 'DELETE' });
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // ── Cash ───────────────────────────────────────────────────────────────────
  const addCashTransaction = async (tx) => {
    const amount = tx.type === 'out' ? -Math.abs(tx.amount) : Math.abs(tx.amount);
    const entry = { ...tx, amount };
    if (apiOnline) {
      await apiFetch('/cash/transaction', { method: 'POST', body: JSON.stringify(entry) });
      const updated = await apiFetch('/cash');
      setCash(updated);
    } else {
      setCash(prev => ({
        balance: prev.balance + amount,
        transactions: [{ ...entry, id: Date.now() }, ...prev.transactions],
      }));
    }
    if (tx.type === 'out' && tx.category) {
      addTransaction({
        date: tx.date || new Date().toISOString().split('T')[0],
        description: tx.description,
        category: tx.category,
        amount: -Math.abs(tx.amount),
        account: 'Cash',
        type: 'expense',
        recurring: false,
      });
    }
  };

  // ── Budgets ────────────────────────────────────────────────────────────────
  const updateBudget = async (id, limit) => {
    if (apiOnline) await apiFetch(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify({ limit }) });
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, limit } : b));
  };

  // ── Subscriptions ──────────────────────────────────────────────────────────
  const toggleSubscriptionCancel = async (id) => {
    if (apiOnline) {
      const res = await apiFetch(`/subscriptions/${id}/cancel`, { method: 'PATCH' });
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, markedForCancel: res.markedForCancel } : s));
    } else {
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, markedForCancel: !s.markedForCancel } : s));
    }
  };

  // ── Goals ──────────────────────────────────────────────────────────────────
  const addGoal = async (goal) => {
    if (apiOnline) {
      const saved = await apiFetch('/goals', { method: 'POST', body: JSON.stringify(goal) });
      setGoals(prev => [...prev, saved]);
    } else {
      setGoals(prev => [...prev, { ...goal, id: Date.now() }]);
    }
  };

  const addToGoal = async (id, amount) => {
    if (apiOnline) {
      const res = await apiFetch(`/goals/${id}/add`, { method: 'PATCH', body: JSON.stringify({ amount }) });
      setGoals(prev => prev.map(g => g.id === id ? { ...g, saved: res.saved } : g));
    } else {
      setGoals(prev => prev.map(g => g.id === id ? { ...g, saved: g.saved + amount } : g));
    }
  };

  const deleteGoal = async (id) => {
    if (apiOnline) await apiFetch(`/goals/${id}`, { method: 'DELETE' });
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const filteredTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === selectedMonth.getMonth() && d.getFullYear() === selectedMonth.getFullYear();
  });

  const income   = filteredTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = filteredTransactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const net      = income - expenses;

  return (
    <AppContext.Provider value={{
      darkMode, setDarkMode,
      privateMode, setPrivateMode,
      apiOnline,
      transactions, addTransaction, deleteTransaction,
      subscriptions, toggleSubscriptionCancel,
      investments, mortgage,
      cash, addCashTransaction, setCashBalance: (v) => setCash(prev => ({ ...prev, balance: v })),
      budgets, updateBudget,
      goals, addGoal, addToGoal, deleteGoal,
      trades,
      selectedMonth, setSelectedMonth,
      filteredTransactions, income, expenses, net,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
