-- Migration 0014: Add coin_id and enhanced fields to ai_traders table

-- Add coin_id column to link AI traders to specific coins
ALTER TABLE ai_traders ADD COLUMN coin_id INTEGER;

-- Add is_active column (different from 'active' - used for per-coin activation)
ALTER TABLE ai_traders ADD COLUMN is_active BOOLEAN DEFAULT 1;

-- Add MLT balance column for trading
ALTER TABLE ai_traders ADD COLUMN mlt_balance REAL DEFAULT 10000.0;

-- Create index for faster coin-specific queries
CREATE INDEX IF NOT EXISTS idx_ai_traders_coin_id ON ai_traders(coin_id);
CREATE INDEX IF NOT EXISTS idx_ai_traders_is_active ON ai_traders(is_active);
