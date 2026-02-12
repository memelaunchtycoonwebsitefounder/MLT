-- 1. 添加測試幣種
INSERT OR IGNORE INTO coins (id, creator_id, name, symbol, description, image_url, total_supply, current_price, hype_score, status, created_at)
VALUES 
  (1, 1, 'Test Coin', 'TEST', 'A test meme coin', '/static/default-coin.svg', 1000000, 0.01, 100, 'active', datetime('now', '-10 days')),
  (2, 1, 'Moon Token', 'MOON', 'To the moon!', '/static/default-coin.svg', 5000000, 0.02, 150, 'active', datetime('now', '-8 days')),
  (3, 1, 'Doge Plus', 'DOGE+', 'Enhanced doge', '/static/default-coin.svg', 10000000, 0.03, 120, 'active', datetime('now', '-5 days')),
  (4, 1, 'Pepe Token', 'PEPE', 'Rare pepe', '/static/default-coin.svg', 2000000, 0.04, 180, 'active', datetime('now', '-3 days')),
  (5, 1, 'Chart Coin', 'CHART', 'Test chart data', '/static/default-coin.svg', 1000000, 0.025, 110, 'active', datetime('now', '-1 day'));

-- 2. 添加價格歷史
INSERT OR IGNORE INTO price_history (coin_id, price, volume, timestamp)
VALUES 
  (1, 0.009, 500, datetime('now', '-120 minutes')),
  (1, 0.010, 800, datetime('now', '-90 minutes')),
  (1, 0.011, 1000, datetime('now', '-60 minutes')),
  (1, 0.010, 900, datetime('now', '-30 minutes')),
  (1, 0.010, 850, datetime('now')),
  (5, 0.020, 600, datetime('now', '-120 minutes')),
  (5, 0.022, 800, datetime('now', '-90 minutes')),
  (5, 0.025, 1000, datetime('now', '-60 minutes')),
  (5, 0.024, 950, datetime('now', '-30 minutes')),
  (5, 0.025, 900, datetime('now'));

-- 3. 添加成就定義
INSERT OR IGNORE INTO achievement_definitions (id, name, description, icon, points, requirement_type, requirement_value, rarity, created_at)
VALUES 
  (1, 'First Trade', 'Complete your first trade', '🎯', 100, 'trade_count', 1, 'common', datetime('now')),
  (2, 'Active Trader', 'Complete 10 trades', '💹', 300, 'trade_count', 10, 'common', datetime('now')),
  (3, 'Trading Master', 'Complete 100 trades', '👑', 1000, 'trade_count', 100, 'rare', datetime('now')),
  (4, 'Coin Creator', 'Create your first coin', '🚀', 500, 'coins_created', 1, 'uncommon', datetime('now')),
  (5, 'Commentator', 'Post 50 comments', '💬', 200, 'comment_count', 50, 'common', datetime('now')),
  (6, 'Social Butterfly', 'Get 10 followers', '🦋', 400, 'follower_count', 10, 'uncommon', datetime('now')),
  (7, 'Influencer', 'Get 100 followers', '⭐', 1500, 'follower_count', 100, 'rare', datetime('now')),
  (8, 'Level 10', 'Reach level 10', '🏆', 600, 'level', 10, 'uncommon', datetime('now'));

-- 4. 更新用戶餘額
UPDATE users SET balance = 10000 WHERE id = 1;

-- 5. 添加一些交易記錄
INSERT OR IGNORE INTO transactions (user_id, coin_id, type, amount, price, total_cost, created_at)
VALUES 
  (1, 1, 'buy', 100, 0.01, 1, datetime('now', '-2 days')),
  (1, 2, 'buy', 50, 0.02, 1, datetime('now', '-1 day'));

-- 6. 添加持倉
INSERT OR IGNORE INTO holdings (user_id, coin_id, amount, avg_buy_price, last_updated)
VALUES 
  (1, 1, 100, 0.01, datetime('now', '-2 days')),
  (1, 2, 50, 0.02, datetime('now', '-1 day'));

-- 7. 添加用戶資料
INSERT OR IGNORE INTO user_profiles (user_id, bio, total_trades, total_volume, created_at)
VALUES 
  (1, 'Test user profile', 2, 2.0, datetime('now'));
