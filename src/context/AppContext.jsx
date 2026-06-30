import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockTransactions, mockSubscriptions, mockInvestments, mockMortgage, mockCash, mockBudgets, mockCategories } from '../data/mockData';
import { applyAccentColor } from '../utils/colorUtils';
import { injectLiquidGlassSvg } from '../utils/liquidGlass';

function loadLocal(key, def) {
  try { return JSON.parse(localStorage.getItem(key)) ?? def; }
  catch { return def; }
}

export const AppContext = createContext();

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
    parseInt(localStorage.getItem('fd2-font-size-v3') || '100', 10)
  );
  const setFontSize = (v) => {
    localStorage.setItem('fd2-font-size-v3', String(v));
    setFontSizeState(v);
  };

  const [uiZoom, setUiZoomState] = useState(() =>
    parseInt(localStorage.getItem('fd2-ui-zoom') || '100', 10)
  );
  const setUiZoom = (v) => {
    localStorage.setItem('fd2-ui-zoom', String(v));
    setUiZoomState(v);
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

  const [hoverEffectSpeed, setHoverEffectSpeedState] = useState(() =>
    parseInt(localStorage.getItem('fd2-hover-speed') || '50', 10)
  );
  const setHoverEffectSpeed = (v) => { localStorage.setItem('fd2-hover-speed', String(v)); setHoverEffectSpeedState(v); };

  const [revealEffectSpeed, setRevealEffectSpeedState] = useState(() =>
    parseInt(localStorage.getItem('fd2-reveal-speed') || '50', 10)
  );
  const setRevealEffectSpeed = (v) => { localStorage.setItem('fd2-reveal-speed', String(v)); setRevealEffectSpeedState(v); };

  const [trafficLightIcons, setTrafficLightIconsState] = useState(() =>
    localStorage.getItem('fd2-traffic-light-icons') !== 'false'
  );
  const setTrafficLightIcons = (v) => { localStorage.setItem('fd2-traffic-light-icons', String(v)); setTrafficLightIconsState(v); };

  const [bgPreset, setBgPresetState] = useState(() =>
    localStorage.getItem('fd2-bg-preset') || 'default'
  );
  const setBgPreset = (v) => { localStorage.setItem('fd2-bg-preset', v); setBgPresetState(v); };

  const [bgCustomImage, setBgCustomImageState] = useState(() =>
    localStorage.getItem('fd2-bg-custom') || ''
  );
  const setBgCustomImage = (v) => {
    try {
      if (v) localStorage.setItem('fd2-bg-custom', v);
      else localStorage.removeItem('fd2-bg-custom');
    } catch {}
    setBgCustomImageState(v);
  };

  const [bgBlurEnabled, setBgBlurEnabledState] = useState(() =>
    localStorage.getItem('fd2-bg-blur') === 'true'
  );
  const setBgBlurEnabled = (v) => { localStorage.setItem('fd2-bg-blur', String(v)); setBgBlurEnabledState(v); };

  const [bgBlurIntensity, setBgBlurIntensityState] = useState(() =>
    parseInt(localStorage.getItem('fd2-bg-blur-intensity') || '40', 10)
  );
  const setBgBlurIntensity = (v) => { localStorage.setItem('fd2-bg-blur-intensity', String(v)); setBgBlurIntensityState(v); };

  const [transparency, setTransparencyState] = useState(() =>
    parseInt(localStorage.getItem('fd2-transparency') || '80', 10)
  );
  const setTransparency = (v) => { localStorage.setItem('fd2-transparency', String(v)); setTransparencyState(v); };

  const [reduceMotion, setReduceMotionState] = useState(() =>
    localStorage.getItem('fd2-reduce-motion') === 'true'
  );
  const setReduceMotion = (v) => { localStorage.setItem('fd2-reduce-motion', String(v)); setReduceMotionState(v); };

  const [highContrast, setHighContrastState] = useState(() =>
    localStorage.getItem('fd2-high-contrast') === 'true'
  );
  const setHighContrast = (v) => { localStorage.setItem('fd2-high-contrast', String(v)); setHighContrastState(v); };

  const [largerText, setLargerTextState] = useState(() =>
    localStorage.getItem('fd2-larger-text') === 'true'
  );
  const setLargerText = (v) => { localStorage.setItem('fd2-larger-text', String(v)); setLargerTextState(v); };

  const [reduceTransparency, setReduceTransparencyState] = useState(() =>
    localStorage.getItem('fd2-reduce-transparency') === 'true'
  );
  const setReduceTransparency = (v) => { localStorage.setItem('fd2-reduce-transparency', String(v)); setReduceTransparencyState(v); };

  const [increaseContrast, setIncreaseContrastState] = useState(() =>
    localStorage.getItem('fd2-increase-contrast') === 'true'
  );
  const setIncreaseContrast = (v) => { localStorage.setItem('fd2-increase-contrast', String(v)); setIncreaseContrastState(v); };

  const [lgEnabled, setLgEnabledState] = useState(() =>
    localStorage.getItem('fd2-lg-enabled') === 'true'
  );
  const setLgEnabled = (v) => { localStorage.setItem('fd2-lg-enabled', String(v)); setLgEnabledState(v); };

  const [lgVariant, setLgVariantState] = useState(() =>
    localStorage.getItem('fd2-lg-variant') || 'wazig'
  );
  const setLgVariant = (v) => { localStorage.setItem('fd2-lg-variant', v); setLgVariantState(v); };

  const [lgIntensity, setLgIntensityState] = useState(() =>
    parseInt(localStorage.getItem('fd2-lg-intensity') || '70', 10)
  );
  const setLgIntensity = (v) => { localStorage.setItem('fd2-lg-intensity', String(v)); setLgIntensityState(v); };

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
  const [categories, setCategories]       = useState(mockCategories);
  const [projects, setProjects]           = useState(() => loadLocal('fd_projects', []));
  const [projectEntries, setProjectEntries] = useState(() => loadLocal('fd_project_entries', []));
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [privateMode, setPrivateMode]     = useState(false);

  // ── Period type ───────────────────────────────────────────────────────────
  const [periodType, setPeriodTypeState] = useState(() =>
    localStorage.getItem('fd2-period-type') || 'monthly'
  );
  const setPeriodType = (v) => { localStorage.setItem('fd2-period-type', v); setPeriodTypeState(v); };

  const [selectedYear, setSelectedYearState] = useState(() =>
    parseInt(localStorage.getItem('fd2-selected-year') || String(new Date().getFullYear()), 10)
  );
  const setSelectedYear = (v) => { localStorage.setItem('fd2-selected-year', String(v)); setSelectedYearState(v); };

  const [dateRange, setDateRangeState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fd2-date-range')) || { from: null, to: null }; }
    catch { return { from: null, to: null }; }
  });
  const setDateRange = (v) => { localStorage.setItem('fd2-date-range', JSON.stringify(v)); setDateRangeState(v); };

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

  // ── Transparency ──────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.style.setProperty('--glass-opacity', String(transparency / 100));
  }, [transparency]);

  // ── Reduce Motion ─────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  }, [reduceMotion]);

  // ── Accessibility ─────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.classList.toggle('larger-text', largerText);
  }, [largerText]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-transparency', reduceTransparency);
  }, [reduceTransparency]);

  useEffect(() => {
    document.documentElement.classList.toggle('increase-contrast', increaseContrast);
  }, [increaseContrast]);

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

  // ── Effect speeds — inject <style> tag directly so nothing can override ──
  useEffect(() => {
    const h = (2.0 * Math.pow(0.025, hoverEffectSpeed / 100)).toFixed(3);
    let tag = document.getElementById('fd2-hover-speed-style');
    if (!tag) { tag = document.createElement('style'); tag.id = 'fd2-hover-speed-style'; document.head.appendChild(tag); }
    tag.textContent = `
      html.hover-lift .card, html.hover-lift .stat-card {
        transition: transform ${h}s cubic-bezier(0.34,1.56,0.64,1), box-shadow ${h}s ease !important;
      }
      html.hover-scale .card, html.hover-scale .stat-card {
        transition: transform ${h}s ease !important;
      }
      html.hover-glow .card, html.hover-glow .stat-card {
        transition: box-shadow ${h}s ease !important;
      }
      html.hover-border-glow .card, html.hover-border-glow .stat-card {
        transition: border-color ${h}s ease, box-shadow ${h}s ease !important;
      }
      html.hover-slide-arrow .card::after, html.hover-slide-arrow .stat-card::after {
        transition: right ${h}s ease, opacity ${h}s ease !important;
      }
    `;
  }, [hoverEffectSpeed]);

  useEffect(() => {
    const r = (3.0 * Math.pow(0.033, revealEffectSpeed / 100)).toFixed(3);
    let tag = document.getElementById('fd2-reveal-speed-style');
    if (!tag) { tag = document.createElement('style'); tag.id = 'fd2-reveal-speed-style'; document.head.appendChild(tag); }
    tag.textContent = `
      html.reveal-slide-up .card, html.reveal-slide-up .stat-card { animation-duration: ${r}s !important; }
      html.reveal-fade-in  .card, html.reveal-fade-in  .stat-card { animation-duration: ${r}s !important; }
      html.reveal-scale    .card, html.reveal-scale    .stat-card { animation-duration: ${r}s !important; }
      html.reveal-blur     .card, html.reveal-blur     .stat-card { animation-duration: ${r}s !important; }
    `;
  }, [revealEffectSpeed]);

  // ── Background ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute('data-bg-preset', bgPreset);
    const blurPx = bgBlurEnabled ? ((bgBlurIntensity / 100) * 40).toFixed(1) + 'px' : '0px';
    el.style.setProperty('--bg-blur-intensity', blurPx);
    if (bgPreset === 'custom' && bgCustomImage) {
      el.style.setProperty('--bg-custom-image', `url("${bgCustomImage}")`);
    } else {
      el.style.removeProperty('--bg-custom-image');
    }
  }, [bgPreset, bgCustomImage, bgBlurEnabled, bgBlurIntensity]);

  // ── Liquid Glass ─────────────────────────────────────────────────────────
  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle('lg-on', lgEnabled);
    if (lgEnabled) {
      el.setAttribute('data-lg-variant', lgVariant);
      const opacity = (lgIntensity / 100) * 0.65 + 0.20;
      const blur    = (lgIntensity / 100) * 35 + 8;
      el.style.setProperty('--lg-opacity', opacity.toFixed(2));
      el.style.setProperty('--lg-blur', blur.toFixed(0) + 'px');
      injectLiquidGlassSvg();
    } else {
      el.removeAttribute('data-lg-variant');
      el.style.removeProperty('--lg-opacity');
      el.style.removeProperty('--lg-blur');
    }
  }, [lgEnabled, lgVariant, lgIntensity]);

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
  const activeDateRange = (() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (periodType) {
      case 'this_week': {
        const day = today.getDay();
        const from = new Date(today); from.setDate(today.getDate() - day);
        const to   = new Date(from);  to.setDate(from.getDate() + 6);
        return { from, to };
      }
      case 'last_week': {
        const day = today.getDay();
        const to   = new Date(today); to.setDate(today.getDate() - day - 1);
        const from = new Date(to);    from.setDate(to.getDate() - 6);
        return { from, to };
      }
      case 'this_month':
        return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: new Date(now.getFullYear(), now.getMonth() + 1, 0) };
      case 'last_month':
        return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: new Date(now.getFullYear(), now.getMonth(), 0) };
      case 'this_quarter': {
        const q = Math.floor(now.getMonth() / 3);
        return { from: new Date(now.getFullYear(), q * 3, 1), to: new Date(now.getFullYear(), q * 3 + 3, 0) };
      }
      case 'last_quarter': {
        const q = Math.floor(now.getMonth() / 3) - 1;
        const year = q < 0 ? now.getFullYear() - 1 : now.getFullYear();
        const qq = ((q % 4) + 4) % 4;
        return { from: new Date(year, qq * 3, 1), to: new Date(year, qq * 3 + 3, 0) };
      }
      case 'this_year':
        return { from: new Date(now.getFullYear(), 0, 1), to: new Date(now.getFullYear(), 11, 31) };
      case 'last_year':
        return { from: new Date(now.getFullYear() - 1, 0, 1), to: new Date(now.getFullYear() - 1, 11, 31) };
      case 'yearly':
        return { from: new Date(selectedYear, 0, 1), to: new Date(selectedYear, 11, 31) };
      case 'custom':
        return { from: dateRange.from ? new Date(dateRange.from) : null, to: dateRange.to ? new Date(dateRange.to) : null };
      case 'max':
        return { from: null, to: null };
      default: // 'monthly'
        return { from: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1), to: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0) };
    }
  })();

  const filteredTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    if (activeDateRange.from && d < activeDateRange.from) return false;
    if (activeDateRange.to   && d > activeDateRange.to)   return false;
    return true;
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
      uiZoom, setUiZoom,
      allCaps, setAllCaps,
      amountPositiveColor, setAmountPositiveColor,
      amountNegativeColor, setAmountNegativeColor,
      toggleColor, setToggleColor,
      hoverEffect, setHoverEffect, hoverEffectEnabled, setHoverEffectEnabled, hoverEffectSpeed, setHoverEffectSpeed,
      revealEffect, setRevealEffect, revealEffectEnabled, setRevealEffectEnabled, revealEffectSpeed, setRevealEffectSpeed,
      trafficLightIcons, setTrafficLightIcons,
      bgPreset, setBgPreset, bgCustomImage, setBgCustomImage,
      bgBlurEnabled, setBgBlurEnabled, bgBlurIntensity, setBgBlurIntensity,
      lgEnabled, setLgEnabled, lgVariant, setLgVariant, lgIntensity, setLgIntensity,
      transparency, setTransparency,
      reduceMotion, setReduceMotion,
      highContrast, setHighContrast,
      largerText, setLargerText,
      reduceTransparency, setReduceTransparency,
      increaseContrast, setIncreaseContrast,
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
      periodType, setPeriodType,
      selectedYear, setSelectedYear,
      dateRange, setDateRange,
      activeDateRange,
      filteredTransactions, income, expenses, net,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
