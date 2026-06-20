import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Target, DollarSign, BarChart2, ArrowRight } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts';
import { mockTrades } from '../../data/tradingData';

const fmt = (n) => {
  const abs = Math.abs(n);
  const s = abs >= 1000 ? (abs / 1000).toFixed(1) + 'K' : abs.toFixed(0);
  return (n < 0 ? '-$' : '$') + s;
};

function StatCard({ label, value, icon: Icon, color = 'var(--tr-accent)', sub }) {
  return (
    <div className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="stat-label">{label}</div>
        <div style={{ color, opacity: 0.7 }}><Icon size={18} strokeWidth={1.5} /></div>
      </div>
      <div className="stat-value private-num" style={{ color, marginTop: 8 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function TradingAnalytics() {
  const navigate = useNavigate();
  const wins = mockTrades.filter(t => t.pnl > 0);
  const losses = mockTrades.filter(t => t.pnl < 0);
  const totalPnl = mockTrades.reduce((s, t) => s + t.pnl, 0);
  const winRate = ((wins.length / mockTrades.length) * 100).toFixed(1);
  const avgWin = wins.reduce((s, t) => s + t.pnl, 0) / wins.length;
  const avgLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length);
  const profitFactor = (wins.reduce((s, t) => s + t.pnl, 0) / Math.abs(losses.reduce((s, t) => s + t.pnl, 0))).toFixed(2);
  const totalReturn = ((totalPnl / 10000) * 100).toFixed(1);

  // Account growth curve
  let running = 10000;
  const growthData = mockTrades.map(t => {
    running += t.pnl;
    return { date: t.date.slice(5), value: running, pnl: t.pnl };
  });

  // Symbol performance
  const byPair = {};
  mockTrades.forEach(t => {
    byPair[t.pair] = (byPair[t.pair] || 0) + t.pnl;
  });
  const pairData = Object.entries(byPair).map(([pair, pnl]) => ({ pair, pnl }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Trading Analytics</h1>
          <p className="page-subtitle">Performance overview · January 2026</p>
        </div>
      </div>

      {/* KPI row 1 */}
      <div className="grid-4">
        <StatCard label="Win Rate" value={winRate + '%'} icon={Target} color="var(--tr-accent)" />
        <StatCard label="Total P&L" value={fmt(totalPnl)} icon={DollarSign} color={totalPnl >= 0 ? 'var(--tr-green)' : 'var(--tr-red)'} />
        <StatCard label="Returns" value={totalReturn + '%'} icon={TrendingUp} color="var(--tr-green)" sub="on $10,000 account" />
        <StatCard label="Profit Factor" value={profitFactor} icon={BarChart2} color="var(--tr-accent)" />
      </div>

      {/* Charts */}
      <div className="grid-2">
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/trading/calendar')}>
          <div className="section-header">
            <span className="section-title">Account Growth</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              View calendar <ArrowRight size={12} />
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="trGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--tr-accent)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--tr-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + v.toLocaleString()} domain={['auto', 'auto']} />
              <Tooltip formatter={(v) => ['$' + v.toLocaleString(), 'Balance']} />
              <Area type="monotone" dataKey="value" stroke="var(--tr-accent)" strokeWidth={2} fill="url(#trGrad)" dot={{ fill: 'var(--tr-accent)', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/trading/pairs')}>
          <div className="section-header">
            <span className="section-title">Symbol Performance</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              View pairs <ArrowRight size={12} />
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pairData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="pair" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + v} />
              <Tooltip formatter={(v) => ['$' + v, 'P&L']} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {pairData.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? 'var(--tr-green)' : 'var(--tr-red)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KPI row 2 */}
      <div className="grid-4">
        <StatCard label="Avg P&L / Day" value={fmt(totalPnl / [...new Set(mockTrades.map(t => t.date))].length)} icon={TrendingUp} color="var(--tr-green)" />
        <StatCard label="Avg P&L / Month" value={fmt(totalPnl)} icon={TrendingUp} color="var(--tr-green)" />
        <StatCard label="Best Trading Day" value={fmt(Math.max(...mockTrades.map(t => t.pnl)))} icon={TrendingUp} color="var(--tr-green)" />
        <StatCard label="Worst Trading Day" value={fmt(Math.min(...mockTrades.map(t => t.pnl)))} icon={TrendingDown} color="var(--tr-red)" />
      </div>

      {/* Recent trades */}
      <div className="card">
        <div className="section-header">
          <span className="section-title">Recent Trades</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}>
              {['Date', 'Pair', 'Type', 'Entry', 'Exit', 'Strategy', 'Duration', 'P&L'].map(h => (
                <th key={h} style={{ padding: '8px 12px', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...mockTrades].reverse().map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{t.date}</td>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{t.pair}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                    background: t.type === 'LONG' ? 'var(--tr-green-light)' : 'var(--tr-red-light)',
                    color: t.type === 'LONG' ? 'var(--tr-green)' : 'var(--tr-red)',
                  }}>{t.type}</span>
                </td>
                <td style={{ padding: '10px 12px' }}>{t.entry}</td>
                <td style={{ padding: '10px 12px' }}>{t.exit}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{t.strategy}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{t.duration}</td>
                <td style={{ padding: '10px 12px', fontWeight: 700, color: t.pnl >= 0 ? 'var(--tr-green)' : 'var(--tr-red)' }}>
                  {t.pnl >= 0 ? '+' : ''}{fmt(t.pnl)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
