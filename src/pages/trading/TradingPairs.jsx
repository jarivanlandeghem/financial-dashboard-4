import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { mockTrades } from '../../data/tradingData';

const PAIR_COLORS = {
  XAUUSD: '#F59E0B',
  EURUSD: '#3B82F6',
  USDJPY: '#8B5CF6',
  BTCUSDT: '#F97316',
  ETHUSDT: '#10B981',
};

export default function TradingPairs() {
  const pairs = [...new Set(mockTrades.map(t => t.pair))];

  const pairStats = pairs.map(pair => {
    const trades = mockTrades.filter(t => t.pair === pair);
    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl < 0);
    const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
    const winRate = ((wins.length / trades.length) * 100).toFixed(0);
    const avgWin = wins.length ? (wins.reduce((s, t) => s + t.pnl, 0) / wins.length).toFixed(0) : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length).toFixed(0) : 0;
    return { pair, trades: trades.length, wins: wins.length, losses: losses.length, totalPnl, winRate, avgWin, avgLoss, color: PAIR_COLORS[pair] || '#6B7280' };
  });

  const pnlByPair = pairStats.map(p => ({ pair: p.pair, pnl: p.totalPnl, color: p.color }));
  const pieData = pairStats.map(p => ({ name: p.pair, value: p.trades, color: p.color }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Trading Pairs</h1>
          <p className="page-subtitle">Performance breakdown per symbol</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-header"><span className="section-title">P&L by Symbol</span></div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={pnlByPair}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="pair" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + v} />
              <Tooltip formatter={(v) => ['$' + v, 'P&L']} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {pnlByPair.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? 'var(--tr-green)' : 'var(--tr-red)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-header"><span className="section-title">Trade Distribution</span></div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [v + ' trades', '']} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {pieData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, flex: 1, color: 'var(--text-secondary)' }}>{d.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{d.value} trades</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pair cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {pairStats.map(p => (
          <div key={p.pair} className="card" style={{ borderTop: `3px solid ${p.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: p.color + '22',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: p.color,
              }}>{p.pair.slice(0, 2)}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{p.pair}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.trades} trades</div>
              </div>
              <div style={{ marginLeft: 'auto', fontWeight: 700, fontSize: 17, color: p.totalPnl >= 0 ? 'var(--tr-green)' : 'var(--tr-red)' }}>
                {p.totalPnl >= 0 ? '+' : ''}${p.totalPnl}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Win Rate', value: p.winRate + '%', color: parseInt(p.winRate) >= 50 ? 'var(--tr-green)' : 'var(--tr-red)' },
                { label: 'Wins / Losses', value: `${p.wins}W / ${p.losses}L`, color: 'var(--text-primary)' },
                { label: 'Avg Win', value: '$' + p.avgWin, color: 'var(--tr-green)' },
                { label: 'Avg Loss', value: '-$' + p.avgLoss, color: 'var(--tr-red)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Win rate bar */}
            <div style={{ marginTop: 12 }}>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: p.winRate + '%', background: parseInt(p.winRate) >= 50 ? 'var(--tr-green)' : 'var(--tr-red)', borderRadius: 100, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
