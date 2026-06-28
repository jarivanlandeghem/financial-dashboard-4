import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@pikoloo/darwin-ui';
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
  const active = ALL_OPTIONS.find(o => o.value === periodType) || ALL_OPTIONS[2];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
            color: 'var(--text-primary)',
            fontSize: 13, fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <SFIcon name={active.icon} size={13} color="var(--accent)" />
          {t(active.key)}
          <SFIcon name="chevron.down.svg" size={11} color="var(--text-muted)" style={{ marginLeft: 2 }} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" sideOffset={6} glass>
        {GROUPS.map((group, gi) => (
          <span key={gi}>
            {gi > 0 && <DropdownMenuSeparator />}
            {group.map(opt => (
              <DropdownMenuItem
                key={opt.value}
                onSelect={() => setPeriodType(opt.value)}
                style={periodType === opt.value ? { color: 'var(--accent)', fontWeight: 600 } : {}}
              >
                <SFIcon name={opt.icon} size={13} color={periodType === opt.value ? 'var(--accent)' : 'currentColor'} />
                <span style={{ marginLeft: 8 }}>{t(opt.key)}</span>
              </DropdownMenuItem>
            ))}
          </span>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
