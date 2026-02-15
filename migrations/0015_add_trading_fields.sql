-- Migration 0015: Add trading fields to ai_traders table

-- Add trader type and trading statistics
ALTER TABLE ai_traders ADD COLUMN trader_type TEXT DEFAULT 'balanced';
ALTER TABLE ai_traders ADD COLUMN holdings REAL DEFAULT 0.0;
ALTER TABLE ai_traders ADD COLUMN total_bought REAL DEFAULT 0.0;
ALTER TABLE ai_traders ADD COLUMN total_sold REAL DEFAULT 0.0;
ALTER TABLE ai_traders ADD COLUMN target_profit_percent REAL DEFAULT 20.0;

-- Create index for trader type queries
CREATE INDEX IF NOT EXISTS idx_ai_traders_type ON ai_traders(trader_type);
