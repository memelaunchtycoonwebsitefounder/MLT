#!/bin/bash

echo "🧪 完整功能測試"
echo "==============="

# 測試登入
echo ""
echo "📝 Step 1: 測試登入..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }')

# 提取 token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // empty' 2>/dev/null)

if [ -n "$TOKEN" ]; then
  echo "✅ 登入成功！"
  
  # 測試用戶資訊 API
  echo ""
  echo "📝 Step 2: 測試用戶資訊 API..."
  ME_RESPONSE=$(curl -s -X GET http://localhost:3000/api/auth/me \
    -H "Authorization: Bearer $TOKEN")
  
  USER_EMAIL=$(echo "$ME_RESPONSE" | jq -r '.data.email // empty' 2>/dev/null)
  USER_BALANCE=$(echo "$ME_RESPONSE" | jq -r '.data.virtual_balance // empty' 2>/dev/null)
  
  if [ -n "$USER_EMAIL" ]; then
    echo "✅ 用戶資訊正常"
    echo "   Email: $USER_EMAIL"
    echo "   餘額: $USER_BALANCE"
  else
    echo "❌ 用戶資訊 API 失敗"
  fi
  
  # 測試幣種列表 API
  echo ""
  echo "📝 Step 3: 測試幣種列表 API..."
  COINS_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/coins?sort=holders")
  
  COINS_COUNT=$(echo "$COINS_RESPONSE" | jq -r '.data.coins | length // 0' 2>/dev/null)
  
  if [ "$COINS_COUNT" -gt 0 ]; then
    echo "✅ 幣種列表正常 ($COINS_COUNT 個幣種)"
    echo "$COINS_RESPONSE" | jq -r '.data.coins[0:3] | .[] | "   \(.id). \(.name) (\(.symbol)) - $\(.current_price)"' 2>/dev/null
  else
    echo "❌ 幣種列表 API 失敗"
  fi
  
  # 測試價格歷史 API (Coin ID 1)
  echo ""
  echo "📝 Step 4: 測試價格歷史 API (Test Coin)..."
  HISTORY_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/coins/1/price-history?timeframe=1h")
  
  HISTORY_COUNT=$(echo "$HISTORY_RESPONSE" | jq -r '.data | length // 0' 2>/dev/null)
  
  if [ "$HISTORY_COUNT" -gt 0 ]; then
    echo "✅ 價格歷史正常 ($HISTORY_COUNT 筆記錄)"
    echo "$HISTORY_RESPONSE" | jq -r '.data[-3:] | .[] | "   \(.timestamp): $\(.price) (Vol: \(.volume))"' 2>/dev/null
  else
    echo "❌ 價格歷史 API 失敗"
  fi
  
else
  echo "❌ 登入失敗"
  echo "$LOGIN_RESPONSE" | jq '.'
fi

echo ""
echo "==============="
echo "✅ 測試完成！"
echo ""
echo "🔗 測試網址:"
echo "   主頁: https://3000-ialq9sk0j7h42em32rv8h-2e77fc33.sandbox.novita.ai"
echo "   Test Coin: https://3000-ialq9sk0j7h42em32rv8h-2e77fc33.sandbox.novita.ai/coin/1"
echo "   Moon Token: https://3000-ialq9sk0j7h42em32rv8h-2e77fc33.sandbox.novita.ai/coin/2"
echo ""
echo "📝 測試帳號:"
echo "   Email: test@example.com"
echo "   Password: Test123!"
echo "   餘額: 10,000 coins"
echo ""

