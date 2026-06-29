import { useState } from 'react';
import { store } from '../store/useStore';
import { useStore } from '../store/useStore';
import SFIcon from '../../components/SFIcon';

export default function Account() {
  const { groups, expenses, settlements } = useStore();
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const totalGroups = groups.length;
  const totalExpenses = expenses.length;
  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);

  function handleExport() {
    const data = { groups, expenses, settlements, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `splitwise-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.groups && data.expenses) {
          localStorage.setItem('splitwise_data', JSON.stringify({
            groups: data.groups,
            expenses: data.expenses,
            settlements: data.settlements || [],
          }));
          window.location.reload();
        }
      } catch {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  }

  function handleClearAll() {
    localStorage.removeItem('splitwise_data');
    window.location.reload();
  }

  return (
    <div style={{ flex: 1, paddingBottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))' }}>
      <div style={{
        padding: '20px 20px 0',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 60px)',
        marginBottom: 8,
      }}>
        <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>Account</h1>
      </div>

      <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--blue)' }}>{totalGroups}</div>
            <div style={{ fontSize: 13, color: 'var(--label-secondary)', marginTop: 2 }}>Groups</div>
          </div>
          <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--blue)' }}>{totalExpenses}</div>
            <div style={{ fontSize: 13, color: 'var(--label-secondary)', marginTop: 2 }}>Expenses</div>
          </div>
          <div className="card" style={{ padding: '16px', textAlign: 'center', gridColumn: '1/-1' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--green)' }}>€{totalAmount.toFixed(2)}</div>
            <div style={{ fontSize: 13, color: 'var(--label-secondary)', marginTop: 2 }}>Total tracked</div>
          </div>
        </div>

        {/* Data */}
        <div>
          <p style={{ fontSize: 13, color: 'var(--label-secondary)', marginBottom: 8, fontWeight: 500, paddingLeft: 4 }}>
            DATA
          </p>
          <div className="card">
            <button onClick={handleExport} style={{
              width: '100%', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 14,
              borderBottom: '0.5px solid var(--separator)',
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 'var(--shape-sm)', background: '#34C75920', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SFIcon name="square.and.arrow.down.svg" size={18} color="var(--green)" />
              </div>
              <span style={{ flex: 1, textAlign: 'left', fontSize: 17 }}>Export backup</span>
              <SFIcon name="chevron.right.svg" size={16} color="var(--label-tertiary)" />
            </button>

            <label style={{
              width: '100%', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer',
              borderBottom: '0.5px solid var(--separator)',
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 'var(--shape-sm)', background: '#007AFF20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SFIcon name="square.and.arrow.up.svg" size={18} color="var(--blue)" />
              </div>
              <span style={{ flex: 1, fontSize: 17 }}>Import backup</span>
              <SFIcon name="chevron.right.svg" size={16} color="var(--label-tertiary)" />
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>

            <button onClick={() => setShowConfirmClear(true)} style={{
              width: '100%', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 'var(--shape-sm)', background: '#FF3B3020', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SFIcon name="trash.svg" size={18} color="var(--red)" />
              </div>
              <span style={{ flex: 1, textAlign: 'left', fontSize: 17, color: 'var(--red)' }}>Clear all data</span>
              <SFIcon name="chevron.right.svg" size={16} color="var(--label-tertiary)" />
            </button>
          </div>
        </div>

        {/* About */}
        <div>
          <p style={{ fontSize: 13, color: 'var(--label-secondary)', marginBottom: 8, fontWeight: 500, paddingLeft: 4 }}>
            ABOUT
          </p>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 'var(--shape-lg)',
                background: 'linear-gradient(135deg, #007AFF, #5856D6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <SFIcon name="banknote.svg" size={26} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17 }}>SplitApp</div>
                <div style={{ fontSize: 13, color: 'var(--label-secondary)', marginTop: 2 }}>Version 1.0 · All data stored locally</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirmClear && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }} onClick={() => setShowConfirmClear(false)}>
          <div className="animate-scalein card" style={{ width: '100%', maxWidth: 320, padding: 24 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Clear all data?</h3>
            <p style={{ fontSize: 15, color: 'var(--label-secondary)', marginBottom: 24 }}>
              This will permanently delete all groups, expenses, and settlements. This cannot be undone.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn-destructive" onClick={handleClearAll}>
                Delete everything
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                style={{ padding: '14px', textAlign: 'center', fontWeight: 600, color: 'var(--blue)', fontSize: 17 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
