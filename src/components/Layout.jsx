import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SFIcon from './SFIcon';

const financeNav = [
  { to: '/finance',                icon: 'chart.bar.xaxis.ascending.svg',  label: 'Dashboard'     },
  { to: '/finance/transactions',   icon: 'arrow.left.arrow.right.svg',      label: 'Transactions'  },
  { to: '/finance/investments',    icon: 'chart.line.uptrend.xyaxis.svg',   label: 'Investments'   },
  { to: '/finance/mortgage',       icon: 'house.svg',                       label: 'Mortgage'      },
  { to: '/finance/budget',         icon: 'chart.bar.xaxis.ascending.svg',   label: 'Budget'        },
  { to: '/finance/subscriptions',  icon: 'creditcard.svg',                  label: 'Subscriptions' },
  { to: '/finance/cash',           icon: 'banknote.svg',                    label: 'Cash'          },
  { to: '/finance/goals',          icon: 'target.svg',                      label: 'Goals'         },
  { to: '/finance/statistics',     icon: 'chart.bar.xaxis.ascending.svg',   label: 'Statistics'    },
  { to: '/finance/categories',     icon: 'tag.svg',                         label: 'Categories'    },
  { to: '/finance/networth',        icon: 'chart.line.uptrend.xyaxis.svg',   label: 'Nettovermogen' },
  { to: '/finance/projects',       icon: 'briefcase.svg',                   label: 'Projects'      },
];

const tradingNav = [
  { to: '/trading',          icon: 'chart.line.uptrend.xyaxis.svg',  label: 'Analytics' },
  { to: '/trading/risk',     icon: 'shield.svg',                     label: 'Risk'      },
  { to: '/trading/strategy', icon: 'book.closed.svg',                label: 'Strategy'  },
  { to: '/trading/pairs',    icon: 'square.stack.3d.up.svg',         label: 'Pairs'     },
  { to: '/trading/calendar', icon: 'calendar.svg',                   label: 'Calendar'  },
];

const SW = 1.5;

export default function Layout({ mode }) {
  const { darkMode, setDarkMode, privateMode, setPrivateMode } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  if (typeof document !== 'undefined') {
    document.body.classList.toggle('private-mode', privateMode);
  }

  const isTrading = mode === 'trading';
  const navItems = isTrading ? tradingNav : financeNav;

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
            <h1>{isTrading ? 'Trading' : 'Dashboard'}</h1>
            <p>{isTrading ? 'Journal & Analytics' : 'Financial Overview'}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">{isTrading ? 'Trading' : 'Menu'}</div>
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
            data-label="Hub"
            onClick={() => navigate('/')}
            style={{ opacity: 0.6 }}
          >
            <SFIcon name="house.svg" size={16} color="currentColor" />
            <span className="nav-item-label">Hub</span>
          </button>
          <button className="nav-item" data-label={privateMode ? 'Show Numbers' : 'Hide Numbers'} onClick={() => setPrivateMode(p => !p)}>
            <SFIcon name={privateMode ? 'eye.svg' : 'lock.svg'} size={16} color="currentColor" />
            <span className="nav-item-label">{privateMode ? 'Show Numbers' : 'Hide Numbers'}</span>
          </button>
          <button className="nav-item" data-label={darkMode ? 'Light Mode' : 'Dark Mode'} onClick={() => setDarkMode(!darkMode)}>
            <SFIcon name={darkMode ? 'sun.max.svg' : 'moon.svg'} size={16} color="currentColor" />
            <span className="nav-item-label">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
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
