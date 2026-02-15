-- Migration 0010: Fixed version - Add missing columns to price_history

-- Only add columns if they don't exist
ALTER TABLE price_history ADD COLUMN circulating_supply REAL DEFAULT 0;
ALTER TABLE price_history ADD COLUMN trader_type TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_price_history_coin_time ON price_history(coin_id, timestamp DESC);
