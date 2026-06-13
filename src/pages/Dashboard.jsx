import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, ArrowRight, Home, LineChart } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import MonthSelector from '../components/MonthSelector';
import CategoryIcon from '../components/CategoryIcon';
import CustomTooltip from '../components/CustomTooltip';
import { CATEGORIES, monthlyData, netWorthData } from '../data/mockData';

const fmt = (n) => '€' + Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function StatCard({ label, value, change, changeLabel, color }) {
  const isPos = change > 0;
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      {change !== undefined && (
        <div className={`stat-change ${isPos ? 'positive' : change < 0 ? 'negative' : 'neutral'}`}>
          {isPos ? <TrendingUp size={12} /> : change < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
          {changeLabel}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { income, expenses, net, filteredTransactions, investments, mortgage } = useApp();
  const navigate = useNavigate();

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

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Good morning, Sir</h1>
          <p className="page-subtitle">Here's your financial overview</p>
        </div>
        <MonthSelector />
      </div>

      {/* KPI Cards */}
      <div className="grid-4">
        <StatCard label="Income" value={fmt(income)} color="var(--green)"
          change={1} changeLabel="+€430 vs last month" />
        <StatCard label="Spent" value={fmt(expenses)} color="var(--red)"
          change={-1} changeLabel="-€230 vs last month" />
        <StatCard label="Net Savings" value={fmt(net)} color={net >= 0 ? 'var(--accent)' : 'var(--red)'}
          change={net >= 0 ? 1 : -1} changeLabel={net >= 0 ? 'On track' : 'Over budget'} />
        <StatCard label="Investments" value={fmt(totalCurrent)}
          color={investGain >= 0 ? 'var(--green)' : 'var(--red)'}
          change={investGain} changeLabel={`${investGain >= 0 ? '+' : ''}${investPct}% total return`} />
      </div>

      {/* Charts row */}
      <div className="grid-2">
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
              <Bar dataKey="income" name="Income" fill="var(--green)" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" name="Expenses" fill="var(--red)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

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
      </div>

      {/* Spending breakdown + Recent transactions */}
      <div className="grid-2">
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

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="section-header" style={{ padding: '16px 20px 12px' }}>
            <span className="section-title">Recent Transactions</span>
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate('/transactions')}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div>
            {recentTx.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '20px' }}>No transactions this month.</div>
            ) : recentTx.map((tx, i) => (
              <div key={tx.id} className="finder-row" style={{ borderRadius: 0, borderTop: i === 0 ? '1px solid var(--border)' : 'none' }}>
                <CategoryIcon category={tx.category} size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{tx.description}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tx.date}</div>
                </div>
                <div className={tx.amount >= 0 ? 'amount-positive' : 'amount-negative'} style={{ fontSize: 14 }}>
                  {tx.amount >= 0 ? '+' : ''}{fmt(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mortgage + Investments mini */}
      <div className="grid-2">
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/mortgage')}>
          <div className="section-header">
            <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Home size={15} strokeWidth={1.5} style={{ color: 'var(--accent)' }} /> Mortgage
            </span>
            <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Remaining</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{fmt(mortgage.currentBalance)}</div>
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

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/investments')}>
          <div className="section-header">
            <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <LineChart size={15} strokeWidth={1.5} style={{ color: 'var(--accent)' }} /> Portfolio
            </span>
            <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total value</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{fmt(totalCurrent)}</div>
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
      </div>
    </div>
  );
}
