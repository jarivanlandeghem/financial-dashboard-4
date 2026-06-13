export default function CustomTooltip({ active, payload, label, prefix = '€' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontSize: 13 }}>
          {p.name}: {prefix}{Number(p.value).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      ))}
    </div>
  );
}
