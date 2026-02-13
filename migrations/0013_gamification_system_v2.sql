-- Simplified migration 0013: Only add new columns (tables already exist)

-- Add new columns to coins table (ignore errors if they exist)
ALTER TABLE coins ADD COLUMN initial_mlt_investment REAL DEFAULT 2000.0;
ALTER TABLE coins ADD COLUMN bonding_curve_progress REAL DEFAULT 0.0;
ALTER TABLE coins ADD COLUMN bonding_curve_k REAL DEFAULT 4.0;
ALTER TABLE coins ADD COLUMN destiny_type TEXT DEFAULT 'unknown';
ALTER TABLE coins ADD COLUMN is_ai_active BOOLEAN DEFAULT 1;
ALTER TABLE coins ADD COLUMN death_time DATETIME;
ALTER TABLE coins ADD COLUMN graduation_time DATETIME;
ALTER TABLE coins ADD COLUMN last_ai_trade_time DATETIME;
ALTER TABLE coins ADD COLUMN has_sniper_attack BOOLEAN DEFAULT 0;
ALTER TABLE coins ADD COLUMN has_whale_buy BOOLEAN DEFAULT 0;
ALTER TABLE coins ADD COLUMN has_rug_pull BOOLEAN DEFAULT 0;
ALTER TABLE coins ADD COLUMN has_panic_sell BOOLEAN DEFAULT 0;
ALTER TABLE coins ADD COLUMN has_fomo_buy BOOLEAN DEFAULT 0;
ALTER TABLE coins ADD COLUMN has_viral_moment BOOLEAN DEFAULT 0;
ALTER TABLE coins ADD COLUMN real_trade_count INTEGER DEFAULT 0;
ALTER TABLE coins ADD COLUMN ai_trade_count INTEGER DEFAULT 0;
ALTER TABLE coins ADD COLUMN unique_real_traders INTEGER DEFAULT 0;

-- Add new columns to transactions table
ALTER TABLE transactions ADD COLUMN ai_trader_type TEXT;

-- Add new column to price_history table  
ALTER TABLE price_history ADD COLUMN ai_trader_type TEXT;

-- Create new tables
CREATE TABLE IF NOT EXISTS coin_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  event_data TEXT,
  impact_percent REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);

CREATE TABLE IF NOT EXISTS ai_traders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id INTEGER NOT NULL,
  trader_type TEXT NOT NULL,
  holdings REAL DEFAULT 0,
  total_bought REAL DEFAULT 0,
  total_sold REAL DEFAULT 0,
  entry_price REAL,
  target_profit_percent REAL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_trade_at DATETIME,
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_coin_events_coin_id ON coin_events(coin_id);
CREATE INDEX IF NOT EXISTS idx_coin_events_type ON coin_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ai_traders_coin_id ON ai_traders(coin_id);
CREATE INDEX IF NOT EXISTS idx_ai_traders_active ON ai_traders(is_active);
CREATE INDEX IF NOT EXISTS idx_transactions_ai_trade ON transactions(is_ai_trade);
CREATE INDEX IF NOT EXISTS idx_price_history_ai_trade ON price_history(is_ai_trade);
