import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mockTrades } from '../../data/tradingData';

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function TradingCalendar() {
  const [current, setCurrent] = useState(new Date(2026, 0, 1)); // Jan 2026

  const year = current.getFullYear();
  const month = current.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Start from Monday
  let startDow = firstDay.getDay(); // 0=Sun
  startDow = startDow === 0 ? 6 : startDow - 1; // convert to Mon=0

  const days = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));

  // Group trades by date
  const tradesByDate = {};
  mockTrades.forEach(t => {
    const key = t.date;
    if (!tradesByDate[key]) tradesByDate[key] = [];
    tradesByDate[key].push(t);
  });

  // Weekly summary
  const weeks = [];
  let week = [];
  days.forEach((d, i) => {
    week.push(d);
    if (week.length === 5) {
      weeks.push(week);
      week = [];
    }
  });
  if (week.length) {
    while (week.length < 5) week.push(null);
    weeks.push(week);
  }

  const monthPnl = mockTrades
    .filter(t => new Date(t.date).getMonth() === month && new Date(t.date).getFullYear() === year)
    .reduce((s, t) => s + t.pnl, 0);
  const monthTrades = mockTrades.filter(t => new Date(t.date).getMonth() === month && new Date(t.date).getFullYear() === year).length;

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Summary'];
  const monthName = current.toLocaleDateString('en', { month: 'long', year: 'numeric' }).replace(' ', '-');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">Daily P&L view</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Calendar header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setCurrent(new Date(year, month - 1, 1))} style={{
              width: 32, height: 32, borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)',
            }}><ChevronLeft size={16} /></button>
            <span style={{ fontWeight: 700, fontSize: 16 }}>{monthName}</span>
            <button onClick={() => setCurrent(new Date(year, month + 1, 1))} style={{
              width: 32, height: 32, borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)',
            }}><ChevronRight size={16} /></button>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <span style={{ fontSize: 14 }}>
              P/L: <strong style={{ color: monthPnl >= 0 ? 'var(--tr-green)' : 'var(--tr-red)' }}>
                {monthPnl >= 0 ? '' : '-'}${Math.abs(monthPnl) >= 1000 ? (Math.abs(monthPnl) / 1000).toFixed(1) + 'K' : Math.abs(monthPnl)}
              </strong>
            </span>
            <span style={{ fontSize: 14 }}>Trades: <strong>{monthTrades}</strong></span>
          </div>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', background: 'var(--bg-primary)' }}>
          {weekDays.map(d => (
            <div key={d} style={{
              padding: '10px 14px', fontSize: 12, fontWeight: 600,
              color: 'var(--text-muted)', borderRight: '1px solid var(--border)',
              textAlign: 'center',
            }}>{d}</div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => {
          // Weekly summary
          const weekDaySlots = week.slice(0, 5);
          const weekTrades = weekDaySlots.flatMap(d => {
            if (!d) return [];
            const key = d.toISOString().split('T')[0];
            return tradesByDate[key] || [];
          });
          const weekPnl = weekTrades.reduce((s, t) => s + t.pnl, 0);

          return (
            <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', borderTop: '1px solid var(--border)' }}>
              {weekDaySlots.map((day, di) => {
                if (!day) return (
                  <div key={di} style={{ minHeight: 80, background: 'var(--bg-primary)', borderRight: '1px solid var(--border)' }} />
                );
                const key = day.toISOString().split('T')[0];
                const dayTrades = tradesByDate[key] || [];
                const dayPnl = dayTrades.reduce((s, t) => s + t.pnl, 0);
                const hasActivity = dayTrades.length > 0;
                const today = isSameDay(day, new Date());

                return (
                  <div key={di} style={{
                    minHeight: 80, padding: '8px 10px', borderRight: '1px solid var(--border)',
                    background: hasActivity
                      ? (dayPnl >= 0 ? 'rgba(0,200,150,0.06)' : 'rgba(239,68,68,0.05)')
                      : 'transparent',
                    position: 'relative',
                  }}>
                    <div style={{
                      fontSize: 13, fontWeight: today ? 700 : 400,
                      color: today ? 'var(--tr-accent)' : 'var(--text-secondary)',
                    }}>{day.getDate()}</div>
                    {hasActivity && (
                      <div style={{ marginTop: 6, textAlign: 'center' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{dayTrades.length}</div>
                        <div style={{
                          fontSize: 13, fontWeight: 700,
                          color: dayPnl >= 0 ? 'var(--tr-green)' : 'var(--tr-red)',
                        }}>
                          {dayPnl >= 0 ? '' : '-'}{Math.abs(dayPnl) >= 1000 ? (Math.abs(dayPnl) / 1000).toFixed(1) + 'K' : Math.abs(dayPnl) + '.0'}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Summary column */}
              <div style={{
                minHeight: 80, padding: '8px 12px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                background: 'var(--bg-primary)',
              }}>
                {weekTrades.length > 0 && (
                  <>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>{weekTrades.length} trades</div>
                    <div style={{
                      fontSize: 14, fontWeight: 700,
                      color: weekPnl >= 0 ? 'var(--tr-green)' : 'var(--tr-red)',
                    }}>
                      {weekPnl >= 0 ? '' : '-'}${Math.abs(weekPnl) >= 1000 ? (Math.abs(weekPnl) / 1000).toFixed(1) + 'K' : Math.abs(weekPnl) + '.0'}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
