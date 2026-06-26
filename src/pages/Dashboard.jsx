import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
const LS_KEY = 'fd2-widgets-v2';

/* ═══════════════════════════════════════════════════════
   WIDGET CATALOGUE
═══════════════════════════════════════════════════════ */
const WIDGET_SIZES = ['mini','small','medium','large','xlarge','fullscreen'];
const WIDGET_SIZE_LABELS = { mini:'Mini', small:'Klein', medium:'Middel', large:'Groot', xlarge:'Heel Groot', fullscreen:'Volledig scherm' };

const WIDGET_CATALOGUE = [
  { id: 'kpi',           name: 'KPI Kaarten',        desc: 'Inkomen, uitgaven & spaargeld',    icon: 'creditcard.svg',                category: 'Financiën',               defaultSize: 'medium' },
  { id: 'health',        name: 'Health Score',        desc: 'Financiële gezondheid',            icon: 'heart.svg',                     category: 'Financiën',               defaultSize: 'small'  },
  { id: 'summary',       name: 'AI Samenvatting',     desc: 'Maandelijkse inzichten',           icon: 'brain.svg',                     category: 'Financiën',               defaultSize: 'small'  },
  { id: 'income-chart',  name: 'Inkomen vs Uitgaven', desc: 'Staafgrafiek per maand',           icon: 'chart.bar.svg',                 category: 'Financiën',               defaultSize: 'small'  },
  { id: 'networth',      name: 'Vermogensgroei',      desc: 'Netto vermogen over tijd',         icon: 'chart.line.uptrend.xyaxis.svg', category: 'Financiën',               defaultSize: 'small'  },
  { id: 'pie',           name: 'Categorieën',         desc: 'Uitgaven per categorie',           icon: 'percent.svg',                   category: 'Financiën',               defaultSize: 'small'  },
  { id: 'transactions',  name: 'Transacties',         desc: 'Recente transacties',              icon: 'list.bullet.svg',               category: 'Financiën',               defaultSize: 'small'  },
  { id: 'cash',          name: 'Contant Geld',        desc: 'Huidig cash saldo',               icon: 'banknote.svg',                  category: 'Financiën',               defaultSize: 'small'  },
  { id: 'portfolio',     name: 'Portfolio',           desc: 'Totale beleggingswaarde',          icon: 'briefcase.svg',                 category: 'Investeringen & Trading', defaultSize: 'small'  },
  { id: 'trading',       name: 'Trading Journal',     desc: 'P&L en winrate',                   icon: 'chart.bar.xaxis.ascending.svg', category: 'Investeringen & Trading', defaultSize: 'medium' },
  { id: 'mortgage',      name: 'Hypotheek',           desc: 'Voortgang afbetaling',             icon: 'house.svg',                     category: 'Vastgoed',                defaultSize: 'small'  },
  { id: 'budget',        name: 'Budget Overzicht',    desc: 'Top budget categorieën',           icon: 'slider.horizontal.3.svg',       category: 'Budget',                  defaultSize: 'small'  },
  { id: 'goals',         name: 'Spaardoelen',         desc: 'Voortgang per doel',               icon: 'target.svg',                    category: 'Spaardoelen',             defaultSize: 'small'  },
  { id: 'subscriptions', name: 'Abonnementen',        desc: 'Maandelijkse kosten',              icon: 'creditcard.rewards.svg',        category: 'Abonnementen',            defaultSize: 'small'  },
];

const CAT_ORDER = ['Financiën', 'Investeringen & Trading', 'Vastgoed', 'Budget', 'Spaardoelen', 'Abonnementen'];

const DEFAULT_WIDGETS = [
  { id: 'kpi',          size: 'medium' },
  { id: 'health',       size: 'small'  },
  { id: 'summary',      size: 'small'  },
  { id: 'income-chart', size: 'small'  },
  { id: 'networth',     size: 'small'  },
  { id: 'pie',          size: 'small'  },
  { id: 'transactions', size: 'small'  },
  { id: 'trading',      size: 'medium' },
  { id: 'mortgage',     size: 'small'  },
  { id: 'portfolio',    size: 'small'  },
  { id: 'budget',       size: 'small'  },
  { id: 'goals',        size: 'small'  },
  { id: 'subscriptions',size: 'small'  },
  { id: 'cash',         size: 'small'  },
];

function migrateWidget(w) {
  if (w.size) return w;
  return { id: w.id, size: w.span >= 2 ? 'medium' : 'small' };
}
function loadWidgets() {
  try { const s = localStorage.getItem(LS_KEY); if (s) return JSON.parse(s).map(migrateWidget); } catch {}
  return DEFAULT_WIDGETS;
}
function saveWidgets(list) { localStorage.setItem(LS_KEY, JSON.stringify(list)); }

/* ═══════════════════════════════════════════════════════
   WIDGET CONTEXT MENU
═══════════════════════════════════════════════════════ */
function WidgetContextMenu({ x, y, widget, onResize, onRemove, onShowPicker, onClose }) {
  useEffect(() => {
    const onDown = (e) => { if (!e.target.closest('.widget-ctx-menu')) onClose(); };
    const onKey  = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const def = WIDGET_CATALOGUE.find(d => d.id === widget.id);
  const current = widget.size || 'small';

  return (
    <div className="widget-ctx-menu" style={{ top: y, left: x }}>
      <div className="widget-ctx-name">{def?.name || 'Widget'}</div>
      <div className="widget-ctx-sep" />
      <div className="widget-ctx-section">Grootte</div>
      {WIDGET_SIZES.map(size => (
        <button
          key={size}
          className={`widget-ctx-item${current === size ? ' checked' : ''}`}
          onClick={() => { onResize(widget.id, size); onClose(); }}
        >
          {WIDGET_SIZE_LABELS[size]}
        </button>
      ))}
      <div className="widget-ctx-sep" />
      <button className="widget-ctx-item danger" onClick={() => { onRemove(widget.id); onClose(); }}>
        Verwijder widget
      </button>
      <button className="widget-ctx-item" onClick={() => { onShowPicker(); onClose(); }}>
        Voeg widget toe...
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   WIDGET PICKER MODAL
═══════════════════════════════════════════════════════ */
function WidgetPicker({ activeIds, onAdd, onClose }) {
  const byCategory = CAT_ORDER.map(cat => ({
    cat,
    widgets: WIDGET_CATALOGUE.filter(w => w.category === cat),
  }));

  return (
    <div className="darwin-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="darwin-ctx-modal">
        <div className="darwin-ctx-header">
          <span className="darwin-ctx-dot" />
          <span className="darwin-ctx-title">Widget toevoegen</span>
        </div>
        <div className="darwin-ctx-divider" />
        <div className="darwin-ctx-body">
          <div className="darwin-picker-scroll">
            {byCategory.map(({ cat, widgets }) => (
              <div key={cat} className="darwin-picker-section">
                <div className="darwin-picker-cat">{cat}</div>
                <div className="darwin-picker-grid">
                  {widgets.map(w => {
                    const on = activeIds.includes(w.id);
                    return (
                      <div
                        key={w.id}
                        className={`widget-picker-item${on ? ' already-on' : ''}`}
                        onClick={() => !on && onAdd(w)}
                      >
                        <div className="widget-picker-icon">
                          <SFIcon name={w.icon} size={26} color={on ? 'var(--text-muted)' : 'var(--accent)'} />
                        </div>
                        <div className="widget-picker-name">{w.name}</div>
                        <div className="widget-picker-desc">{on ? 'Al actief' : w.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="darwin-ctx-footer" style={{ borderTop: '1px solid var(--border)', marginTop: 0 }}>
            <button className="darwin-ctx-cancel" onClick={onClose}>Sluiten</button>
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
          {changeLabel}
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
    case 'kpi':
      return (
        <div className="grid-4">
          <StatCard label="Income"       value={fmt(d.income)}       color="var(--accent-dark)"   change={1}  changeLabel="+€430 vs vorige maand" />
          <StatCard label="Spent"        value={fmt(d.expenses)}     color="#3B82F6"              change={-1} changeLabel="-€230 vs vorige maand" />
          <StatCard label="Net Savings"  value={fmt(d.net)}          color={d.net >= 0 ? 'var(--accent)' : 'var(--red)'} change={d.net >= 0 ? 1 : -1} changeLabel={d.net >= 0 ? 'On track' : 'Over budget'} />
          <StatCard label="Investments"  value={fmt(d.totalCurrent)} color={d.investGain >= 0 ? 'var(--accent-mid)' : 'var(--red)'} change={d.investGain} changeLabel={`${d.investGain >= 0 ? '+' : ''}${d.investPct}% return`} />
        </div>
      );

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
   WIDGET WRAPPER — drag + right-click + edit mode + resize
═══════════════════════════════════════════════════════ */
function Widget({ w, editMode, isDragging, dropPos, onDragStart, onDragOver, onDragEnd, onDrop, onContextMenu, onRemove, onResize, children }) {
  const [isResizing, setIsResizing] = useState(false);
  const [previewSize, setPreviewSize] = useState(null);

  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const sizes = WIDGET_SIZES;
    const currentIdx = sizes.indexOf(w.size || 'small');
    let latestSize = w.size || 'small';
    setIsResizing(true);

    const onMove = (mv) => {
      const delta = mv.clientX - startX;
      const steps = Math.round(delta / 110);
      const newIdx = Math.max(0, Math.min(sizes.length - 1, currentIdx + steps));
      latestSize = sizes[newIdx];
      setPreviewSize(latestSize);
    };

    const onUp = () => {
      onResize(w.id, latestSize);
      setIsResizing(false);
      setPreviewSize(null);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [w.id, w.size, onResize]);

  const displaySize = previewSize || w.size || 'small';

  return (
    <div
      className={[
        'widget-dnd',
        isDragging  ? 'dragging'    : '',
        dropPos     ? `drop-${dropPos}` : '',
        editMode    ? 'edit-mode'   : '',
        isResizing  ? 'resizing'    : '',
      ].filter(Boolean).join(' ')}
      data-size={displaySize}
      draggable={!isResizing && !editMode}
      onDragStart={() => { if (!isResizing && !editMode) onDragStart(w.id); }}
      onDragOver={e => { e.preventDefault(); onDragOver(w.id, e); }}
      onDragEnd={onDragEnd}
      onDrop={e => { e.preventDefault(); onDrop(w.id, e); }}
      onContextMenu={e => { e.preventDefault(); onContextMenu(w, e); }}
    >
      {/* Remove badge — edit mode only */}
      {editMode && (
        <button
          className="widget-remove-badge"
          onClick={e => { e.stopPropagation(); onRemove(w.id); }}
          title="Verwijder widget"
        >
          <SFIcon name="minus.svg" size={10} color="white" />
        </button>
      )}

      {/* Drag grip — shown on hover when NOT in edit mode */}
      {!editMode && (
        <div className="widget-drag-grip" title="Sleep om te verplaatsen">
          <SFIcon name="line.3.horizontal.svg" size={12} color="var(--text-muted)" />
        </div>
      )}

      {children}

      {/* Resize handle — shown on hover */}
      <div
        className="widget-resize-handle"
        onMouseDown={handleResizeStart}
        title={`Formaat: ${WIDGET_SIZE_LABELS[displaySize]} — sleep om te vergroten`}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M9 1L1 9M9 5L5 9M9 9L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Resize size preview label */}
      {previewSize && (
        <div className="widget-resize-label">
          {WIDGET_SIZE_LABELS[previewSize]}
        </div>
      )}
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

  const [widgets, setWidgets] = useState(loadWidgets);
  const [showPicker, setShowPicker] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [ctxMenu, setCtxMenu] = useState(null);
  const [dragId, setDragId] = useState(null);
  // dropIndicator: { targetId, position: 'before' | 'after' }
  const [dropIndicator, setDropIndicator] = useState(null);
  const data = useWidgetData();

  /* ── DnD with drop indicator ── */
  const handleDragStart = (id) => setDragId(id);

  const handleDragOver = useCallback((id, e) => {
    if (!dragId || dragId === id) return;
    // Determine if cursor is in left or right half of target
    const rect = e.currentTarget?.getBoundingClientRect?.();
    const pos = rect && (e.clientX - rect.left) < rect.width / 2 ? 'before' : 'after';
    setDropIndicator({ targetId: id, position: pos });
  }, [dragId]);

  const handleDragEnd = () => {
    setDragId(null);
    setDropIndicator(null);
  };

  const handleDrop = useCallback((targetId) => {
    if (!dragId || dragId === targetId) { handleDragEnd(); return; }
    setWidgets(prev => {
      const arr   = [...prev];
      const fromI = arr.findIndex(w => w.id === dragId);
      const toI   = arr.findIndex(w => w.id === targetId);
      if (fromI === -1 || toI === -1) return prev;
      const [item] = arr.splice(fromI, 1);
      const insertAt = dropIndicator?.position === 'before' ? toI : toI + 1;
      arr.splice(Math.min(insertAt, arr.length), 0, item);
      saveWidgets(arr);
      return arr;
    });
    setDragId(null);
    setDropIndicator(null);
  }, [dragId, dropIndicator]);

  /* ── Widget actions ── */
  const removeWidget = (id) => {
    setWidgets(prev => { const n = prev.filter(w => w.id !== id); saveWidgets(n); return n; });
  };
  const resizeWidget = (id, size) => {
    setWidgets(prev => { const n = prev.map(w => w.id === id ? { ...w, size } : w); saveWidgets(n); return n; });
  };
  const addWidget = (def) => {
    const n = [...widgets, { id: def.id, size: def.defaultSize || 'small' }];
    setWidgets(n); saveWidgets(n); setShowPicker(false);
  };
  const handleContextMenu = (w, e) => {
    const menuW = 215, menuH = 310;
    const x = Math.min(e.clientX, window.innerWidth  - menuW - 12);
    const y = Math.min(e.clientY, window.innerHeight - menuH - 12);
    setCtxMenu({ widget: w, x, y });
  };

  /* ── Close edit mode on Escape ── */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && editMode) setEditMode(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [editMode]);

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
          <span>Bewerkmodus actief — sleep widgets om te herordenen, druk <kbd>−</kbd> om te verwijderen</span>
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: '3px 10px', marginLeft: 'auto' }}
            onClick={() => setShowPicker(true)}>
            <SFIcon name="plus.svg" size={12} color="currentColor" /> Widget toevoegen
          </button>
        </div>
      )}

      {/* Widget grid */}
      <div className={`widget-dnd-grid${editMode ? ' edit-mode-grid' : ''}`}>
        {widgets.map(w => {
          const indicator = dropIndicator?.targetId === w.id ? dropIndicator.position : null;
          return (
            <Widget
              key={w.id}
              w={w}
              editMode={editMode}
              isDragging={dragId === w.id}
              dropPos={indicator}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              onContextMenu={handleContextMenu}
              onRemove={removeWidget}
              onResize={resizeWidget}
            >
              {renderWidget(w.id, data)}
            </Widget>
          );
        })}

        {/* Add widget placeholder — edit mode */}
        {editMode && (
          <div
            className="widget-add-placeholder"
            onClick={() => setShowPicker(true)}
            title="Widget toevoegen"
          >
            <SFIcon name="plus.svg" size={22} color="var(--text-muted)" />
            <span>Widget toevoegen</span>
          </div>
        )}
      </div>

      {widgets.length === 0 && !editMode && (
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
          onResize={resizeWidget}
          onRemove={removeWidget}
          onShowPicker={() => setShowPicker(true)}
          onClose={() => setCtxMenu(null)}
        />
      )}

      {/* Widget picker modal */}
      {showPicker && (
        <WidgetPicker
          activeIds={widgets.map(w => w.id)}
          onAdd={addWidget}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
