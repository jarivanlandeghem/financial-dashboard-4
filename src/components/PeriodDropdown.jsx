import { useState, useRef, useEffect } from 'react';
import SFIcon from './SFIcon';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/useT';

const GROUPS = [
  [
    { value: 'this_week',    key: 'period_this_week',    icon: 'calendar.svg' },
    { value: 'last_week',    key: 'period_last_week',    icon: 'calendar.svg' },
  ],
  [
    { value: 'this_month',   key: 'period_this_month',   icon: 'calendar.svg' },
    { value: 'last_month',   key: 'period_last_month',   icon: 'calendar.svg' },
    { value: 'monthly',      key: 'period_monthly',      icon: 'calendar.svg' },
  ],
  [
    { value: 'this_quarter', key: 'period_this_quarter', icon: 'calendar.badge.clock.svg' },
    { value: 'last_quarter', key: 'period_last_quarter', icon: 'calendar.badge.clock.svg' },
  ],
  [
    { value: 'this_year',    key: 'period_this_year',    icon: 'calendar.badge.clock.svg' },
    { value: 'last_year',    key: 'period_last_year',    icon: 'calendar.badge.clock.svg' },
    { value: 'yearly',       key: 'period_yearly',       icon: 'calendar.badge.clock.svg' },
  ],
  [
    { value: 'custom',       key: 'period_custom',       icon: 'calendar.badge.plus.svg' },
  ],
];

const ALL_OPTIONS = GROUPS.flat();

export default function PeriodDropdown() {
  const t = useT();
  const { periodType, setPeriodType } = useApp();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const active = ALL_OPTIONS.find(o => o.value === periodType) || ALL_OPTIONS[2];

  useEffect(() => {
    if (!open) return;
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left });
    }
    const onClickOutside = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const select = (value) => {
    setPeriodType(value);
    setOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px',
          background: open ? 'var(--accent-light)' : 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-widget)',
          boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
          color: 'var(--text-primary)',
          fontSize: 13, fontWeight: 500,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'background 0.15s',
        }}
      >
        <SFIcon name={active.icon} size={13} color="var(--accent)" />
        {t(active.key)}
        <SFIcon
          name="chevron.down.svg"
          size={11}
          color="var(--text-muted)"
          style={{ marginLeft: 2, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            zIndex: 9999,
            minWidth: 200,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--shape-lg)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 1.5px 6px rgba(0,0,0,0.10)',
            padding: '4px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {GROUPS.map((group, gi) => (
            <div key={gi}>
              {gi > 0 && (
                <div style={{
                  height: 1,
                  background: 'var(--border)',
                  margin: '4px 8px',
                  opacity: 0.6,
                }} />
              )}
              {group.map(opt => {
                const isActive = periodType === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => select(opt.value)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', textAlign: 'left',
                      padding: '7px 10px',
                      background: isActive ? 'var(--accent-light)' : 'none',
                      border: 'none',
                      borderRadius: 'var(--shape-md)',
                      color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--accent-light)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'none'; }}
                  >
                    <SFIcon name={opt.icon} size={13} color={isActive ? 'var(--accent)' : 'var(--text-muted)'} />
                    <span>{t(opt.key)}</span>
                    {isActive && (
                      <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: 11 }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
