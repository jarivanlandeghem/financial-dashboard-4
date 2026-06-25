import { useState, useRef, useCallback } from 'react';
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

const fmt = (n) => '€' + Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const LS_KEY = 'fd2-widgets-v2';

/* ═══════════════════════════════════════════════════════
   WIDGET CATALOGUE  (id, name, desc, icon, category, defaultSpan)
═══════════════════════════════════════════════════════ */
const WIDGET_CATALOGUE = [
  // ── Financiën
  { id: 'kpi',           name: 'KPI Kaarten',        desc: 'Inkomen, uitgaven & spaargeld',    icon: 'creditcard.svg',                category: 'Financiën',               defaultSpan: 2 },
  { id: 'health',        name: 'Health Score',        desc: 'Financiële gezondheid',            icon: 'heart.svg',                     category: 'Financiën',               defaultSpan: 1 },
  { id: 'summary',       name: 'AI Samenvatting',     desc: 'Maandelijkse inzichten',           icon: 'brain.svg',                     category: 'Financiën',               defaultSpan: 1 },
  { id: 'income-chart',  name: 'Inkomen vs Uitgaven', desc: 'Staafgrafiek per maand',           icon: 'chart.bar.svg',                 category: 'Financiën',               defaultSpan: 1 },
  { id: 'networth',      name: 'Vermogensgroei',      desc: 'Netto vermogen over tijd',         icon: 'chart.line.uptrend.xyaxis.svg', category: 'Financiën',               defaultSpan: 1 },
  { id: 'pie',           name: 'Categorieën',         desc: 'Uitgaven per categorie',           icon: 'percent.svg',                   category: 'Financiën',               defaultSpan: 1 },
  { id: 'transactions',  name: 'Transacties',         desc: 'Recente transacties',              icon: 'list.bullet.svg',               category: 'Financiën',               defaultSpan: 1 },
  { id: 'cash',          name: 'Contant Geld',        desc: 'Huidig cash saldo',               icon: 'banknote.svg',                  category: 'Financiën',               defaultSpan: 1 },
  // ── Investeringen & Trading
  { id: 'portfolio',     name: 'Portfolio',           desc: 'Totale beleggingswaarde',          icon: 'briefcase.svg',                 category: 'Investeringen & Trading', defaultSpan: 1 },
  { id: 'trading',       name: 'Trading Journal',     desc: 'P&L en winrate',                   icon: 'chart.bar.xaxis.ascending.svg', category: 'Investeringen & Trading', defaultSpan: 2 },
  // ── Vastgoed
  { id: 'mortgage',      name: 'Hypotheek',           desc: 'Voortgang afbetaling',             icon: 'house.svg',                     category: 'Vastgoed',                defaultSpan: 1 },
  // ── Budget
  { id: 'budget',        name: 'Budget Overzicht',    desc: 'Top budget categorieën',           icon: 'slider.horizontal.3.svg',       category: 'Budget',                  defaultSpan: 1 },
  // ── Spaardoelen
  { id: 'goals',         name: 'Spaardoelen',         desc: 'Voortgang per doel',               icon: 'target.svg',                    category: 'Spaardoelen',             defaultSpan: 1 },
  // ── Abonnementen
  { id: 'subscriptions', name: 'Abonnementen',        desc: 'Maandelijkse kosten',              icon: 'creditcard.rewards.svg',        category: 'Abonnementen',            defaultSpan: 1 },
];

const CAT_ORDER = ['Financiën', 'Investeringen & Trading', 'Vastgoed', 'Budget', 'Spaardoelen', 'Abonnementen'];

const DEFAULT_WIDGETS = [
  { id: 'kpi',          span: 2 },
  { id: 'health',       span: 1 },
  { id: 'summary',      span: 1 },
  { id: 'income-chart', span: 1 },
  { id: 'networth',     span: 1 },
  { id: 'pie',          span: 1 },
  { id: 'transactions', span: 1 },
  { id: 'trading',      span: 2 },
  { id: 'mortgage',     span: 1 },
  { id: 'portfolio',    span: 1 },
  { id: 'budget',       span: 1 },
  { id: 'goals',        span: 1 },
  { id: 'subscriptions',span: 1 },
  { id: 'cash',         span: 1 },
];

function loadWidgets() {
  try { const s = localStorage.getItem(LS_KEY); if (s) return JSON.parse(s); } catch {}
  return DEFAULT_WIDGETS;
}
function saveWidgets(list) { localStorage.setItem(LS_KEY, JSON.stringify(list)); }

/* ═══════════════════════════════════════════════════════
   DARWIN CONTEXT MODAL
═══════════════════════════════════════════════════════ */
function DarwinModal({ title, children, onClose }) {
  return (
    <div className="darwin-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="darwin-ctx-modal">
        <div className="darwin-ctx-header">
          <span className="darwin-ctx-dot" />
          <span className="darwin-ctx-title">{title}</span>
        </div>
        <div className="darwin-ctx-divider" />
        <div className="darwin-ctx-body">{children}</div>
      </div>
    </div>
  );
}

function ContextMenu({ widget, onResize, onRemove, onClose }) {
  const def = WIDGET_CATALOGUE.find(w => w.id === widget.id);
  return (
    <DarwinModal title={def?.name || 'Widget'} onClose={onClose}>
      <div className="darwin-ctx-options">
        <button
          className="darwin-ctx-opt"
          disabled={widget.span >= 2}
          onClick={() => { onResize(widget.id, Math.min(widget.span + 1, 2)); onClose(); }}
        >
          <SFIcon name="arrow.up.left.and.arrow.down.right.svg" size={16} color="currentColor" />
          Vergroten
          {widget.span >= 2 && <span className="darwin-ctx-badge">Max</span>}
        </button>
        <button
          className="darwin-ctx-opt"
          disabled={widget.span <= 1}
          onClick={() => { onResize(widget.id, Math.max(widget.span - 1, 1)); onClose(); }}
        >
          <SFIcon name="arrow.down.right.and.arrow.up.left.svg" size={16} color="currentColor" />
          Verkleinen
          {widget.span <= 1 && <span className="darwin-ctx-badge">Min</span>}
        </button>
        <button
          className="darwin-ctx-opt darwin-ctx-opt-danger"
          onClick={() => { onRemove(widget.id); onClose(); }}
        >
          <SFIcon name="trash.svg" size={16} color="currentColor" />
          Verwijderen
        </button>
      </div>
      <div className="darwin-ctx-footer">
        <button className="darwin-ctx-cancel" onClick={onClose}>Annuleer</button>
      </div>
    </DarwinModal>
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
    <DarwinModal title="Widget toevoegen" onClose={onClose}>
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
    </DarwinModal>
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
   WIDGET RENDERERS
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

function renderWidget(id, d) {
  switch (id) {

    case 'kpi':
      return (
        <div className="grid-4">
          <StatCard label="Income"       value={fmt(d.income)}       color="var(--accent-dark)"   change={1}              changeLabel="+€430 vs vorige maand" />
          <StatCard label="Spent"        value={fmt(d.expenses)}     color="#3B82F6"              change={-1}             changeLabel="-€230 vs vorige maand" />
          <StatCard label="Net Savings"  value={fmt(d.net)}          color={d.net >= 0 ? 'var(--accent)' : 'var(--red)'} change={d.net >= 0 ? 1 : -1} changeLabel={d.net >= 0 ? 'On track' : 'Over budget'} />
          <StatCard label="Investments"  value={fmt(d.totalCurrent)} color={d.investGain >= 0 ? 'var(--accent-mid)' : 'var(--red)'} change={d.investGain} changeLabel={`${d.investGain >= 0 ? '+' : ''}${d.investPct}% return`} />
        </div>
      );

    case 'health':
      return <HealthScore />;

    case 'summary':
      return <MonthlySummary />;

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
            {d.filteredTransactions.slice(0, 4).map(tx => (
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
   WIDGET WRAPPER (drag + right-click)
═══════════════════════════════════════════════════════ */
function Widget({ w, isDragging, isOver, onDragStart, onDragOver, onDragEnd, onDrop, onContextMenu, children }) {
  return (
    <div
      className={`widget-dnd${isDragging ? ' dragging' : ''}${isOver ? ' drop-target' : ''} ${w.span >= 2 ? 'span2' : ''}`}
      draggable
      onDragStart={() => onDragStart(w.id)}
      onDragOver={e => { e.preventDefault(); onDragOver(w.id); }}
      onDragEnd={onDragEnd}
      onDrop={() => onDrop(w.id)}
      onContextMenu={e => { e.preventDefault(); onContextMenu(w); }}
    >
      <div className="widget-drag-grip" title="Sleep om te verplaatsen">
        <SFIcon name="line.3.horizontal.svg" size={12} color="var(--text-muted)" />
      </div>
      {children}
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
  const [ctxWidget, setCtxWidget] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);
  const data = useWidgetData();

  /* ── DnD ── */
  const handleDragStart = (id) => setDragId(id);
  const handleDragOver  = (id) => setOverId(id);
  const handleDragEnd   = () => { setDragId(null); setOverId(null); };
  const handleDrop      = (targetId) => {
    if (!dragId || dragId === targetId) { setDragId(null); setOverId(null); return; }
    setWidgets(prev => {
      const arr   = [...prev];
      const fromI = arr.findIndex(w => w.id === dragId);
      const toI   = arr.findIndex(w => w.id === targetId);
      const [item] = arr.splice(fromI, 1);
      arr.splice(toI, 0, item);
      saveWidgets(arr);
      return arr;
    });
    setDragId(null); setOverId(null);
  };

  /* ── Widget actions ── */
  const removeWidget = (id) => {
    setWidgets(prev => { const n = prev.filter(w => w.id !== id); saveWidgets(n); return n; });
  };
  const resizeWidget = (id, span) => {
    setWidgets(prev => { const n = prev.map(w => w.id === id ? { ...w, span } : w); saveWidgets(n); return n; });
  };
  const addWidget = (def) => {
    const n = [...widgets, { id: def.id, span: def.defaultSpan || 1 }];
    setWidgets(n); saveWidgets(n); setShowPicker(false);
  };

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
          <button className="btn btn-primary" style={{ fontSize: 13, gap: 6 }} onClick={() => setShowPicker(true)}>
            <SFIcon name="plus.svg" size={14} color="white" /> {t('widgets_btn')}
          </button>
        </div>
      </div>

      {/* Widget grid */}
      <div className="widget-dnd-grid">
        {widgets.map(w => (
          <Widget
            key={w.id}
            w={w}
            isDragging={dragId === w.id}
            isOver={overId === w.id && dragId !== w.id}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            onContextMenu={setCtxWidget}
          >
            {renderWidget(w.id, data)}
          </Widget>
        ))}
      </div>

      {widgets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Geen widgets actief</div>
          <button className="btn btn-primary" onClick={() => setShowPicker(true)}>
            <SFIcon name="plus.svg" size={14} color="white" /> Widgets toevoegen
          </button>
        </div>
      )}

      {/* Context menu modal */}
      {ctxWidget && (
        <ContextMenu
          widget={ctxWidget}
          onResize={resizeWidget}
          onRemove={removeWidget}
          onClose={() => setCtxWidget(null)}
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
