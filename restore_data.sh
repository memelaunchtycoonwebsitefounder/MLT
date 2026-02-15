#!/bin/bash

echo "🔄 開始還原測試資料..."

# Step 1: 清空現有資料
echo "📦 Step 1: 清空舊資料..."
npx wrangler d1 execute memelaunch-db --local --command="
DELETE FROM price_history;
DELETE FROM transactions;
DELETE FROM holdings;
DELETE FROM coins;
DELETE FROM users;
"

# Step 2: 創建測試用戶
echo "👤 Step 2: 創建測試用戶..."
npx wrangler d1 execute memelaunch-db --local --command="
INSERT INTO users (id, email, username, password_hash, virtual_balance, level, xp)
VALUES (1, 'test@example.com', 'testuser', '\$2a\$10\$6YjB/tXHoQOxDzW7s5H7PeZKONBxR9FxGv0.0z7QxhN4j5L2GHqCy', 10000.0, 5, 250);
"

# Step 3: 創建測試幣種
echo "🪙 Step 3: 創建測試幣種..."
npx wrangler d1 execute memelaunch-db --local --command="
INSERT INTO coins (id, name, symbol, description, current_price, market_cap, circulating_supply, total_supply, holders_count, transaction_count, hype_score, creator_id)
VALUES 
  (1, 'Test Coin', 'TEST', 'A test cryptocurrency for development', 0.01, 100000, 10000000, 100000000, 15, 120, 75, 1),
  (2, 'Moon Token', 'MOON', 'To the moon! 🚀', 0.02, 200000, 10000000, 100000000, 30, 250, 85, 1),
  (3, 'Doge Plus', 'DOGE+', 'Much wow, such gains', 0.03, 300000, 10000000, 100000000, 45, 380, 90, 1),
  (4, 'Pepe Token', 'PEPE', 'Rare pepe edition', 0.04, 400000, 10000000, 100000000, 60, 500, 95, 1),
  (5, 'Chart Coin', 'CHART', 'For testing charts', 0.025, 250000, 10000000, 100000000, 25, 150, 80, 1);
"

# Step 4: 為每個幣種插入價格歷史（最近 2 小時的分鐘級數據）
echo "📊 Step 4: 插入價格歷史數據..."

# Coin 1 - Test Coin (最近 120 分鐘的數據)
npx wrangler d1 execute memelaunch-db --local --command="
WITH RECURSIVE minutes(n) AS (
  VALUES(0)
  UNION ALL
  SELECT n+1 FROM minutes WHERE n < 120
)
INSERT INTO price_history (coin_id, price, volume, market_cap, timestamp)
SELECT 
  1,
  0.01 + (n * 0.0001) + (RANDOM() % 100) * 0.00001,
  50 + (RANDOM() % 500),
  100000 + (n * 100),
  datetime('now', '-' || (120 - n) || ' minutes')
FROM minutes;
"

# Coin 2 - Moon Token
npx wrangler d1 execute memelaunch-db --local --command="
WITH RECURSIVE minutes(n) AS (
  VALUES(0)
  UNION ALL
  SELECT n+1 FROM minutes WHERE n < 120
)
INSERT INTO price_history (coin_id, price, volume, market_cap, timestamp)
SELECT 
  2,
  0.02 + (n * 0.0002) + (RANDOM() % 100) * 0.00002,
  80 + (RANDOM() % 600),
  200000 + (n * 200),
  datetime('now', '-' || (120 - n) || ' minutes')
FROM minutes;
"

# Coin 3 - Doge Plus
npx wrangler d1 execute memelaunch-db --local --command="
WITH RECURSIVE minutes(n) AS (
  VALUES(0)
  UNION ALL
  SELECT n+1 FROM minutes WHERE n < 120
)
INSERT INTO price_history (coin_id, price, volume, market_cap, timestamp)
SELECT 
  3,
  0.03 + (n * 0.0003) + (RANDOM() % 100) * 0.00003,
  100 + (RANDOM() % 700),
  300000 + (n * 300),
  datetime('now', '-' || (120 - n) || ' minutes')
FROM minutes;
"

# Coin 4 - Pepe Token
npx wrangler d1 execute memelaunch-db --local --command="
WITH RECURSIVE minutes(n) AS (
  VALUES(0)
  UNION ALL
  SELECT n+1 FROM minutes WHERE n < 120
)
INSERT INTO price_history (coin_id, price, volume, market_cap, timestamp)
SELECT 
  4,
  0.04 + (n * 0.0004) + (RANDOM() % 100) * 0.00004,
  120 + (RANDOM() % 800),
  400000 + (n * 400),
  datetime('now', '-' || (120 - n) || ' minutes')
FROM minutes;
"

# Coin 5 - Chart Coin
npx wrangler d1 execute memelaunch-db --local --command="
WITH RECURSIVE minutes(n) AS (
  VALUES(0)
  UNION ALL
  SELECT n+1 FROM minutes WHERE n < 120
)
INSERT INTO price_history (coin_id, price, volume, market_cap, timestamp)
SELECT 
  5,
  0.025 + (n * 0.00025) + (RANDOM() % 100) * 0.000025,
  70 + (RANDOM() % 550),
  250000 + (n * 250),
  datetime('now', '-' || (120 - n) || ' minutes')
FROM minutes;
"

# Step 5: 驗證數據
echo ""
echo "✅ Step 5: 驗證數據..."
npx wrangler d1 execute memelaunch-db --local --command="
SELECT 'Users:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Coins:' as table_name, COUNT(*) as count FROM coins
UNION ALL
SELECT 'Price History:' as table_name, COUNT(*) as count FROM price_history;
"

echo ""
echo "🎯 測試幣種列表:"
npx wrangler d1 execute memelaunch-db --local --command="
SELECT id, name, symbol, current_price, holders_count, transaction_count
FROM coins
ORDER BY id;
"

echo ""
echo "✅ 資料還原完成！"
echo ""
echo "📝 測試帳號:"
echo "   Email: test@example.com"
echo "   Password: Test123!"
echo "   餘額: 10,000 coins"
echo ""
echo "🔗 測試網址:"
echo "   https://3000-ialq9sk0j7h42em32rv8h-2e77fc33.sandbox.novita.ai"
echo ""

