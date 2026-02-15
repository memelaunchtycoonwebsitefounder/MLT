-- Seed data for fresh database

-- Insert test user (password: Test123!)
INSERT OR IGNORE INTO users (id, email, username, password_hash, mlt_balance, virtual_balance, created_at) 
VALUES (1, 'test@example.com', 'testuser', '$2a$10$YourHashHere', 10000.0, 10000.0, datetime('now'));

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
