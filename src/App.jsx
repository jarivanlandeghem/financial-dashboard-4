import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OverlayProvider } from '@pikoloo/darwin-ui';
import { AppProvider } from './context/AppContext';
import Hub from './pages/Hub';
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
import Categories from './pages/Categories';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import NetWorth from './pages/NetWorth';
import TradingAnalytics from './pages/trading/TradingAnalytics';
import TradingRisk from './pages/trading/TradingRisk';
import TradingStrategy from './pages/trading/TradingStrategy';
import TradingPairs from './pages/trading/TradingPairs';
import TradingCalendar from './pages/trading/TradingCalendar';
import SplitwiseApp from './splitwise/SplitwiseApp';

export default function App() {
  return (
    <OverlayProvider>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Hub — landing page */}
          <Route path="/" element={<Hub />} />

          {/* Splitwise — standalone, no Layout wrapper */}
          <Route path="/splitwise" element={<SplitwiseApp />} />

          {/* Finance dashboard */}
          <Route path="/finance" element={<Layout mode="finance" />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="investments" element={<Investments />} />
            <Route path="mortgage" element={<Mortgage />} />
            <Route path="budget" element={<Budget />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="cash" element={<Cash />} />
            <Route path="goals" element={<SavingsGoals />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="categories" element={<Categories />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="networth" element={<NetWorth />} />
          </Route>

          {/* Trading */}
          <Route path="/trading" element={<Layout mode="trading" />}>
            <Route index element={<TradingAnalytics />} />
            <Route path="risk" element={<TradingRisk />} />
            <Route path="strategy" element={<TradingStrategy />} />
            <Route path="pairs" element={<TradingPairs />} />
            <Route path="calendar" element={<TradingCalendar />} />
          </Route>

          {/* Legacy redirects — old routes without /finance prefix */}
          <Route path="/transactions" element={<Navigate to="/finance/transactions" replace />} />
          <Route path="/investments" element={<Navigate to="/finance/investments" replace />} />
          <Route path="/mortgage" element={<Navigate to="/finance/mortgage" replace />} />
          <Route path="/budget" element={<Navigate to="/finance/budget" replace />} />
          <Route path="/subscriptions" element={<Navigate to="/finance/subscriptions" replace />} />
          <Route path="/cash" element={<Navigate to="/finance/cash" replace />} />
          <Route path="/goals" element={<Navigate to="/finance/goals" replace />} />
          <Route path="/statistics" element={<Navigate to="/finance/statistics" replace />} />
          <Route path="/categories" element={<Navigate to="/finance/categories" replace />} />
          <Route path="/projects" element={<Navigate to="/finance/projects" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
    </OverlayProvider>
  );
}
