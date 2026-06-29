import SFIcon from '../../components/SFIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { mockTrades, strategies } from '../../data/tradingData';
import { useT } from '../../i18n/useT';

export default function TradingStrategy() {
  const stratStats = strategies.map(s => {
    const trades = mockTrades.filter(t => t.strategy === s);
    if (!trades.length) return null;
    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl < 0);
    const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
    const winRate = ((wins.length / trades.length) * 100).toFixed(0);
    const avgRR = (trades.reduce((s, t) => s + t.rr, 0) / trades.length).toFixed(2);
    const avgPnl = (totalPnl / trades.length).toFixed(0);
    return { strategy: s, trades: trades.length, wins: wins.length, losses: losses.length, totalPnl, winRate, avgRR, avgPnl };
  }).filter(Boolean);

  const pnlData = stratStats.map(s => ({ strategy: s.strategy, pnl: s.totalPnl, winRate: parseInt(s.winRate) }));
  const t = useT();

  const rules = [
    { rule: 'Only trade with RR ≥ 1.5', status: 'active' },
    { rule: 'Max 2 trades per day', status: 'active' },
    { rule: 'No trading on Mondays (poor historical performance)', status: 'paused' },
    { rule: 'Only enter during London or NY session', status: 'active' },
    { rule: 'Close all positions before major news events', status: 'active' },
    { rule: 'Daily loss limit: $200 — stop trading if hit', status: 'active' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('tr_strategy_title')}</h1>
          <p className="page-subtitle">{t('tr_strategy_sub')}</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-header"><span className="section-title">{t('tr_pnl_by_strategy')}</span></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pnlData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="strategy" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + v} />
              <Tooltip formatter={(v) => ['$' + v, 'P&L']} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {pnlData.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? 'var(--tr-green)' : 'var(--tr-red)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-header"><span className="section-title">{t('tr_winrate_by_strategy')}</span></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pnlData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="strategy" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v + '%'} domain={[0, 100]} />
              <Tooltip formatter={(v) => [v + '%', t('tr_win_rate_lbl')]} />
              <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                {pnlData.map((d, i) => <Cell key={i} fill={d.winRate >= 50 ? 'var(--tr-accent)' : 'var(--tr-red)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strategy detail cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 20 }}>
        {stratStats.map(s => (
          <div key={s.strategy} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: s.totalPnl >= 0 ? 'var(--tr-green-light)' : 'var(--tr-red-light)',
                color: s.totalPnl >= 0 ? 'var(--tr-green)' : 'var(--tr-red)',
              }} data-squircle-r="8">
                <SFIcon name={s.totalPnl >= 0 ? 'chart.line.uptrend.xyaxis.svg' : 'chart.line.downtrend.xyaxis.svg'} size={16} color={s.totalPnl >= 0 ? 'var(--tr-green)' : 'var(--tr-red)'} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{s.strategy}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('tr_trades_count').replace('{n}', s.trades)}</div>
              </div>
              <div style={{ fontWeight: 700, color: s.totalPnl >= 0 ? 'var(--tr-green)' : 'var(--tr-red)' }}>
                {s.totalPnl >= 0 ? '+' : ''}${s.totalPnl}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {[
                { label: t('tr_win_rate_lbl'), value: s.winRate + '%' },
                { label: t('tr_avg_rr'), value: s.avgRR },
                { label: t('tr_avg_pnl_lbl'), value: '$' + s.avgPnl },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--bg-primary)', padding: '7px 9px', textAlign: 'center' }} data-squircle-r="8">
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Trading rules */}
      <div className="card">
        <div className="section-header">
          <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <SFIcon name="book.closed.svg" size={15} color="var(--tr-accent)" /> {t('tr_trading_rules')}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rules.map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
              background: 'var(--bg-primary)',
            }} data-squircle-r="8">
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: r.status === 'active' ? 'var(--tr-green)' : 'var(--tr-red)',
              }} />
              <span style={{ fontSize: 13, flex: 1 }}>{r.rule}</span>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 8px',
                background: r.status === 'active' ? 'var(--tr-green-light)' : 'var(--tr-red-light)',
                color: r.status === 'active' ? 'var(--tr-green)' : 'var(--tr-red)',
              }} data-squircle-r="8">{r.status === 'active' ? t('tr_active') : t('tr_paused')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
