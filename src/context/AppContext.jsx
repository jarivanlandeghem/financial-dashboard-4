import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockTransactions, mockSubscriptions, mockInvestments, mockMortgage, mockCash, mockBudgets } from '../data/mockData';
import { applyAccentColor } from '../utils/colorUtils';

function loadLocal(key, def) {
  try { return JSON.parse(localStorage.getItem(key)) ?? def; }
  catch { return def; }
}

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
  const [accentColor, setAccentColorState] = useState(() =>
    localStorage.getItem('fd2-accent') || '#007AFF'
  );
  const setAccentColor = (hex) => {
    localStorage.setItem('fd2-accent', hex);
    setAccentColorState(hex);
  };

  const [language, setLanguageState] = useState(() =>
    localStorage.getItem('fd2-language') || 'nl'
  );
  const setLanguage = (lang) => {
    localStorage.setItem('fd2-language', lang);
    setLanguageState(lang);
  };

  const [fontFamily, setFontFamilyState] = useState(() =>
    localStorage.getItem('fd2-font') || 'system'
  );
  const setFontFamily = (font) => {
    localStorage.setItem('fd2-font', font);
    setFontFamilyState(font);
  };

  const [boldText, setBoldTextState] = useState(() =>
    localStorage.getItem('fd2-bold') === 'true'
  );
  const setBoldText = (v) => {
    localStorage.setItem('fd2-bold', String(v));
    setBoldTextState(v);
  };

  const [boldWeight, setBoldWeightState] = useState(() =>
    parseInt(localStorage.getItem('fd2-bold-weight') || '50', 10)
  );
  const setBoldWeight = (v) => {
    localStorage.setItem('fd2-bold-weight', String(v));
    setBoldWeightState(v);
  };

  const [allCaps, setAllCapsState] = useState(() =>
    localStorage.getItem('fd2-all-caps') === 'true'
  );
  const setAllCaps = (v) => {
    localStorage.setItem('fd2-all-caps', String(v));
    setAllCapsState(v);
  };

  const [fontSize, setFontSizeState] = useState(() =>
    parseInt(localStorage.getItem('fd2-font-size') || '100', 10)
  );
  const setFontSize = (v) => {
    localStorage.setItem('fd2-font-size', String(v));
    setFontSizeState(v);
  };

  const [amountPositiveColor, setAmountPositiveColorState] = useState(() =>
    localStorage.getItem('fd2-color-positive') || '#1A56DB'
  );
  const setAmountPositiveColor = (hex) => {
    localStorage.setItem('fd2-color-positive', hex);
    setAmountPositiveColorState(hex);
  };

  const [amountNegativeColor, setAmountNegativeColorState] = useState(() =>
    localStorage.getItem('fd2-color-negative') || '#FF3B30'
  );
  const setAmountNegativeColor = (hex) => {
    localStorage.setItem('fd2-color-negative', hex);
    setAmountNegativeColorState(hex);
  };

  const [toggleColor, setToggleColorState] = useState(() =>
    localStorage.getItem('fd2-toggle-color') || '#34C759'
  );
  const setToggleColor = (hex) => {
    localStorage.setItem('fd2-toggle-color', hex);
    setToggleColorState(hex);
  };

  const [hoverEffect, setHoverEffectState] = useState(() =>
    localStorage.getItem('fd2-hover-effect') || 'none'
  );
  const setHoverEffect = (v) => { localStorage.setItem('fd2-hover-effect', v); setHoverEffectState(v); };

  const [hoverEffectEnabled, setHoverEffectEnabledState] = useState(() =>
    localStorage.getItem('fd2-hover-effect-enabled') === 'true'
  );
  const setHoverEffectEnabled = (v) => { localStorage.setItem('fd2-hover-effect-enabled', String(v)); setHoverEffectEnabledState(v); };

  const [revealEffect, setRevealEffectState] = useState(() =>
    localStorage.getItem('fd2-reveal-effect') || 'none'
  );
  const setRevealEffect = (v) => { localStorage.setItem('fd2-reveal-effect', v); setRevealEffectState(v); };

  const [revealEffectEnabled, setRevealEffectEnabledState] = useState(() =>
    localStorage.getItem('fd2-reveal-effect-enabled') === 'true'
  );
  const setRevealEffectEnabled = (v) => { localStorage.setItem('fd2-reveal-effect-enabled', String(v)); setRevealEffectEnabledState(v); };

  const [themeMode, setThemeModeRaw] = useState(() =>
    localStorage.getItem('fd2-theme-mode') || 'auto'
  );

  const setThemeMode = (mode) => {
    localStorage.setItem('fd2-theme-mode', mode);
    setThemeModeRaw(mode);
  };

  const [darkMode, setDarkMode] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

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
  const [categories, setCategories]       = useState([]);
  const [projects, setProjects]           = useState(() => loadLocal('fd_projects', []));
  const [projectEntries, setProjectEntries] = useState(() => loadLocal('fd_project_entries', []));
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [privateMode, setPrivateMode]     = useState(false);

  // ── Accent color (does NOT touch amount colors) ───────────────────────────
  useEffect(() => {
    applyAccentColor(accentColor, darkMode);
  }, [accentColor, darkMode]);

  // ── Font family ───────────────────────────────────────────────────────────
  useEffect(() => {
    const STACKS = {
      system:  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
      inter:   "'Inter', sans-serif",
      verdana: "'Verdana', Geneva, Tahoma, sans-serif",
      arial:   "'Arial', Helvetica, sans-serif",
      georgia: "'Georgia', 'Times New Roman', serif",
    };
    const stack = STACKS[fontFamily] || STACKS.system;
    document.documentElement.style.setProperty('--font-family', stack);
    // Force on every text element via the CSS class
    document.documentElement.setAttribute('data-font', fontFamily);
  }, [fontFamily]);

  // ── Bold text ─────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('bold-text', boldText);
  }, [boldText]);

  // ── Bold weight: 0%→100, 20%→400 (normal), 100%→900 + stroke ────────────
  useEffect(() => {
    const w = boldWeight <= 20
      ? 100 + (boldWeight / 20) * 300
      : 400 + ((boldWeight - 20) / 80) * 500;
    document.documentElement.style.setProperty('--bold-weight', String(Math.round(w)));
    // Above 50%: add text-stroke so weight visually exceeds 900
    const stroke = boldWeight > 50 ? ((boldWeight - 50) / 50) * 1.2 : 0;
    document.documentElement.style.setProperty('--bold-stroke', stroke.toFixed(2) + 'px');
  }, [boldWeight]);

  // ── All caps ──────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('all-caps', allCaps);
  }, [allCaps]);

  // ── Font size zoom ────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.style.setProperty('--font-zoom', String(fontSize / 100));
  }, [fontSize]);

  // ── Toggle color ──────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.style.setProperty('--toggle-color', toggleColor);
  }, [toggleColor]);

  // ── Hover effects ────────────────────────────────────────────────────
  useEffect(() => {
    const el = document.documentElement;
    ['gradient-reveal','lift','scale','glow','border-glow','slide-arrow'].forEach(e => el.classList.remove(`hover-${e}`));
    if (!hoverEffectEnabled || hoverEffect === 'none') return;
    el.classList.add(`hover-${hoverEffect}`);
    if (hoverEffect === 'gradient-reveal') {
      const handler = (e) => {
        document.querySelectorAll('.card, .stat-card').forEach(card => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
          card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
        });
      };
      document.addEventListener('mousemove', handler);
      return () => document.removeEventListener('mousemove', handler);
    }
  }, [hoverEffect, hoverEffectEnabled]);

  // ── Reveal effects ────────────────────────────────────────────────────
  useEffect(() => {
    const el = document.documentElement;
    ['slide-up','fade-in','scale','blur'].forEach(e => el.classList.remove(`reveal-${e}`));
    if (revealEffectEnabled && revealEffect !== 'none') {
      el.classList.add(`reveal-${revealEffect}`);
    }
  }, [revealEffect, revealEffectEnabled]);

  // ── Amount colors (independent of accent) ────────────────────────────────
  useEffect(() => {
    const { r, g, b } = { r: parseInt(amountPositiveColor.slice(1,3),16), g: parseInt(amountPositiveColor.slice(3,5),16), b: parseInt(amountPositiveColor.slice(5,7),16) };
    document.documentElement.style.setProperty('--amount-positive', amountPositiveColor);
    document.documentElement.style.setProperty('--amount-positive-light', `rgba(${r},${g},${b},0.10)`);
  }, [amountPositiveColor]);

  useEffect(() => {
    const { r, g, b } = { r: parseInt(amountNegativeColor.slice(1,3),16), g: parseInt(amountNegativeColor.slice(3,5),16), b: parseInt(amountNegativeColor.slice(5,7),16) };
    document.documentElement.style.setProperty('--amount-negative', amountNegativeColor);
    document.documentElement.style.setProperty('--amount-negative-light', `rgba(${r},${g},${b},0.10)`);
  }, [amountNegativeColor]);

  // ── Theme mode: auto|light|dark ───────────────────────────────────────────
  useEffect(() => {
    const apply = (isDark) => {
      setDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    };

    if (themeMode === 'light')  { apply(false); return; }
    if (themeMode === 'dark')   { apply(true);  return; }

    // auto: follow system
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    apply(mq.matches);
    const handler = (e) => apply(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [themeMode]);

  // ── Load all data from API ─────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    try {
      const [txs, subs, inv, mort, cashData, budg, goalData, tradeData, catData] = await Promise.all([
        apiFetch('/transactions'),
        apiFetch('/subscriptions'),
        apiFetch('/investments'),
        apiFetch('/mortgage'),
        apiFetch('/cash'),
        apiFetch('/budgets'),
        apiFetch('/goals'),
        apiFetch('/trades'),
        apiFetch('/categories'),
      ]);
      setTransactions(txs);
      setSubscriptions(subs);
      setInvestments(inv);
      setMortgage(mort);
      setCash(cashData);
      setBudgets(budg);
      setGoals(goalData);
      setTrades(tradeData);
      setCategories(catData);
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

  // ── Projects (localStorage) ────────────────────────────────────────────────
  useEffect(() => localStorage.setItem('fd_projects', JSON.stringify(projects)), [projects]);
  useEffect(() => localStorage.setItem('fd_project_entries', JSON.stringify(projectEntries)), [projectEntries]);

  const addProject = (p) => {
    const proj = { ...p, id: Date.now(), createdAt: new Date().toISOString() };
    setProjects(prev => [proj, ...prev]);
    return proj;
  };
  const updateProject = (id, data) =>
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  const deleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setProjectEntries(prev => prev.filter(e => e.projectId !== id));
  };
  const addProjectEntry = (entry) =>
    setProjectEntries(prev => [{ ...entry, id: Date.now() }, ...prev]);
  const updateProjectEntry = (id, data) =>
    setProjectEntries(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  const deleteProjectEntry = (id) =>
    setProjectEntries(prev => prev.filter(e => e.id !== id));

  // ── Categories ─────────────────────────────────────────────────────────────
  const addCategory = async (data) => {
    if (apiOnline) {
      const saved = await apiFetch('/categories', { method: 'POST', body: JSON.stringify(data) });
      setCategories(prev => [...prev, saved]);
    } else {
      setCategories(prev => [...prev, { ...data, id: Date.now() }]);
    }
  };

  const updateCategory = async (id, data) => {
    if (apiOnline) await apiFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCategory = async (id) => {
    if (apiOnline) await apiFetch(`/categories/${id}`, { method: 'DELETE' });
    setCategories(prev => prev.filter(c => c.id !== id && c.parent_id !== id));
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
      darkMode, setDarkMode, themeMode, setThemeMode,
      accentColor, setAccentColor,
      language, setLanguage,
      fontFamily, setFontFamily,
      boldText, setBoldText,
      boldWeight, setBoldWeight,
      fontSize, setFontSize,
      allCaps, setAllCaps,
      amountPositiveColor, setAmountPositiveColor,
      amountNegativeColor, setAmountNegativeColor,
      toggleColor, setToggleColor,
      hoverEffect, setHoverEffect, hoverEffectEnabled, setHoverEffectEnabled,
      revealEffect, setRevealEffect, revealEffectEnabled, setRevealEffectEnabled,
      privateMode, setPrivateMode,
      apiOnline,
      transactions, addTransaction, deleteTransaction,
      subscriptions, toggleSubscriptionCancel,
      investments, mortgage,
      cash, addCashTransaction, setCashBalance: (v) => setCash(prev => ({ ...prev, balance: v })),
      budgets, updateBudget,
      goals, addGoal, addToGoal, deleteGoal,
      categories, addCategory, updateCategory, deleteCategory,
      projects, addProject, updateProject, deleteProject,
      projectEntries, addProjectEntry, updateProjectEntry, deleteProjectEntry,
      trades,
      selectedMonth, setSelectedMonth,
      filteredTransactions, income, expenses, net,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
