#!/bin/bash

echo "測試成就更新系統"
echo "=================="
echo ""

# Login
echo "1. 登入..."
LOGIN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "trade1770651466@example.com", "password": "Trade123!"}')

TOKEN=$(echo $LOGIN | jq -r '.data.token')
USER_ID=27

echo "   Token: ${TOKEN:0:20}..."

echo ""
echo "2. 檢查當前交易數..."
TRADE_COUNT=$(npx wrangler d1 execute memelaunch-db --local --command="SELECT COUNT(*) as count FROM transactions WHERE user_id = $USER_ID" 2>/dev/null | jq -r '.[0].results[0].count')
echo "   總交易數: $TRADE_COUNT"

echo ""
echo "3. 檢查當前成就狀態..."
ACHIEVEMENTS=$(curl -s http://localhost:3000/api/gamification/achievements \
  -H "Authorization: Bearer $TOKEN")

echo "   首次交易:"
echo "$ACHIEVEMENTS" | jq -r '.data.achievements[] | select(.key == "first_trade") | "     進度: \(.user_progress)/\(.requirement_value), 完成: \(.completed)"'

echo "   交易新手 (10筆):"
echo "$ACHIEVEMENTS" | jq -r '.data.achievements[] | select(.key == "trader_10") | "     進度: \(.user_progress)/\(.requirement_value), 完成: \(.completed)"'

echo "   交易專家 (100筆):"
echo "$ACHIEVEMENTS" | jq -r '.data.achievements[] | select(.key == "trader_100") | "     進度: \(.user_progress)/\(.requirement_value), 完成: \(.completed)"'

echo ""
echo "4. 執行一筆新交易..."
COIN_ID=8
BUY=$(curl -s -X POST http://localhost:3000/api/trades/buy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"coinId\": $COIN_ID, \"amount\": 5}")

if echo "$BUY" | jq -e '.success' > /dev/null 2>&1; then
  echo "   ✅ 交易成功"
else
  echo "   ❌ 交易失敗: $(echo $BUY | jq -r '.error')"
fi

echo ""
echo "5. 等待3秒..."
sleep 3

echo ""
echo "6. 重新檢查成就狀態..."
ACHIEVEMENTS_AFTER=$(curl -s http://localhost:3000/api/gamification/achievements \
  -H "Authorization: Bearer $TOKEN")

echo "   首次交易:"
echo "$ACHIEVEMENTS_AFTER" | jq -r '.data.achievements[] | select(.key == "first_trade") | "     進度: \(.user_progress)/\(.requirement_value), 完成: \(.completed)"'

echo "   交易新手 (10筆):"
echo "$ACHIEVEMENTS_AFTER" | jq -r '.data.achievements[] | select(.key == "trader_10") | "     進度: \(.user_progress)/\(.requirement_value), 完成: \(.completed)"'

echo "   交易專家 (100筆):"
echo "$ACHIEVEMENTS_AFTER" | jq -r '.data.achievements[] | select(.key == "trader_100") | "     進度: \(.user_progress)/\(.requirement_value), 完成: \(.completed)"'

echo ""
echo "7. 檢查XP更新..."
USER_INFO=$(curl -s http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN")

echo "$USER_INFO" | jq '.data | {level, xp: .xp, balance: .virtual_balance}'

echo ""
echo "8. 檢查數據庫中的成就記錄..."
npx wrangler d1 execute memelaunch-db --local --command="SELECT ad.key, ad.name, ua.progress, ua.completed FROM user_achievements ua JOIN achievement_definitions ad ON ua.achievement_id = ad.id WHERE ua.user_id = $USER_ID ORDER BY ua.completed DESC, ad.id" 2>/dev/null | jq -r '.[0].results[] | "\(.key): \(.progress)/? - 完成: \(.completed)"'

echo ""
echo "=================="
echo "測試完成"
echo "=================="
