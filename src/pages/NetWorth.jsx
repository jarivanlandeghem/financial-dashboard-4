import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SFIcon from '../components/SFIcon';
import { netWorthData } from '../data/mockData';

const fmt = (n) => (n < 0 ? '-' : '') + '€' + Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function NetWorth() {
  const { investments, mortgage, cash, goals } = useApp();
  const [eurRate, setEurRate] = useState(0.92);
  const [homeValue, setHomeValue] = useState(() => {
    const saved = localStorage.getItem('fd_home_value');
    return saved ? Number(saved) : mortgage.originalAmount;
  });
  const [editingHome, setEditingHome] = useState(false);
  const [homeInput, setHomeInput] = useState('');

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(d => { if (d?.rates?.EUR) setEurRate(d.rates.EUR); })
      .catch(() => {});
  }, []);

  const stocksValue = investments.saxobank.reduce((s, p) => s + p.currentPrice * p.shares * eurRate, 0);
  const cryptoValue = investments.bybit.reduce((s, p) => s + p.currentPrice * p.amount * eurRate, 0);
  const investmentsTotal = stocksValue + cryptoValue;
  const homeEquity = Math.max(0, homeValue - mortgage.currentBalance);
  const cashTotal = cash.balance;
  const goalsTotal = goals.reduce((s, g) => s + (g.saved || 0), 0);

  const totalAssets = investmentsTotal + homeEquity + cashTotal + goalsTotal;
  const totalLiabilities = mortgage.currentBalance;
  const netWorth = totalAssets - totalLiabilities;

  const prevValue = netWorthData[netWorthData.length - 2]?.value || 0;
  const change = netWorth - prevValue;
  const changePct = prevValue ? ((change / prevValue) * 100).toFixed(1) : '0.0';

  const assetItems = [
    {
      label: 'Investments',
      sublabel: 'Aandelen & crypto',
      value: investmentsTotal,
      icon: 'chart.line.uptrend.xyaxis.svg',
      color: '#4F8EF7',
      detail: `${fmt(stocksValue)} aandelen · ${fmt(cryptoValue)} crypto`,
    },
    {
      label: 'Home Equity',
      sublabel: 'Woningwaarde minus hypotheek',
      value: homeEquity,
      icon: 'house.svg',
      color: '#10B981',
      detail: `${fmt(homeValue)} waarde − ${fmt(mortgage.currentBalance)} hypotheek`,
      editable: true,
    },
    {
      label: 'Cash',
      sublabel: 'Fysiek geld',
      value: cashTotal,
      icon: 'banknote.svg',
      color: '#FFB800',
      detail: 'Contant op zak',
    },
    {
      label: 'Spaardoelen',
      sublabel: 'Alle actieve doelen',
      value: goalsTotal,
      icon: 'target.svg',
      color: '#A855F7',
      detail: `${goals.length} doelen`,
    },
  ];

  const saveHomeValue = () => {
    const v = parseFloat(homeInput);
    if (!isNaN(v) && v > 0) {
      setHomeValue(v);
      localStorage.setItem('fd_home_value', String(v));
    }
    setEditingHome(false);
  };

  const assetsPct = totalAssets + totalLiabilities > 0
    ? (totalAssets / (totalAssets + totalLiabilities)) * 100
    : 100;

  const mortgageYearsLeft = Math.max(0, Math.ceil(
    (new Date(mortgage.endDate) - new Date()) / (1000 * 60 * 60 * 24 * 365)
  ));
  const mortgagePaidPct = ((mortgage.originalAmount - mortgage.currentBalance) / mortgage.originalAmount) * 100;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Nettovermogen</h1>
          <p className="page-subtitle">Totaal assets minus schulden</p>
        </div>
      </div>

      {/* Hero */}
      <div className="card" style={{ marginBottom: 20, textAlign: 'center', padding: '36px 24px' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
          Totaal nettovermogen
        </div>
        <div className="private-num" style={{
          fontSize: 52, fontWeight: 800, letterSpacing: -2,
          color: netWorth >= 0 ? 'var(--green)' : 'var(--red)',
          marginBottom: 10, lineHeight: 1,
        }}>
          {fmt(netWorth)}
        </div>
        <div style={{
          fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          color: change >= 0 ? 'var(--green)' : 'var(--red)',
        }}>
          <SFIcon
            name={change >= 0 ? 'chart.line.uptrend.xyaxis.svg' : 'chart.line.downtrend.xyaxis.svg'}
            size={14} color="currentColor"
          />
          {change >= 0 ? '+' : ''}{fmt(change)} ({changePct}%) t.o.v. vorige maand
        </div>
      </div>

      {/* Assets vs Liabilities */}
      <div className="card" style={{ marginBottom: 20, padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 3 }}>Assets</div>
            <div className="private-num" style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)' }}>{fmt(totalAssets)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 3 }}>Schulden</div>
            <div className="private-num" style={{ fontSize: 22, fontWeight: 700, color: 'var(--red)' }}>{fmt(totalLiabilities)}</div>
          </div>
        </div>
        <div style={{ height: 14, borderRadius: 100, background: 'var(--bg-primary)', overflow: 'hidden', display: 'flex' }}>
          <div style={{
            width: `${assetsPct}%`,
            background: 'var(--green)',
            borderRadius: assetsPct < 100 ? '100px 0 0 100px' : 100,
            transition: 'width 0.5s ease',
          }} />
          <div style={{
            flex: 1,
            background: 'var(--red)',
            borderRadius: '0 100px 100px 0',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
          <span>{assetsPct.toFixed(0)}% assets</span>
          <span>{(100 - assetsPct).toFixed(0)}% schulden</span>
        </div>
      </div>

      {/* Asset cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginBottom: 20 }}>
        {assetItems.map(item => (
          <div key={item.label} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 13,
                background: item.color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <SFIcon name={item.icon} size={20} color={item.color} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.sublabel}</div>
              </div>
            </div>
            <div className="private-num" style={{ fontSize: 28, fontWeight: 800, color: item.color, letterSpacing: -0.5, marginBottom: 4 }}>
              {fmt(item.value)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.detail}</div>
            {item.editable && (
              <button
                onClick={() => { setHomeInput(String(homeValue)); setEditingHome(true); }}
                style={{ marginTop: 10, fontSize: 11, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <SFIcon name="pencil.svg" size={11} color="currentColor" /> Woningwaarde aanpassen
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Liabilities */}
      <div className="card" style={{ padding: '18px 20px', marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 14 }}>Schulden</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: '#FF3B3018', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SFIcon name="house.svg" size={20} color="var(--red)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Hypotheek</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {mortgagePaidPct.toFixed(0)}% afbetaald · nog {mortgageYearsLeft} jaar
            </div>
          </div>
          <div className="private-num" style={{ fontSize: 20, fontWeight: 700, color: 'var(--red)' }}>
            {fmt(mortgage.currentBalance)}
          </div>
        </div>
        <div style={{ marginTop: 14, height: 8, background: 'var(--bg-primary)', borderRadius: 100, overflow: 'hidden' }}>
          <div style={{
            width: `${mortgagePaidPct}%`,
            height: '100%', background: 'var(--green)', borderRadius: 100,
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 11, color: 'var(--text-muted)' }}>
          <span>{fmt(mortgage.originalAmount - mortgage.currentBalance)} afbetaald</span>
          <span>{fmt(mortgage.currentBalance)} resterend</span>
        </div>
      </div>

      {/* Net worth chart */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Nettovermogen over tijd</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={netWorthData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <YAxis
              tickFormatter={v => '€' + (v / 1000).toFixed(0) + 'k'}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              width={52}
            />
            <Tooltip
              formatter={v => ['€' + Number(v).toLocaleString('nl-BE'), 'Nettovermogen']}
              contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
            />
            <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5} fill="url(#nwGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Edit home value modal */}
      {editingHome && (
        <div className="modal-overlay" onClick={() => setEditingHome(false)}>
          <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">Woningwaarde aanpassen</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Huidige geschatte marktwaarde van je woning (niet de aankoopprijs).
            </p>
            <div className="input-group">
              <label className="input-label">Woningwaarde (€)</label>
              <input
                className="input"
                type="number"
                value={homeInput}
                onChange={e => setHomeInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveHomeValue()}
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setEditingHome(false)}>Annuleer</button>
              <button className="btn btn-primary" onClick={saveHomeValue}>Opslaan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
