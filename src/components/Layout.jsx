import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, TrendingUp, Home, PieChart, CreditCard, Banknote, Moon, Sun, Target, BarChart2, ChevronLeft } from 'lucide-react';
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

export default function Layout({ children }) {
  const { darkMode, setDarkMode } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-layout">
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>

        {/* Logo — clickable, goes to dashboard */}
        <Link to="/" className="sidebar-logo" style={{ textDecoration: 'none' }}>
          <div className="sidebar-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="sidebar-logo-text">
            <h1>Dashboard</h1>
            <p>Financial Overview</p>
          </div>
        </Link>

        {/* Collapse toggle — small grey arrow */}
        <button className="sidebar-toggle" onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand' : 'Collapse'}>
          <ChevronLeft size={13} strokeWidth={2.5} />
        </button>

        {/* Nav */}
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
              <Icon size={16} strokeWidth={1.8} />
              <span className="nav-item-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item" data-label={darkMode ? 'Light Mode' : 'Dark Mode'} onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}
            <span className="nav-item-label">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      <main className={`main-content${collapsed ? ' collapsed' : ''}`}>
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        {navItems.slice(0, 5).map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, padding: '4px 8px', textDecoration: 'none',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: 10, fontWeight: 500,
            })}>
            <Icon size={20} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
