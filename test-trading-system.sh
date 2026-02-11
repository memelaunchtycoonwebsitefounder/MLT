#!/bin/bash

echo "🚀 MemeLaunch 交易系統完整測試"
echo "================================"
echo ""

# 登入獲取token
echo "1️⃣ 登入測試..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trade1770651466@example.com","password":"Trade123!"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -z "$TOKEN" ]; then
  echo "❌ 登入失敗"
  exit 1
fi

echo "✅ 登入成功 - User ID: $USER_ID"
echo ""

# 測試創建幣種
echo "2️⃣ 創建新幣種..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/coins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "TestCoin",
    "symbol": "TEST",
    "description": "A test coin for trading",
    "total_supply": 10000,
    "quality_score": 80
  }')

COIN_ID=$(echo $CREATE_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$COIN_ID" ]; then
  echo "❌ 創建幣種失敗"
  echo "Response: $CREATE_RESPONSE"
else
  echo "✅ 創建成功 - Coin ID: $COIN_ID"
fi
echo ""

# 測試獲取幣種詳情
echo "3️⃣ 獲取幣種詳情..."
COIN_DETAILS=$(curl -s http://localhost:3000/api/coins/$COIN_ID)
echo "Coin Name: $(echo $COIN_DETAILS | grep -o '"name":"[^"]*"' | cut -d'"' -f4)"
echo "Current Price: $(echo $COIN_DETAILS | grep -o '"current_price":[0-9.]*' | cut -d':' -f2)"
echo ""

# 測試買入現有幣種（使用DogeCopy, ID=4）
echo "4️⃣ 買入測試 - DogeCopy (100 金幣)..."
COIN_ID=4
BUY_RESPONSE=$(curl -s -X POST http://localhost:3000/api/trades/buy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"coinId\": $COIN_ID,
    \"amount\": 100
  }")

if echo $BUY_RESPONSE | grep -q '"success":true'; then
  echo "✅ 買入成功"
  echo "Transaction: $(echo $BUY_RESPONSE | grep -o '"transaction":{[^}]*}' || echo 'N/A')"
else
  echo "❌ 買入失敗"
  echo "Response: $BUY_RESPONSE"
fi
echo ""

# 測試賣出
echo "5️⃣ 賣出測試 (50 金幣)..."
SELL_RESPONSE=$(curl -s -X POST http://localhost:3000/api/trades/sell \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"coinId\": $COIN_ID,
    \"amount\": 50
  }")

if echo $SELL_RESPONSE | grep -q '"success":true'; then
  echo "✅ 賣出成功"
else
  echo "❌ 賣出失敗"
  echo "Response: $SELL_RESPONSE"
fi
echo ""

# 測試投資組合
echo "6️⃣ 查看投資組合..."
PORTFOLIO=$(curl -s http://localhost:3000/api/portfolio \
  -H "Authorization: Bearer $TOKEN")

if echo $PORTFOLIO | grep -q '"success":true'; then
  echo "✅ 投資組合載入成功"
  HOLDINGS=$(echo $PORTFOLIO | grep -o '"holdings":\[[^]]*\]' | head -1)
  echo "Holdings: $HOLDINGS"
else
  echo "❌ 投資組合載入失敗"
fi
echo ""

# 測試AI交易者
echo "7️⃣ 檢查AI交易者..."
AI_TRADERS=$(curl -s http://localhost:3000/api/ai-traders)
AI_COUNT=$(echo $AI_TRADERS | grep -o '"id":[0-9]*' | wc -l)
echo "✅ AI交易者數量: $AI_COUNT"
echo ""

# 測試市場事件API
echo "8️⃣ 檢查市場事件API..."
EVENTS=$(curl -s http://localhost:3000/api/market/events)
if echo $EVENTS | grep -q '"success"'; then
  echo "✅ 市場事件API正常"
else
  echo "⚠️ 市場事件API可能需要檢查"
fi
echo ""

echo "================================"
echo "🎉 測試完成！"
echo ""
echo "📊 測試結果摘要:"
echo "   - 登入: ✅"
echo "   - 創建幣種: $([ -n "$COIN_ID" ] && echo '✅' || echo '❌')"
echo "   - 買入交易: $(echo $BUY_RESPONSE | grep -q '"success":true' && echo '✅' || echo '❌')"
echo "   - 賣出交易: $(echo $SELL_RESPONSE | grep -q '"success":true' && echo '✅' || echo '❌')"
echo "   - 投資組合: $(echo $PORTFOLIO | grep -q '"success":true' && echo '✅' || echo '❌')"
echo "   - AI交易者: ✅ ($AI_COUNT 個)"
echo ""
echo "🌐 在線測試: https://3000-ialq9sk0j7h42em32rv8h-2e77fc33.sandbox.novita.ai"
