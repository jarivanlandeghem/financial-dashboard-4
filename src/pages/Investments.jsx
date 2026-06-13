import { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import CustomTooltip from '../components/CustomTooltip';

const EUR_RATE = 0.92;
const portfolioHistory = [
  { month: 'Jan', value: 18200 }, { month: 'Feb', value: 19800 },
  { month: 'Mar', value: 21200 }, { month: 'Apr', value: 22600 },
  { month: 'May', value: 23900 }, { month: 'Jun', value: 25400 },
];

function PositionRow({ pos }) {
  const qty = pos.shares || pos.amount;
  const invested = pos.buyPrice * qty * EUR_RATE;
  const current = pos.currentPrice * qty * EUR_RATE;
  const gain = current - invested;
  const pct = ((gain / invested) * 100).toFixed(2);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
      <div className="cat-icon" style={{ background: 'var(--accent-light)', fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>
        {pos.ticker.slice(0, 2)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{pos.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pos.ticker} · {qty} {pos.shares ? 'shares' : 'units'}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>€{current.toFixed(2)}</div>
        <div style={{ fontSize: 12, color: gain >= 0 ? 'var(--green)' : 'var(--red)' }}>
          {gain >= 0 ? '+' : ''}€{gain.toFixed(2)} ({pct}%)
        </div>
      </div>
    </div>
  );
}

export default function Investments() {
  const { investments } = useApp();
  const [tab, setTab] = useState('all');

  const allPos = [...investments.saxobank, ...investments.bybit];
  const totalInvested = allPos.reduce((s, p) => s + (p.buyPrice * (p.shares || p.amount) * EUR_RATE), 0);
  const totalCurrent = allPos.reduce((s, p) => s + (p.currentPrice * (p.shares || p.amount) * EUR_RATE), 0);
  const totalGain = totalCurrent - totalInvested;
  const totalPct = ((totalGain / totalInvested) * 100).toFixed(2);

  const saxoCurrent = investments.saxobank.reduce((s, p) => s + (p.currentPrice * p.shares * EUR_RATE), 0);
  const bybitCurrent = investments.bybit.reduce((s, p) => s + (p.currentPrice * p.amount * EUR_RATE), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Investments</h1>
          <p className="page-subtitle">Portfolio overview</p>
        </div>
      </div>

      <div className="grid-3">
        {[
          { label: 'Total Value', value: '€' + totalCurrent.toFixed(2), sub: `${totalGain >= 0 ? '+' : ''}${totalPct}% all time`, color: 'var(--accent)' },
          { label: 'Saxobank', value: '€' + saxoCurrent.toFixed(2), sub: `${investments.saxobank.length} positions`, color: 'var(--text-primary)' },
          { label: 'Bybit', value: '€' + bybitCurrent.toFixed(2), sub: `${investments.bybit.length} positions`, color: 'var(--text-primary)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: 22 }}>{s.value}</div>
            <div className="stat-change positive">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-header"><span className="section-title">Portfolio Value</span></div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={portfolioHistory}>
            <defs>
              <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => '€'+v} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="value" name="Portfolio" stroke="var(--accent)" strokeWidth={2} fill="url(#portGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'saxobank', 'bybit'].map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {(tab === 'all' || tab === 'saxobank') && (
        <div className="card" style={{ marginBottom: 16, padding: 0 }}>
          <div style={{ padding: '16px 16px 0', fontWeight: 600 }}>Saxobank</div>
          {investments.saxobank.map(p => <PositionRow key={p.id} pos={p} />)}
        </div>
      )}
      {(tab === 'all' || tab === 'bybit') && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 16px 0', fontWeight: 600 }}>Bybit</div>
          {investments.bybit.map(p => <PositionRow key={p.id} pos={p} />)}
        </div>
      )}
    </div>
  );
}
