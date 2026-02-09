-- Migration: Advanced Trading System
-- Date: 2026-02-09
-- Description: Add order book, pending orders, and trade history tables

-- Orders table for limit orders, stop-loss, take-profit
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  coin_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('buy', 'sell')),
  order_type TEXT NOT NULL CHECK(order_type IN ('market', 'limit', 'stop_loss', 'take_profit')),
  amount REAL NOT NULL CHECK(amount > 0),
  price REAL, -- NULL for market orders
  trigger_price REAL, -- For stop-loss/take-profit orders
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'filled', 'cancelled', 'expired')),
  filled_amount REAL DEFAULT 0,
  filled_at DATETIME,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);

-- Trade history for executed trades
CREATE TABLE IF NOT EXISTS trade_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  buyer_id INTEGER NOT NULL,
  seller_id INTEGER,
  coin_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  price REAL NOT NULL,
  total_value REAL NOT NULL,
  buyer_order_id INTEGER,
  seller_order_id INTEGER,
  trade_type TEXT DEFAULT 'direct' CHECK(trade_type IN ('direct', 'order_match')),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (coin_id) REFERENCES coins(id),
  FOREIGN KEY (buyer_order_id) REFERENCES orders(id),
  FOREIGN KEY (seller_order_id) REFERENCES orders(id)
);

-- AI Traders table
CREATE TABLE IF NOT EXISTS ai_traders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  personality TEXT NOT NULL CHECK(personality IN ('conservative', 'moderate', 'aggressive', 'random')),
  virtual_balance REAL NOT NULL DEFAULT 10000,
  active BOOLEAN DEFAULT 1,
  total_trades INTEGER DEFAULT 0,
  win_rate REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_trade_at DATETIME
);

-- Market events table (already exists, but add if missing)
CREATE TABLE IF NOT EXISTS market_events_enhanced (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL CHECK(event_type IN ('pump', 'dump', 'news', 'whale', 'rug_pull', 'viral')),
  coin_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  impact_multiplier REAL NOT NULL DEFAULT 1.0,
  duration_minutes INTEGER DEFAULT 60,
  active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);

-- Price history for charts
CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id INTEGER NOT NULL,
  price REAL NOT NULL,
  volume REAL DEFAULT 0,
  market_cap REAL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('order_filled', 'price_alert', 'system', 'achievement')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT 0,
  data TEXT, -- JSON data
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_coin_status ON orders(coin_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_type_status ON orders(order_type, status);
CREATE INDEX IF NOT EXISTS idx_trade_history_coin ON trade_history(coin_id);
CREATE INDEX IF NOT EXISTS idx_trade_history_timestamp ON trade_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_price_history_coin ON price_history(coin_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

-- Insert some AI traders
INSERT OR IGNORE INTO ai_traders (id, name, personality, virtual_balance) VALUES
  (1, 'Warren Bot', 'conservative', 100000),
  (2, 'Degen Dave', 'aggressive', 50000),
  (3, 'Steady Steve', 'moderate', 75000),
  (4, 'Random Rick', 'random', 60000),
  (5, 'Whale Walter', 'aggressive', 500000);
