#!/bin/bash

echo "========================================"
echo "測試所有修復"
echo "========================================"
echo ""

# Login
echo "1. 登入測試帳號..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "trade1770651466@example.com", "password": "Trade123!"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo "✓ 登入成功"
else
  echo "✗ 登入失敗"
  exit 1
fi

echo ""
echo "2. 檢查成就稀有度..."
ACHIEVEMENTS=$(curl -s http://localhost:3000/api/gamification/achievements \
  -H "Authorization: Bearer $TOKEN")

echo "$ACHIEVEMENTS" | jq -r '.data.achievements[] | select(.key == "first_trade") | "首次交易: \(.rarity) (應該是 common)"'
echo "$ACHIEVEMENTS" | jq -r '.data.achievements[] | select(.key == "trader_10") | "交易新手: \(.rarity) (應該是 rare)"'
echo "$ACHIEVEMENTS" | jq -r '.data.achievements[] | select(.key == "whale") | "巨鯨: \(.rarity) (應該是 epic)"'
echo "$ACHIEVEMENTS" | jq -r '.data.achievements[] | select(.key == "profit_king") | "盈利之王: \(.rarity) (應該是 legendary)"'

echo ""
echo "3. 執行一筆交易來測試成就觸發..."
# Get a coin
COIN_ID=$(curl -s http://localhost:3000/api/coins | jq -r '.data[0].id')
echo "  使用幣種 ID: $COIN_ID"

# Buy some coins
BUY_RESPONSE=$(curl -s -X POST http://localhost:3000/api/trades/buy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"coinId\": $COIN_ID, \"amount\": 10}")

echo "$BUY_RESPONSE" | jq '.'

echo ""
echo "4. 檢查成就進度..."
ACHIEVEMENTS_AFTER=$(curl -s http://localhost:3000/api/gamification/achievements \
  -H "Authorization: Bearer $TOKEN")

FIRST_TRADE_PROGRESS=$(echo "$ACHIEVEMENTS_AFTER" | jq -r '.data.achievements[] | select(.key == "first_trade") | "\(.user_progress)/\(.requirement_value) - 完成: \(.completed)"')
echo "  首次交易: $FIRST_TRADE_PROGRESS"

echo ""
echo "========================================"
echo "✅ 測試完成！"
echo "========================================"
echo ""
echo "🌐 請在瀏覽器測試："
echo "   1. 訪問: http://localhost:3000/dashboard"
echo "   2. 點擊導航欄的「成就」按鈕"
echo "   3. 查看所有成就及其稀有度標籤"
echo "   4. 執行更多交易來解鎖成就"
