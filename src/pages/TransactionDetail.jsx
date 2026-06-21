import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import SFIcon from '../components/SFIcon';

const fmt = (n) => (n >= 0 ? '+' : '-') + '€' + Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function TransactionDetail() {
  const { id } = useParams();
  const { transactions, deleteTransaction } = useApp();
  const navigate = useNavigate();

  const tx = transactions.find(t => t.id === Number(id) || t.id === id);
  if (!tx) return <div style={{ padding: 32, color: 'var(--text-muted)' }}>Transaction not found.</div>;

  const cat = CATEGORIES[tx.category];

  const handleDelete = () => {
    if (confirm('Delete this transaction?')) {
      deleteTransaction(tx.id);
      navigate('/finance/transactions');
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: (cat?.color || '#6B7280') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SFIcon name={cat?.icon || 'questionmark.folder.svg'} size={36} color={cat?.color || '#6B7280'} />
          </div>
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: tx.amount >= 0 ? 'var(--green)' : 'var(--red)' }}>
          {fmt(tx.amount)}
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, marginTop: 8 }}>{tx.description}</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          {new Date(tx.date + 'T12:00:00').toLocaleDateString('en-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        {[
          ['Category', cat?.label || tx.category],
          ['Account', tx.account],
          ['Type', tx.type.charAt(0).toUpperCase() + tx.type.slice(1)],
          ['Recurring', tx.recurring ? 'Yes' : 'No'],
          ['Reference', `TX-${String(tx.id).padStart(6, '0')}`],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{label}</span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </div>

      <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={handleDelete}>
        <Trash2 size={14} /> Delete Transaction
      </button>
    </div>
  );
}
