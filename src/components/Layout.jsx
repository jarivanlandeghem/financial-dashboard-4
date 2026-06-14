import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, TrendingUp, Home, PieChart,
  CreditCard, Banknote, Moon, Sun, Target, BarChart2,
  Wallet, EyeOff, Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/investments', icon: TrendingUp, label: 'Investments' },
  { to: '/mortgage', icon: Home, label: 'Mortgage' },
  { to: '/budget', icon: PieChart, label: 'Budget' },
  { to: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { to: '/cash', icon: Banknote, label: 'Cash' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/statistics', icon: BarChart2, label: 'Statistics' },
];

const SW = 1.5;

export default function Layout({ children }) {
  const { darkMode, setDarkMode, privateMode, setPrivateMode } = useApp();

  // Apply private-mode class to body
  if (typeof document !== 'undefined') {
    document.body.classList.toggle('private-mode', privateMode);
  }
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="app-layout">
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>

        {/* Logo — icon toggles sidebar, text navigates home */}
        <div className="sidebar-logo">
          <div
            className="sidebar-logo-icon"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{ cursor: 'pointer' }}
          >
            <Wallet size={18} strokeWidth={SW} color="white" />
          </div>
          <div className="sidebar-logo-text" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <h1>Dashboard</h1>
            <p>Financial Overview</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              data-label={label}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={16} strokeWidth={SW} />
              <span className="nav-item-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item" data-label={privateMode ? 'Show Numbers' : 'Hide Numbers'} onClick={() => setPrivateMode(p => !p)}>
            {privateMode
              ? <Eye size={16} strokeWidth={SW} />
              : <EyeOff size={16} strokeWidth={SW} />}
            <span className="nav-item-label">{privateMode ? 'Show Numbers' : 'Hide Numbers'}</span>
          </button>
          <button className="nav-item" data-label={darkMode ? 'Light Mode' : 'Dark Mode'} onClick={() => setDarkMode(!darkMode)}>
            {darkMode
              ? <Sun size={16} strokeWidth={SW} />
              : <Moon size={16} strokeWidth={SW} />}
            <span className="nav-item-label">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      <main className={`main-content${collapsed ? ' collapsed' : ''}`}>
        {children}
      </main>

      <nav className="mobile-nav">
        {navItems.slice(0, 5).map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, padding: '4px 8px', textDecoration: 'none',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: 10, fontWeight: 500,
            })}>
            <Icon size={20} strokeWidth={SW} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
