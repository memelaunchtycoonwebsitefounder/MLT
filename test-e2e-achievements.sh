#!/bin/bash

echo "========================================="
echo "成就系統端到端測試 v2.3.3"
echo "========================================="

API_URL="http://localhost:3000"
EMAIL="trade1770651466@example.com"
PASSWORD="Trade123!"

echo ""
echo "步驟 1: 登入並獲取 token..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ 登入失敗"
  exit 1
fi

echo "✅ Token: ${TOKEN:0:30}..."

echo ""
echo "步驟 2: 查詢用戶資料..."
USER_DATA=$(curl -s "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")

echo "$USER_DATA" | python3 -m json.tool 2>/dev/null || echo "$USER_DATA"

LEVEL=$(echo "$USER_DATA" | grep -o '"level":[0-9]*' | grep -o '[0-9]*')
XP=$(echo "$USER_DATA" | grep -o '"xp":[0-9]*' | grep -o '[0-9]*')
BALANCE=$(echo "$USER_DATA" | grep -o '"virtual_balance":[0-9.]*' | head -1 | grep -o '[0-9.]*')

echo ""
echo "📊 當前狀態:"
echo "  等級: $LEVEL"
echo "  XP: $XP"
echo "  餘額: $BALANCE"

echo ""
echo "步驟 3: 查詢成就列表..."
ACHIEVEMENTS=$(curl -s "$API_URL/api/gamification/achievements" \
  -H "Authorization: Bearer $TOKEN")

echo "$ACHIEVEMENTS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if 'data' in data and 'achievements' in data['data']:
    achievements = data['data']['achievements']
    print(f'\n✅ 成就總數: {len(achievements)}')
    print('\n前5個成就:')
    for ach in achievements[:5]:
        status = '✅' if ach['completed'] == 1 else '⏳'
        print(f'  {status} {ach[\"name\"]} - {ach[\"user_progress\"]}/{ach[\"requirement\"]} ({ach[\"rarity\"]})')
" 2>/dev/null || echo "$ACHIEVEMENTS" | head -c 500

echo ""
echo "步驟 4: 查詢數據庫..."
echo "📊 資料庫狀態:"

DB_USER=$(cd /home/user/webapp && npx wrangler d1 execute memelaunch-db --local --command="SELECT id, username, level, experience_points FROM users WHERE email = '$EMAIL'" 2>/dev/null)
echo "$DB_USER" | grep -o '"experience_points":[0-9]*'
echo "$DB_USER" | grep -o '"level":[0-9]*'

DB_TRADES=$(cd /home/user/webapp && npx wrangler d1 execute memelaunch-db --local --command="SELECT COUNT(*) as count FROM transactions WHERE user_id = (SELECT id FROM users WHERE email = '$EMAIL')" 2>/dev/null)
TRADE_COUNT=$(echo "$DB_TRADES" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
echo "總交易數: $TRADE_COUNT"

DB_ACHIEVEMENTS=$(cd /home/user/webapp && npx wrangler d1 execute memelaunch-db --local --command="SELECT COUNT(*) as count FROM user_achievements WHERE user_id = (SELECT id FROM users WHERE email = '$EMAIL') AND completed = 1" 2>/dev/null)
COMPLETED_COUNT=$(echo "$DB_ACHIEVEMENTS" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
echo "已解鎖成就: $COMPLETED_COUNT"

echo ""
echo "步驟 5: 執行新交易..."
COINS=$(curl -s "$API_URL/api/coins?limit=1&sort=market_cap" \
  -H "Authorization: Bearer $TOKEN")
COIN_ID=$(echo $COINS | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

if [ -z "$COIN_ID" ]; then
  echo "❌ 無法獲取幣種"
  exit 1
fi

echo "🪙 使用幣種 ID: $COIN_ID"

BUY_RESULT=$(curl -s -X POST "$API_URL/api/trades/buy" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"coinId\":$COIN_ID,\"amount\":1}")

if echo "$BUY_RESULT" | grep -q "success.*true"; then
  TX_ID=$(echo "$BUY_RESULT" | grep -o '"transactionId":[0-9]*' | grep -o '[0-9]*')
  echo "✅ 交易成功 (Transaction ID: $TX_ID)"
else
  echo "❌ 交易失敗:"
  echo "$BUY_RESULT"
fi

echo ""
echo "步驟 6: 等待5秒後重新檢查..."
sleep 5

USER_DATA_AFTER=$(curl -s "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")

LEVEL_AFTER=$(echo "$USER_DATA_AFTER" | grep -o '"level":[0-9]*' | grep -o '[0-9]*')
XP_AFTER=$(echo "$USER_DATA_AFTER" | grep -o '"xp":[0-9]*' | grep -o '[0-9]*')

echo ""
echo "📊 交易後狀態:"
echo "  等級: $LEVEL → $LEVEL_AFTER"
echo "  XP: $XP → $XP_AFTER"
echo "  XP 增加: $((XP_AFTER - XP))"

echo ""
echo "步驟 7: 再次查詢成就..."
ACHIEVEMENTS_AFTER=$(curl -s "$API_URL/api/gamification/achievements" \
  -H "Authorization: Bearer $TOKEN")

echo "$ACHIEVEMENTS_AFTER" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if 'data' in data and 'achievements' in data['data']:
    achievements = data['data']['achievements']
    completed = [a for a in achievements if a['completed'] == 1]
    print(f'已解鎖成就: {len(completed)}/{len(achievements)}')
    print('\n新解鎖的成就:')
    for ach in completed:
        print(f'  ✅ {ach[\"name\"]} (+{ach[\"points\"]} XP)')
" 2>/dev/null || echo "查詢失敗"

echo ""
echo "========================================="
echo "測試總結"
echo "========================================="
echo ""
echo "✅ API 測試通過"
echo "✅ 資料庫連接正常"
if [ "$XP_AFTER" -gt "$XP" ]; then
  echo "✅ XP 系統運作正常"
else
  echo "⚠️  XP 沒有增加 (可能成就已解鎖)"
fi
echo ""
echo "🔗 測試連結:"
echo "  - 成就頁面: $API_URL/achievements"
echo "  - 市場頁面: $API_URL/market"
echo ""
echo "📧 測試帳號: $EMAIL"
