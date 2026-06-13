import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function MonthSelector() {
  const { selectedMonth, setSelectedMonth } = useApp();

  const prev = () => setSelectedMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const next = () => setSelectedMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const now = new Date();
  const isCurrent = selectedMonth.getMonth() === now.getMonth() && selectedMonth.getFullYear() === now.getFullYear();

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      {/* Prev arrow */}
      <button onClick={prev} style={{
        width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--accent)', borderRight: '1px solid var(--border)',
        transition: 'background 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <ChevronLeft size={15} strokeWidth={2.5} />
      </button>

      {/* Month label — fixed width so arrows never move */}
      <div style={{ width: 148, textAlign: 'center', position: 'relative' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>
          {MONTHS[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
        </span>
        {!isCurrent && (
          <button onClick={() => setSelectedMonth(new Date())} style={{
            position: 'absolute', top: -8, right: 8,
            fontSize: 9, fontWeight: 600, color: 'var(--accent)',
            background: 'var(--accent-light)', border: 'none', borderRadius: 4,
            padding: '1px 5px', cursor: 'pointer', letterSpacing: '0.02em',
          }}>
            TODAY
          </button>
        )}
      </div>

      {/* Next arrow */}
      <button onClick={next} style={{
        width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--accent)', borderLeft: '1px solid var(--border)',
        transition: 'background 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <ChevronRight size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
}
