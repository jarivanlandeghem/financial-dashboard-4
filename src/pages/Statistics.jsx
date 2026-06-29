import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n/useT';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import SFIcon from '../components/SFIcon';
import CustomTooltip from '../components/CustomTooltip';
import MonthSelector from '../components/MonthSelector';
import { CATEGORIES, monthlyData, savingsData, savingsRate } from '../data/mockData';

const fmt = (n) => (n < 0 ? '-' : '') + '€' + Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const COLORS = ['#007AFF', '#5856D6', '#FF2D55', '#FF9500', '#34C759', '#00C7BE'];

export default function Statistics() {
  const { filteredTransactions } = useApp();
  const t = useT();

  const income   = filteredTransactions.filter(tx => tx.amount > 0).reduce((s, tx) => s + tx.amount, 0);
  const expenses = filteredTransactions.filter(tx => tx.amount < 0).reduce((s, tx) => s + Math.abs(tx.amount), 0);
  const net      = income - expenses;
  const savingsPct = income > 0 ? ((net / income) * 100).toFixed(1) : 0;

  const catSpend = {};
  filteredTransactions.filter(t => t.amount < 0).forEach(t => {
    catSpend[t.category] = (catSpend[t.category] || 0) + Math.abs(t.amount);
  });
  const catChartData = Object.entries(catSpend)
    .map(([k, v]) => ({ name: CATEGORIES[k]?.label || k, value: v }))
    .sort((a, b) => b.value - a.value);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('stats_title')}</h1>
          <p className="page-subtitle">{t('stats_subtitle')}</p>
        </div>
        <MonthSelector />
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: t('stats_income'), value: fmt(income), color: '#34C759' },
          { label: t('stats_expenses'), value: fmt(expenses), color: '#FF3B30' },
          { label: t('stats_net'), value: fmt(net), color: net >= 0 ? '#1A56DB' : '#FF3B30' },
          { label: t('stats_rate'), value: savingsPct + '%', color: savingsPct >= 30 ? '#34C759' : savingsPct >= 15 ? '#FF9500' : '#FF3B30' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value private-num" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2">
        <div className="card">
          <div className="section-header"><span className="section-title">{t('stats_income_vs_expenses')}</span></div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '€'+v} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="income" name={t('stats_income_leg')} fill="#34C759" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" name={t('stats_expenses_leg')} fill="#FF3B30" radius={[4,4,0,0]} />
              <Bar dataKey="savings" name={t('stats_savings_leg')} fill="#FF9500" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-header"><span className="section-title">{t('stats_savings_trend')}</span></div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={savingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '€'+v} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" name={t('stats_networth_lbl')} stroke="#1A56DB" strokeWidth={1.5} dot={{ fill: '#1A56DB', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="section-header"><span className="section-title">{t('stats_top_expenses')}</span></div>
        {catChartData.slice(0, 5).map((cat, i) => (
          <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div data-squircle-r={8} style={{ width: 24, height: 24, background: COLORS[i % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700 }}>
              {i + 1}
            </div>
            <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{cat.name}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>€{cat.value.toFixed(0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
