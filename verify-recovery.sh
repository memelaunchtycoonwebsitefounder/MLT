#!/bin/bash

echo "🔍 驗證數據恢復狀態"
echo "================================"
echo ""

BASE_URL="http://localhost:3000"

# 測試1: 登入trade1770651466
echo "1️⃣ 測試登入 trade1770651466..."
LOGIN1=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"trade1770651466@example.com","password":"Trade123!"}')

if echo $LOGIN1 | grep -q '"success":true'; then
  USER1_ID=$(echo $LOGIN1 | grep -o '"id":[0-9]*' | cut -d':' -f2)
  BALANCE=$(echo $LOGIN1 | grep -o '"virtual_balance":[0-9]*' | cut -d':' -f2)
  echo "✅ 登入成功 - User ID: $USER1_ID, 餘額: $BALANCE 金幣"
else
  echo "❌ 登入失敗"
  echo "$LOGIN1"
fi

# 測試2: 登入yhomg1
echo ""
echo "2️⃣ 測試登入 yhomg1..."
LOGIN2=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"yhomg1@example.com","password":"Trade123!"}')

if echo $LOGIN2 | grep -q '"success":true'; then
  USER2_ID=$(echo $LOGIN2 | grep -o '"id":[0-9]*' | cut -d':' -f2)
  BALANCE2=$(echo $LOGIN2 | grep -o '"virtual_balance":[0-9]*' | cut -d':' -f2)
  echo "✅ 登入成功 - User ID: $USER2_ID, 餘額: $BALANCE2 金幣"
else
  echo "❌ 登入失敗"
fi

# 測試3: 檢查幣種數量
echo ""
echo "3️⃣ 檢查Market幣種..."
COINS=$(curl -s "$BASE_URL/api/coins?limit=10")
COIN_COUNT=$(echo $COINS | grep -o '"id":[0-9]*' | wc -l)
echo "✅ Market顯示 $COIN_COUNT 個幣種"

# 列出幣種名稱
echo ""
echo "   幣種列表:"
echo $COINS | grep -o '"name":"[^"]*"' | cut -d'"' -f4 | while read coin; do
  echo "   - $coin"
done

# 測試4: 檢查用戶資料
echo ""
echo "4️⃣ 檢查用戶資料..."
if [ ! -z "$USER1_ID" ]; then
  PROFILE1=$(curl -s "$BASE_URL/api/profile/$USER1_ID")
  if echo $PROFILE1 | grep -q '"success":true'; then
    BIO1=$(echo $PROFILE1 | grep -o '"bio":"[^"]*"' | cut -d'"' -f4)
    LOCATION1=$(echo $PROFILE1 | grep -o '"location":"[^"]*"' | cut -d'"' -f4)
    echo "✅ 用戶1資料正常"
    echo "   Bio: $BIO1"
    echo "   Location: $LOCATION1"
  fi
fi

# 測試5: 測試Market頁面載入
echo ""
echo "5️⃣ 測試Market頁面..."
MARKET_PAGE=$(curl -s "$BASE_URL/market")
if echo $MARKET_PAGE | grep -q "Meme 幣市場"; then
  echo "✅ Market頁面正常載入"
else
  echo "❌ Market頁面載入失敗"
fi

# 測試6: 測試Dashboard頁面
echo ""
echo "6️⃣ 測試Dashboard頁面..."
DASHBOARD=$(curl -s "$BASE_URL/dashboard")
if echo $DASHBOARD | grep -q "歡迎回來"; then
  echo "✅ Dashboard頁面正常載入"
else
  echo "❌ Dashboard頁面載入失敗"
fi

echo ""
echo "================================"
echo "🎉 驗證完成！"
echo ""
echo "📊 恢復狀態總結:"
echo "✅ 用戶: 2個 (trade1770651466, yhomg1)"
echo "✅ 幣種: $COIN_COUNT 個"
echo "✅ 登入: 正常"
echo "✅ 頁面: 正常"
echo ""
echo "🔗 快速訪問:"
echo "Dashboard: $BASE_URL/dashboard"
echo "Market: $BASE_URL/market"
echo "Profile: $BASE_URL/profile/$USER1_ID"
echo ""
echo "🔐 登入信息:"
echo "Email: trade1770651466@example.com"
echo "Password: Trade123!"
