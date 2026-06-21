import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { mockTrades } from '../../data/tradingData';
import SFIcon from '../../components/SFIcon';

const fmt = (n) => (n < 0 ? '-$' : '$') + Math.abs(n).toFixed(2);

function RiskCard({ label, value, icon, color, sub }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="stat-label">{label}</div>
        <div style={{ opacity: 0.7 }}><SFIcon name={icon} size={18} color={color} /></div>
      </div>
      <div className="stat-value private-num" style={{ color, marginTop: 8 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function TradingRisk() {
  const wins = mockTrades.filter(t => t.pnl > 0);
  const losses = mockTrades.filter(t => t.pnl < 0);
  const avgWin = wins.reduce((s, t) => s + t.pnl, 0) / (wins.length || 1);
  const avgLoss = losses.reduce((s, t) => s + t.pnl, 0) / (losses.length || 1);
  const rr = (avgWin / Math.abs(avgLoss)).toFixed(2);
  const maxWin = Math.max(...mockTrades.map(t => t.pnl));
  const maxLoss = Math.min(...mockTrades.map(t => t.pnl));
  const profitFactor = (wins.reduce((s, t) => s + t.pnl, 0) / Math.abs(losses.reduce((s, t) => s + t.pnl, 0))).toFixed(2);

  // Drawdown series
  let peak = 10000;
  let running = 10000;
  const drawdownData = mockTrades.map(t => {
    running += t.pnl;
    if (running > peak) peak = running;
    const dd = running - peak;
    return { date: t.date.slice(5), drawdown: dd };
  });

  // Daily P&L
  const byDay = {};
  mockTrades.forEach(t => {
    const day = new Date(t.date).toLocaleDateString('en', { weekday: 'short' });
    byDay[day] = (byDay[day] || 0) + t.pnl;
  });
  const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyData = dayOrder.map(d => ({ day: d, pnl: byDay[d] || 0 }));

  const maxDD = Math.min(...drawdownData.map(d => d.drawdown));
  const recoveryFactor = (mockTrades.reduce((s, t) => s + t.pnl, 0) / Math.abs(maxDD)).toFixed(2);
  const consistencyScore = ((wins.length / mockTrades.length) * (avgWin / Math.abs(avgLoss)) * 10).toFixed(1);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Risk Analysis</h1>
          <p className="page-subtitle">Drawdown, consistency & risk metrics</p>
        </div>
      </div>

      <div className="grid-4">
        <RiskCard label="Max Drawdown" value={fmt(maxDD)} icon="chart.line.downtrend.xyaxis.svg" color="var(--tr-red)" />
        <RiskCard label="Biggest Loser" value={fmt(maxLoss)} icon="chart.line.downtrend.xyaxis.svg" color="var(--tr-red)" />
        <RiskCard label="Biggest Winner" value={'$' + maxWin.toFixed(2)} icon="chart.line.uptrend.xyaxis.svg" color="var(--tr-green)" />
        <RiskCard label="Recovery Factor" value={recoveryFactor} icon="chart.line.uptrend.xyaxis.svg" color="var(--tr-green)" />
      </div>

      <div className="grid-2">
        {/* Left column: metric cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Avg Win', value: '$' + avgWin.toFixed(2), icon: 'chart.line.uptrend.xyaxis.svg', color: 'var(--tr-green)' },
            { label: 'Avg Loss', value: fmt(avgLoss), icon: 'chart.line.downtrend.xyaxis.svg', color: 'var(--tr-red)' },
            { label: 'Risk/Reward', value: rr, icon: 'chart.bar.xaxis.ascending.svg', color: 'var(--tr-accent)' },
            { label: 'Consistency Score', value: consistencyScore + '%', icon: 'shield.svg', color: consistencyScore >= 50 ? 'var(--tr-green)' : 'var(--tr-red)' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SFIcon name={icon} size={18} color={color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
                <div className="private-num" style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Drawdown chart */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">Drawdown Chart</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={drawdownData}>
              <defs>
                <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--tr-green)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--tr-green)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + v} />
              <Tooltip formatter={(v) => ['$' + v.toFixed(2), 'Drawdown']} />
              <Area type="monotone" dataKey="drawdown" stroke="var(--tr-green)" strokeWidth={2} fill="url(#ddGrad)" dot={{ fill: 'var(--tr-green)', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily performance */}
      <div className="card">
        <div className="section-header">
          <span className="section-title">Daily Performance</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + v} />
            <Tooltip formatter={(v) => ['$' + v, 'P&L']} />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {dailyData.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? 'var(--tr-green)' : 'var(--tr-red)'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Risk alerts */}
      <div className="card">
        <div className="section-header">
          <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <SFIcon name="exclamationmark.svg" size={15} color="var(--tr-red)" /> Risk Alerts
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { msg: `Breakout strategy has negative expectancy (${losses.filter(t => t.strategy === 'Breakout').length} losses)`, severity: 'warn' },
            { msg: `Avg loss ($${Math.abs(avgLoss).toFixed(0)}) is within acceptable range vs avg win ($${avgWin.toFixed(0)})`, severity: 'ok' },
            { msg: `Max drawdown ${fmt(maxDD)} is ${(Math.abs(maxDD) / 100).toFixed(1)}% of $10K account — manageable`, severity: 'ok' },
            { msg: `Monday shows consistent losses — consider reducing size or skipping Mondays`, severity: 'warn' },
          ].map((alert, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
              borderRadius: 'var(--radius-sm)', fontSize: 13,
              background: alert.severity === 'warn' ? 'var(--tr-red-light)' : 'var(--tr-green-light)',
              color: alert.severity === 'warn' ? 'var(--tr-red)' : 'var(--tr-green)',
            }}>
              <SFIcon
                name={alert.severity === 'warn' ? 'exclamationmark.svg' : 'shield.svg'}
                size={14}
                color={alert.severity === 'warn' ? 'var(--tr-red)' : 'var(--tr-green)'}
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              {alert.msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
