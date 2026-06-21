import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import BottomNav from './components/BottomNav';
import GroupList from './components/GroupList';
import GroupDetail from './components/GroupDetail';
import Activity from './components/Activity';
import AllBalances from './components/AllBalances';
import Account from './components/Account';
import './splitwise.css';

export default function SplitwiseApp() {
  const { darkMode } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('groups');
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  function handleSelectGroup(id) { setSelectedGroupId(id); setTab('groups'); }
  function handleBack() { setSelectedGroupId(null); }
  function handleTabChange(t) { setTab(t); if (t !== 'groups') setSelectedGroupId(null); }

  return (
    <div className={`sw-root${darkMode ? ' dark' : ''}`} style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      maxWidth: 430, margin: '0 auto', position: 'relative',
      background: 'var(--bg)', color: 'var(--label)',
    }}>
      {/* Hub switch button */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 999,
          background: 'var(--bg-card)', border: '1px solid var(--separator-opaque)',
          borderRadius: 'var(--radius-full)', padding: '6px 14px',
          fontSize: 13, fontWeight: 600, color: 'var(--label-secondary)',
          cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        ◀ Apps
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {tab === 'groups' && selectedGroupId ? (
          <GroupDetail groupId={selectedGroupId} onBack={handleBack} />
        ) : tab === 'groups' ? (
          <GroupList onSelectGroup={handleSelectGroup} />
        ) : tab === 'activity' ? (
          <Activity />
        ) : tab === 'friends' ? (
          <AllBalances />
        ) : (
          <Account />
        )}
      </div>
      <BottomNav active={tab} onChange={handleTabChange} />
    </div>
  );
}
