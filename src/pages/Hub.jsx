import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/useT';
import SFIcon from '../components/SFIcon';

const APPS = [
  { id: 'finance',   icon: 'chart.bar.xaxis.ascending.svg', titleKey: 'hub_finance_title',  subtitleKey: 'hub_finance_desc',   accent: '#1A3F82', route: '/finance'    },
  { id: 'trading',   icon: 'chart.line.uptrend.xyaxis.svg', titleKey: 'hub_trading_title',  subtitleKey: 'hub_trading_desc',   accent: '#7B2D8B', route: '/trading'    },
  { id: 'splitwise', icon: 'person.2.svg',                  titleKey: 'hub_splitwise_title',subtitleKey: 'hub_splitwise_desc', accent: '#1B7C2E', route: '/splitwise'  },
];

const css = (dark) => `
  .hub-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    width: min(860px, 100%);
  }
  @media (max-width: 580px) {
    .hub-grid { grid-template-columns: 1fr; }
  }
  .hub-card {
    background: ${dark ? '#1c1c1e' : '#ffffff'};
    border: 1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
    border-radius: 18px;
    padding: clamp(20px, 4vw, 28px) clamp(16px, 4vw, 24px);
    cursor: pointer;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: ${dark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)'};
    transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
    width: 100%;
  }
  .hub-card:hover {
    transform: translateY(-2px);
    box-shadow: ${dark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.10)'};
  }
  .hub-card:active { transform: scale(0.98); }
`;

export default function Hub() {
  const navigate = useNavigate();
  const t = useT();
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
      padding: 'clamp(32px, 5vw, 60px) clamp(16px, 5vw, 40px)',
    }}>

      <style>{css(darkMode)}</style>

      <button
        onClick={() => setDarkMode(d => !d)}
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 10,
          background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          borderRadius: 'var(--shape-md)', width: 36, height: 36,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
        }}
      >
        <SFIcon name={darkMode ? 'sun.max.svg' : 'moon.svg'} size={15}
          color={darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'} />
      </button>

      <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 56px)' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 52, height: 52, borderRadius: 'var(--shape-lg)',
          background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          marginBottom: 18,
        }}>
          <SFIcon name="chart.bar.xaxis.ascending.svg" size={22}
            color={darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'} />
        </div>
        <h1 style={{
          fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 700, letterSpacing: -0.5,
          margin: '0 0 8px', color: darkMode ? '#ffffff' : '#111111',
        }}>
          {t('hub_title')}
        </h1>
        <p style={{
          fontSize: 15, margin: 0, fontWeight: 400,
          color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
        }}>
          {t('hub_subtitle')}
        </p>
      </div>

      <div className="hub-grid">
        {APPS.map(({ id, icon, titleKey, subtitleKey, accent, route }) => (
          <button key={id} className="hub-card" onClick={() => navigate(route)}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-panel)',
              background: accent + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <SFIcon name={icon} size={20} color={accent} />
            </div>
            <div>
              <div style={{
                fontSize: 16, fontWeight: 600, marginBottom: 5,
                color: darkMode ? '#ffffff' : '#111111',
              }}>
                {t(titleKey)}
              </div>
              <div style={{
                fontSize: 13, lineHeight: 1.5,
                color: darkMode ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.4)',
              }}>
                {t(subtitleKey)}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
              <SFIcon name="chevron.right.svg" size={14} color={accent} style={{ opacity: 0.6 }} />
            </div>
          </button>
        ))}
      </div>

      <p style={{
        marginTop: 'clamp(32px, 5vw, 56px)', fontSize: 12,
        color: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
      }}>
        Jari Van Landeghem
      </p>
    </div>
  );
}
