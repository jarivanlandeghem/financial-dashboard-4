import { Users, Activity, Receipt, User } from 'lucide-react';

const tabs = [
  { id: 'groups', label: 'Groups', Icon: Users },
  { id: 'activity', label: 'Activity', Icon: Activity },
  { id: 'friends', label: 'Balances', Icon: Receipt },
  { id: 'account', label: 'Account', Icon: User },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 430,
      background: 'rgba(255,255,255,0.82)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderTop: '0.5px solid var(--separator)',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      zIndex: 100,
    }}>
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '10px 0 8px',
              transition: 'opacity 0.1s',
            }}
          >
            <Icon
              size={24}
              strokeWidth={isActive ? 2 : 1.5}
              color={isActive ? 'var(--blue)' : 'var(--label-tertiary)'}
              style={{ transition: 'color 0.15s' }}
            />
            <span style={{
              fontSize: 10,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--blue)' : 'var(--label-tertiary)',
              letterSpacing: 0.1,
              transition: 'color 0.15s',
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
