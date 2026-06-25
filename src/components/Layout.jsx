import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SFIcon from './SFIcon';
import Settings from './Settings';
import { TRANSLATIONS } from '../i18n/translations';

const financeNavDef = [
  { to: '/finance',               icon: 'chart.bar.xaxis.ascending.svg', tKey: 'nav_dashboard'     },
  { to: '/finance/transactions',  icon: 'arrow.left.arrow.right.svg',    tKey: 'nav_transactions'  },
  { to: '/finance/investments',   icon: 'chart.line.uptrend.xyaxis.svg', tKey: 'nav_investments'   },
  { to: '/finance/mortgage',      icon: 'house.svg',                     tKey: 'nav_mortgage'      },
  { to: '/finance/budget',        icon: 'chart.bar.xaxis.ascending.svg', tKey: 'nav_budget'        },
  { to: '/finance/subscriptions', icon: 'creditcard.svg',                tKey: 'nav_subscriptions' },
  { to: '/finance/cash',          icon: 'banknote.svg',                  tKey: 'nav_cash'          },
  { to: '/finance/goals',         icon: 'target.svg',                    tKey: 'nav_goals'         },
  { to: '/finance/statistics',    icon: 'chart.bar.xaxis.ascending.svg', tKey: 'nav_statistics'    },
  { to: '/finance/categories',    icon: 'tag.svg',                       tKey: 'nav_categories'    },
  { to: '/finance/networth',      icon: 'chart.line.uptrend.xyaxis.svg', tKey: 'nav_networth'      },
  { to: '/finance/projects',      icon: 'briefcase.svg',                 tKey: 'nav_projects'      },
];

const tradingNavDef = [
  { to: '/trading',          icon: 'chart.line.uptrend.xyaxis.svg', tKey: 'nav_analytics' },
  { to: '/trading/risk',     icon: 'shield.svg',                    tKey: 'nav_risk'      },
  { to: '/trading/strategy', icon: 'book.closed.svg',               tKey: 'nav_strategy'  },
  { to: '/trading/pairs',    icon: 'square.stack.3d.up.svg',        tKey: 'nav_pairs'     },
  { to: '/trading/calendar', icon: 'calendar.svg',                  tKey: 'nav_calendar'  },
];

const SW = 1.5;

export default function Layout({ mode }) {
  const { privateMode, setPrivateMode, language } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  if (typeof document !== 'undefined') {
    document.body.classList.toggle('private-mode', privateMode);
  }

  const isTrading = mode === 'trading';
  const dict = TRANSLATIONS[language] || TRANSLATIONS.nl;
  const t = (key) => dict[key] ?? key;
  const navDefs = isTrading ? tradingNavDef : financeNavDef;
  const navItems = navDefs.map(n => ({ ...n, label: t(n.tKey) }));

  const toggleMode = () => {
    navigate(isTrading ? '/finance' : '/trading');
  };

  return (
    <div className="app-layout">
      <aside className={`sidebar${isTrading ? ' trading-mode' : ''}${collapsed ? ' collapsed' : ''}`}>

        <div className="sidebar-logo">
          <div
            className="sidebar-logo-icon"
            onClick={toggleMode}
            title={isTrading ? 'Switch to Finance' : 'Switch to Trading'}
            style={{ cursor: 'pointer', background: isTrading ? 'var(--tr-accent)' : undefined }}
          >
            <SFIcon name="wallet.pass.svg" size={18} color="white" />
          </div>
          <div className="sidebar-logo-text" onClick={() => navigate(isTrading ? '/trading' : '/finance')} style={{ cursor: 'pointer' }}>
            <h1>{isTrading ? t('trading_label') : t('nav_dashboard')}</h1>
            <p>{isTrading ? 'Journal & Analytics' : 'Financial Overview'}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">{isTrading ? t('trading_label') : t('menu')}</div>
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/finance' || to === '/trading'}
              data-label={label}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <SFIcon name={icon} size={16} color="currentColor" />
              <span className="nav-item-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            className="nav-item"
            data-label={t('nav_settings')}
            onClick={() => setShowSettings(true)}
          >
            <SFIcon name="gearshape.svg" size={16} color="currentColor" />
            <span className="nav-item-label">{t('nav_settings')}</span>
          </button>
        </div>
      </aside>

      {/* Sidebar collapse pill */}
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          position: 'fixed',
          top: 28,
          left: collapsed
            ? 'calc(var(--nav-collapsed) + var(--sidebar-gap) - 12px)'
            : 'calc(var(--nav-width) + var(--sidebar-gap) - 12px)',
          zIndex: 200,
          width: 24, height: 24, borderRadius: '50%',
          background: 'var(--bg-card)', border: '1.5px solid var(--border)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: isTrading ? 'var(--tr-accent)' : 'var(--accent)',
          transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        <SFIcon name="chevron.left.svg" size={13} color="currentColor" style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }} />
      </button>

      <main className={`main-content${collapsed ? ' collapsed' : ''}`}>
        <Outlet />
      </main>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}

      <nav className="mobile-nav">
        {navItems.slice(0, 5).map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === '/finance' || to === '/trading'}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, padding: '4px 8px', textDecoration: 'none',
              color: isActive ? (isTrading ? 'var(--tr-accent)' : 'var(--accent)') : 'var(--text-muted)',
              fontSize: 10, fontWeight: 500,
            })}>
            <SFIcon name={icon} size={20} color="currentColor" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
