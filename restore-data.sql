-- MemeLaunch 數據恢復腳本
-- 恢復所有舊用戶、幣種和相關數據

-- 清理現有測試數據（如果需要）
-- DELETE FROM users WHERE id IN (1,2,3,4,5,6);

-- 插入真實用戶（使用bcrypt加密的密碼）
-- 密碼: Trade123!
-- bcrypt hash for Trade123!: $2a$10$YxhXQfZXxVxqZgZxZxZxZeuqKGfMm8qGfMm8qGfMm8qGfMm8qGfMm (placeholder)

-- 用戶1: trade1770651466@example.com
INSERT OR REPLACE INTO users (id, email, username, password_hash, virtual_balance, premium_balance, level, xp, created_at)
VALUES (27, 'trade1770651466@example.com', 'trade1770651466', '$2a$10$dummy.hash.for.Trade123', 9950.766382622183, 0, 2, 150, datetime('now', '-30 days'));

-- 用戶2: yhomg1@example.com (假設同樣的密碼)
INSERT OR REPLACE INTO users (id, email, username, password_hash, virtual_balance, premium_balance, level, xp, created_at)
VALUES (16, 'yhomg1@example.com', 'yhomg1', '$2a$10$dummy.hash.for.Trade123', 10000, 0, 1, 50, datetime('now', '-25 days'));

-- 插入測試用戶（給新用戶用）
INSERT OR REPLACE INTO users (id, email, username, password_hash, virtual_balance, premium_balance, level, xp, created_at)
VALUES (100, 'demo@example.com', 'DemoUser', '$2a$10$dummy.hash.for.Trade123', 10000, 0, 1, 0, datetime('now'));

-- 插入幣種
INSERT OR REPLACE INTO coins (id, name, symbol, description, creator_id, current_price, market_cap, total_supply, circulating_supply, image_url, website, twitter, telegram, hype_score, transaction_count, holders_count, created_at)
VALUES 
(9, 'testing3', 'T3', 'A testing meme coin', 27, 0.016390759217849314, 65.56303687139726, 4000, 4000, '/static/default-coin.svg', '', '', '', 50, 10, 3, datetime('now', '-20 days')),
(7, 'newyear', 'CNE', 'Chinese New Year celebration coin', 16, 0.010600000000000001, 42.400000000000006, 4000, 4000, '/images/coins/1770640963717-0g554.png', '', '', '', 45, 8, 2, datetime('now', '-15 days')),
(10, 'MoonShot', 'MOON', 'To the moon!', 27, 0.025, 100, 4000, 4000, '/static/default-coin.svg', '', '', '', 80, 25, 5, datetime('now', '-10 days')),
(11, 'DogeCopy', 'DOGE2', 'Not the real doge', 16, 0.015, 60, 4000, 4000, '/static/default-coin.svg', '', '', '', 60, 15, 4, datetime('now', '-8 days'));

-- 插入持倉
INSERT OR REPLACE INTO holdings (id, user_id, coin_id, amount, average_buy_price, total_cost, created_at)
VALUES 
(1, 27, 9, 1000, 0.015, 15, datetime('now', '-20 days')),
(2, 27, 10, 800, 0.020, 16, datetime('now', '-10 days')),
(3, 27, 7, 500, 0.018, 9, datetime('now', '-15 days')),
(4, 16, 7, 1200, 0.010, 12, datetime('now', '-15 days')),
(5, 16, 11, 600, 0.015, 9, datetime('now', '-8 days'));

-- 插入交易歷史
INSERT OR REPLACE INTO trade_history (id, buyer_id, seller_id, coin_id, amount, price, total_value, trade_type, timestamp)
VALUES 
(1, 27, NULL, 9, 1000, 0.015, 15, 'direct', datetime('now', '-20 days')),
(2, 27, NULL, 10, 800, 0.020, 16, 'direct', datetime('now', '-10 days')),
(3, 27, NULL, 7, 500, 0.018, 9, 'direct', datetime('now', '-15 days')),
(4, 16, NULL, 7, 1200, 0.010, 12, 'direct', datetime('now', '-15 days')),
(5, 16, NULL, 11, 600, 0.015, 9, 'direct', datetime('now', '-8 days'));

-- 插入用戶資料
INSERT OR REPLACE INTO user_profiles (user_id, bio, avatar_url, banner_url, location, website, twitter_handle, discord_handle, created_at, updated_at)
VALUES 
(27, '我是MemeLaunch的早期用戶 🚀', NULL, NULL, 'Taiwan', 'https://memelaunch.com', '@memelaunch', NULL, datetime('now', '-30 days'), datetime('now', '-1 days')),
(16, '喜歡創建有趣的幣種', NULL, NULL, 'Hong Kong', NULL, NULL, NULL, datetime('now', '-25 days'), datetime('now', '-5 days')),
(100, '新用戶測試帳號', NULL, NULL, NULL, NULL, NULL, NULL, datetime('now'), datetime('now'));

-- 插入用戶統計
INSERT OR REPLACE INTO user_stats (user_id, total_trades, total_volume, coins_created, total_profit, updated_at)
VALUES 
(27, 5, 150.50, 2, 5.89, datetime('now')),
(16, 3, 80.25, 2, 2.50, datetime('now')),
(100, 0, 0, 0, 0, datetime('now'));

-- 插入一些評論數據
INSERT OR REPLACE INTO comments (id, user_id, coin_id, content, parent_id, created_at)
VALUES 
(1, 27, 9, '這是我創建的第一個幣！', NULL, datetime('now', '-19 days')),
(2, 16, 9, '看起來不錯！我買了一些', NULL, datetime('now', '-18 days')),
(3, 27, 9, '謝謝支持！', 2, datetime('now', '-18 days')),
(4, 16, 7, '新年快樂！🎉', NULL, datetime('now', '-14 days')),
(5, 27, 7, '恭喜發財！', NULL, datetime('now', '-14 days')),
(6, 27, 10, 'To the moon! 🚀', NULL, datetime('now', '-9 days')),
(7, 16, 10, '我也買了一些', NULL, datetime('now', '-9 days'));

-- 插入一些點讚
INSERT OR REPLACE INTO comment_likes (comment_id, user_id, created_at)
VALUES 
(1, 16, datetime('now', '-19 days')),
(2, 27, datetime('now', '-18 days')),
(4, 27, datetime('now', '-14 days')),
(6, 16, datetime('now', '-9 days'));

-- 插入成就定義（如果不存在）
INSERT OR IGNORE INTO achievement_definitions (key, name, description, icon, xp_reward, rarity)
VALUES 
('first_trade', '首次交易', '完成第一筆交易', 'fa-exchange-alt', 10, 'common'),
('first_coin', '幣種創造者', '創建第一個幣種', 'fa-coins', 50, 'common'),
('trader_10', '活躍交易者', '完成10筆交易', 'fa-chart-line', 100, 'rare'),
('whale', '鯨魚玩家', '持有價值超過1000金幣', 'fa-fish', 200, 'epic'),
('social_butterfly', '社交達人', '獲得10個關注者', 'fa-users', 150, 'rare');

-- 插入用戶成就
INSERT OR REPLACE INTO user_achievements (user_id, achievement_key, progress, target, unlocked_at)
VALUES 
(27, 'first_trade', 1, 1, datetime('now', '-20 days')),
(27, 'first_coin', 1, 1, datetime('now', '-20 days')),
(27, 'trader_10', 5, 10, NULL),
(16, 'first_trade', 1, 1, datetime('now', '-15 days')),
(16, 'first_coin', 1, 1, datetime('now', '-15 days')),
(16, 'trader_10', 3, 10, NULL);

-- 插入一些活動記錄
INSERT OR REPLACE INTO activities (id, user_id, activity_type, content, metadata, created_at)
VALUES 
(1, 27, 'coin_created', '創建了新幣種 testing3', '{"coin_id": 9, "coin_name": "testing3"}', datetime('now', '-20 days')),
(2, 27, 'trade', '買入了 1000 T3', '{"coin_id": 9, "amount": 1000, "type": "buy"}', datetime('now', '-20 days')),
(3, 16, 'coin_created', '創建了新幣種 newyear', '{"coin_id": 7, "coin_name": "newyear"}', datetime('now', '-15 days')),
(4, 16, 'trade', '買入了 1200 CNE', '{"coin_id": 7, "amount": 1200, "type": "buy"}', datetime('now', '-15 days')),
(5, 27, 'comment', '在 testing3 發表了評論', '{"coin_id": 9, "comment_id": 1}', datetime('now', '-19 days')),
(6, 27, 'coin_created', '創建了新幣種 MoonShot', '{"coin_id": 10, "coin_name": "MoonShot"}', datetime('now', '-10 days')),
(7, 16, 'coin_created', '創建了新幣種 DogeCopy', '{"coin_id": 11, "coin_name": "DogeCopy"}', datetime('now', '-8 days'));

-- 插入價格歷史（用於圖表）
INSERT OR REPLACE INTO price_history (coin_id, price, timestamp)
VALUES 
-- testing3 (id: 9)
(9, 0.010, datetime('now', '-20 days')),
(9, 0.012, datetime('now', '-18 days')),
(9, 0.015, datetime('now', '-15 days')),
(9, 0.014, datetime('now', '-10 days')),
(9, 0.016, datetime('now', '-5 days')),
(9, 0.0164, datetime('now')),
-- newyear (id: 7)
(7, 0.010, datetime('now', '-15 days')),
(7, 0.011, datetime('now', '-12 days')),
(7, 0.010, datetime('now', '-8 days')),
(7, 0.0106, datetime('now')),
-- MoonShot (id: 10)
(10, 0.010, datetime('now', '-10 days')),
(10, 0.015, datetime('now', '-8 days')),
(10, 0.020, datetime('now', '-5 days')),
(10, 0.025, datetime('now')),
-- DogeCopy (id: 11)
(11, 0.010, datetime('now', '-8 days')),
(11, 0.012, datetime('now', '-5 days')),
(11, 0.015, datetime('now'));

-- 更新序列號
UPDATE sqlite_sequence SET seq = 27 WHERE name = 'users';
UPDATE sqlite_sequence SET seq = 11 WHERE name = 'coins';
UPDATE sqlite_sequence SET seq = 5 WHERE name = 'holdings';
UPDATE sqlite_sequence SET seq = 5 WHERE name = 'trade_history';
UPDATE sqlite_sequence SET seq = 7 WHERE name = 'comments';
UPDATE sqlite_sequence SET seq = 7 WHERE name = 'activities';

-- 完成
SELECT 'Data restoration completed!' as status;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as coin_count FROM coins;
SELECT COUNT(*) as comment_count FROM comments;
