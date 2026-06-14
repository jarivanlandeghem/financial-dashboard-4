import { createContext, useContext, useState, useEffect } from 'react';
import { mockTransactions, mockSubscriptions, mockInvestments, mockMortgage, mockCash, mockBudgets } from '../data/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [transactions, setTransactions] = useState(mockTransactions);
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
  const [investments] = useState(mockInvestments);
  const [mortgage] = useState(mockMortgage);
  const [cash, setCash] = useState(mockCash);
  const [budgets, setBudgets] = useState(mockBudgets);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [privateMode, setPrivateMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      if (localStorage.getItem('darkMode') === null) setDarkMode(e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const addTransaction = (tx) => {
    setTransactions(prev => [{ ...tx, id: Date.now() }, ...prev]);
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addCashTransaction = (tx) => {
    const amount = tx.type === 'out' ? -Math.abs(tx.amount) : Math.abs(tx.amount);
    setCash(prev => ({
      balance: prev.balance + amount,
      transactions: [{ ...tx, id: Date.now(), amount }, ...prev.transactions],
    }));
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

  const updateBudget = (id, limit) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, limit } : b));
  };

  const toggleSubscriptionCancel = (id) => {
    setSubscriptions(prev => prev.map(s =>
      s.id === id ? { ...s, markedForCancel: !s.markedForCancel } : s
    ));
  };

  const filteredTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === selectedMonth.getMonth() && d.getFullYear() === selectedMonth.getFullYear();
  });

  const income = filteredTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = filteredTransactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const net = income - expenses;

  return (
    <AppContext.Provider value={{
      darkMode, setDarkMode,
      privateMode, setPrivateMode,
      transactions, addTransaction, deleteTransaction,
      subscriptions, toggleSubscriptionCancel,
      investments, mortgage, cash, addCashTransaction,
      budgets, updateBudget, setCashBalance: (v) => setCash(prev => ({ ...prev, balance: v })),
      selectedMonth, setSelectedMonth,
      filteredTransactions, income, expenses, net,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
