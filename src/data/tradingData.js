export const mockTrades = [
  { id: 1, date: '2026-01-08', pair: 'XAUUSD', type: 'LONG', entry: 2630.5, exit: 2620.3, size: 0.1, pnl: -100, duration: '2h 15m', strategy: 'Breakout', rr: -0.5, notes: 'SL hit on fake breakout' },
  { id: 2, date: '2026-01-13', pair: 'EURUSD', type: 'SHORT', entry: 1.0342, exit: 1.0298, size: 1, pnl: 400, duration: '4h 30m', strategy: 'Trend Follow', rr: 2.0, notes: 'Clean downtrend continuation' },
  { id: 3, date: '2026-01-13', pair: 'XAUUSD', type: 'LONG', entry: 2615.0, exit: 2635.0, size: 0.1, pnl: 200, duration: '1h 45m', strategy: 'Support Bounce', rr: 2.0, notes: 'Key support held' },
  { id: 4, date: '2026-01-14', pair: 'USDJPY', type: 'LONG', entry: 157.80, exit: 157.30, size: 0.5, pnl: -100, duration: '3h 00m', strategy: 'Breakout', rr: -1.0, notes: 'Failed breakout, cut loss early' },
  { id: 5, date: '2026-01-14', pair: 'XAUUSD', type: 'SHORT', entry: 2640.0, exit: 2614.0, size: 0.1, pnl: 600, duration: '6h 10m', strategy: 'Trend Follow', rr: 3.0, notes: 'Perfect entry at resistance' },
  { id: 6, date: '2026-01-15', pair: 'EURUSD', type: 'LONG', entry: 1.0285, exit: 1.0340, size: 1, pnl: 500, duration: '5h 20m', strategy: 'Support Bounce', rr: 2.5, notes: 'Daily support + RSI divergence' },
  { id: 7, date: '2026-01-16', pair: 'XAUUSD', type: 'LONG', entry: 2618.0, exit: 2678.0, size: 0.1, pnl: 600, duration: '8h 00m', strategy: 'Trend Follow', rr: 3.0, notes: 'Rode the entire move' },
  { id: 8, date: '2026-01-19', pair: 'USDJPY', type: 'SHORT', entry: 156.50, exit: 156.90, size: 0.5, pnl: -100, duration: '1h 30m', strategy: 'Breakout', rr: -1.0, notes: 'Market reversed unexpectedly' },
];

export const tradingPairs = ['XAUUSD', 'EURUSD', 'USDJPY', 'BTCUSDT', 'ETHUSDT'];

export const strategies = ['Breakout', 'Trend Follow', 'Support Bounce', 'Scalp', 'Reversal'];
