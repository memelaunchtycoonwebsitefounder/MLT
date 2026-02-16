-- Seed data for fresh database

-- Insert test user (password: Test123!)
-- Hash for 'Test123!' generated with bcrypt
INSERT OR IGNORE INTO users (id, email, username, password_hash, mlt_balance, virtual_balance, created_at) 
VALUES (1, 'test@example.com', 'testuser', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 10000.0, 10000.0, datetime('now'));

-- Insert test coins with MLT economy
INSERT OR IGNORE INTO coins (
  id, creator_id, name, symbol, description, image_url,
  total_supply, circulating_supply, current_price, market_cap,
  hype_score, holders_count, transaction_count,
  initial_mlt_investment, bonding_curve_progress, bonding_curve_k,
  destiny_type, is_ai_active,
  created_at
) VALUES 
(1, 1, 'Test Coin', 'TEST', 'A test meme coin', '/static/default-coin.svg',
 1000000, 50000, 0.01, 500, 100, 1, 0,
 2000.0, 0.05, 4.0, 'unknown', 1,
 datetime('now')),
 
(2, 1, 'Moon Token', 'MOON', 'To the moon! 🚀', '/static/default-coin.svg',
 1000000, 100000, 0.02, 2000, 150, 2, 5,
 2000.0, 0.10, 4.0, 'unknown', 1,
 datetime('now')),
 
(3, 1, 'Doge Plus', 'DOGE+', 'Much wow, such coin', '/static/default-coin.svg',
 10000000, 500000, 0.005, 2500, 200, 5, 12,
 5000.0, 0.05, 4.0, 'unknown', 1,
 datetime('now'));

-- Insert initial price history
INSERT OR IGNORE INTO price_history (coin_id, price, volume, market_cap, circulating_supply, timestamp)
SELECT id, current_price, 0, market_cap, circulating_supply, created_at
FROM coins WHERE id IN (1, 2, 3);

-- Create AI traders for each coin (IDs start from 10001 to avoid conflicts)
-- Coin 1 AI Traders
INSERT OR IGNORE INTO users (id, username, email, password_hash, virtual_balance, mlt_balance)
VALUES 
  (10001, 'ai_trader_10001_sniper', 'ai_trader_10001_sniper@ai.memelaunch.system', 'AI_TRADER_NO_LOGIN', 0, 0),
  (10002, 'ai_trader_10002_whale', 'ai_trader_10002_whale@ai.memelaunch.system', 'AI_TRADER_NO_LOGIN', 0, 0),
  (10003, 'ai_trader_10003_retail', 'ai_trader_10003_retail@ai.memelaunch.system', 'AI_TRADER_NO_LOGIN', 0, 0),
  (10004, 'ai_trader_10004_bot', 'ai_trader_10004_bot@ai.memelaunch.system', 'AI_TRADER_NO_LOGIN', 0, 0),
  (10005, 'ai_trader_10005_market_maker', 'ai_trader_10005_market_maker@ai.memelaunch.system', 'AI_TRADER_NO_LOGIN', 0, 0);

INSERT OR IGNORE INTO ai_traders (id, coin_id, trader_type, holdings, total_bought, total_sold, target_profit_percent, is_active, mlt_balance)
VALUES 
  (10001, 1, 'SNIPER', 0, 0, 0, 50.0, 1, 10000.0),
  (10002, 1, 'WHALE', 0, 0, 0, 30.0, 1, 10000.0),
  (10003, 1, 'RETAIL', 0, 0, 0, 40.0, 1, 10000.0),
  (10004, 1, 'BOT', 0, 0, 0, 25.0, 1, 10000.0),
  (10005, 1, 'MARKET_MAKER', 0, 0, 0, 15.0, 1, 10000.0);

-- Coin 2 AI Traders
INSERT OR IGNORE INTO users (id, username, email, password_hash, virtual_balance, mlt_balance)
VALUES 
  (10006, 'ai_trader_10006_sniper', 'ai_trader_10006_sniper@ai.memelaunch.system', 'AI_TRADER_NO_LOGIN', 0, 0),
  (10007, 'ai_trader_10007_whale', 'ai_trader_10007_whale@ai.memelaunch.system', 'AI_TRADER_NO_LOGIN', 0, 0),
  (10008, 'ai_trader_10008_retail', 'ai_trader_10008_retail@ai.memelaunch.system', 'AI_TRADER_NO_LOGIN', 0, 0),
  (10009, 'ai_trader_10009_bot', 'ai_trader_10009_bot@ai.memelaunch.system', 'AI_TRADER_NO_LOGIN', 0, 0),
  (10010, 'ai_trader_10010_market_maker', 'ai_trader_10010_market_maker@ai.memelaunch.system', 'AI_TRADER_NO_LOGIN', 0, 0);

INSERT OR IGNORE INTO ai_traders (id, coin_id, trader_type, holdings, total_bought, total_sold, target_profit_percent, is_active, mlt_balance)
VALUES 
  (10006, 2, 'SNIPER', 0, 0, 0, 55.0, 1, 10000.0),
  (10007, 2, 'WHALE', 0, 0, 0, 35.0, 1, 10000.0),
  (10008, 2, 'RETAIL', 0, 0, 0, 45.0, 1, 10000.0),
  (10009, 2, 'BOT', 0, 0, 0, 20.0, 1, 10000.0),
  (10010, 2, 'MARKET_MAKER', 0, 0, 0, 18.0, 1, 10000.0);

-- Coin 3 AI Traders
INSERT OR IGNORE INTO users (id, username, email, password_hash, virtual_balance, mlt_balance)
VALUES 
  (10011, 'ai_trader_10011_sniper', 'ai_trader_10011_sniper@ai.memelaunch.system', 'AI_TRADER_NO_LOGIN', 0, 0),
  (10012, 'ai_trader_10012_whale', 'ai_trader_10012_whale@ai.memelaunch.system', 'AI_TRADER_NO_LOGIN', 0, 0),
  (10013, 'ai_trader_10013_retail', 'ai_trader_10013_retail@ai.memelaunch.system', 'AI_TRADER_NO_LOGIN', 0, 0),
  (10014, 'ai_trader_10014_bot', 'ai_trader_10014_bot@ai.memelaunch.system', 'AI_TRADER_NO_LOGIN', 0, 0),
  (10015, 'ai_trader_10015_market_maker', 'ai_trader_10015_market_maker@ai.memelaunch.system', 'AI_TRADER_NO_LOGIN', 0, 0);

INSERT OR IGNORE INTO ai_traders (id, coin_id, trader_type, holdings, total_bought, total_sold, target_profit_percent, is_active, mlt_balance)
VALUES 
  (10011, 3, 'SNIPER', 0, 0, 0, 52.0, 1, 10000.0),
  (10012, 3, 'WHALE', 0, 0, 0, 32.0, 1, 10000.0),
  (10013, 3, 'RETAIL', 0, 0, 0, 42.0, 1, 10000.0),
  (10014, 3, 'BOT', 0, 0, 0, 22.0, 1, 10000.0),
  (10015, 3, 'MARKET_MAKER', 0, 0, 0, 16.0, 1, 10000.0);
