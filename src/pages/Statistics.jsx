import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import { CATEGORIES, monthlyData, netWorthData } from '../data/mockData';
import CustomTooltip from '../components/CustomTooltip';
import MonthSelector from '../components/MonthSelector';
import { useT } from '../i18n/useT';

const fmt = (n) => (n < 0 ? '-' : '') + '€' + Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const COLORS = ['#4F8EF7','#00C896','#FFB800','#FF4757','#A855F7','#EC4899','#06B6D4','#F97316'];

export default function Statistics() {
  const { filteredTransactions, income, expenses, net } = useApp();
  const t = useT();

  const savingsRate = income > 0 ? ((net / income) * 100).toFixed(1) : 0;

  // Category breakdown
  const catData = {};
  filteredTransactions.filter(t => t.amount < 0).forEach(t => {
    const label = CATEGORIES[t.category]?.label || t.category;
    catData[label] = (catData[label] || 0) + Math.abs(t.amount);
  });
  const catChartData = Object.entries(catData).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Savings rate per month
  const savingsData = monthlyData.map(m => ({
    ...m,
    rate: ((m.savings / m.income) * 100).toFixed(1),
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('stats_title')}</h1>
          <p className="page-subtitle">{t('stats_subtitle')}</p>
        </div>
        <MonthSelector />
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: t('stats_income'), value: fmt(income), color: 'var(--green)' },
          { label: t('stats_expenses'), value: fmt(expenses), color: 'var(--red)' },
          { label: t('stats_net'), value: fmt(net), color: net >= 0 ? 'var(--accent)' : 'var(--red)' },
          { label: t('stats_rate'), value: savingsRate + '%', color: savingsRate >= 30 ? 'var(--green)' : savingsRate >= 15 ? 'var(--yellow)' : 'var(--red)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: 22, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-header"><span className="section-title">{t('stats_monthly_chart')}</span></div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => '€'+v} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="income" name={t('stats_income_leg')} fill="var(--green)" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" name={t('stats_expenses_leg')} fill="var(--red)" radius={[4,4,0,0]} />
              <Bar dataKey="savings" name={t('stats_savings_leg')} fill="var(--accent)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-header"><span className="section-title">{t('stats_savings_trend')}</span></div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={savingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => v+'%'} />
              <Tooltip formatter={v => [v + '%', 'Savings Rate']} />
              <Line type="monotone" dataKey="rate" name="Savings Rate" stroke="var(--accent)" strokeWidth={1.5} dot={{ fill: 'var(--accent)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-header"><span className="section-title">{t('stats_by_category')}</span></div>
          {catChartData.length === 0 ? (
            <div className="empty-state"><p>{t('stats_no_expenses')}</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={catChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '€'+v} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={v => ['€' + v.toFixed(2), 'Spent']} />
                <Bar dataKey="value" radius={[0,4,4,0]}>
                  {catChartData.map((_, i) => (
                    <rect key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="section-header"><span className="section-title">{t('stats_networth')}</span></div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={netWorthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => '€'+v} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" name="Net Worth" stroke="var(--green)" strokeWidth={1.5} dot={{ fill: 'var(--green)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="section-header"><span className="section-title">{t('stats_top_expenses')}</span></div>
        {catChartData.slice(0, 5).map((cat, i) => (
          <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 24, height: 24, borderRadius: 'var(--radius-sm)', background: COLORS[i % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700 }}>
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{cat.name}</div>
              <div className="progress-bar" style={{ marginTop: 4 }}>
                <div className="progress-fill" style={{ width: ((cat.value / catChartData[0].value) * 100) + '%', background: COLORS[i % COLORS.length] }} />
              </div>
            </div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>€{cat.value.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
