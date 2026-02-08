-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  virtual_balance REAL DEFAULT 10000.0,
  premium_balance REAL DEFAULT 0,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  achievements TEXT DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_verified BOOLEAN DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Meme Coins Table
CREATE TABLE IF NOT EXISTS coins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  total_supply REAL NOT NULL,
  circulating_supply REAL DEFAULT 0,
  current_price REAL DEFAULT 0.01,
  market_cap REAL DEFAULT 0,
  hype_score REAL DEFAULT 100,
  holders_count INTEGER DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  launch_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active',
  FOREIGN KEY (creator_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_coins_creator ON coins(creator_id);
CREATE INDEX IF NOT EXISTS idx_coins_symbol ON coins(symbol);
CREATE INDEX IF NOT EXISTS idx_coins_status ON coins(status);
CREATE INDEX IF NOT EXISTS idx_coins_market_cap ON coins(market_cap DESC);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  coin_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('buy', 'sell', 'create')),
  amount REAL NOT NULL,
  price REAL NOT NULL,
  total_cost REAL NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_coin ON transactions(coin_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp DESC);

-- Holdings Table
CREATE TABLE IF NOT EXISTS holdings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  coin_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  avg_buy_price REAL NOT NULL,
  current_value REAL DEFAULT 0,
  profit_loss_percent REAL DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (coin_id) REFERENCES coins(id),
  UNIQUE(user_id, coin_id)
);

CREATE INDEX IF NOT EXISTS idx_holdings_user ON holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_coin ON holdings(coin_id);

-- Market Events Table (for price simulation)
CREATE TABLE IF NOT EXISTS market_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  description TEXT,
  impact_multiplier REAL DEFAULT 1.0,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);

CREATE INDEX IF NOT EXISTS idx_market_events_coin ON market_events(coin_id);
CREATE INDEX IF NOT EXISTS idx_market_events_timestamp ON market_events(timestamp DESC);

-- Leaderboard Table
CREATE TABLE IF NOT EXISTS leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  total_profit REAL DEFAULT 0,
  best_trade_roi REAL DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  season TEXT DEFAULT 'season_1',
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_season ON leaderboard(season);
CREATE INDEX IF NOT EXISTS idx_leaderboard_profit ON leaderboard(total_profit DESC);
