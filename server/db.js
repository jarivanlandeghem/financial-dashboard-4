const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'finance.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ──────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    key        TEXT NOT NULL UNIQUE,
    label      TEXT NOT NULL,
    icon       TEXT NOT NULL DEFAULT '📦',
    color      TEXT NOT NULL DEFAULT '#6B7280',
    type       TEXT NOT NULL DEFAULT 'expense' CHECK(type IN ('expense','income','both')),
    parent_id  INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

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

function seedCategories() {
  const count = db.prepare('SELECT COUNT(*) as c FROM categories').get().c;
  if (count > 0) return;

  const ins = db.prepare('INSERT INTO categories (key,label,icon,color,type,parent_id,sort_order) VALUES (?,?,?,?,?,?,?)');

  const parents = [
    ['housing',      'Wonen',            'house.svg',                     '#4F8EF7', 'expense',  null, 0],
    ['food',         'Eten & Drinken',   'fork.knife.svg',                '#00C896', 'expense',  null, 1],
    ['transport',    'Transport',        'car.svg',                       '#FFB800', 'expense',  null, 2],
    ['health',       'Gezondheid',       'pill.svg',                      '#FF4757', 'expense',  null, 3],
    ['entertainment','Entertainment',    'gamecontroller.svg',            '#A855F7', 'expense',  null, 4],
    ['shopping',     'Shopping',         'bag.svg',                       '#EC4899', 'expense',  null, 5],
    ['travel',       'Reizen',           'airplane.svg',                  '#06B6D4', 'expense',  null, 6],
    ['education',    'Onderwijs',        'book.closed.svg',               '#8B5CF6', 'expense',  null, 7],
    ['personal',     'Persoonlijke Zorg','person.svg',                    '#F97316', 'expense',  null, 8],
    ['subscriptions','Abonnementen',     'iphone.svg',                    '#0EA5E9', 'expense',  null, 9],
    ['pets',         'Huisdieren',       'pawprint.svg',                  '#84CC16', 'expense',  null, 10],
    ['family',       'Gezin & Kids',     'figure.and.child.holdinghands.svg','#F43F5E', 'expense', null, 11],
    ['financial',    'Financieel',       'building.svg',                  '#64748B', 'both',     null, 12],
    ['gifts',        'Giften',           'giftcard.svg',                  '#EF4444', 'expense',  null, 13],
    ['salary',       'Salaris',          'dollarsign.svg',                '#10B981', 'income',   null, 14],
    ['freelance',    'Freelance',        'briefcase.svg',                 '#059669', 'income',   null, 15],
    ['investments',  'Beleggingen',      'chart.line.uptrend.xyaxis.svg', '#3B82F6', 'both',     null, 16],
    ['rental',       'Huurinkomsten',    'house.svg',                     '#8B5CF6', 'income',   null, 17],
    ['extra_income', 'Extra Inkomsten',  'bolt.svg',                      '#F59E0B', 'income',   null, 18],
    ['other',        'Overige',          'questionmark.folder.svg',       '#6B7280', 'both',     null, 19],
  ];

  const idMap = {};
  const insertParent = db.transaction(() => {
    parents.forEach(([key, label, icon, color, type, , sort]) => {
      const r = ins.run(key, label, icon, color, type, null, sort);
      idMap[key] = r.lastInsertRowid;
    });
  });
  insertParent();

  const children = [
    // Wonen
    ['rent',          'Huur',               'house.svg',                     '#4F8EF7', 'expense', 'housing',       0],
    ['mortgage_pay',  'Hypotheek',          'building.svg',                  '#4F8EF7', 'expense', 'housing',       1],
    ['utilities',     'Nutsvoorzieningen',  'lightbulb.svg',                 '#FCD34D', 'expense', 'housing',       2],
    ['internet',      'Internet & Telefoon','wifi.svg',                      '#60A5FA', 'expense', 'housing',       3],
    ['home_insurance','Woonverzekering',    'shield.svg',                    '#93C5FD', 'expense', 'housing',       4],
    ['maintenance',   'Onderhoud & Herst.', 'wrench.and.screwdriver.svg',    '#A3A3A3', 'expense', 'housing',       5],
    ['furniture',     'Meubels & Deco',     'sofa.svg',                      '#D97706', 'expense', 'housing',       6],
    // Eten & Drinken
    ['groceries',     'Supermarkt',         'cart.svg',                      '#00C896', 'expense', 'food',          0],
    ['dining',        'Restaurant',         'fork.knife.svg',                '#F97316', 'expense', 'food',          1],
    ['takeaway',      'Afhaal & Bezorg',    'takeoutbag.and.cup.and.straw.svg','#FB923C','expense', 'food',          2],
    ['coffee',        'Koffie & Café',      'cup.and.saucer.svg',            '#92400E', 'expense', 'food',          3],
    ['bakery',        'Bakkerij & Markt',   'basket.svg',                    '#FDE68A', 'expense', 'food',          4],
    // Transport
    ['fuel',          'Brandstof',          'fuelpump.svg',                  '#FFB800', 'expense', 'transport',     0],
    ['public_transit','Openbaar Vervoer',   'bus.svg',                       '#FBBF24', 'expense', 'transport',     1],
    ['car_insurance', 'Autoverzekering',    'car.front.waves.down.svg',      '#D97706', 'expense', 'transport',     2],
    ['car_maintenance','Auto Onderhoud',    'wrench.and.screwdriver.svg',    '#B45309', 'expense', 'transport',     3],
    ['parking',       'Parkeren',           'parkingsign.svg',               '#92400E', 'expense', 'transport',     4],
    ['taxi_uber',     'Taxi & Uber',        'car.svg',                       '#F59E0B', 'expense', 'transport',     5],
    // Gezondheid
    ['doctor',        'Dokter',             'stethoscope.svg',               '#FF4757', 'expense', 'health',        0],
    ['pharmacy',      'Apotheek',           'pill.svg',                      '#F87171', 'expense', 'health',        1],
    ['dentist',       'Tandarts',           'stethoscope.svg',               '#FCA5A5', 'expense', 'health',        2],
    ['gym',           'Fitness & Sport',    'figure.strengthtraining.traditional.svg','#EF4444','expense','health',  3],
    ['mental_health', 'Mentale Gezondheid', 'heart.svg',                     '#FECACA', 'expense', 'health',        4],
    // Entertainment
    ['streaming',     'Streaming',          'tv.svg',                        '#A855F7', 'expense', 'entertainment', 0],
    ['games',         'Games',              'gamecontroller.svg',            '#9333EA', 'expense', 'entertainment', 1],
    ['cinema',        'Cinema & Theater',   'film.stack.svg',                '#7C3AED', 'expense', 'entertainment', 2],
    ['concerts',      'Concerten & Events', 'music.note.list.svg',           '#6D28D9', 'expense', 'entertainment', 3],
    ['sports',        'Sport & Recreatie',  'soccerball.svg',                '#5B21B6', 'expense', 'entertainment', 4],
    ['hobbies',       "Hobby's",            'paintbrush.svg',                '#DDD6FE', 'expense', 'entertainment', 5],
    // Shopping
    ['clothing',      'Kleding',            'tshirt.svg',                    '#EC4899', 'expense', 'shopping',      0],
    ['electronics',   'Elektronica',        'laptopcomputer.svg',            '#DB2777', 'expense', 'shopping',      1],
    ['books',         'Boeken & Media',     'book.svg',                      '#BE185D', 'expense', 'shopping',      2],
    ['home_goods',    'Huishoudelijk',      'archivebox.svg',                '#9D174D', 'expense', 'shopping',      3],
    // Reizen
    ['flights',       'Vluchten',           'airplane.svg',                  '#06B6D4', 'expense', 'travel',        0],
    ['hotels',        'Hotels & Verblijf',  'bed.double.svg',                '#0891B2', 'expense', 'travel',        1],
    ['car_rental',    'Autohuur',           'car.svg',                       '#0E7490', 'expense', 'travel',        2],
    ['activities',    'Activiteiten',       'map.svg',                       '#155E75', 'expense', 'travel',        3],
    // Onderwijs
    ['courses',       'Cursussen & Online', 'laptopcomputer.svg',            '#8B5CF6', 'expense', 'education',     0],
    ['tuition',       'Schoolgeld',         'graduationcap.svg',             '#7C3AED', 'expense', 'education',     1],
    ['books_edu',     'Boeken & Materiaal', 'book.closed.svg',               '#6D28D9', 'expense', 'education',     2],
    ['workshops',     'Workshops',          'wrench.and.screwdriver.svg',    '#5B21B6', 'expense', 'education',     3],
    // Persoonlijke Zorg
    ['haircut',       'Kapper & Schoonheid','scissors.svg',                  '#F97316', 'expense', 'personal',      0],
    ['skincare',      'Huidverzorging',     'sun.max.svg',                   '#FB923C', 'expense', 'personal',      1],
    ['clothing_care', 'Stomerij & Was',     'tshirt.svg',                    '#FED7AA', 'expense', 'personal',      2],
    // Abonnementen
    ['software_sub',  'Software',           'laptopcomputer.svg',            '#0EA5E9', 'expense', 'subscriptions', 0],
    ['music_sub',     'Muziek',             'music.note.list.svg',           '#0284C7', 'expense', 'subscriptions', 1],
    ['video_sub',     'Video',              'tv.svg',                        '#0369A1', 'expense', 'subscriptions', 2],
    ['news_sub',      'Nieuws & Magazines', 'newspaper.svg',                 '#075985', 'expense', 'subscriptions', 3],
    ['cloud_sub',     'Cloud Opslag',       'icloud.svg',                    '#0C4A6E', 'expense', 'subscriptions', 4],
    // Huisdieren
    ['pet_food',      'Dierenvoeding',      'pawprint.svg',                  '#84CC16', 'expense', 'pets',          0],
    ['vet',           'Dierenarts',         'stethoscope.svg',               '#65A30D', 'expense', 'pets',          1],
    ['pet_grooming',  'Verzorging',         'scissors.svg',                  '#4D7C0F', 'expense', 'pets',          2],
    // Gezin & Kids
    ['childcare',     'Kinderopvang',       'figure.and.child.holdinghands.svg','#F43F5E','expense','family',        0],
    ['school',        'School & Activit.',  'graduationcap.svg',             '#E11D48', 'expense', 'family',        1],
    ['allowance',     'Zakgeld',            'dollarsign.svg',                '#BE123C', 'expense', 'family',        2],
    // Financieel
    ['bank_fees',     'Bankkosten',         'building.svg',                  '#64748B', 'expense', 'financial',     0],
    ['insurance',     'Verzekering',        'shield.svg',                    '#475569', 'expense', 'financial',     1],
    ['taxes',         'Belastingen',        'gear.svg',                      '#334155', 'expense', 'financial',     2],
    ['savings_transfer','Sparen',           'banknote.svg',                  '#1E293B', 'both',    'financial',     3],
    // Giften
    ['gifts_out',     'Cadeaus',            'giftcard.svg',                  '#EF4444', 'expense', 'gifts',         0],
    ['charity',       'Liefdadigheid',      'heart.svg',                     '#DC2626', 'expense', 'gifts',         1],
    // Salaris
    ['main_salary',   'Hoofdsalaris',       'dollarsign.svg',                '#10B981', 'income',  'salary',        0],
    ['bonus',         'Bonus',              'trophy.svg',                    '#059669', 'income',  'salary',        1],
    ['holiday_pay',   'Vakantiegeld',       'sun.max.svg',                   '#047857', 'income',  'salary',        2],
    // Freelance
    ['consulting',    'Consulting',         'briefcase.svg',                 '#059669', 'income',  'freelance',     0],
    ['side_project',  'Nevenproject',       'gear.svg',                      '#047857', 'income',  'freelance',     1],
    // Beleggingen
    ['dividends',     'Dividenden',         'chart.bar.xaxis.ascending.svg', '#3B82F6', 'income',  'investments',   0],
    ['crypto_profit', 'Crypto Winst',       'bitcoinsign.svg',               '#1D4ED8', 'income',  'investments',   1],
    ['stock_profit',  'Aandelen Winst',     'chart.line.uptrend.xyaxis.svg', '#1E40AF', 'income',  'investments',   2],
    // Extra Inkomsten
    ['cashback',      'Cashback',           'creditcard.svg',                '#F59E0B', 'income',  'extra_income',  0],
    ['gift_received', 'Ontvangen Cadeau',   'giftcard.svg',                  '#D97706', 'income',  'extra_income',  1],
    ['tax_return',    'Belastingteruggave', 'gear.svg',                      '#B45309', 'income',  'extra_income',  2],
    ['government',    'Uitkering/Toelage',  'building.2.svg',                '#92400E', 'income',  'extra_income',  3],
  ];

  const insertChildren = db.transaction(() => {
    children.forEach(([key, label, icon, color, type, parentKey, sort]) => {
      ins.run(key, label, icon, color, type, idMap[parentKey], sort);
    });
  });
  insertChildren();

  console.log('✓ Categories seeded');
}

function seed() {
  seedCategories();
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
    ['Netflix',       17.99,'subscriptions','tv.svg',                              'monthly','2026-07-12',1],
    ['Spotify',       10.99,'subscriptions','headphones.svg',                      'monthly','2026-07-09',1],
    ['Apple Music',    5.99,'subscriptions','music.note.list.svg',                 'monthly','2026-07-03',1],
    ['Gym',           29.99,'health',       'figure.strengthtraining.traditional.svg','monthly','2026-07-02',0],
    ['Internet',      45.00,'housing',      'wifi.svg',                            'monthly','2026-07-01',0],
    ['Cloud Storage',  2.99,'subscriptions','icloud.svg',                          'monthly','2026-07-15',1],
    ['Adobe CC',      54.99,'subscriptions','paintbrush.svg',                      'monthly','2026-07-20',1],
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
migrateIconsToSF();

module.exports = db;

function migrateIconsToSF() {
  const catMap = {
    '🏠':'house.svg','🛒':'cart.svg','🚗':'car.svg','💊':'pill.svg','🎮':'gamecontroller.svg',
    '🛍️':'bag.svg','✈️':'airplane.svg','📚':'book.closed.svg','💆':'person.svg','📱':'iphone.svg',
    '🐾':'pawprint.svg','👶':'figure.and.child.holdinghands.svg','🏦':'building.svg','🎁':'giftcard.svg',
    '💰':'dollarsign.svg','💼':'briefcase.svg','📈':'chart.line.uptrend.xyaxis.svg','🏡':'house.svg',
    '🎰':'bolt.svg','❓':'questionmark.folder.svg','🍽️':'fork.knife.svg','⛽':'fuelpump.svg',
    '🩺':'stethoscope.svg','🏋️':'figure.strengthtraining.traditional.svg','📺':'tv.svg','👕':'tshirt.svg',
    '✂️':'scissors.svg','💾':'laptopcomputer.svg','📰':'newspaper.svg','☁️':'icloud.svg','🎵':'music.note.list.svg',
    '💳':'creditcard.svg','🎬':'film.stack.svg','⚽':'soccerball.svg','📖':'book.svg','💻':'laptopcomputer.svg',
    '🛡️':'shield.svg','📋':'gear.svg','💡':'lightbulb.svg','🔧':'wrench.and.screwdriver.svg','🛋️':'sofa.svg',
    '☕':'cup.and.saucer.svg','🥡':'takeoutbag.and.cup.and.straw.svg','🚌':'bus.svg','🅿️':'parkingsign.svg',
    '🚕':'car.svg','🦷':'stethoscope.svg','🧠':'heart.svg','📡':'wifi.svg','🧹':'archivebox.svg',
    '🏨':'bed.double.svg','🚙':'car.svg','🎡':'map.svg','🏫':'graduationcap.svg','📝':'book.closed.svg',
    '🛠️':'wrench.and.screwdriver.svg','🧴':'sun.max.svg','👗':'tshirt.svg','🐶':'pawprint.svg',
    '🏥':'stethoscope.svg','💸':'dollarsign.svg','🏆':'trophy.svg','🌴':'sun.max.svg','🚀':'gear.svg',
    '📊':'chart.bar.xaxis.ascending.svg','₿':'bitcoinsign.svg','🎨':'paintbrush.svg','🧱':'shippingbox.svg',
    '⏱️':'clock.svg','👷':'person.svg','📦':'archivebox.svg','🎸':'headphones.svg','📷':'gear.svg',
    '🌿':'figure.walk.svg','🔨':'wrench.and.screwdriver.svg','🏗️':'shippingbox.svg','⚡':'bolt.svg',
    '🌊':'figure.run.svg','🌱':'figure.walk.svg','🚲':'bicycle.svg','⛵':'airplane.svg','🔌':'bolt.svg',
    '🍎':'music.note.list.svg','💪':'figure.strengthtraining.traditional.svg','💵':'banknote.svg',
    '↔️':'arrow.left.arrow.right.svg','🍔':'fork.knife.svg','🥖':'basket.svg','❤️':'heart.svg',
    '🏛️':'building.2.svg','🏗':'shippingbox.svg',
  };
  const subMap = {
    '🎬':'tv.svg','🎵':'headphones.svg','🍎':'music.note.list.svg','💪':'figure.strengthtraining.traditional.svg',
    '📡':'wifi.svg','☁️':'icloud.svg','🎨':'paintbrush.svg',
  };

  const updateCat = db.prepare('UPDATE categories SET icon=? WHERE icon=?');
  const migrateCats = db.transaction(() => {
    for (const [old, svg] of Object.entries(catMap)) {
      updateCat.run(svg, old);
    }
  });
  migrateCats();

  const updateSub = db.prepare('UPDATE subscriptions SET icon=? WHERE icon=?');
  const migrateSubs = db.transaction(() => {
    for (const [old, svg] of Object.entries({ ...catMap, ...subMap })) {
      updateSub.run(svg, old);
    }
  });
  migrateSubs();
}
