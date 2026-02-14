-- Migration 0016: Make ai_traders.name nullable and add defaults

-- Unfortunately SQLite doesn't support ALTER COLUMN to change NOT NULL constraint
-- We need to recreate the table

-- Step 1: Create new table with corrected schema
CREATE TABLE ai_traders_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id INTEGER,
  trader_type TEXT DEFAULT 'balanced',
  name TEXT,  -- Now nullable
  personality TEXT,  -- Now nullable
  virtual_balance REAL NOT NULL DEFAULT 10000,
  mlt_balance REAL DEFAULT 10000.0,
  holdings REAL DEFAULT 0.0,
  total_bought REAL DEFAULT 0.0,
  total_sold REAL DEFAULT 0.0,
  target_profit_percent REAL DEFAULT 20.0,
  active BOOLEAN DEFAULT 1,
  is_active BOOLEAN DEFAULT 1,
  total_trades INTEGER DEFAULT 0,
  win_rate REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_trade_at DATETIME
);

-- Step 2: Copy existing data
INSERT INTO ai_traders_new 
SELECT id, coin_id, trader_type, name, personality, virtual_balance, mlt_balance, 
       holdings, total_bought, total_sold, target_profit_percent, active, is_active,
       total_trades, win_rate, created_at, last_trade_at
FROM ai_traders;

-- Step 3: Drop old table and rename new one
DROP TABLE ai_traders;
ALTER TABLE ai_traders_new RENAME TO ai_traders;

-- Step 4: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_ai_traders_coin_id ON ai_traders(coin_id);
CREATE INDEX IF NOT EXISTS idx_ai_traders_is_active ON ai_traders(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_traders_type ON ai_traders(trader_type);
