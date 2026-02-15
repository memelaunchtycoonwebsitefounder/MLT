#!/bin/bash
echo "🔍 MemeLaunch 綜合診斷測試"
echo "================================"

# 登入獲取token
echo ""
echo "1️⃣ 登入測試..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trade1770651466@example.com","password":"Trade123!"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ 登入失敗"
  echo "$LOGIN_RESPONSE" | jq '.'
  exit 1
fi

echo "✅ 登入成功"
USER_ID=$(echo $LOGIN_RESPONSE | jq -r '.data.user.id')
BALANCE=$(echo $LOGIN_RESPONSE | jq -r '.data.user.virtual_balance')
echo "   用戶ID: $USER_ID"
echo "   餘額: $BALANCE 金幣"

# 測試買入功能
echo ""
echo "2️⃣ 測試買入功能..."
BUY_RESPONSE=$(curl -s -X POST http://localhost:3000/api/trades/buy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"coinId":4,"amount":10}')

BUY_SUCCESS=$(echo $BUY_RESPONSE | jq -r '.success')
if [ "$BUY_SUCCESS" = "true" ]; then
  echo "✅ 買入成功"
  NEW_BALANCE=$(echo $BUY_RESPONSE | jq -r '.data.newBalance')
  echo "   新餘額: $NEW_BALANCE 金幣"
else
  echo "❌ 買入失敗"
  echo "$BUY_RESPONSE" | jq '.'
fi

# 測試賣出功能
echo ""
echo "3️⃣ 測試賣出功能..."
SELL_RESPONSE=$(curl -s -X POST http://localhost:3000/api/trades/sell \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"coinId":4,"amount":5}')

SELL_SUCCESS=$(echo $SELL_RESPONSE | jq -r '.success')
if [ "$SELL_SUCCESS" = "true" ]; then
  echo "✅ 賣出成功"
  NEW_BALANCE=$(echo $SELL_RESPONSE | jq -r '.data.newBalance')
  echo "   新餘額: $NEW_BALANCE 金幣"
else
  echo "❌ 賣出失敗"
  echo "$SELL_RESPONSE" | jq '.'
fi

# 測試評論API
echo ""
echo "4️⃣ 測試評論系統..."
COMMENTS_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/social/comments/4" \
  -H "Authorization: Bearer $TOKEN")

COMMENTS_SUCCESS=$(echo $COMMENTS_RESPONSE | jq -r '.success')
if [ "$COMMENTS_SUCCESS" = "true" ]; then
  COMMENTS_COUNT=$(echo $COMMENTS_RESPONSE | jq -r '.data.comments | length')
  echo "✅ 評論API正常"
  echo "   評論數: $COMMENTS_COUNT"
else
  echo "❌ 評論API失敗"
  echo "$COMMENTS_RESPONSE" | jq '.'
fi

# 測試幣種詳情API
echo ""
echo "5️⃣ 測試幣種詳情API..."
COIN_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/coins/4" \
  -H "Authorization: Bearer $TOKEN")

COIN_SUCCESS=$(echo $COIN_RESPONSE | jq -r '.success')
if [ "$COIN_SUCCESS" = "true" ]; then
  COIN_NAME=$(echo $COIN_RESPONSE | jq -r '.data.coin.name')
  COIN_PRICE=$(echo $COIN_RESPONSE | jq -r '.data.coin.current_price')
  echo "✅ 幣種API正常"
  echo "   名稱: $COIN_NAME"
  echo "   價格: \$$COIN_PRICE"
else
  echo "❌ 幣種API失敗"
  echo "$COIN_RESPONSE" | jq '.'
fi

# 測試價格歷史API
echo ""
echo "6️⃣ 測試價格歷史API..."
HISTORY_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/coins/4/price-history?limit=5" \
  -H "Authorization: Bearer $TOKEN")

HISTORY_SUCCESS=$(echo $HISTORY_RESPONSE | jq -r '.success')
if [ "$HISTORY_SUCCESS" = "true" ]; then
  HISTORY_COUNT=$(echo $HISTORY_RESPONSE | jq -r '.data.data | length')
  echo "✅ 價格歷史API正常"
  echo "   記錄數: $HISTORY_COUNT"
else
  echo "❌ 價格歷史API失敗"
  echo "$HISTORY_RESPONSE" | jq '.'
fi

echo ""
echo "================================"
echo "✅ 診斷完成！"
