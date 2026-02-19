-- Migration: Add database indexes for performance optimization
-- Purpose: Speed up frequent queries by adding composite indexes

-- Indexes for coins table
CREATE INDEX IF NOT EXISTS idx_coins_status_ai_active ON coins(status, is_ai_active);
CREATE INDEX IF NOT EXISTS idx_coins_created_at ON coins(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coins_market_cap ON coins(market_cap DESC);
CREATE INDEX IF NOT EXISTS idx_coins_hype_score ON coins(hype_score DESC);

-- Indexes for transactions table
CREATE INDEX IF NOT EXISTS idx_transactions_user_coin ON transactions(user_id, coin_id);
CREATE INDEX IF NOT EXISTS idx_transactions_coin_timestamp ON transactions(coin_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_timestamp ON transactions(user_id, timestamp DESC);

-- Indexes for holdings table
CREATE INDEX IF NOT EXISTS idx_holdings_user_coin ON holdings(user_id, coin_id);
CREATE INDEX IF NOT EXISTS idx_holdings_coin ON holdings(coin_id);
CREATE INDEX IF NOT EXISTS idx_holdings_amount ON holdings(amount DESC);

-- Indexes for price_history table
CREATE INDEX IF NOT EXISTS idx_price_history_coin_timestamp ON price_history(coin_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_timestamp ON price_history(timestamp DESC);

-- Indexes for ai_traders table
CREATE INDEX IF NOT EXISTS idx_ai_traders_coin_active ON ai_traders(coin_id, is_active);
CREATE INDEX IF NOT EXISTS idx_ai_traders_coin ON ai_traders(coin_id);
CREATE INDEX IF NOT EXISTS idx_ai_traders_trader_type ON ai_traders(trader_type);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level DESC);

-- Indexes for coin_events table (if exists)
CREATE INDEX IF NOT EXISTS idx_coin_events_coin_timestamp ON coin_events(coin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coin_events_event_type ON coin_events(event_type);

-- Analyze tables to update statistics
ANALYZE coins;
ANALYZE transactions;
ANALYZE holdings;
ANALYZE price_history;
ANALYZE ai_traders;
ANALYZE users;
