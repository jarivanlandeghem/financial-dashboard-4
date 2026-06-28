import { useState, useRef, useEffect } from 'react';
import SFIcon from './SFIcon';
import { useApp } from '../context/AppContext';

const MONTHS_NL = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];

/* ── Month selector (bestaand gedrag) ─────────────────────── */
function MonthMode() {
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
      background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
      boxShadow: '0 1px 8px rgba(0,0,0,0.08)', padding: '3px 4px',
    }}>
      <button onClick={prev} style={btnStyle}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
        <SFIcon name="chevron.left.svg" size={14} color="currentColor" />
      </button>
      <div style={{ width: 140, textAlign: 'center', position: 'relative' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>
          {MONTHS_NL[selectedMonth.getMonth()].charAt(0).toUpperCase() + MONTHS_NL[selectedMonth.getMonth()].slice(1)} {selectedMonth.getFullYear()}
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
        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
        <SFIcon name="chevron.right.svg" size={14} color="currentColor" />
      </button>
    </div>
  );
}

/* ── Year selector ────────────────────────────────────────── */
function YearMode() {
  const { selectedYear, setSelectedYear } = useApp();
  const now = new Date().getFullYear();
  const prev = () => setSelectedYear(y => y - 1);
  const next = () => setSelectedYear(y => Math.min(y + 1, now));

  const btnStyle = {
    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--accent)', borderRadius: 'var(--radius-sm)', transition: 'background 0.15s',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 2,
      background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
      boxShadow: '0 1px 8px rgba(0,0,0,0.08)', padding: '3px 4px',
    }}>
      <button onClick={prev} style={btnStyle}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
        <SFIcon name="chevron.left.svg" size={14} color="currentColor" />
      </button>
      <div style={{ width: 80, textAlign: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          {selectedYear}
        </span>
      </div>
      <button onClick={next} disabled={selectedYear >= now}
        style={{ ...btnStyle, opacity: selectedYear >= now ? 0.3 : 1, cursor: selectedYear >= now ? 'default' : 'pointer' }}
        onMouseEnter={e => selectedYear < now && (e.currentTarget.style.background = 'var(--accent-light)')}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
        <SFIcon name="chevron.right.svg" size={14} color="currentColor" />
      </button>
    </div>
  );
}

/* ── Max mode ─────────────────────────────────────────────── */
function MaxMode() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
      boxShadow: '0 1px 8px rgba(0,0,0,0.08)', padding: '6px 14px',
    }}>
      <SFIcon name="infinity.svg" size={13} color="var(--accent)" />
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Volledige historie</span>
    </div>
  );
}

/* ── Custom date range ────────────────────────────────────── */
function CustomMode() {
  const { dateRange, setDateRange } = useApp();
  const fromRef = useRef(null);
  const toRef = useRef(null);

  const inputStyle = {
    background: 'none', border: 'none', outline: 'none',
    fontSize: 12, fontWeight: 500, color: 'var(--text-primary)',
    cursor: 'pointer', width: 90,
    colorScheme: 'dark',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
      boxShadow: '0 1px 8px rgba(0,0,0,0.08)', padding: '5px 10px',
      border: '1px solid var(--border)',
    }}>
      <SFIcon name="calendar.svg" size={13} color="var(--accent)" />
      <input
        ref={fromRef}
        type="date"
        value={dateRange.from || ''}
        onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
        style={inputStyle}
        max={dateRange.to || undefined}
      />
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>→</span>
      <input
        ref={toRef}
        type="date"
        value={dateRange.to || ''}
        onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
        style={inputStyle}
        min={dateRange.from || undefined}
      />
    </div>
  );
}

/* ── Main export ──────────────────────────────────────────── */
export default function PeriodSelector() {
  const { periodType } = useApp();
  if (periodType === 'yearly')  return <YearMode />;
  if (periodType === 'max')     return <MaxMode />;
  if (periodType === 'custom')  return <CustomMode />;
  return <MonthMode />;
}
