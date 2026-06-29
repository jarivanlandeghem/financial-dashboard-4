import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GridLayout, { WidthProvider } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
const RGL = WidthProvider(GridLayout);
import SFIcon from '../components/SFIcon';
import { useT } from '../i18n/useT';
import { mockTrades } from '../data/tradingData';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useApp } from '../context/AppContext';
import PeriodDropdown from '../components/PeriodDropdown';
import PeriodSelector from '../components/PeriodSelector';
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
  { id: 'income',        nameKey: 'wcat_income',        descKey: 'wcat_income_desc',        icon: 'chart.line.uptrend.xyaxis.svg', categoryKey: 'wgrp_finance'        },
  { id: 'spent',         nameKey: 'wcat_spent',         descKey: 'wcat_spent_desc',         icon: 'chart.bar.svg',                 categoryKey: 'wgrp_finance'        },
  { id: 'net-savings',   nameKey: 'wcat_net_savings',   descKey: 'wcat_net_savings_desc',   icon: 'banknote.svg',                  categoryKey: 'wgrp_finance'        },
  { id: 'investments',   nameKey: 'wcat_investments',   descKey: 'wcat_investments_desc',   icon: 'briefcase.svg',                 categoryKey: 'wgrp_finance'        },
  { id: 'health',        nameKey: 'wcat_health',        descKey: 'wcat_health_desc',        icon: 'heart.svg',                     categoryKey: 'wgrp_finance'        },
  { id: 'summary',       nameKey: 'wcat_summary',       descKey: 'wcat_summary_desc',       icon: 'brain.svg',                     categoryKey: 'wgrp_finance'        },
  { id: 'income-chart',  nameKey: 'wcat_income_chart',  descKey: 'wcat_income_chart_desc',  icon: 'chart.bar.svg',                 categoryKey: 'wgrp_finance'        },
  { id: 'networth',      nameKey: 'wcat_networth',      descKey: 'wcat_networth_desc',      icon: 'chart.line.uptrend.xyaxis.svg', categoryKey: 'wgrp_finance'        },
  { id: 'pie',           nameKey: 'wcat_pie',           descKey: 'wcat_pie_desc',           icon: 'percent.svg',                   categoryKey: 'wgrp_finance'        },
  { id: 'transactions',  nameKey: 'wcat_transactions',  descKey: 'wcat_transactions_desc',  icon: 'list.bullet.svg',               categoryKey: 'wgrp_finance'        },
  { id: 'cash',          nameKey: 'wcat_cash',          descKey: 'wcat_cash_desc',          icon: 'banknote.svg',                  categoryKey: 'wgrp_finance'        },
  { id: 'portfolio',     nameKey: 'wcat_portfolio',     descKey: 'wcat_portfolio_desc',     icon: 'briefcase.svg',                 categoryKey: 'wgrp_trading'        },
  { id: 'trading',       nameKey: 'wcat_trading',       descKey: 'wcat_trading_desc',       icon: 'chart.bar.xaxis.ascending.svg', categoryKey: 'wgrp_trading'        },
  { id: 'mortgage',      nameKey: 'wcat_mortgage',      descKey: 'wcat_mortgage_desc',      icon: 'house.svg',                     categoryKey: 'wgrp_real_estate'    },
  { id: 'budget',        nameKey: 'wcat_budget',        descKey: 'wcat_budget_desc',        icon: 'slider.horizontal.3.svg',       categoryKey: 'wgrp_budget'         },
  { id: 'goals',         nameKey: 'wcat_goals',         descKey: 'wcat_goals_desc',         icon: 'target.svg',                    categoryKey: 'wgrp_goals'          },
  { id: 'subscriptions', nameKey: 'wcat_subscriptions', descKey: 'wcat_subscriptions_desc', icon: 'creditcard.rewards.svg',        categoryKey: 'wgrp_subscriptions'  },
];

const CAT_ORDER_KEYS = ['wgrp_finance', 'wgrp_trading', 'wgrp_real_estate', 'wgrp_budget', 'wgrp_goals', 'wgrp_subscriptions'];

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
   WIDGET PICKER — macOS-style bottom sheet
═══════════════════════════════════════════════════════ */
function WidgetPicker({ activeIds, onAdd, onClose, onWidgetDragStart, onWidgetDragEnd }) {
  const t = useT();
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [sheetY, setSheetY] = useState(0);
  const [draggingSheet, setDraggingSheet] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [dragAbove, setDragAbove] = useState(false);
  const startYRef = useRef(null);
  const sheetRef = useRef(null);
  const categories = ['all', ...CAT_ORDER_KEYS];

  const filtered = WIDGET_CATALOGUE.filter(w => {
    const matchCat = activeCat === 'all' || w.categoryKey === activeCat;
    const q = search.toLowerCase();
    const name = t(w.nameKey).toLowerCase();
    const desc = t(w.descKey).toLowerCase();
    const matchSearch = !q || name.includes(q) || desc.includes(q);
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
      if (delta > sheetH * 0.6) { onClose(); }
      else if (delta > sheetH * 0.25) { setMinimized(true); setSheetY(0); }
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
    <>
      <div
        className={`wps-backdrop${dragAbove ? ' drag-above' : ''}${minimized ? ' wps-minimized' : ''}`}
        onClick={e => !minimized && e.target === e.currentTarget && onClose()}
      >
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
            <span className="wps-title">{t('widgets_title')}</span>
            <div className="wps-search-wrap" onPointerDown={e => e.stopPropagation()}>
              <SFIcon name="magnifyingglass.svg" size={13} color="var(--text-muted)" />
              <input
                className="wps-search"
                type="text"
                placeholder={t('widgets_search')}
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
                  {cat === 'all' ? t('all') : t(cat)}
                </button>
              ))}
            </div>
            <div className="wps-widgets-scroll">
              <div className="wps-widgets-grid">
                {filtered.map(w => (
                  <div
                    key={w.id}
                    className="wps-widget-card"
                    draggable
                    onDragStart={(e) => handleWidgetDragStart(e, w)}
                    onClick={() => onAdd(w)}
                    title={t('widgets_drag_hint')}
                  >
                    <div className="wps-widget-icon">
                      <SFIcon name={w.icon} size={30} color="var(--accent)" />
                    </div>
                    <div className="wps-widget-name">{t(w.nameKey)}</div>
                    <div className="wps-widget-desc">{t(w.descKey)}</div>
                    <div className="wps-widget-add-badge">
                      <SFIcon name="plus.svg" size={10} color="white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {minimized && (
        <button className="wps-minimized-tab" onClick={() => { setMinimized(false); setSheetY(0); }}>
          <SFIcon name="chevron.up.svg" size={12} color="currentColor" />
          {t('widgets_btn')}
        </button>
      )}
    </>
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
function renderWidget(id, d, t) {
  const type = id.replace(/__\d+$/, '');
  switch (type) {
    case 'income':
      return <StatCard label={t('w_income')} value={fmt(d.income)} color="#1A56DB" change={1} changeLabel={t('w_vs_last_month_pos').replace('{n}', '430')} />;
    case 'spent':
      return <StatCard label={t('w_spent')} value={fmt(d.expenses)} color="#3B82F6" change={-1} changeLabel={t('w_vs_last_month_neg').replace('{n}', '230')} />;
    case 'net-savings':
      return <StatCard label={t('w_net_savings')} value={fmt(d.net)} color={d.net >= 0 ? '#34C759' : '#FF3B30'} change={d.net >= 0 ? 1 : -1} changeLabel={d.net >= 0 ? t('w_on_track') : t('w_behind')} />;
    case 'investments':
      return <StatCard label={t('w_investments')} value={fmt(d.totalCurrent)} color={d.investGain >= 0 ? '#30D158' : '#FF3B30'} change={d.investGain} changeLabel={`${d.investGain >= 0 ? '+' : ''}${d.investPct}%`} />;

    case 'health':  return <HealthScore />;
    case 'summary': return <MonthlySummary />;

    case 'income-chart':
      return (
        <div className="card">
          <div className="section-header"><span className="section-title">{t('w_income_chart')}</span></div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '€'+v} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="income" name={t('w_income_legend')} fill="#1A56DB" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" name={t('w_expenses_legend')} fill="#93C5FD" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );

    case 'networth':
      return (
        <div className="card">
          <div className="section-header"><span className="section-title">{t('w_networth_chart')}</span></div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={netWorthData}>
              <defs>
                <linearGradient id="nwg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '€'+v} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" name={t('w_networth_label')} stroke="#007AFF" strokeWidth={1.5} fill="url(#nwg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );

    case 'pie':
      return (
        <div className="card">
          <div className="section-header"><span className="section-title">{t('w_categories')}</span></div>
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
            <span className="section-title">{t('w_recent_tx')}</span>
            <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => d.navigate('/finance/transactions')}>
              {t('view_all')}<SFIcon name="arrow.right.svg" size={11} color="currentColor" />
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
          <div className="section-header"><span className="section-title">{t('w_cash')}</span></div>
          <div className="private-num" style={{ fontSize: 32, fontWeight: 200, letterSpacing: -1, marginBottom: 6 }}>
            €{d.cash?.balance?.toFixed(2) ?? '0.00'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('w_cash_balance')}</div>
          {d.cash?.transactions?.slice(0,3).map(tx => (
            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderTop: '1px solid var(--border)', marginTop: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{tx.description}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: tx.amount > 0 ? '#34C759' : '#FF3B30' }}>
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
              <SFIcon name="chart.line.uptrend.xyaxis.svg" size={14} color="var(--accent)" /> {t('w_portfolio')}
            </span>
            <SFIcon name="arrow.right.svg" size={14} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('w_portfolio_total')}</div>
              <div className="private-num" style={{ fontSize: 22, fontWeight: 700 }}>{fmt(d.totalCurrent)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className={`badge ${d.investGain >= 0 ? 'badge-green' : 'badge-red'}`}>
                {d.investGain >= 0 ? '+' : ''}{d.investPct}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                {d.investGain >= 0 ? '+' : ''}{fmt(d.investGain)} {t('w_portfolio_pct')}
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
              <SFIcon name="chart.bar.xaxis.ascending.svg" size={14} color="#059669" /> {t('w_trading')}
            </span>
            <SFIcon name="arrow.right.svg" size={14} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            {[
              { lbl: t('w_trading_pnl'),     val: `${d.totalPnl >= 0 ? '+' : ''}$${d.totalPnl}`, color: d.totalPnl >= 0 ? '#059669' : '#EF4444' },
              { lbl: t('w_trading_winrate'), val: `${d.winRate}%`, color: parseInt(d.winRate) >= 50 ? '#059669' : '#EF4444' },
              { lbl: t('w_trading_trades'),  val: mockTrades.length, color: 'var(--text-primary)' },
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
              {t('w_trading_last')} <strong>{d.lastTrade?.pair}</strong> {d.lastTrade?.pnl >= 0 ? '+' : ''}${d.lastTrade?.pnl}
            </div>
          </div>
        </div>
      );

    case 'mortgage':
      return (
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => d.navigate('/finance/mortgage')}>
          <div className="section-header">
            <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <SFIcon name="house.svg" size={14} color="var(--accent)" /> {t('w_mortgage')}
            </span>
            <SFIcon name="arrow.right.svg" size={14} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t('w_mortgage_remain')}</div>
              <div className="private-num" style={{ fontSize: 20, fontWeight: 700 }}>{fmt(d.mortgage.currentBalance)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t('w_mortgage_paid')}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#34C759' }}>{d.mortgagePct}%</div>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: d.mortgagePct + '%', background: '#34C759' }} />
          </div>
        </div>
      );

    case 'budget':
      return (
        <div className="card">
          <div className="section-header" style={{ marginBottom: 10 }}>
            <span className="section-title">{t('w_budget')}</span>
            <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => d.navigate('/finance/budget')}>
              {t('view_all')}<SFIcon name="arrow.right.svg" size={11} color="currentColor" />
            </button>
          </div>
          {(d.budgets || []).slice(0, 4).map(b => {
            const cat = CATEGORIES[b.category];
            const pct = Math.min((b.spent / b.limit) * 100, 100);
            const color = b.spent > b.limit ? '#FF3B30' : pct >= 80 ? '#FF9500' : '#34C759';
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
      const goalIcons = { plane: 'airplane.svg', monitor: 'laptopcomputer.svg', shield: 'shield.svg', home: 'house.svg', car: 'car.svg', edu: 'graduationcap.svg', target: 'target.svg', beach: 'sun.max.svg' };
      return (
        <div className="card">
          <div className="section-header" style={{ marginBottom: 10 }}>
            <span className="section-title">{t('w_goals')}</span>
          </div>
          {d.goals.slice(0, 3).map(g => {
            const pct = Math.min((g.saved / g.target) * 100, 100);
            return (
              <div key={g.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                  <div data-squircle-r={8} style={{ width: 24, height: 24, background: (g.color || '#007AFF') + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SFIcon name={goalIcons[g.iconKey] || 'target.svg'} size={12} color={g.color || '#007AFF'} />
                  </div>
                  <span style={{ fontSize: 12, flex: 1, color: 'var(--text-primary)', fontWeight: 500 }}>{g.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pct.toFixed(0)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: pct + '%', background: g.color || '#007AFF' }} />
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
            <span className="section-title">{t('w_subscriptions')}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#FF3B30' }}>-€{d.totalSubs.toFixed(2)}/mo</span>
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
      return <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('widget_not_found')}</div>;
  }
}

/* ═══════════════════════════════════════════════════════
   WIDGET CONTEXT MENU
═══════════════════════════════════════════════════════ */
function WidgetContextMenu({ x, y, onEnterEditMode, onClose }) {
  const t = useT();
  useEffect(() => {
    const onDown = (e) => { if (!e.target.closest('.widget-ctx-menu')) onClose(); };
    const onKey  = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return (
    <div className="widget-ctx-menu" style={{ top: y, left: x }}>
      <button className="widget-ctx-item" onClick={() => { onEnterEditMode(); onClose(); }}>
        <SFIcon name="pencil.svg" size={13} color="currentColor" style={{ marginRight: 6 }} />
        {t('widgets_btn')}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   WIDGET WRAPPER
═══════════════════════════════════════════════════════ */
function Widget({ id, editMode, onContextMenu, onRemove, children }) {
  const t = useT();
  return (
    <div
      className={`widget-rgl${editMode ? ' edit-mode' : ''}`}
      onContextMenu={e => { e.preventDefault(); onContextMenu(id, e); }}
    >
      {editMode && (
        <button
          className="widget-remove-badge"
          onClick={e => { e.stopPropagation(); onRemove(id); }}
          title={t('widget_remove')}
        >
          <SFIcon name="minus.svg" size={10} color="var(--text-primary)" />
        </button>
      )}
      {editMode && (
        <div className="apple-grab-handle" aria-hidden="true">
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none" overflow="visible">
            <path d="M 28 7 A 22 22 0 0 1 7 28" style={{ stroke: 'var(--border)' }} strokeWidth="11" strokeLinecap="round" />
            <path d="M 28 7 A 22 22 0 0 1 7 28" style={{ stroke: 'var(--bg-card)' }} strokeWidth="8" strokeLinecap="round" />
          </svg>
        </div>
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
  const { transactions, investments, mortgage, budgets, subscriptions } = useApp();
  const t = useT();

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

  const addWidget = useCallback((def) => {
    let instanceId = def.id;
    let n = 2;
    while (widgetIds.includes(instanceId)) instanceId = `${def.id}__${n++}`;
    const maxY = layout.reduce((m, l) => Math.max(m, l.y + l.h), 0);
    const newItem = { i: instanceId, x: 0, y: maxY, w: 2, h: 1, minW: 1, minH: 1 };
    const newIds = [...widgetIds, instanceId];
    const newLayout = [...layout, newItem];
    setWidgetIds(newIds);
    setLayout(newLayout);
    saveState(newIds, newLayout);
    setShowPicker(false);
  }, [widgetIds, layout]);

  const handleGridDrop = useCallback((newLayout, item, e) => {
    const baseId = e.dataTransfer?.getData('text/plain');
    if (!baseId) { setDroppingItem(undefined); return; }
    let widgetId = baseId;
    let n = 2;
    while (widgetIds.includes(widgetId)) widgetId = `${baseId}__${n++}`;
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
    const x = Math.min(e.clientX, window.innerWidth  - 200);
    const y = Math.min(e.clientY, window.innerHeight - 80);
    setCtxMenu({ x, y });
  }, []);

  /* Close edit mode on Escape */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setEditMode(false); setCtxMenu(null); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const enterEditMode = useCallback(() => {
    setEditMode(true);
    setShowPicker(true);
  }, []);

  return (
    <div>
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
          <PeriodDropdown />
          <PeriodSelector />
        </div>
      </div>

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
                {renderWidget(id, data, t)}
              </Widget>
            </div>
          ))}
        </RGL>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{t('widgets_empty')}</div>
          <button className="btn btn-primary" onClick={() => { setEditMode(true); setShowPicker(true); }}>
            <SFIcon name="plus.svg" size={14} color="white" /> {t('widgets_add')}
          </button>
        </div>
      )}

      {/* Right-click context menu */}
      {ctxMenu && (
        <WidgetContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          onEnterEditMode={enterEditMode}
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
