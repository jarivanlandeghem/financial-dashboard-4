import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Investments from './pages/Investments';
import Mortgage from './pages/Mortgage';
import Budget from './pages/Budget';
import Subscriptions from './pages/Subscriptions';
import Cash from './pages/Cash';
import Statistics from './pages/Statistics';
import SavingsGoals from './pages/SavingsGoals';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/mortgage" element={<Mortgage />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/cash" element={<Cash />} />
            <Route path="/goals" element={<SavingsGoals />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
