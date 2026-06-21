import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, TrendingUp, Home, PieChart,
  CreditCard, Banknote, Moon, Sun, Target, BarChart2,
  Wallet, EyeOff, Eye, LineChart, Shield, BookOpen, Calendar,
  Layers, ChevronLeft, Tag, Briefcase, LayoutGrid,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const financeNav = [
  { to: '/finance', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/finance/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/finance/investments', icon: TrendingUp, label: 'Investments' },
  { to: '/finance/mortgage', icon: Home, label: 'Mortgage' },
  { to: '/finance/budget', icon: PieChart, label: 'Budget' },
  { to: '/finance/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { to: '/finance/cash', icon: Banknote, label: 'Cash' },
  { to: '/finance/goals', icon: Target, label: 'Goals' },
  { to: '/finance/statistics', icon: BarChart2, label: 'Statistics' },
  { to: '/finance/categories', icon: Tag, label: 'Categories' },
  { to: '/finance/projects', icon: Briefcase, label: 'Projects' },
];

const tradingNav = [
  { to: '/trading', icon: LineChart, label: 'Analytics' },
  { to: '/trading/risk', icon: Shield, label: 'Risk' },
  { to: '/trading/strategy', icon: BookOpen, label: 'Strategy' },
  { to: '/trading/pairs', icon: Layers, label: 'Pairs' },
  { to: '/trading/calendar', icon: Calendar, label: 'Calendar' },
];

const SW = 1.5;

export default function Layout({ mode }) {
  const { darkMode, setDarkMode, privateMode, setPrivateMode } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const navigate = useNavigate();

  if (typeof document !== 'undefined') {
    document.body.classList.toggle('private-mode', privateMode);
  }

  const isTrading = mode === 'trading';
  const navItems = isTrading ? tradingNav : financeNav;

  return (
    <div className="app-layout">
      <aside className={`sidebar${isTrading ? ' trading-mode' : ''}${collapsed ? ' collapsed' : ''}`}>

        <div className="sidebar-logo">
          <div
            className="sidebar-logo-icon"
            onClick={() => setSwitcherOpen(s => !s)}
            title="Switch app"
            style={{ cursor: 'pointer', background: isTrading ? 'var(--tr-accent)' : undefined, position: 'relative' }}
          >
            <Wallet size={18} strokeWidth={SW} color="white" />
          </div>
          <div className="sidebar-logo-text" onClick={() => navigate(isTrading ? '/trading' : '/finance')} style={{ cursor: 'pointer' }}>
            <h1>{isTrading ? 'Trading' : 'Dashboard'}</h1>
            <p>{isTrading ? 'Journal & Analytics' : 'Financial Overview'}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">{isTrading ? 'Trading' : 'Menu'}</div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/finance' || to === '/trading'}
              data-label={label}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={16} strokeWidth={SW} />
              <span className="nav-item-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          {/* App switcher */}
          <button className="nav-item" data-label="Switch App" onClick={() => navigate('/')}>
            <LayoutGrid size={16} strokeWidth={SW} />
            <span className="nav-item-label">Switch App</span>
          </button>
          <button className="nav-item" data-label={privateMode ? 'Show Numbers' : 'Hide Numbers'} onClick={() => setPrivateMode(p => !p)}>
            {privateMode ? <Eye size={16} strokeWidth={SW} /> : <EyeOff size={16} strokeWidth={SW} />}
            <span className="nav-item-label">{privateMode ? 'Show Numbers' : 'Hide Numbers'}</span>
          </button>
          <button className="nav-item" data-label={darkMode ? 'Light Mode' : 'Dark Mode'} onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={16} strokeWidth={SW} /> : <Moon size={16} strokeWidth={SW} />}
            <span className="nav-item-label">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      {/* Collapse pill */}
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          position: 'fixed', top: 28,
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
        <ChevronLeft size={13} strokeWidth={2.5} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }} />
      </button>

      <main className={`main-content${collapsed ? ' collapsed' : ''}`}>
        <Outlet />
      </main>

      <nav className="mobile-nav">
        {navItems.slice(0, 4).map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/finance' || to === '/trading'}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, padding: '4px 8px', textDecoration: 'none',
              color: isActive ? (isTrading ? 'var(--tr-accent)' : 'var(--accent)') : 'var(--text-muted)',
              fontSize: 10, fontWeight: 500,
            })}>
            <Icon size={20} strokeWidth={SW} />
            {label}
          </NavLink>
        ))}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, padding: '4px 8px', background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 10, fontWeight: 500,
          }}>
          <LayoutGrid size={20} strokeWidth={SW} />
          Apps
        </button>
      </nav>
    </div>
  );
}
