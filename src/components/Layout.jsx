import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, TrendingUp, Home, PieChart, CreditCard, Banknote, Moon, Sun, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/investments', icon: TrendingUp, label: 'Investments' },
  { to: '/mortgage', icon: Home, label: 'Mortgage' },
  { to: '/budget', icon: PieChart, label: 'Budget' },
  { to: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { to: '/cash', icon: Banknote, label: 'Cash' },
  { to: '/statistics', icon: TrendingUp, label: 'Statistics' },
];

export default function Layout({ children }) {
  const { darkMode, setDarkMode } = useApp();
  const location = useLocation();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>FinDash</h1>
          <p>Good morning, Sir</p>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        {navItems.slice(0, 5).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, padding: '4px 8px', textDecoration: 'none',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: 10, fontWeight: 500,
            })}
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
