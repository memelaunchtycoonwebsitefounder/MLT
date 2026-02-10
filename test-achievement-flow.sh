#!/bin/bash

echo "========================================="
echo "成就系統完整流程測試 v2.3.3"
echo "========================================="

# API配置
API_URL="http://localhost:3000"
EMAIL="trade1770651466@example.com"
PASSWORD="Trade123!"

echo ""
echo "步驟 1: 登入測試帳號..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"userId":[0-9]*' | grep -o '[0-9]*')

if [ -z "$TOKEN" ]; then
  echo "❌ 登入失敗"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ 登入成功 (User ID: $USER_ID)"
echo "Token: ${TOKEN:0:20}..."

echo ""
echo "步驟 2: 檢查當前用戶資料..."
USER_DATA=$(curl -s "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")

echo "$USER_DATA" | grep -o '"level":[0-9]*' || echo "無等級資料"
echo "$USER_DATA" | grep -o '"experience_points":[0-9]*' || echo "無XP資料"
echo "$USER_DATA" | grep -o '"virtual_balance":[0-9.]*' | head -1 || echo "無餘額資料"

echo ""
echo "步驟 3: 檢查成就狀態..."
ACHIEVEMENTS=$(curl -s "$API_URL/api/gamification/achievements" \
  -H "Authorization: Bearer $TOKEN")

echo "📊 成就統計:"
echo "$ACHIEVEMENTS" | grep -o '"name":"[^"]*","description"[^}]*"user_progress":[0-9]*,"completed":[01]' | head -5 | while read line; do
  NAME=$(echo $line | grep -o '"name":"[^"]*' | cut -d'"' -f4)
  PROGRESS=$(echo $line | grep -o '"user_progress":[0-9]*' | grep -o '[0-9]*')
  COMPLETED=$(echo $line | grep -o '"completed":[01]' | grep -o '[01]')
  if [ "$COMPLETED" = "1" ]; then
    echo "  ✅ $NAME - 已完成 (進度: $PROGRESS)"
  else
    echo "  ⏳ $NAME - 進行中 (進度: $PROGRESS)"
  fi
done

echo ""
echo "步驟 4: 檢查資料庫交易記錄..."
TRADE_COUNT=$(cd /home/user/webapp && npx wrangler d1 execute memelaunch-db --local --command="SELECT COUNT(*) as count FROM transactions WHERE user_id = $USER_ID" 2>/dev/null | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
echo "總交易數: $TRADE_COUNT"

echo ""
echo "步驟 5: 檢查資料庫用戶XP..."
DB_XP=$(cd /home/user/webapp && npx wrangler d1 execute memelaunch-db --local --command="SELECT experience_points, level FROM users WHERE id = $USER_ID" 2>/dev/null | grep -o '"experience_points":[0-9]*' | grep -o '[0-9]*')
DB_LEVEL=$(cd /home/user/webapp && npx wrangler d1 execute memelaunch-db --local --command="SELECT experience_points, level FROM users WHERE id = $USER_ID" 2>/dev/null | grep -o '"level":[0-9]*' | grep -o '[0-9]*')
echo "資料庫 XP: $DB_XP"
echo "資料庫 Level: $DB_LEVEL"

echo ""
echo "步驟 6: 執行一筆新交易..."
COINS=$(curl -s "$API_URL/api/coins?limit=1&sort=market_cap" \
  -H "Authorization: Bearer $TOKEN")
COIN_ID=$(echo $COINS | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

if [ -z "$COIN_ID" ]; then
  echo "❌ 無法獲取幣種ID"
  exit 1
fi

echo "使用幣種 ID: $COIN_ID"

BUY_RESPONSE=$(curl -s -X POST "$API_URL/api/trades/buy" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"coinId\":$COIN_ID,\"amount\":5}")

if echo "$BUY_RESPONSE" | grep -q "success.*true"; then
  echo "✅ 交易成功"
  echo "$BUY_RESPONSE" | grep -o '"transactionId":[0-9]*'
else
  echo "❌ 交易失敗"
  echo "$BUY_RESPONSE"
fi

echo ""
echo "步驟 7: 等待3秒後檢查成就更新..."
sleep 3

ACHIEVEMENTS_AFTER=$(curl -s "$API_URL/api/gamification/achievements" \
  -H "Authorization: Bearer $TOKEN")

echo "📊 交易後成就狀態:"
echo "$ACHIEVEMENTS_AFTER" | grep -o '"name":"[^"]*","description"[^}]*"user_progress":[0-9]*,"completed":[01]' | head -5 | while read line; do
  NAME=$(echo $line | grep -o '"name":"[^"]*' | cut -d'"' -f4)
  PROGRESS=$(echo $line | grep -o '"user_progress":[0-9]*' | grep -o '[0-9]*')
  COMPLETED=$(echo $line | grep -o '"completed":[01]' | grep -o '[01]')
  if [ "$COMPLETED" = "1" ]; then
    echo "  ✅ $NAME - 已完成 (進度: $PROGRESS)"
  else
    echo "  ⏳ $NAME - 進行中 (進度: $PROGRESS)"
  fi
done

echo ""
echo "步驟 8: 檢查XP更新..."
USER_DATA_AFTER=$(curl -s "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")

LEVEL_AFTER=$(echo "$USER_DATA_AFTER" | grep -o '"level":[0-9]*' | grep -o '[0-9]*')
XP_AFTER=$(echo "$USER_DATA_AFTER" | grep -o '"experience_points":[0-9]*' | grep -o '[0-9]*')

echo "交易後等級: $LEVEL_AFTER"
echo "交易後 XP: $XP_AFTER"

echo ""
echo "========================================="
echo "測試完成！"
echo "========================================="
echo ""
echo "📋 總結:"
echo "  - 總交易數: $TRADE_COUNT"
echo "  - 資料庫 XP: $DB_XP"
echo "  - API 回傳 XP: $XP_AFTER"
echo "  - 等級: $LEVEL_AFTER"
echo ""
echo "🔍 診斷:"
if [ "$DB_XP" = "$XP_AFTER" ] && [ "$XP_AFTER" -gt "0" ]; then
  echo "  ✅ XP系統運作正常"
else
  echo "  ⚠️ XP系統可能有問題"
  echo "     資料庫XP ($DB_XP) 與 API XP ($XP_AFTER) 不一致"
fi

echo ""
echo "測試頁面: $API_URL/achievements"
echo "測試帳號: $EMAIL / $PASSWORD"
