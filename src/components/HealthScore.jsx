import { useApp } from '../context/AppContext';

function scoreColor(s) {
  if (s >= 75) return 'var(--green)';
  if (s >= 50) return 'var(--yellow)';
  return 'var(--red)';
}

function scoreLabel(s) {
  if (s >= 85) return 'Excellent';
  if (s >= 70) return 'Good';
  if (s >= 50) return 'Fair';
  if (s >= 30) return 'Needs attention';
  return 'Critical';
}

export default function HealthScore() {
  const { income, expenses, net, budgets, mortgage, subscriptions } = useApp();

  // 1. Savings rate (40 pts): >20% = full, linear below
  const savingsRate = income > 0 ? (net / income) * 100 : 0;
  const savingsScore = Math.min(40, Math.max(0, (savingsRate / 20) * 40));

  // 2. Budget adherence (30 pts): % of budgets on track
  const onTrack = budgets.filter(b => b.spent <= b.limit).length;
  const budgetScore = budgets.length > 0 ? (onTrack / budgets.length) * 30 : 30;

  // 3. Debt-to-income (20 pts): mortgage payment vs income, < 30% = full
  const debtRatio = income > 0 ? (mortgage.monthlyPayment / income) * 100 : 0;
  const debtScore = Math.min(20, Math.max(0, ((30 - debtRatio) / 30) * 20));

  // 4. Subscription ratio (10 pts): subs cost vs income, < 5% = full
  const subsTotal = subscriptions.reduce((s, sub) => s + sub.amount, 0);
  const subsRatio = income > 0 ? (subsTotal / income) * 100 : 0;
  const subsScore = Math.min(10, Math.max(0, ((5 - subsRatio) / 5) * 10));

  const total = Math.round(savingsScore + budgetScore + debtScore + subsScore);
  const color = scoreColor(total);
  const label = scoreLabel(total);

  // Arc math
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const arc = circ * 0.75; // 270° arc
  const offset = arc - (arc * total) / 100;

  const factors = [
    { label: 'Savings rate', value: `${savingsRate.toFixed(0)}%`, score: Math.round(savingsScore), max: 40 },
    { label: 'Budget control', value: `${onTrack}/${budgets.length}`, score: Math.round(budgetScore), max: 30 },
    { label: 'Debt ratio', value: `${debtRatio.toFixed(0)}%`, score: Math.round(debtScore), max: 20 },
    { label: 'Subscriptions', value: `${subsRatio.toFixed(0)}%`, score: Math.round(subsScore), max: 10 },
  ];

  return (
    <div className="card" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      {/* Arc gauge */}
      <div style={{ flexShrink: 0, position: 'relative', width: 120, height: 90 }}>
        <svg width="120" height="90" viewBox="0 0 120 90">
          {/* Track */}
          <circle cx="60" cy="65" r={radius}
            fill="none" stroke="var(--border)" strokeWidth="9"
            strokeDasharray={`${arc} ${circ - arc}`}
            strokeDashoffset={circ * 0.125}
            strokeLinecap="round"
            transform="rotate(135 60 65)"
          />
          {/* Fill */}
          <circle cx="60" cy="65" r={radius}
            fill="none" stroke={color} strokeWidth="9"
            strokeDasharray={`${arc - offset} ${circ - (arc - offset)}`}
            strokeDashoffset={circ * 0.125}
            strokeLinecap="round"
            transform="rotate(135 60 65)"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{total}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{label}</div>
        </div>
      </div>

      {/* Factors */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>
          Financial Health Score
        </div>
        {factors.map(f => (
          <div key={f.label} style={{ marginBottom: 7 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{f.label}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>
                {f.value} · <span style={{ color: scoreColor((f.score / f.max) * 100) }}>{f.score}/{f.max}</span>
              </span>
            </div>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                width: `${(f.score / f.max) * 100}%`,
                background: scoreColor((f.score / f.max) * 100),
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
