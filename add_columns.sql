-- Add MLT economy columns to coins table
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

-- Add AI trader type to transactions
ALTER TABLE transactions ADD COLUMN ai_trader_type TEXT;
