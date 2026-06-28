import { useApp } from '../context/AppContext';
import { useT } from '../i18n/useT';

const fmt = (n) => (n < 0 ? '-' : '') + '€' + Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Mortgage() {
  const { mortgage, language } = useApp();
  const t = useT();
  const { originalAmount, startDate, endDate, interestRate, monthlyPayment, currentBalance } = mortgage;
  const LOCALE_MAP = { nl: 'nl-NL', en: 'en-US', fr: 'fr-FR', de: 'de-DE' };

  const paid = originalAmount - currentBalance;
  const pct = ((paid / originalAmount) * 100).toFixed(1);

  // Generate next 12 months of schedule
  const schedule = [];
  let balance = currentBalance;
  const monthlyRate = interestRate / 100 / 12;
  const start = new Date();
  for (let i = 0; i < 24; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const interest = balance * monthlyRate;
    const capital = monthlyPayment - interest;
    balance -= capital;
    schedule.push({
      date: d.toLocaleDateString(LOCALE_MAP[language] || 'nl-NL', { month: 'short', year: 'numeric' }),
      payment: monthlyPayment,
      capital: capital.toFixed(2),
      interest: interest.toFixed(2),
      balance: Math.max(0, balance).toFixed(2),
    });
  }

  const yearsLeft = ((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1);
  const interestPaidYTD = schedule.slice(0, 6).reduce((s, r) => s + parseFloat(r.interest), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('mort_title')}</h1>
          <p className="page-subtitle">{t('mort_subtitle')}</p>
        </div>
      </div>

      <div className="grid-4">
        {[
          { label: t('mort_original'), value: fmt(originalAmount) },
          { label: t('mort_remaining'), value: fmt(currentBalance), color: 'var(--red)' },
          { label: t('mort_monthly'), value: fmt(monthlyPayment) },
          { label: t('mort_years_left'), value: yearsLeft + ' ' + t('mort_yr') },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: 22, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-header"><span className="section-title">{t('mort_progress')}</span><span style={{ color: 'var(--green)', fontWeight: 600 }}>{pct}% {t('mort_paid_off')}</span></div>
        <div className="progress-bar" style={{ height: 16, marginBottom: 12 }}>
          <div className="progress-fill" style={{ width: pct + '%', background: 'linear-gradient(90deg, var(--green), var(--accent))' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
          <span>{t('mort_paid')} {fmt(paid)}</span>
          <span>{t('mort_remaining')}: {fmt(currentBalance)}</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>{t('mort_details')}</div>
          {[
            [t('mort_start_date'), new Date(startDate).toLocaleDateString(LOCALE_MAP[language] || 'nl-NL')],
            [t('mort_end_date'), new Date(endDate).toLocaleDateString(LOCALE_MAP[language] || 'nl-NL')],
            [t('mort_interest_rate'), interestRate + '%'],
            [t('mort_monthly_capital'), fmt(monthlyPayment - currentBalance * (interestRate/100/12))],
            [t('mort_monthly_interest'), fmt(currentBalance * (interestRate/100/12))],
            [t('mort_interest_ytd'), fmt(interestPaidYTD)],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{k}</span>
              <span style={{ fontWeight: 500, fontSize: 14 }}>{v}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>{t('mort_next_payment')}</div>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('mort_due').replace('{date}', schedule[0]?.date)}</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent)', margin: '8px 0' }}>{fmt(monthlyPayment)}</div>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('mort_capital')}</div>
                <div style={{ fontWeight: 600, color: 'var(--green)' }}>€{schedule[0]?.capital}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('mort_interest')}</div>
                <div style={{ fontWeight: 600, color: 'var(--red)' }}>€{schedule[0]?.interest}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span className="section-title">{t('mort_schedule')}</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('mort_next_24')}</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('mort_col_month')}</th>
                <th>{t('mort_col_payment')}</th>
                <th>{t('mort_col_capital')}</th>
                <th>{t('mort_col_interest')}</th>
                <th>{t('mort_col_balance')}</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{r.date}</td>
                  <td>{fmt(r.payment)}</td>
                  <td style={{ color: 'var(--green)' }}>€{r.capital}</td>
                  <td style={{ color: 'var(--red)' }}>€{r.interest}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>€{r.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
