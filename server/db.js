const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'finance.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ──────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    date      TEXT    NOT NULL,
    description TEXT  NOT NULL,
    category  TEXT    NOT NULL,
    amount    REAL    NOT NULL,
    account   TEXT    NOT NULL DEFAULT 'KBC',
    type      TEXT    NOT NULL CHECK(type IN ('income','expense','transfer')),
    recurring INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    amount      REAL    NOT NULL,
    category    TEXT    NOT NULL,
    icon        TEXT    NOT NULL DEFAULT '📱',
    billing     TEXT    NOT NULL DEFAULT 'monthly',
    next_date   TEXT,
    can_cancel  INTEGER NOT NULL DEFAULT 1,
    marked_for_cancel INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS investments_stocks (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT  NOT NULL,
    ticker        TEXT  NOT NULL,
    shares        REAL  NOT NULL,
    buy_price     REAL  NOT NULL,
    current_price REAL  NOT NULL,
    currency      TEXT  NOT NULL DEFAULT 'USD'
  );

  CREATE TABLE IF NOT EXISTS investments_crypto (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT  NOT NULL,
    ticker        TEXT  NOT NULL,
    amount        REAL  NOT NULL,
    buy_price     REAL  NOT NULL,
    current_price REAL  NOT NULL,
    currency      TEXT  NOT NULL DEFAULT 'USD'
  );

  CREATE TABLE IF NOT EXISTS mortgage (
    id              INTEGER PRIMARY KEY CHECK(id = 1),
    original_amount REAL NOT NULL,
    start_date      TEXT NOT NULL,
    end_date        TEXT NOT NULL,
    interest_rate   REAL NOT NULL,
    monthly_payment REAL NOT NULL,
    current_balance REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cash_transactions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    date        TEXT  NOT NULL,
    description TEXT  NOT NULL,
    amount      REAL  NOT NULL,
    category    TEXT,
    type        TEXT  NOT NULL CHECK(type IN ('in','out'))
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL UNIQUE,
    "limit"  REAL NOT NULL,
    spent    REAL NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS goals (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    icon_key TEXT  NOT NULL DEFAULT 'target',
    name     TEXT  NOT NULL,
    target   REAL  NOT NULL,
    saved    REAL  NOT NULL DEFAULT 0,
    color    TEXT  NOT NULL DEFAULT '#007AFF',
    deadline TEXT
  );

  CREATE TABLE IF NOT EXISTS trades (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    date     TEXT  NOT NULL,
    pair     TEXT  NOT NULL,
    type     TEXT  NOT NULL CHECK(type IN ('LONG','SHORT')),
    entry    REAL  NOT NULL,
    exit     REAL  NOT NULL,
    size     REAL  NOT NULL,
    pnl      REAL  NOT NULL,
    duration TEXT,
    strategy TEXT,
    rr       REAL,
    notes    TEXT
  );
`);

// ── Seed (only if tables are empty) ─────────────────────────────────────────

function seed() {
  const txCount = db.prepare('SELECT COUNT(*) as c FROM transactions').get().c;
  if (txCount > 0) return;

  const insertTx = db.prepare(`INSERT INTO transactions (date,description,category,amount,account,type,recurring) VALUES (?,?,?,?,?,?,?)`);
  const transactions = [
    ['2026-06-13','Colruyt','groceries',-67.50,'KBC','expense',0],
    ['2026-06-13','Q8 Tankstation','transport',-89.00,'KBC','expense',0],
    ['2026-06-12','Netflix','subscriptions',-17.99,'KBC','expense',1],
    ['2026-06-11','Salary June','salary',3200.00,'KBC','income',1],
    ['2026-06-10','Delhaize','groceries',-43.20,'KBC','expense',0],
    ['2026-06-09','Spotify','subscriptions',-10.99,'KBC','expense',1],
    ['2026-06-08','Rent','housing',-850.00,'KBC','expense',1],
    ['2026-06-07','Bybit Trade BTC','investment',430.00,'Bybit','income',0],
    ['2026-06-06','Lidl','groceries',-28.40,'KBC','expense',0],
    ['2026-06-05',"McDonald's",'dining',-14.50,'KBC','expense',0],
    ['2026-06-04','Electricity','housing',-120.00,'KBC','expense',1],
    ['2026-06-03','Apple Music','subscriptions',-5.99,'KBC','expense',1],
    ['2026-06-02','Gym membership','health',-29.99,'KBC','expense',1],
    ['2026-06-01','Zalando','clothing',-67.00,'KBC','expense',0],
    ['2026-05-28','Colruyt','groceries',-54.30,'KBC','expense',0],
    ['2026-05-25','Salary May','salary',3200.00,'KBC','income',1],
    ['2026-05-20','Bybit Ethereum','investment',-200.00,'Bybit','expense',0],
    ['2026-05-15','Dentist','health',-85.00,'KBC','expense',0],
    ['2026-04-25','Salary April','salary',3200.00,'KBC','income',1],
    ['2026-03-25','Salary March','salary',3200.00,'KBC','income',1],
  ];
  const insertMany = db.transaction((rows) => rows.forEach(r => insertTx.run(...r)));
  insertMany(transactions);

  const insertSub = db.prepare(`INSERT INTO subscriptions (name,amount,category,icon,billing,next_date,can_cancel) VALUES (?,?,?,?,?,?,?)`);
  [
    ['Netflix',17.99,'subscriptions','🎬','monthly','2026-07-12',1],
    ['Spotify',10.99,'subscriptions','🎵','monthly','2026-07-09',1],
    ['Apple Music',5.99,'subscriptions','🍎','monthly','2026-07-03',1],
    ['Gym',29.99,'health','💪','monthly','2026-07-02',0],
    ['Internet',45.00,'housing','📡','monthly','2026-07-01',0],
    ['Cloud Storage',2.99,'subscriptions','☁️','monthly','2026-07-15',1],
    ['Adobe CC',54.99,'subscriptions','🎨','monthly','2026-07-20',1],
  ].forEach(r => insertSub.run(...r));

  db.prepare(`INSERT INTO investments_stocks (name,ticker,shares,buy_price,current_price,currency) VALUES (?,?,?,?,?,?)`).run('Apple Inc.','AAPL',12,165.00,189.50,'USD');
  db.prepare(`INSERT INTO investments_stocks (name,ticker,shares,buy_price,current_price,currency) VALUES (?,?,?,?,?,?)`).run('Microsoft','MSFT',5,380.00,415.00,'USD');
  db.prepare(`INSERT INTO investments_stocks (name,ticker,shares,buy_price,current_price,currency) VALUES (?,?,?,?,?,?)`).run('S&P 500 ETF','SPY',8,450.00,524.00,'USD');

  db.prepare(`INSERT INTO investments_crypto (name,ticker,amount,buy_price,current_price,currency) VALUES (?,?,?,?,?,?)`).run('Bitcoin','BTC',0.08,52000,67800,'USD');
  db.prepare(`INSERT INTO investments_crypto (name,ticker,amount,buy_price,current_price,currency) VALUES (?,?,?,?,?,?)`).run('Ethereum','ETH',0.9,2800,3420,'USD');
  db.prepare(`INSERT INTO investments_crypto (name,ticker,amount,buy_price,current_price,currency) VALUES (?,?,?,?,?,?)`).run('Solana','SOL',4.2,95,142,'USD');

  db.prepare(`INSERT OR IGNORE INTO mortgage (id,original_amount,start_date,end_date,interest_rate,monthly_payment,current_balance) VALUES (1,?,?,?,?,?,?)`)
    .run(350000,'2018-03-01','2048-03-01',2.15,1187,287430);

  const insertCash = db.prepare(`INSERT INTO cash_transactions (date,description,amount,category,type) VALUES (?,?,?,?,?)`);
  [
    ['2026-06-12','ATM Withdrawal',200,null,'in'],
    ['2026-06-13','Bakery',-4.50,'dining','out'],
    ['2026-06-11','Market vegetables',-12.00,'groceries','out'],
    ['2026-06-10','Parking',-3.00,'transport','out'],
    ['2026-06-08','ATM Withdrawal',160,null,'in'],
  ].forEach(r => insertCash.run(...r));

  const insertBudget = db.prepare(`INSERT INTO budgets (category,"limit",spent) VALUES (?,?,?)`);
  [
    ['groceries',300,193.40],
    ['dining',100,14.50],
    ['transport',200,89.00],
    ['entertainment',80,0],
    ['clothing',100,67.00],
    ['health',60,29.99],
  ].forEach(r => insertBudget.run(...r));

  const insertGoal = db.prepare(`INSERT INTO goals (icon_key,target,saved,color,name,deadline) VALUES (?,?,?,?,?,?)`);
  [
    ['plane',2000,850,'#5856D6','Vacation Italy','2026-08-01'],
    ['monitor',2499,1200,'#34C759','New MacBook','2026-12-01'],
    ['shield',5000,3200,'#FF9500','Emergency Fund',null],
  ].forEach(r => insertGoal.run(...r));

  const insertTrade = db.prepare(`INSERT INTO trades (date,pair,type,entry,exit,size,pnl,duration,strategy,rr,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  [
    ['2026-01-08','XAUUSD','LONG',2630.5,2620.3,0.1,-100,'2h 15m','Breakout',-0.5,'SL hit on fake breakout'],
    ['2026-01-13','EURUSD','SHORT',1.0342,1.0298,1,400,'4h 30m','Trend Follow',2.0,'Clean downtrend continuation'],
    ['2026-01-13','XAUUSD','LONG',2615.0,2635.0,0.1,200,'1h 45m','Support Bounce',2.0,'Key support held'],
    ['2026-01-14','USDJPY','LONG',157.80,157.30,0.5,-100,'3h 00m','Breakout',-1.0,'Failed breakout, cut loss early'],
    ['2026-01-14','XAUUSD','SHORT',2640.0,2614.0,0.1,600,'6h 10m','Trend Follow',3.0,'Perfect entry at resistance'],
    ['2026-01-15','EURUSD','LONG',1.0285,1.0340,1,500,'5h 20m','Support Bounce',2.5,'Daily support + RSI divergence'],
    ['2026-01-16','XAUUSD','LONG',2618.0,2678.0,0.1,600,'8h 00m','Trend Follow',3.0,'Rode the entire move'],
    ['2026-01-19','USDJPY','SHORT',156.50,156.90,0.5,-100,'1h 30m','Breakout',-1.0,'Market reversed unexpectedly'],
  ].forEach(r => insertTrade.run(...r));

  console.log('✓ Database seeded with initial data');
}

seed();

module.exports = db;
