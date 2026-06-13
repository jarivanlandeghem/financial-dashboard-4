import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import CustomTooltip from '../components/CustomTooltip';

const portfolioHistory = [
  { month: 'Jan', value: 18200 }, { month: 'Feb', value: 19800 },
  { month: 'Mar', value: 21200 }, { month: 'Apr', value: 22600 },
  { month: 'May', value: 23900 }, { month: 'Jun', value: 25400 },
];

const COLORS = ['#4F8EF7','#00C896','#FFB800','#FF4757','#A855F7','#EC4899'];

export default function Investments() {
  const { investments } = useApp();
  const [tab, setTab] = useState('all');
  const [eurRate, setEurRate] = useState(0.92);
  const [rateLoading, setRateLoading] = useState(true);

  // Try to fetch live EUR/USD rate
  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(d => { if (d?.rates?.EUR) { setEurRate(d.rates.EUR); } })
      .catch(() => {})
      .finally(() => setRateLoading(false));
  }, []);

  const toEur = (usd) => usd * eurRate;

  const saxoVal = investments.saxobank.reduce((s, p) => s + toEur(p.currentPrice * p.shares), 0);
  const bybitVal = investments.bybit.reduce((s, p) => s + toEur(p.currentPrice * p.amount), 0);
  const totalVal = saxoVal + bybitVal;

  const saxoInvested = investments.saxobank.reduce((s, p) => s + toEur(p.buyPrice * p.shares), 0);
  const bybitInvested = investments.bybit.reduce((s, p) => s + toEur(p.buyPrice * p.amount), 0);
  const totalInvested = saxoInvested + bybitInvested;
  const totalGain = totalVal - totalInvested;
  const totalPct = ((totalGain / totalInvested) * 100).toFixed(2);

  const pieData = [
    { name: 'Saxobank', value: parseFloat(saxoVal.toFixed(2)), color: '#4F8EF7' },
    { name: 'Bybit', value: parseFloat(bybitVal.toFixed(2)), color: '#FFB800' },
  ];

  const exportCSV = (positions, label) => {
    const rows = [['Name','Ticker','Quantity','Buy Price (€)','Current Price (€)','Value (€)','Gain (€)','Gain %']];
    positions.forEach(p => {
      const qty = p.shares || p.amount;
      const buy = toEur(p.buyPrice * qty);
      const cur = toEur(p.currentPrice * qty);
      rows.push([p.name, p.ticker, qty, buy.toFixed(2), cur.toFixed(2), cur.toFixed(2), (cur-buy).toFixed(2), (((cur-buy)/buy)*100).toFixed(2)+'%']);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = `${label}-investments.csv`; a.click();
  };

  function PositionRow({ pos, platform }) {
    const qty = pos.shares || pos.amount;
    const invested = toEur(pos.buyPrice * qty);
    const current = toEur(pos.currentPrice * qty);
    const gain = current - invested;
    const pct = ((gain / invested) * 100).toFixed(2);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
        <div className="cat-icon" style={{ background: 'var(--accent-light)', fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
          {pos.ticker.slice(0, 2)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{pos.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pos.ticker} · {qty} {pos.shares ? 'shares' : 'units'} · {platform}</div>
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

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Investments</h1><p className="page-subtitle">Portfolio overview</p></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ padding: '6px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 12 }}>
            💱 1 USD = €{rateLoading ? '…' : eurRate.toFixed(4)}
          </div>
        </div>
      </div>

      <div className="grid-4">
        {[
          { label: 'Total Value', value: '€' + totalVal.toFixed(2), color: 'var(--accent)' },
          { label: 'Total Gain', value: (totalGain >= 0 ? '+' : '') + '€' + totalGain.toFixed(2), color: totalGain >= 0 ? 'var(--green)' : 'var(--red)' },
          { label: 'Saxobank', value: '€' + saxoVal.toFixed(2), color: 'var(--text-primary)' },
          { label: 'Bybit', value: '€' + bybitVal.toFixed(2), color: 'var(--text-primary)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: 20 }}>{s.value}</div>
            {s.label === 'Total Gain' && <div className={`stat-change ${totalGain >= 0 ? 'positive' : 'negative'}`}>{totalPct}% all time</div>}
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
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
              <Area type="monotone" dataKey="value" name="Portfolio" stroke="var(--accent)" strokeWidth={1.5} fill="url(#portGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-header"><span className="section-title">Allocation</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={4}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={v => ['€'+v.toFixed(2), '']} />
              </PieChart>
            </ResponsiveContainer>
            <div>
              {pieData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>€{d.value.toFixed(2)} · {((d.value/totalVal)*100).toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        {['all','saxobank','bybit'].map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {(tab === 'all' || tab === 'saxobank') && (
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => exportCSV(investments.saxobank, 'saxobank')}>
              <Download size={12} /> Saxobank CSV
            </button>
          )}
          {(tab === 'all' || tab === 'bybit') && (
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => exportCSV(investments.bybit, 'bybit')}>
              <Download size={12} /> Bybit CSV
            </button>
          )}
        </div>
      </div>

      {(tab === 'all' || tab === 'saxobank') && (
        <div className="card" style={{ marginBottom: 16, padding: 0 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
            <span>Saxobank</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>€{saxoVal.toFixed(2)} · {((saxoVal/totalVal)*100).toFixed(1)}%</span>
          </div>
          {investments.saxobank.map(p => <PositionRow key={p.id} pos={p} platform="Saxobank" />)}
        </div>
      )}
      {(tab === 'all' || tab === 'bybit') && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
            <span>Bybit</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>€{bybitVal.toFixed(2)} · {((bybitVal/totalVal)*100).toFixed(1)}%</span>
          </div>
          {investments.bybit.map(p => <PositionRow key={p.id} pos={p} platform="Bybit" />)}
        </div>
      )}
    </div>
  );
}
