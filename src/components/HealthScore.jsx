import { useApp } from '../context/AppContext';

function scoreColor(s) {
  if (s >= 75) return '#007AFF';
  if (s >= 50) return '#5BA0DC';
  return '#93C5FD';
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
    <div className="card health-score-card">
      {/* Arc gauge */}
      <div className="health-gauge">
        <svg width="96" height="72" viewBox="0 0 120 90">
          <circle cx="60" cy="65" r={radius}
            fill="none" stroke="var(--border)" strokeWidth="9"
            strokeDasharray={`${arc} ${circ - arc}`}
            strokeDashoffset={circ * 0.125}
            strokeLinecap="round"
            transform="rotate(135 60 65)"
          />
          <circle cx="60" cy="65" r={radius}
            fill="none" stroke={color} strokeWidth="9"
            strokeDasharray={`${arc - offset} ${circ - (arc - offset)}`}
            strokeDashoffset={circ * 0.125}
            strokeLinecap="round"
            transform="rotate(135 60 65)"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div className="health-gauge-label">
          <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{total}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{label}</div>
        </div>
      </div>

      {/* Factors */}
      <div className="health-factors">
        {factors.map(f => (
          <div key={f.label} style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.label}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0, marginLeft: 4 }}>
                <span style={{ color: scoreColor((f.score / f.max) * 100) }}>{f.score}</span>/{f.max}
              </span>
            </div>
            <div style={{ height: 3, background: 'var(--border)', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 100,
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
