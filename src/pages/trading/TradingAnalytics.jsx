import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/useT';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts';
import { mockTrades } from '../../data/tradingData';
import SFIcon from '../../components/SFIcon';

const fmt = (n) => {
  const abs = Math.abs(n);
  const s = abs >= 1000 ? (abs / 1000).toFixed(1) + 'K' : abs.toFixed(0);
  return (n < 0 ? '-$' : '$') + s;
};

function StatCard({ label, value, icon, color = '#30D158', sub }) {
  return (
    <div className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="stat-label">{label}</div>
        <div style={{ opacity: 0.7 }}><SFIcon name={icon} size={18} color={color} /></div>
      </div>
      <div className="stat-value private-num" style={{ color, marginTop: 8 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function TradingAnalytics() {
  const navigate = useNavigate();
  const t = useT();

  const totalPnl = mockTrades.reduce((s, t) => s + t.pnl, 0);
  const wins = mockTrades.filter(t => t.pnl > 0).length;
  const winRate = ((wins / mockTrades.length) * 100).toFixed(0);
  const totalReturn = (totalPnl * 0.5).toFixed(1);
  const profitFactor = (wins > 0 ? wins / (mockTrades.length - wins) : 0).toFixed(2);

  const monthlyPnl = [
    { month: 'Jan', pnl: 250 },
    { month: 'Feb', pnl: -150 },
    { month: 'Mar', pnl: 420 },
    { month: 'Apr', pnl: 180 },
    { month: 'May', pnl: 580 },
    { month: 'Jun', pnl: 310 },
  ];

  const drawdownData = [
    { day: 1, dd: 0 },
    { day: 5, dd: -2.3 },
    { day: 10, dd: -5.1 },
    { day: 15, dd: -1.8 },
    { day: 20, dd: -3.5 },
    { day: 25, dd: 0.5 },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('tr_analytics_title')}</h1>
          <p className="page-subtitle">{t('tr_analytics_subtitle')}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <StatCard label={t('tr_win_rate')} value={winRate + '%'} icon="target.svg" color="#30D158" />
        <StatCard label={t('tr_total_pnl')} value={fmt(totalPnl)} icon="dollarsign.svg" color={totalPnl >= 0 ? '#30D158' : '#FF3B30'} />
        <StatCard label={t('tr_returns')} value={totalReturn + '%'} icon="chart.line.uptrend.xyaxis.svg" color="#34C759" sub={t('tr_on_account')} />
        <StatCard label={t('tr_profit_factor')} value={profitFactor} icon="chart.bar.xaxis.ascending.svg" color="#30D158" />
      </div>

      {/* Charts */}
      <div className="grid-2">
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/trading/calendar')}>
          <div className="section-header">
            <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <SFIcon name="calendar.svg" size={14} color="#30D158" /> {t('tr_calendar')}
            </span>
            <SFIcon name="arrow.right.svg" size={14} color="var(--text-muted)" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyPnl}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '$'+v} />
              <Tooltip formatter={(v) => ['$' + v, '']} />
              <Bar dataKey="pnl" radius={[4,4,0,0]}>
                {monthlyPnl.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#30D158' : '#FF3B30'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-header"><span className="section-title">{t('tr_drawdown')}</span></div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={drawdownData}>
              <defs>
                <linearGradient id="ddg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF3B30" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickFormatter={v => v + '%'} />
              <Tooltip formatter={(v) => [v + '%', '']} />
              <Area type="monotone" dataKey="dd" name={t('tr_drawdown')} stroke="#FF3B30" strokeWidth={1.5} fill="url(#ddg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
