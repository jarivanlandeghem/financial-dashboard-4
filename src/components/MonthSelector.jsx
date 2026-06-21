import SFIcon from './SFIcon';
import { useApp } from '../context/AppContext';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function MonthSelector() {
  const { selectedMonth, setSelectedMonth } = useApp();

  const prev = () => setSelectedMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const next = () => setSelectedMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const now = new Date();
  const isCurrent = selectedMonth.getMonth() === now.getMonth() && selectedMonth.getFullYear() === now.getFullYear();

  const btnStyle = {
    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--accent)', borderRadius: 'var(--radius-sm)', transition: 'background 0.15s',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 2,
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-sm)',
      boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
      padding: '3px 4px',
    }}>
      <button onClick={prev} style={btnStyle}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <SFIcon name="chevron.left.svg" size={14} color="currentColor" />
      </button>

      <div style={{ width: 140, textAlign: 'center', position: 'relative' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>
          {MONTHS[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
        </span>
        {!isCurrent && (
          <button onClick={() => setSelectedMonth(new Date())} style={{
            position: 'absolute', top: -8, right: 4,
            fontSize: 9, fontWeight: 600, color: 'var(--accent)',
            background: 'var(--accent-light)', border: 'none', borderRadius: 6,
            padding: '1px 5px', cursor: 'pointer',
          }}>TODAY</button>
        )}
      </div>

      <button onClick={next} style={btnStyle}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <SFIcon name="chevron.right.svg" size={14} color="currentColor" />
      </button>
    </div>
  );
}
