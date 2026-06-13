import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function MonthSelector() {
  const { selectedMonth, setSelectedMonth } = useApp();

  const prev = () => setSelectedMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const next = () => setSelectedMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const isCurrentMonth = () => {
    const now = new Date();
    return selectedMonth.getMonth() === now.getMonth() && selectedMonth.getFullYear() === now.getFullYear();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="month-selector">
        <button className="btn-icon" onClick={prev} style={{ border: 'none', background: 'none', padding: 4 }}>
          <ChevronLeft size={16} />
        </button>
        <span>{MONTHS[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}</span>
        <button className="btn-icon" onClick={next} style={{ border: 'none', background: 'none', padding: 4 }}>
          <ChevronRight size={16} />
        </button>
      </div>
      {!isCurrentMonth() && (
        <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}
          onClick={() => setSelectedMonth(new Date())}>
          Today
        </button>
      )}
    </div>
  );
}
