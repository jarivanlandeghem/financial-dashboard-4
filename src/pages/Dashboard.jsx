import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GridLayout, { WidthProvider } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
const RGL = WidthProvider(GridLayout);
import SFIcon from '../components/SFIcon';
import { TRANSLATIONS } from '../i18n/translations';
import { mockTrades } from '../data/tradingData';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useApp } from '../context/AppContext';
import MonthSelector from '../components/MonthSelector';
import CategoryIcon from '../components/CategoryIcon';
import CustomTooltip from '../components/CustomTooltip';
import HealthScore from '../components/HealthScore';
import MonthlySummary from '../components/MonthlySummary';
import { downloadAnnualReport } from '../utils/excelExport';
import { CATEGORIES, monthlyData, netWorthData } from '../data/mockData';

const fmt = (n) => (n < 0 ? '-' : '') + '€' + Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ═══════════════════════════════════════════════════════
   GRID CONSTANTS
═══════════════════════════════════════════════════════ */
const LS_KEY       = 'fd2-grid-v4';
const GRID_COLS    = 8;
const GRID_ROW_HEIGHT = 140;

const WIDGET_CATALOGUE = [
  { id: 'income',        name: 'Inkomen',             desc: 'Maandelijks inkomen',              icon: 'chart.line.uptrend.xyaxis.svg', category: 'Financiën'               },
  { id: 'spent',         name: 'Uitgaven',            desc: 'Maandelijkse uitgaven',            icon: 'chart.bar.svg',                 category: 'Financiën'               },
  { id: 'net-savings',   name: 'Netto Sparen',        desc: 'Inkomen minus uitgaven',           icon: 'banknote.svg',                  category: 'Financiën'               },
  { id: 'investments',   name: 'Beleggingen',         desc: 'Totale beleggingswaarde',          icon: 'briefcase.svg',                 category: 'Financiën'               },
  { id: 'health',        name: 'Health Score',        desc: 'Financiële gezondheid',            icon: 'heart.svg',                     category: 'Financiën'               },
  { id: 'summary',       name: 'AI Samenvatting',     desc: 'Maandelijkse inzichten',           icon: 'brain.svg',                     category: 'Financiën'               },
  { id: 'income-chart',  name: 'Inkomen vs Uitgaven', desc: 'Staafgrafiek per maand',           icon: 'chart.bar.svg',                 category: 'Financiën'               },
  { id: 'networth',      name: 'Vermogensgroei',      desc: 'Netto vermogen over tijd',         icon: 'chart.line.uptrend.xyaxis.svg', category: 'Financiën'               },
  { id: 'pie',           name: 'Categorieën',         desc: 'Uitgaven per categorie',           icon: 'percent.svg',                   category: 'Financiën'               },
  { id: 'transactions',  name: 'Transacties',         desc: 'Recente transacties',              icon: 'list.bullet.svg',               category: 'Financiën'               },
  { id: 'cash',          name: 'Contant Geld',        desc: 'Huidig cash saldo',                icon: 'banknote.svg',                  category: 'Financiën'               },
  { id: 'portfolio',     name: 'Portfolio',           desc: 'Totale beleggingswaarde',          icon: 'briefcase.svg',                 category: 'Investeringen & Trading' },
  { id: 'trading',       name: 'Trading Journal',     desc: 'P&L en winrate',                   icon: 'chart.bar.xaxis.ascending.svg', category: 'Investeringen & Trading' },
  { id: 'mortgage',      name: 'Hypotheek',           desc: 'Voortgang afbetaling',             icon: 'house.svg',                     category: 'Vastgoed'                },
  { id: 'budget',        name: 'Budget Overzicht',    desc: 'Top budget categorieën',           icon: 'slider.horizontal.3.svg',       category: 'Budget'                  },
  { id: 'goals',         name: 'Spaardoelen',         desc: 'Voortgang per doel',               icon: 'target.svg',                    category: 'Spaardoelen'             },
  { id: 'subscriptions', name: 'Abonnementen',        desc: 'Maandelijkse kosten',              icon: 'creditcard.rewards.svg',        category: 'Abonnementen'            },
];

const CAT_ORDER = ['Financiën', 'Investeringen & Trading', 'Vastgoed', 'Budget', 'Spaardoelen', 'Abonnementen'];

const DEFAULT_LAYOUT = [
  { i: 'income',       x: 0, y: 0, w: 2, h: 1 },
  { i: 'spent',        x: 2, y: 0, w: 2, h: 1 },
  { i: 'net-savings',  x: 4, y: 0, w: 2, h: 1 },
  { i: 'investments',  x: 6, y: 0, w: 2, h: 1 },
  { i: 'health',       x: 0, y: 1, w: 2, h: 2 },
  { i: 'summary',      x: 2, y: 1, w: 2, h: 2 },
  { i: 'income-chart', x: 4, y: 1, w: 4, h: 2 },
  { i: 'networth',     x: 0, y: 3, w: 4, h: 2 },
  { i: 'pie',          x: 4, y: 3, w: 2, h: 2 },
  { i: 'transactions', x: 6, y: 3, w: 2, h: 2 },
  { i: 'trading',      x: 0, y: 5, w: 6, h: 1 },
  { i: 'mortgage',     x: 6, y: 5, w: 2, h: 1 },
  { i: 'portfolio',    x: 0, y: 6, w: 2, h: 1 },
  { i: 'budget',       x: 2, y: 6, w: 2, h: 2 },
  { i: 'goals',        x: 4, y: 6, w: 2, h: 2 },
  { i: 'subscriptions',x: 6, y: 6, w: 2, h: 2 },
  { i: 'cash',         x: 0, y: 7, w: 2, h: 1 },
];

function loadState() {
  try {
    const s = localStorage.getItem(LS_KEY);
    if (s) {
      const p = JSON.parse(s);
      if (p.layout && p.widgetIds) return p;
    }
  } catch {}
  return { widgetIds: DEFAULT_LAYOUT.map(l => l.i), layout: DEFAULT_LAYOUT };
}
function saveState(widgetIds, layout) {
  localStorage.setItem(LS_KEY, JSON.stringify({ widgetIds, layout }));
}

/* ═══════════════════════════════════════════════════════
   GRID SIZE PICKER
═══════════════════════════════════════════════════════ */
const PICKER_COLS = 8;
const PICKER_ROWS = 8;

function GridSizePicker({ currentW, currentH, onSelect }) {
  const [hoverW, setHoverW] = useState(currentW);
  const [hoverH, setHoverH] = useState(currentH);

  return (
    <div className="gsp-container">
      <div
        className="gsp-grid"
        onMouseLeave={() => { setHoverW(currentW); setHoverH(currentH); }}
      >
        {Array.from({ length: PICKER_ROWS }, (_, row) =>
          Array.from({ length: PICKER_COLS }, (_, col) => {
            const w = col + 1, h = row + 1;
            return (
              <div
                key={`${col}-${row}`}
                className={`gsp-cell${w <= hoverW && h <= hoverH ? ' active' : ''}`}
                onMouseEnter={() => { setHoverW(w); setHoverH(h); }}
                onClick={() => onSelect(hoverW, hoverH)}
              />
            );
          })
        )}
      </div>
      <div className="gsp-label">{hoverW} × {hoverH} cellen</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   WIDGET CONTEXT MENU
═══════════════════════════════════════════════════════ */
function WidgetContextMenu({ x, y, widget, currentW, currentH, onResize, onRemove, onShowPicker, onClose }) {
  useEffect(() => {
    const onDown = (e) => { if (!e.target.closest('.widget-ctx-menu')) onClose(); };
    const onKey  = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const def = WIDGET_CATALOGUE.find(d => d.id === widget.id);

  return (
    <div className="widget-ctx-menu" style={{ top: y, left: x }}>
      <div className="widget-ctx-name">{def?.name || 'Widget'}</div>
      <div className="widget-ctx-sep" />
      <div className="widget-ctx-section">Grootte</div>
      <GridSizePicker
        currentW={currentW}
        currentH={currentH}
        onSelect={(w, h) => { onResize(widget.id, w, h); onClose(); }}
      />
      <div className="widget-ctx-sep" />
      <button className="widget-ctx-item" onClick={() => { onShowPicker(); onClose(); }}>
        Voeg widget toe...
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   WIDGET PICKER — macOS-style bottom sheet
═══════════════════════════════════════════════════════ */
function WidgetPicker({ activeIds, onAdd, onClose, onWidgetDragStart, onWidgetDragEnd }) {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('Alle');
  const [sheetY, setSheetY] = useState(0);
  const [draggingSheet, setDraggingSheet] = useState(false);
  const [dragAbove, setDragAbove] = useState(false);
  const startYRef = useRef(null);
  const sheetRef = useRef(null);
  const categories = ['Alle', ...CAT_ORDER];

  const filtered = WIDGET_CATALOGUE.filter(w => {
    const matchCat = activeCat === 'Alle' || w.category === activeCat;
    const q = search.toLowerCase();
    const matchSearch = !q || w.name.toLowerCase().includes(q) || w.desc.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onTopbarPointerDown = useCallback((e) => {
    if (e.target.closest('input, button')) return;
    e.preventDefault();
    startYRef.current = e.clientY;
    setDraggingSheet(true);
    const onMove = (ev) => {
      const delta = Math.max(0, ev.clientY - startYRef.current);
      setSheetY(delta);
    };
    const onUp = (ev) => {
      const delta = ev.clientY - startYRef.current;
      setDraggingSheet(false);
      const sheetH = sheetRef.current?.offsetHeight || 400;
      if (delta > sheetH * 0.38) { onClose(); }
      else { setSheetY(0); }
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [onClose]);

  const handleWidgetDragStart = useCallback((e, w) => {
    e.dataTransfer.setData('text/plain', w.id);
    e.dataTransfer.effectAllowed = 'copy';
    onWidgetDragStart?.(w);
    const onDragOver = (ev) => {
      const sheetTop = sheetRef.current?.getBoundingClientRect().top ?? window.innerHeight;
      setDragAbove(ev.clientY < sheetTop - 10);
    };
    const onDragEnd = () => {
      setDragAbove(false);
      onWidgetDragEnd?.();
      document.removeEventListener('dragover', onDragOver);
      document.removeEventListener('dragend', onDragEnd);
    };
    document.addEventListener('dragover', onDragOver);
    document.addEventListener('dragend', onDragEnd);
  }, [onWidgetDragStart, onWidgetDragEnd]);

  return (
    <div className={`wps-backdrop${dragAbove ? ' drag-above' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        ref={sheetRef}
        className="wps-sheet"
        style={{
          transform: `translateY(${sheetY}px)`,
          transition: draggingSheet ? 'none' : 'transform 0.32s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        <div className="wps-handle" onPointerDown={onTopbarPointerDown} />
        <div className="wps-topbar" onPointerDown={onTopbarPointerDown}>
          <span className="wps-title">Widgets</span>
          <div className="wps-search-wrap" onPointerDown={e => e.stopPropagation()}>
            <SFIcon name="magnifyingglass.svg" size={13} color="var(--text-muted)" />
            <input
              className="wps-search"
              type="text"
              placeholder="Zoeken..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button className="wps-search-clear" onClick={() => setSearch('')}>
                <SFIcon name="xmark.circle.fill.svg" size={14} color="var(--text-muted)" />
              </button>
            )}
          </div>
          <button className="wps-close" onPointerDown={e => e.stopPropagation()} onClick={onClose}>
            <SFIcon name="xmark.svg" size={13} color="var(--text-secondary)" />
          </button>
        </div>
        <div className="wps-body">
          <div className="wps-cats">
            {categories.map(cat => (
              <button
                key={cat}
                className={`wps-cat-btn${activeCat === cat ? ' active' : ''}`}
                onClick={() => setActiveCat(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="wps-widgets-scroll">
            <div className="wps-widgets-grid">
              {filtered.map(w => {
                const on = activeIds.includes(w.id);
                return (
                  <div
                    key={w.id}
                    className={`wps-widget-card${on ? ' on' : ''}`}
                    draggable={!on}
                    onDragStart={!on ? (e) => handleWidgetDragStart(e, w) : undefined}
                    onClick={() => !on && onAdd(w)}
                    title={on ? 'Al actief op dashboard' : 'Sleep naar het dashboard of klik om toe te voegen'}
                  >
                    <div className="wps-widget-icon">
                      <SFIcon name={w.icon} size={30} color={on ? 'var(--text-muted)' : 'var(--accent)'} />
                    </div>
                    <div className="wps-widget-name">{w.name}</div>
                    <div className="wps-widget-desc">{on ? 'Al actief' : w.desc}</div>
                    {!on && (
                      <div className="wps-widget-add-badge">
                        <SFIcon name="plus.svg" size={10} color="white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════════════════ */
function StatCard({ label, value, change, changeLabel, color }) {
  const isPos = change > 0;
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value private-num" style={{ color }}>{value}</div>
      {change !== undefined && (
        <div className={`stat-change private-num ${isPos ? 'positive' : change < 0 ? 'negative' : 'neutral'}`}>
          <SFIcon name={isPos ? 'chart.line.uptrend.xyaxis.svg' : change < 0 ? 'chart.line.downtrend.xyaxis.svg' : 'minus.svg'} size={12} color="currentColor" />
          <span className="stat-change-text">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   WIDGET DATA HOOK
═══════════════════════════════════════════════════════ */
function useWidgetData() {
  const ctx = useApp();
  const navigate = useNavigate();
  const { income, expenses, net, filteredTransactions, investments, mortgage,
          transactions, budgets, subscriptions, goals, cash } = ctx;

  const catSpend = {};
  filteredTransactions.filter(t => t.amount < 0).forEach(t => {
    catSpend[t.category] = (catSpend[t.category] || 0) + Math.abs(t.amount);
  });
  const pieData = Object.entries(catSpend)
    .map(([k, v]) => ({ name: CATEGORIES[k]?.label || k, value: v, color: CATEGORIES[k]?.color || '#6B7280' }))
    .sort((a, b) => b.value - a.value).slice(0, 6);

  const allPos = [...investments.saxobank, ...investments.bybit];
  const totalInvested = allPos.reduce((s, p) => s + (p.buyPrice * (p.shares || p.amount)), 0);
  const totalCurrent  = allPos.reduce((s, p) => s + (p.currentPrice * (p.shares || p.amount)), 0);
  const investGain    = totalCurrent - totalInvested;
  const investPct     = totalInvested ? ((investGain / totalInvested) * 100).toFixed(1) : '0.0';

  const mortgagePaid  = mortgage.originalAmount - mortgage.currentBalance;
  const mortgagePct   = ((mortgagePaid / mortgage.originalAmount) * 100).toFixed(1);

  const totalPnl  = mockTrades.reduce((s, t) => s + t.pnl, 0);
  const wins      = mockTrades.filter(t => t.pnl > 0).length;
  const winRate   = ((wins / mockTrades.length) * 100).toFixed(0);
  const lastTrade = mockTrades[mockTrades.length - 1];

  const totalSubs = (subscriptions || []).filter(s => !s.markedForCancel).reduce((s, x) => s + x.amount, 0);

  const fallbackGoals = [
    { id: 1, iconKey: 'plane', target: 2000, saved: 850, name: 'Vakantie Italië', color: '#5856D6' },
    { id: 2, iconKey: 'monitor', target: 2499, saved: 1200, name: 'MacBook', color: '#34C759' },
    { id: 3, iconKey: 'shield', target: 5000, saved: 3200, name: 'Noodfonds', color: '#FF9500' },
  ];
  const activeGoals = (goals && goals.length > 0) ? goals : fallbackGoals;

  return {
    income, expenses, net, filteredTransactions, investments, mortgage,
    transactions, budgets, subscriptions, goals: activeGoals, cash,
    pieData, totalCurrent, investGain, investPct, mortgagePct,
    totalPnl, winRate, lastTrade, totalSubs, navigate,
  };
}

/* ═══════════════════════════════════════════════════════
   WIDGET RENDERERS
═══════════════════════════════════════════════════════ */
function renderWidget(id, d) {
  switch (id) {
    case 'income':
      return <StatCard label="Inkomen"      value={fmt(d.income)}       color="var(--accent-dark)"   change={1}  changeLabel="+€430 vs vorige maand" />;
    case 'spent':
      return <StatCard label="Uitgaven"     value={fmt(d.expenses)}     color="#3B82F6"              change={-1} changeLabel="-€230 vs vorige maand" />;
    case 'net-savings':
      return <StatCard label="Netto Sparen" value={fmt(d.net)}          color={d.net >= 0 ? 'var(--accent)' : 'var(--red)'} change={d.net >= 0 ? 1 : -1} changeLabel={d.net >= 0 ? 'On track' : 'Over budget'} />;
    case 'investments':
      return <StatCard label="Beleggingen"  value={fmt(d.totalCurrent)} color={d.investGain >= 0 ? 'var(--accent-mid)' : 'var(--red)'} change={d.investGain} changeLabel={`${d.investGain >= 0 ? '+' : ''}${d.investPct}% return`} />;

    case 'health':  return <HealthScore />;
    case 'summary': return <MonthlySummary />;

    case 'income-chart':
      return (
        <div className="card">
          <div className="section-header"><span className="section-title">Inkomen vs Uitgaven</span></div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '€'+v} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="income"   name="Inkomen"  fill="#1A56DB" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" name="Uitgaven" fill="#93C5FD" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );

    case 'networth':
      return (
        <div className="card">
          <div className="section-header"><span className="section-title">Vermogensgroei</span></div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={netWorthData}>
              <defs>
                <linearGradient id="nwg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '€'+v} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" name="Vermogen" stroke="var(--accent)" strokeWidth={1.5} fill="url(#nwg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );

    case 'pie':
      return (
        <div className="card">
          <div className="section-header"><span className="section-title">Categorieën</span></div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={d.pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" paddingAngle={3}>
                  {d.pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={v => ['€'+v.toFixed(2), '']} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {d.pieData.map((x, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: x.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, flex: 1, color: 'var(--text-secondary)' }}>{x.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>€{x.value.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'transactions':
      return (
        <div className="card">
          <div className="section-header" style={{ marginBottom: 10 }}>
            <span className="section-title">Recente transacties</span>
            <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => d.navigate('/finance/transactions')}>
              Alle <SFIcon name="arrow.right.svg" size={11} color="currentColor" />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {d.filteredTransactions.slice(0, 6).map(tx => (
              <div key={tx.id} className="finder-row">
                <CategoryIcon category={tx.category} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tx.date}</div>
                </div>
                <div className={`${tx.amount >= 0 ? 'amount-positive' : 'amount-negative'} private-num`} style={{ fontSize: 13 }}>
                  {tx.amount >= 0 ? '+' : ''}{fmt(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'cash':
      return (
        <div className="card">
          <div className="section-header"><span className="section-title">Contant</span></div>
          <div className="private-num" style={{ fontSize: 32, fontWeight: 200, letterSpacing: -1, marginBottom: 6 }}>
            €{d.cash?.balance?.toFixed(2) ?? '0.00'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Huidig cash saldo</div>
          {d.cash?.transactions?.slice(0,3).map(tx => (
            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderTop: '1px solid var(--border)', marginTop: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{tx.description}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: tx.amount > 0 ? 'var(--green)' : 'var(--red)' }}>
                {tx.amount > 0 ? '+' : ''}€{Math.abs(tx.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      );

    case 'portfolio':
      return (
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => d.navigate('/finance/investments')}>
          <div className="section-header">
            <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <SFIcon name="chart.line.uptrend.xyaxis.svg" size={14} color="var(--accent)" /> Portfolio
            </span>
            <SFIcon name="arrow.right.svg" size={14} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Totale waarde</div>
              <div className="private-num" style={{ fontSize: 22, fontWeight: 700 }}>{fmt(d.totalCurrent)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className={`badge ${d.investGain >= 0 ? 'badge-green' : 'badge-red'}`}>
                {d.investGain >= 0 ? '+' : ''}{d.investPct}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                {d.investGain >= 0 ? '+' : ''}{fmt(d.investGain)} totaal
              </div>
            </div>
          </div>
        </div>
      );

    case 'trading':
      return (
        <div className="card" style={{ cursor: 'pointer', borderLeft: '3px solid #059669', background: 'linear-gradient(135deg, var(--bg-card) 80%, rgba(5,150,105,0.04) 100%)' }}
          onClick={() => d.navigate('/trading')}>
          <div className="section-header">
            <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <SFIcon name="chart.bar.xaxis.ascending.svg" size={14} color="#059669" /> Trading Journal
            </span>
            <SFIcon name="arrow.right.svg" size={14} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            {[
              { lbl: 'Total P&L', val: `${d.totalPnl >= 0 ? '+' : ''}$${d.totalPnl}`, color: d.totalPnl >= 0 ? '#059669' : '#EF4444' },
              { lbl: 'Win Rate', val: `${d.winRate}%`, color: parseInt(d.winRate) >= 50 ? '#059669' : '#EF4444' },
              { lbl: 'Trades', val: mockTrades.length, color: 'var(--text-primary)' },
            ].map((x, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                {i > 0 && <div style={{ width: 1, height: 32, background: 'var(--border)' }} />}
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{x.lbl}</div>
                  <div className="private-num" style={{ fontSize: 20, fontWeight: 700, color: x.color }}>{x.val}</div>
                </div>
              </div>
            ))}
            <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
              Laatste: <strong>{d.lastTrade?.pair}</strong> {d.lastTrade?.pnl >= 0 ? '+' : ''}${d.lastTrade?.pnl}
            </div>
          </div>
        </div>
      );

    case 'mortgage':
      return (
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => d.navigate('/finance/mortgage')}>
          <div className="section-header">
            <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <SFIcon name="house.svg" size={14} color="var(--accent)" /> Hypotheek
            </span>
            <SFIcon name="arrow.right.svg" size={14} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Resterend</div>
              <div className="private-num" style={{ fontSize: 20, fontWeight: 700 }}>{fmt(d.mortgage.currentBalance)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Afbetaald</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>{d.mortgagePct}%</div>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: d.mortgagePct + '%', background: 'var(--green)' }} />
          </div>
        </div>
      );

    case 'budget':
      return (
        <div className="card">
          <div className="section-header" style={{ marginBottom: 10 }}>
            <span className="section-title">Budget</span>
            <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => d.navigate('/finance/budget')}>
              Alle <SFIcon name="arrow.right.svg" size={11} color="currentColor" />
            </button>
          </div>
          {(d.budgets || []).slice(0, 4).map(b => {
            const cat = CATEGORIES[b.category];
            const pct = Math.min((b.spent / b.limit) * 100, 100);
            const color = b.spent > b.limit ? 'var(--red)' : pct >= 80 ? 'var(--yellow)' : 'var(--green)';
            return (
              <div key={b.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cat?.label || b.category}</span>
                  <span style={{ fontSize: 12, color }}>€{b.spent.toFixed(0)} / €{b.limit}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: pct + '%', background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      );

    case 'goals': {
      const goalIcons = { plane:'airplane.svg', monitor:'laptopcomputer.svg', shield:'shield.svg', home:'house.svg', car:'car.svg', edu:'graduationcap.svg', target:'target.svg', beach:'sun.max.svg' };
      return (
        <div className="card">
          <div className="section-header" style={{ marginBottom: 10 }}>
            <span className="section-title">Spaardoelen</span>
          </div>
          {d.goals.slice(0, 3).map(g => {
            const pct = Math.min((g.saved / g.target) * 100, 100);
            return (
              <div key={g.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: (g.color || '#007AFF') + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SFIcon name={goalIcons[g.iconKey] || 'target.svg'} size={12} color={g.color || '#007AFF'} />
                  </div>
                  <span style={{ fontSize: 12, flex: 1, color: 'var(--text-primary)', fontWeight: 500 }}>{g.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pct.toFixed(0)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: pct + '%', background: g.color || 'var(--accent)' }} />
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case 'subscriptions': {
      const active = (d.subscriptions || []).filter(s => !s.markedForCancel).slice(0, 4);
      return (
        <div className="card">
          <div className="section-header" style={{ marginBottom: 10 }}>
            <span className="section-title">Abonnementen</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)' }}>-€{d.totalSubs.toFixed(2)}/mo</span>
          </div>
          {active.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{s.name}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>€{s.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      );
    }

    default:
      return <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Widget '{id}' niet gevonden</div>;
  }
}

/* ═══════════════════════════════════════════════════════
   WIDGET WRAPPER
═══════════════════════════════════════════════════════ */
function Widget({ id, editMode, onContextMenu, onRemove, children }) {
  return (
    <div
      className={`widget-rgl${editMode ? ' edit-mode' : ''}`}
      onContextMenu={e => { e.preventDefault(); onContextMenu(id, e); }}
    >
      {editMode && (
        <button
          className="widget-remove-badge"
          onClick={e => { e.stopPropagation(); onRemove(id); }}
          title="Verwijder widget"
        >
          <SFIcon name="minus.svg" size={10} color="white" />
        </button>
      )}
      <div className="widget-rgl-content">
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { transactions, investments, mortgage, budgets, subscriptions, language } = useApp();
  const dict = TRANSLATIONS[language] || TRANSLATIONS.nl;
  const t = (key) => dict[key] ?? key;

  const [widgetIds, setWidgetIds] = useState(() => loadState().widgetIds);
  const [layout, setLayout]       = useState(() => loadState().layout);
  const [showPicker, setShowPicker] = useState(false);
  const [editMode,   setEditMode]   = useState(false);
  const [ctxMenu,    setCtxMenu]    = useState(null);
  const [droppingItem, setDroppingItem] = useState(undefined);
  const data = useWidgetData();

  const handleLayoutChange = useCallback((newLayout) => {
    setLayout(newLayout);
    saveState(widgetIds, newLayout);
  }, [widgetIds]);

  const removeWidget = useCallback((id) => {
    const newIds = widgetIds.filter(w => w !== id);
    const newLayout = layout.filter(l => l.i !== id);
    setWidgetIds(newIds);
    setLayout(newLayout);
    saveState(newIds, newLayout);
  }, [widgetIds, layout]);

  const resizeWidget = useCallback((id, w, h) => {
    setLayout(prev => {
      const newLayout = prev.map(l => l.i === id ? { ...l, w, h } : l);
      saveState(widgetIds, newLayout);
      return newLayout;
    });
  }, [widgetIds]);

  const addWidget = useCallback((def) => {
    const maxY = layout.reduce((m, l) => Math.max(m, l.y + l.h), 0);
    const newItem = { i: def.id, x: 0, y: maxY, w: 2, h: 1, minW: 1, minH: 1 };
    const newIds = [...widgetIds, def.id];
    const newLayout = [...layout, newItem];
    setWidgetIds(newIds);
    setLayout(newLayout);
    saveState(newIds, newLayout);
    setShowPicker(false);
  }, [widgetIds, layout]);

  const handleGridDrop = useCallback((newLayout, item, e) => {
    const widgetId = e.dataTransfer?.getData('text/plain');
    if (!widgetId || widgetIds.includes(widgetId)) {
      setDroppingItem(undefined);
      return;
    }
    const dropped = { i: widgetId, x: item.x, y: item.y, w: item.w, h: item.h, minW: 1, minH: 1 };
    const cleaned = newLayout.filter(l => l.i !== '__dropping-elem__');
    const finalLayout = [...cleaned, dropped];
    const newIds = [...widgetIds, widgetId];
    setWidgetIds(newIds);
    setLayout(finalLayout);
    saveState(newIds, finalLayout);
    setDroppingItem(undefined);
    setShowPicker(false);
  }, [widgetIds]);

  const handleContextMenu = useCallback((id, e) => {
    const menuW = 220, menuH = 380;
    const x = Math.min(e.clientX, window.innerWidth  - menuW - 12);
    const y = Math.min(e.clientY, window.innerHeight - menuH - 12);
    const item = layout.find(l => l.i === id);
    setCtxMenu({ widget: { id }, x, y, currentW: item?.w ?? 2, currentH: item?.h ?? 2 });
  }, [layout]);

  /* Close edit mode on Escape */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && editMode) setEditMode(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [editMode]);

  return (
    <div onDoubleClick={() => { if (!editMode) setEditMode(true); }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('greeting')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-ghost" style={{ fontSize: 13, gap: 6 }}
            onClick={() => downloadAnnualReport({ transactions, investments, mortgage, budgets, subscriptions })}>
            <SFIcon name="square.and.arrow.down.svg" size={14} color="currentColor" /> {t('annual_report')}
          </button>
          <MonthSelector />
          <button
            className={`btn ${editMode ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: 13, gap: 6 }}
            onClick={() => setEditMode(m => !m)}
            title={editMode ? 'Stop met bewerken (Esc)' : 'Widgets bewerken'}
          >
            <SFIcon name="pencil.svg" size={14} color={editMode ? 'white' : 'currentColor'} />
            {editMode ? 'Gereed' : 'Bewerk'}
          </button>
        </div>
      </div>

      {/* Edit mode banner */}
      {editMode && (
        <div className="widget-edit-banner">
          <SFIcon name="pencil.svg" size={13} color="var(--accent)" />
          <span>Bewerkmodus — sleep widgets om te verplaatsen, rechtsklik voor grootte, <kbd>−</kbd> om te verwijderen</span>
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: '3px 10px', marginLeft: 'auto' }}
            onClick={() => setShowPicker(true)}>
            <SFIcon name="plus.svg" size={12} color="currentColor" /> Widget toevoegen
          </button>
        </div>
      )}

      {/* Widget grid */}
      {widgetIds.length > 0 ? (
        <RGL
          className={`widget-grid${editMode ? ' edit-mode-grid' : ''}`}
          layout={layout}
          cols={GRID_COLS}
          rowHeight={GRID_ROW_HEIGHT}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          onLayoutChange={handleLayoutChange}
          isDraggable={true}
          isResizable={true}
          compactType="vertical"
          preventCollision={false}
          resizeHandles={['se']}
          isDroppable={true}
          droppingItem={droppingItem}
          onDrop={handleGridDrop}
        >
          {widgetIds.map(id => (
            <div key={id} className="widget-rgl-outer">
              <Widget
                id={id}
                editMode={editMode}
                onContextMenu={handleContextMenu}
                onRemove={removeWidget}
              >
                {renderWidget(id, data)}
              </Widget>
            </div>
          ))}
        </RGL>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Geen widgets actief</div>
          <button className="btn btn-primary" onClick={() => { setEditMode(true); setShowPicker(true); }}>
            <SFIcon name="plus.svg" size={14} color="white" /> Widgets toevoegen
          </button>
        </div>
      )}

      {/* Right-click context menu */}
      {ctxMenu && (
        <WidgetContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          widget={ctxMenu.widget}
          currentW={ctxMenu.currentW}
          currentH={ctxMenu.currentH}
          onResize={resizeWidget}
          onRemove={removeWidget}
          onShowPicker={() => setShowPicker(true)}
          onClose={() => setCtxMenu(null)}
        />
      )}

      {/* Widget picker modal */}
      {showPicker && (
        <WidgetPicker
          activeIds={widgetIds}
          onAdd={addWidget}
          onClose={() => setShowPicker(false)}
          onWidgetDragStart={(w) => setDroppingItem({ i: '__dropping__', w: 2, h: 1 })}
          onWidgetDragEnd={() => setDroppingItem(undefined)}
        />
      )}
    </div>
  );
}
