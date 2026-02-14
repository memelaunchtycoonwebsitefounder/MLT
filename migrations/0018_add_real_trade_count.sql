-- Migration 0018: Add real_trade_count to coins table

ALTER TABLE coins ADD COLUMN real_trade_count INTEGER DEFAULT 0;

-- Update existing coins to have 0 real trades
UPDATE coins SET real_trade_count = 0 WHERE real_trade_count IS NULL;

CREATE INDEX IF NOT EXISTS idx_coins_real_trade_count ON coins(real_trade_count);
