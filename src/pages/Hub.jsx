import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const APPS = [
  {
    id: 'finance',
    icon: '💰',
    title: 'Financieel Dashboard',
    subtitle: 'Transacties, budget, investeringen, hypotheek',
    color: '#1A3F82',
    bg: 'linear-gradient(135deg, #1A3F82 0%, #2E75B6 100%)',
    route: '/finance',
  },
  {
    id: 'splitwise',
    icon: '🍕',
    title: 'Splitwise',
    subtitle: 'Gedeelde kosten, groepen, afrekenen',
    color: '#1B7C2E',
    bg: 'linear-gradient(135deg, #1B7C2E 0%, #34C759 100%)',
    route: '/splitwise',
  },
  {
    id: 'trading',
    icon: '📈',
    title: 'Trading',
    subtitle: 'Journal, analytics, posities & kalender',
    color: '#7B2D8B',
    bg: 'linear-gradient(135deg, #7B2D8B 0%, #AF52DE 100%)',
    route: '/trading',
  },
];

export default function Hub() {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useApp();

  return (
    <div style={{
      minHeight: '100dvh',
      background: darkMode
        ? 'radial-gradient(ellipse at 20% 20%, #1a1a2e 0%, #0a0a0a 60%)'
        : 'radial-gradient(ellipse at 20% 20%, #e8f0fb 0%, #f5f5f7 60%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      transition: 'background 0.3s',
    }}>

      {/* Dark mode toggle */}
      <button
        onClick={() => setDarkMode(d => !d)}
        style={{
          position: 'fixed', top: 20, right: 20,
          background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
          border: 'none', borderRadius: '50%', width: 38, height: 38,
          cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🏦</div>
        <h1 style={{
          fontSize: 32, fontWeight: 800, letterSpacing: -0.5,
          color: darkMode ? '#ffffff' : '#1a1a2e',
          marginBottom: 8,
        }}>
          Jari's Finance Hub
        </h1>
        <p style={{ fontSize: 16, color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)', fontWeight: 400 }}>
          Kies een app om te starten
        </p>
      </div>

      {/* App cards */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 16,
        width: '100%', maxWidth: 420,
      }}>
        {APPS.map((app) => (
          <button
            key={app.id}
            onClick={() => navigate(app.route)}
            style={{
              background: app.bg,
              border: 'none', borderRadius: 24,
              padding: '28px 28px',
              cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 20,
              boxShadow: `0 8px 32px ${app.color}40`,
              transform: 'translateY(0)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = `0 16px 48px ${app.color}55`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 8px 32px ${app.color}40`;
            }}
          >
            <div style={{
              width: 60, height: 60, borderRadius: 18,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, flexShrink: 0,
              backdropFilter: 'blur(8px)',
            }}>
              {app.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                {app.title}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>
                {app.subtitle}
              </div>
            </div>
            <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.6)', flexShrink: 0 }}>›</div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <p style={{
        marginTop: 48, fontSize: 13,
        color: darkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
      }}>
        Privé dashboard · Jari Van Landeghem
      </p>
    </div>
  );
}
