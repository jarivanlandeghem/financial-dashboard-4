export const CATEGORIES = {
  // Expenses
  housing:       { label: 'Housing',      icon: 'house.svg',                     color: '#4F8EF7' },
  groceries:     { label: 'Groceries',    icon: 'cart.svg',                      color: '#00C896' },
  transport:     { label: 'Transport',    icon: 'car.svg',                       color: '#FFB800' },
  health:        { label: 'Health',       icon: 'pill.svg',                      color: '#FF4757' },
  entertainment: { label: 'Entertainment',icon: 'gamecontroller.svg',            color: '#A855F7' },
  clothing:      { label: 'Clothing',     icon: 'tshirt.svg',                    color: '#EC4899' },
  subscriptions: { label: 'Subscriptions',icon: 'iphone.svg',                   color: '#06B6D4' },
  dining:        { label: 'Dining',       icon: 'fork.knife.svg',                color: '#F97316' },
  education:     { label: 'Education',    icon: 'book.closed.svg',               color: '#8B5CF6' },
  gifts:         { label: 'Gifts',        icon: 'giftcard.svg',                  color: '#EF4444' },
  other:         { label: 'Other',        icon: 'questionmark.folder.svg',       color: '#6B7280' },
  // Income
  salary:        { label: 'Salary',       icon: 'dollarsign.svg',                color: '#00C896' },
  investment:    { label: 'Investment',   icon: 'chart.line.uptrend.xyaxis.svg', color: '#4F8EF7' },
  extra:         { label: 'Extra Income', icon: 'bolt.svg',                      color: '#FFB800' },
  // Transfer
  transfer:      { label: 'Transfer',     icon: 'arrow.left.arrow.right.svg',    color: '#6B7280' },
  // Cash
  cash:          { label: 'Cash',         icon: 'banknote.svg',                  color: '#10B981' },
};

export const mockTransactions = [
  { id: 1, date: '2026-06-13', description: 'Colruyt', category: 'groceries', amount: -67.50, account: 'KBC', type: 'expense', recurring: false },
  { id: 2, date: '2026-06-13', description: 'Q8 Tankstation', category: 'transport', amount: -89.00, account: 'KBC', type: 'expense', recurring: false },
  { id: 3, date: '2026-06-12', description: 'Netflix', category: 'subscriptions', amount: -17.99, account: 'KBC', type: 'expense', recurring: true },
  { id: 4, date: '2026-06-11', description: 'Salary June', category: 'salary', amount: 3200.00, account: 'KBC', type: 'income', recurring: true },
  { id: 5, date: '2026-06-10', description: 'Delhaize', category: 'groceries', amount: -43.20, account: 'KBC', type: 'expense', recurring: false },
  { id: 6, date: '2026-06-09', description: 'Spotify', category: 'subscriptions', amount: -10.99, account: 'KBC', type: 'expense', recurring: true },
  { id: 7, date: '2026-06-08', description: 'Rent', category: 'housing', amount: -850.00, account: 'KBC', type: 'expense', recurring: true },
  { id: 8, date: '2026-06-07', description: 'Bybit Trade BTC', category: 'investment', amount: 430.00, account: 'Bybit', type: 'income', recurring: false },
  { id: 9, date: '2026-06-06', description: 'Lidl', category: 'groceries', amount: -28.40, account: 'KBC', type: 'expense', recurring: false },
  { id: 10, date: '2026-06-05', description: 'McDonald\'s', category: 'dining', amount: -14.50, account: 'KBC', type: 'expense', recurring: false },
  { id: 11, date: '2026-06-04', description: 'Electricity', category: 'housing', amount: -120.00, account: 'KBC', type: 'expense', recurring: true },
  { id: 12, date: '2026-06-03', description: 'Apple Music', category: 'subscriptions', amount: -5.99, account: 'KBC', type: 'expense', recurring: true },
  { id: 13, date: '2026-06-02', description: 'Gym membership', category: 'health', amount: -29.99, account: 'KBC', type: 'expense', recurring: true },
  { id: 14, date: '2026-06-01', description: 'Zalando', category: 'clothing', amount: -67.00, account: 'KBC', type: 'expense', recurring: false },
  { id: 15, date: '2026-05-28', description: 'Colruyt', category: 'groceries', amount: -54.30, account: 'KBC', type: 'expense', recurring: false },
  { id: 16, date: '2026-05-25', description: 'Salary May', category: 'salary', amount: 3200.00, account: 'KBC', type: 'income', recurring: true },
  { id: 17, date: '2026-05-20', description: 'Bybit Ethereum', category: 'investment', amount: -200.00, account: 'Bybit', type: 'expense', recurring: false },
  { id: 18, date: '2026-05-15', description: 'Dentist', category: 'health', amount: -85.00, account: 'KBC', type: 'expense', recurring: false },
  { id: 19, date: '2026-04-25', description: 'Salary April', category: 'salary', amount: 3200.00, account: 'KBC', type: 'income', recurring: true },
  { id: 20, date: '2026-03-25', description: 'Salary March', category: 'salary', amount: 3200.00, account: 'KBC', type: 'income', recurring: true },
];

export const mockSubscriptions = [
  { id: 1, name: 'Netflix',       amount: 17.99, category: 'subscriptions', icon: 'tv.svg',                              billing: 'monthly', nextDate: '2026-07-12', canCancel: true,  cancelSaving: null },
  { id: 2, name: 'Spotify',       amount: 10.99, category: 'subscriptions', icon: 'headphones.svg',                      billing: 'monthly', nextDate: '2026-07-09', canCancel: true,  cancelSaving: null },
  { id: 3, name: 'Apple Music',   amount: 5.99,  category: 'subscriptions', icon: 'music.note.list.svg',                 billing: 'monthly', nextDate: '2026-07-03', canCancel: true,  cancelSaving: null },
  { id: 4, name: 'Gym',           amount: 29.99, category: 'health',        icon: 'figure.strengthtraining.traditional.svg', billing: 'monthly', nextDate: '2026-07-02', canCancel: false, cancelSaving: null },
  { id: 5, name: 'Internet',      amount: 45.00, category: 'housing',       icon: 'wifi.svg',                            billing: 'monthly', nextDate: '2026-07-01', canCancel: false, cancelSaving: null },
  { id: 6, name: 'Cloud Storage', amount: 2.99,  category: 'subscriptions', icon: 'icloud.svg',                          billing: 'monthly', nextDate: '2026-07-15', canCancel: true,  cancelSaving: null },
  { id: 7, name: 'Adobe CC',      amount: 54.99, category: 'subscriptions', icon: 'paintbrush.svg',                      billing: 'monthly', nextDate: '2026-07-20', canCancel: true,  cancelSaving: null },
];

export const mockInvestments = {
  saxobank: [
    { id: 1, name: 'Apple Inc.', ticker: 'AAPL', shares: 12, buyPrice: 165.00, currentPrice: 189.50, currency: 'USD' },
    { id: 2, name: 'Microsoft', ticker: 'MSFT', shares: 5, buyPrice: 380.00, currentPrice: 415.00, currency: 'USD' },
    { id: 3, name: 'S&P 500 ETF', ticker: 'SPY', shares: 8, buyPrice: 450.00, currentPrice: 524.00, currency: 'USD' },
  ],
  bybit: [
    { id: 1, name: 'Bitcoin', ticker: 'BTC', amount: 0.08, buyPrice: 52000, currentPrice: 67800, currency: 'USD' },
    { id: 2, name: 'Ethereum', ticker: 'ETH', amount: 0.9, buyPrice: 2800, currentPrice: 3420, currency: 'USD' },
    { id: 3, name: 'Solana', ticker: 'SOL', amount: 4.2, buyPrice: 95, currentPrice: 142, currency: 'USD' },
  ],
};

export const mockMortgage = {
  originalAmount: 350000,
  startDate: '2018-03-01',
  endDate: '2048-03-01',
  interestRate: 2.15,
  monthlyPayment: 1187,
  currentBalance: 287430,
};

export const mockCash = {
  balance: 340,
  transactions: [
    { id: 1, date: '2026-06-12', description: 'ATM Withdrawal', amount: 200, type: 'in' },
    { id: 2, date: '2026-06-13', description: 'Bakery', amount: -4.50, category: 'dining', type: 'out' },
    { id: 3, date: '2026-06-11', description: 'Market vegetables', amount: -12.00, category: 'groceries', type: 'out' },
    { id: 4, date: '2026-06-10', description: 'Parking', amount: -3.00, category: 'transport', type: 'out' },
    { id: 5, date: '2026-06-08', description: 'ATM Withdrawal', amount: 160, type: 'in' },
  ],
};

export const mockBudgets = [
  { id: 1, category: 'groceries', limit: 300, spent: 193.40 },
  { id: 2, category: 'dining', limit: 100, spent: 14.50 },
  { id: 3, category: 'transport', limit: 200, spent: 89.00 },
  { id: 4, category: 'entertainment', limit: 80, spent: 0 },
  { id: 5, category: 'clothing', limit: 100, spent: 67.00 },
  { id: 6, category: 'health', limit: 60, spent: 29.99 },
];

export const monthlyData = [
  { month: 'Jan', income: 3200, expenses: 1920, savings: 1280 },
  { month: 'Feb', income: 3200, expenses: 2100, savings: 1100 },
  { month: 'Mar', income: 3200, expenses: 1750, savings: 1450 },
  { month: 'Apr', income: 3200, expenses: 1890, savings: 1310 },
  { month: 'May', income: 3630, expenses: 2010, savings: 1620 },
  { month: 'Jun', income: 3630, expenses: 1337, savings: 2293 },
];

export const savingsData = [
  { month: 'Jan', value: 1280 },
  { month: 'Feb', value: 1100 },
  { month: 'Mar', value: 1450 },
  { month: 'Apr', value: 1310 },
  { month: 'May', value: 1620 },
  { month: 'Jun', value: 2293 },
];

export const savingsRate = 0.38;

export const netWorthData = [
  { month: 'Jan', value: 18200 },
  { month: 'Feb', value: 19300 },
  { month: 'Mar', value: 20750 },
  { month: 'Apr', value: 22060 },
  { month: 'May', value: 23680 },
  { month: 'Jun', value: 26340 },
];
