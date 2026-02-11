-- Migration 0009: MLT Economy System
-- Add MLT (MemeLaunch Token) as the primary game currency

-- Add MLT balance columns to users table
-- Note: SQLite doesn't support IF NOT EXISTS in ALTER TABLE, so we handle errors gracefully
-- These will fail silently if columns already exist

-- Add coin_protection table for revoke features
CREATE TABLE IF NOT EXISTS coin_protection (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  protection_type TEXT NOT NULL, -- 'revoke_freeze', 'revoke_mint', 'revoke_update'
  mlt_cost REAL NOT NULL,
  purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1,
  FOREIGN KEY (coin_id) REFERENCES coins(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(coin_id, protection_type)
);

-- Create MLT transaction history table
CREATE TABLE IF NOT EXISTS mlt_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL, -- positive for earning, negative for spending
  transaction_type TEXT NOT NULL, -- 'create_coin', 'buy_protection', 'trade_fee', 'reward', 'referral'
  related_coin_id INTEGER,
  related_transaction_id INTEGER,
  description TEXT,
  balance_after REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_coin_id) REFERENCES coins(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_coin_protection_coin_id ON coin_protection(coin_id);
CREATE INDEX IF NOT EXISTS idx_coin_protection_user_id ON coin_protection(user_id);
CREATE INDEX IF NOT EXISTS idx_mlt_transactions_user_id ON mlt_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_mlt_transactions_created_at ON mlt_transactions(created_at);

PRAGMA foreign_keys = ON;
