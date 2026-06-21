import { useNavigate } from 'react-router-dom';
import { TrendingUp, LayoutDashboard, Users, Moon, Sun } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SW = 1.5;

const APPS = [
  {
    id: 'finance',
    Icon: LayoutDashboard,
    title: 'Financieel Dashboard',
    subtitle: 'Transacties · Budget · Investeringen · Hypotheek',
    accent: '#1A3F82',
    route: '/finance',
  },
  {
    id: 'trading',
    Icon: TrendingUp,
    title: 'Trading',
    subtitle: 'Journal · Analytics · Posities · Kalender',
    accent: '#7B2D8B',
    route: '/trading',
  },
  {
    id: 'splitwise',
    Icon: Users,
    title: 'Splitwise',
    subtitle: 'Gedeelde kosten · Groepen · Afrekenen',
    accent: '#1B7C2E',
    route: '/splitwise',
  },
];

export default function Hub() {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useApp();

  return (
    <div style={{
      minHeight: '100dvh',
      background: darkMode ? '#0a0a0a' : '#f2f2f7',
      color: darkMode ? '#ffffff' : '#1a1a1e',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 40px',
    }}>

      {/* Dark mode toggle */}
      <button
        onClick={() => setDarkMode(d => !d)}
        style={{
          position: 'fixed', top: 20, right: 20,
          background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          borderRadius: 10, width: 36, height: 36,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
          transition: 'background 0.2s',
        }}
      >
        {darkMode ? <Sun size={15} strokeWidth={SW} /> : <Moon size={15} strokeWidth={SW} />}
      </button>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 56, height: 56, borderRadius: 16,
          background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          marginBottom: 20,
        }}>
          <LayoutDashboard size={24} strokeWidth={SW} style={{ opacity: 0.7 }} />
        </div>
        <h1 style={{
          fontSize: 28, fontWeight: 700, letterSpacing: -0.5,
          margin: '0 0 8px',
          color: darkMode ? '#ffffff' : '#111111',
        }}>
          Persoonlijk Dashboard
        </h1>
        <p style={{
          fontSize: 15,
          color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
          margin: 0, fontWeight: 400,
        }}>
          Kies een applicatie
        </p>
      </div>

      {/* App grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 280px)',
        gap: 16,
      }}>
        {APPS.map(({ id, Icon, title, subtitle, accent, route }) => (
          <button
            key={id}
            onClick={() => navigate(route)}
            style={{
              background: darkMode ? '#1c1c1e' : '#ffffff',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              borderRadius: 18,
              padding: '28px 24px',
              cursor: 'pointer', textAlign: 'left',
              display: 'flex', flexDirection: 'column', gap: 16,
              boxShadow: darkMode
                ? '0 1px 3px rgba(0,0,0,0.4)'
                : '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = darkMode
                ? '0 8px 24px rgba(0,0,0,0.5)'
                : '0 8px 32px rgba(0,0,0,0.10)';
              e.currentTarget.style.borderColor = accent + '60';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = darkMode
                ? '0 1px 3px rgba(0,0,0,0.4)'
                : '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)';
              e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
            }}
          >
            {/* Icon */}
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: accent + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon size={20} strokeWidth={SW} color={accent} />
            </div>

            {/* Text */}
            <div>
              <div style={{
                fontSize: 16, fontWeight: 600,
                color: darkMode ? '#ffffff' : '#111111',
                marginBottom: 5,
              }}>
                {title}
              </div>
              <div style={{
                fontSize: 13,
                color: darkMode ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.4)',
                lineHeight: 1.5,
              }}>
                {subtitle}
              </div>
            </div>

            {/* Arrow */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end',
              color: accent, opacity: 0.7, fontSize: 18, marginTop: 'auto',
            }}>›</div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <p style={{
        marginTop: 56, fontSize: 12,
        color: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
      }}>
        Jari Van Landeghem
      </p>
    </div>
  );
}
