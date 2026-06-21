import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import GroupList from './components/GroupList';
import GroupDetail from './components/GroupDetail';
import ActivityPage from './components/Activity';
import AllBalances from './components/AllBalances';
import Account from './components/Account';
import SFIcon from '../components/SFIcon';
import './splitwise.css';

const SW = 1.5;

const navItems = [
  { id: 'groups',   label: 'Groups',   icon: 'person.2.svg' },
  { id: 'activity', label: 'Activity', icon: 'waveform.svg' },
  { id: 'friends',  label: 'Balances', icon: 'receipt.svg' },
  { id: 'account',  label: 'Account',  icon: 'person.svg' },
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
                <SFIcon name="person.2.svg" size={16} color="white" />
              </div>
              <div>
                <div className="sw-sidebar-title">Splitwise</div>
                <div className="sw-sidebar-subtitle">Gedeelde kosten</div>
              </div>
            </div>

            <div className="sw-nav-section-label">Menu</div>
            {navItems.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`sw-nav-item${tab === id ? ' active' : ''}`}
              >
                <SFIcon name={icon} size={15} color="currentColor" />
                <span>{label}</span>
              </button>
            ))}

            <div className="sw-sidebar-bottom">
              <button className="sw-nav-item" onClick={() => navigate('/')}>
                <SFIcon name="chevron.left.svg" size={15} color="currentColor" />
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
          {navItems.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`sw-bottom-nav-item${tab === id ? ' active' : ''}`}
            >
              <SFIcon name={icon} size={22} color="currentColor" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

      </div>
    </div>
  );
}
