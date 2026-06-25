import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SFIcon from '../components/SFIcon';
import { mockTrades } from '../data/tradingData';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import MonthSelector from '../components/MonthSelector';
import CategoryIcon from '../components/CategoryIcon';
import CustomTooltip from '../components/CustomTooltip';
import HealthScore from '../components/HealthScore';
import MonthlySummary from '../components/MonthlySummary';
import { downloadAnnualReport } from '../utils/excelExport';
import { CATEGORIES, monthlyData, netWorthData } from '../data/mockData';

const fmt = (n) => '€' + Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const LS_KEY = 'fd2-dashboard-widgets';

const ALL_WIDGETS = [
  { id: 'kpi',          name: 'KPI Kaarten',       desc: 'Inkomen, uitgaven, besparingen',  icon: '💳', span: 'full' },
  { id: 'health',       name: 'Health Score',       desc: 'Financiële gezondheid',           icon: '❤️', span: 'half' },
  { id: 'summary',      name: 'AI Samenvatting',    desc: 'Maandelijkse inzichten',          icon: '🤖', span: 'half' },
  { id: 'income-chart', name: 'Inkomen vs Uitgaven',desc: 'Staafgrafiek per maand',          icon: '📊', span: 'half' },
  { id: 'networth',     name: 'Vermogensgroei',     desc: 'Netto vermogen over tijd',        icon: '📈', span: 'half' },
  { id: 'pie',          name: 'Categorieën',        desc: 'Uitgaven per categorie',          icon: '🥧', span: 'half' },
  { id: 'transactions', name: 'Transacties',        desc: 'Recente transacties',             icon: '🧾', span: 'half' },
  { id: 'trading',      name: 'Trading Journal',    desc: 'P&L en winrate',                  icon: '📉', span: 'full' },
  { id: 'mortgage',     name: 'Hypotheek',          desc: 'Voortgang afbetaling',            icon: '🏠', span: 'half' },
  { id: 'portfolio',    name: 'Portfolio',          desc: 'Totale beleggingswaarde',         icon: '💼', span: 'half' },
];

const DEFAULT_WIDGETS = ALL_WIDGETS.map(w => w.id);

function loadWidgets() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_WIDGETS;
}

function saveWidgets(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

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

function Widget({ id, onRemove, children, style, className }) {
  return (
    <div className={`widget-wrapper widget-enter ${className || ''}`} style={style}>
      <button className="widget-del-btn" onClick={() => onRemove(id)} title="Verwijder widget">✕</button>
      {children}
    </div>
  );
}

function WidgetModal({ visible, activeWidgets, onAdd, onClose }) {
  if (!visible) return null;
  return (
    <div className="widget-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="widget-modal">
        <div className="widget-modal-header">
          <span className="widget-modal-title">Widget toevoegen</span>
          <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 13 }} onClick={onClose}>Sluiten</button>
        </div>
        <div className="widget-picker-grid">
          {ALL_WIDGETS.map(w => {
            const on = activeWidgets.includes(w.id);
            return (
              <div
                key={w.id}
                className={`widget-picker-item${on ? ' already-on' : ''}`}
                onClick={() => !on && onAdd(w.id)}
              >
                <div className="widget-picker-icon">{w.icon}</div>
                <div className="widget-picker-name">{w.name}</div>
                <div className="widget-picker-desc">{on ? 'Al actief' : w.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { income, expenses, net, filteredTransactions, investments, mortgage, transactions, budgets, subscriptions } = useApp();
  const navigate = useNavigate();
  const [widgets, setWidgets] = useState(loadWidgets);
  const [showModal, setShowModal] = useState(false);

  const removeWidget = useCallback((id) => {
    setWidgets(prev => {
      const next = prev.filter(w => w !== id);
      saveWidgets(next);
      return next;
    });
  }, []);

  const addWidget = useCallback((id) => {
    setWidgets(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      saveWidgets(next);
      return next;
    });
    setShowModal(false);
  }, []);

  const has = (id) => widgets.includes(id);

  // Category breakdown for pie
  const catSpend = {};
  filteredTransactions.filter(t => t.amount < 0).forEach(t => {
    catSpend[t.category] = (catSpend[t.category] || 0) + Math.abs(t.amount);
  });
  const pieData = Object.entries(catSpend).map(([k, v]) => ({
    name: CATEGORIES[k]?.label || k,
    value: v,
    color: CATEGORIES[k]?.color || '#6B7280',
  })).sort((a, b) => b.value - a.value).slice(0, 6);

  // Investment summary
  const allPositions = [...investments.saxobank, ...investments.bybit];
  const totalInvested = allPositions.reduce((s, p) => s + (p.buyPrice * (p.shares || p.amount)), 0);
  const totalCurrent = allPositions.reduce((s, p) => s + (p.currentPrice * (p.shares || p.amount)), 0);
  const investGain = totalCurrent - totalInvested;
  const investPct = ((investGain / totalInvested) * 100).toFixed(1);

  // Mortgage progress
  const mortgagePaid = mortgage.originalAmount - mortgage.currentBalance;
  const mortgagePct = ((mortgagePaid / mortgage.originalAmount) * 100).toFixed(1);

  const recentTx = filteredTransactions.slice(0, 5);

  // Trading
  const totalPnl = mockTrades.reduce((s, t) => s + t.pnl, 0);
  const wins = mockTrades.filter(t => t.pnl > 0).length;
  const winRate = ((wins / mockTrades.length) * 100).toFixed(0);
  const lastTrade = mockTrades[mockTrades.length - 1];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Good morning, Sir</h1>
          <p className="page-subtitle">Here's your financial overview</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className="btn btn-ghost"
            style={{ fontSize: 13, gap: 6 }}
            onClick={() => downloadAnnualReport({ transactions, investments, mortgage, budgets, subscriptions })}
          >
            <SFIcon name="square.and.arrow.down.svg" size={14} color="currentColor" /> Annual Report
          </button>
          <MonthSelector />
          <button
            className="btn btn-primary"
            style={{ fontSize: 13, gap: 6 }}
            onClick={() => setShowModal(true)}
          >
            <SFIcon name="plus.svg" size={14} color="white" /> Widgets
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {has('kpi') && (
        <Widget id="kpi" onRemove={removeWidget}>
          <div className="grid-4">
            <StatCard label="Income" value={fmt(income)} color="var(--accent-dark)"
              change={1} changeLabel="+€430 vs last month" />
            <StatCard label="Spent" value={fmt(expenses)} color="#3B82F6"
              change={-1} changeLabel="-€230 vs last month" />
            <StatCard label="Net Savings" value={fmt(net)} color={net >= 0 ? 'var(--accent)' : 'var(--red)'}
              change={net >= 0 ? 1 : -1} changeLabel={net >= 0 ? 'On track' : 'Over budget'} />
            <StatCard label="Investments" value={fmt(totalCurrent)}
              color={investGain >= 0 ? 'var(--accent-mid)' : 'var(--red)'}
              change={investGain} changeLabel={`${investGain >= 0 ? '+' : ''}${investPct}% total return`} />
          </div>
        </Widget>
      )}

      {/* Health Score + AI Summary */}
      {(has('health') || has('summary')) && (
        <div className="grid-2" style={{ marginBottom: 20 }}>
          {has('health') && (
            <Widget id="health" onRemove={removeWidget}>
              <HealthScore />
            </Widget>
          )}
          {has('summary') && (
            <Widget id="summary" onRemove={removeWidget}>
              <MonthlySummary />
            </Widget>
          )}
        </div>
      )}

      {/* Charts row */}
      {(has('income-chart') || has('networth')) && (
        <div className="grid-2">
          {has('income-chart') && (
            <Widget id="income-chart" onRemove={removeWidget}>
              <div className="card">
                <div className="section-header">
                  <span className="section-title">Income vs Expenses</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => '€'+v} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#1A56DB" radius={[4,4,0,0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="#93C5FD" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Widget>
          )}
          {has('networth') && (
            <Widget id="networth" onRemove={removeWidget}>
              <div className="card">
                <div className="section-header">
                  <span className="section-title">Net Worth Growth</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={netWorthData}>
                    <defs>
                      <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => '€'+v} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" name="Net Worth" stroke="var(--accent)" strokeWidth={1.5} fill="url(#netWorthGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Widget>
          )}
        </div>
      )}

      {/* Spending breakdown + Recent transactions */}
      {(has('pie') || has('transactions')) && (
        <div className="grid-2">
          {has('pie') && (
            <Widget id="pie" onRemove={removeWidget}>
              <div className="card">
                <div className="section-header">
                  <span className="section-title">Spending by Category</span>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => ['€' + v.toFixed(2), '']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1 }}>
                    {pieData.map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, flex: 1, color: 'var(--text-secondary)' }}>{d.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>€{d.value.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Widget>
          )}
          {has('transactions') && (
            <Widget id="transactions" onRemove={removeWidget}>
              <div className="card">
                <div className="section-header" style={{ marginBottom: 12 }}>
                  <span className="section-title">Recent Transactions</span>
                  <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate('/finance/transactions')}>
                    View all <SFIcon name="arrow.right.svg" size={12} color="currentColor" />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recentTx.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No transactions this month.</div>
                  ) : recentTx.map((tx) => (
                    <div key={tx.id} className="finder-row">
                      <CategoryIcon category={tx.category} size={32} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{tx.description}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tx.date}</div>
                      </div>
                      <div className={`${tx.amount >= 0 ? 'amount-positive' : 'amount-negative'} private-num`} style={{ fontSize: 14 }}>
                        {tx.amount >= 0 ? '+' : ''}{fmt(tx.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Widget>
          )}
        </div>
      )}

      {/* Trading Journal */}
      {has('trading') && (
        <Widget id="trading" onRemove={removeWidget}>
          <div className="card" style={{
            cursor: 'pointer', borderLeft: '3px solid #059669',
            background: 'linear-gradient(135deg, var(--bg-card) 80%, rgba(5,150,105,0.04) 100%)',
          }} onClick={() => navigate('/trading')}>
            <div className="section-header">
              <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <SFIcon name="chart.bar.xaxis.ascending.svg" size={15} color="#059669" /> Trading Journal
              </span>
              <SFIcon name="arrow.right.svg" size={16} color="var(--text-muted)" />
            </div>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total P&L</div>
                <div className="private-num" style={{ fontSize: 20, fontWeight: 700, color: totalPnl >= 0 ? '#059669' : '#EF4444' }}>
                  {totalPnl >= 0 ? '+' : ''}${totalPnl}
                </div>
              </div>
              <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Win Rate</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: parseInt(winRate) >= 50 ? '#059669' : '#EF4444' }}>{winRate}%</div>
              </div>
              <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Trades</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{mockTrades.length}</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
                Last: <strong>{lastTrade?.pair}</strong> {lastTrade?.pnl >= 0 ? '+' : ''}${lastTrade?.pnl}
              </div>
            </div>
          </div>
        </Widget>
      )}

      {/* Mortgage + Portfolio */}
      {(has('mortgage') || has('portfolio')) && (
        <div className="grid-2">
          {has('mortgage') && (
            <Widget id="mortgage" onRemove={removeWidget}>
              <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/finance/mortgage')}>
                <div className="section-header">
                  <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <SFIcon name="house.svg" size={15} color="var(--accent)" /> Mortgage
                  </span>
                  <SFIcon name="arrow.right.svg" size={16} color="var(--text-muted)" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Remaining</div>
                    <div className="private-num" style={{ fontSize: 20, fontWeight: 700 }}>{fmt(mortgage.currentBalance)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Paid off</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>{mortgagePct}%</div>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: mortgagePct + '%', background: 'var(--green)' }} />
                </div>
              </div>
            </Widget>
          )}
          {has('portfolio') && (
            <Widget id="portfolio" onRemove={removeWidget}>
              <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/finance/investments')}>
                <div className="section-header">
                  <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <SFIcon name="chart.line.uptrend.xyaxis.svg" size={15} color="var(--accent)" /> Portfolio
                  </span>
                  <SFIcon name="arrow.right.svg" size={16} color="var(--text-muted)" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total value</div>
                    <div className="private-num" style={{ fontSize: 20, fontWeight: 700 }}>{fmt(totalCurrent)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={`badge ${investGain >= 0 ? 'badge-green' : 'badge-red'}`}>
                      {investGain >= 0 ? '+' : ''}{investPct}%
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                      {investGain >= 0 ? '+' : ''}{fmt(investGain)} total
                    </div>
                  </div>
                </div>
              </div>
            </Widget>
          )}
        </div>
      )}

      {/* Empty state */}
      {widgets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Geen widgets actief</div>
          <div style={{ fontSize: 13, marginBottom: 20 }}>Voeg widgets toe om je dashboard te vullen.</div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <SFIcon name="plus.svg" size={14} color="white" /> Widgets toevoegen
          </button>
        </div>
      )}

      <WidgetModal
        visible={showModal}
        activeWidgets={widgets}
        onAdd={addWidget}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
