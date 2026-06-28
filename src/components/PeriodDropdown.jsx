import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@pikoloo/darwin-ui';
import SFIcon from './SFIcon';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/useT';

const OPTIONS_DEF = [
  { value: 'monthly', key: 'period_monthly', icon: 'calendar.svg' },
  { value: 'yearly',  key: 'period_yearly',  icon: 'calendar.badge.clock.svg' },
  { value: 'max',     key: 'period_max',      icon: 'infinity.svg' },
  { value: 'custom',  key: 'period_custom',   icon: 'calendar.badge.plus.svg' },
];

export default function PeriodDropdown() {
  const t = useT();
  const { periodType, setPeriodType } = useApp();
  const options = OPTIONS_DEF.map(o => ({ ...o, label: t(o.key) }));
  const active = options.find(o => o.value === periodType) || options[0];

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
          {active.label}
          <SFIcon name="chevron.down.svg" size={11} color="var(--text-muted)" style={{ marginLeft: 2 }} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" sideOffset={6} glass>
        {options.map(opt => (
          <DropdownMenuItem
            key={opt.value}
            onSelect={() => setPeriodType(opt.value)}
            style={periodType === opt.value ? { color: 'var(--accent)', fontWeight: 600 } : {}}
          >
            <SFIcon name={opt.icon} size={13} color={periodType === opt.value ? 'var(--accent)' : 'currentColor'} />
            <span style={{ marginLeft: 8 }}>{opt.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
