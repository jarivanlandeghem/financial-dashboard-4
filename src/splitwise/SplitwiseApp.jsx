import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users2, Activity, Receipt, User, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import GroupList from './components/GroupList';
import GroupDetail from './components/GroupDetail';
import ActivityPage from './components/Activity';
import AllBalances from './components/AllBalances';
import Account from './components/Account';
import './splitwise.css';

const SW = 1.5;

const navItems = [
  { id: 'groups', label: 'Groups', Icon: Users2 },
  { id: 'activity', label: 'Activity', Icon: Activity },
  { id: 'friends', label: 'Balances', Icon: Receipt },
  { id: 'account', label: 'Account', Icon: User },
];

export default function SplitwiseApp() {
  const { darkMode } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('groups');
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  function handleSelectGroup(id) { setSelectedGroupId(id); setTab('groups'); }
  function handleBack() { setSelectedGroupId(null); }
  function handleTabChange(t) { setTab(t); if (t !== 'groups') setSelectedGroupId(null); }

  const content = tab === 'groups' && selectedGroupId
    ? <GroupDetail groupId={selectedGroupId} onBack={handleBack} />
    : tab === 'groups' ? <GroupList onSelectGroup={handleSelectGroup} />
    : tab === 'activity' ? <ActivityPage />
    : tab === 'friends' ? <AllBalances />
    : <Account />;

  return (
    <div className={`sw-root${darkMode ? ' dark' : ''}`}>
      <div className="sw-layout">

        {/* Desktop sidebar */}
        <aside className="sw-sidebar">
          <div className="sw-sidebar-card">
            <div className="sw-sidebar-logo">
              <div className="sw-sidebar-logo-icon">
                <Users2 size={16} strokeWidth={SW} color="white" />
              </div>
              <div>
                <div className="sw-sidebar-title">Splitwise</div>
                <div className="sw-sidebar-subtitle">Gedeelde kosten</div>
              </div>
            </div>

            <div className="sw-nav-section-label">Menu</div>
            {navItems.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`sw-nav-item${tab === id ? ' active' : ''}`}
              >
                <Icon size={15} strokeWidth={SW} />
                <span>{label}</span>
              </button>
            ))}

            <div className="sw-sidebar-bottom">
              <button className="sw-nav-item" onClick={() => navigate('/')}>
                <ChevronLeft size={15} strokeWidth={SW} />
                <span>Hub</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="sw-content">
          {content}
        </main>

        {/* Mobile bottom nav */}
        <nav className="sw-bottom-nav">
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`sw-bottom-nav-item${tab === id ? ' active' : ''}`}
            >
              <Icon size={22} strokeWidth={tab === id ? 2 : 1.5} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

      </div>
    </div>
  );
}
