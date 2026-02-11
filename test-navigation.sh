#!/bin/bash

echo "🧭 MemeLaunch 導航系統測試"
echo "================================"
echo ""

BASE_URL="http://localhost:3000"

# 註冊測試用戶
echo "1️⃣ 註冊測試用戶..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "navtest@example.com",
    "username": "NavTestUser",
    "password": "Test123!"
  }')

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

echo "✅ 用戶已註冊: ID $USER_ID"
echo "Token: ${TOKEN:0:20}..."
echo ""

# 測試Dashboard頁面
echo "2️⃣ 測試Dashboard頁面..."
DASHBOARD=$(curl -s "$BASE_URL/dashboard" | grep -o "查看資料")
if [ ! -z "$DASHBOARD" ]; then
  echo "✅ Dashboard包含'查看資料'按鈕"
else
  echo "❌ Dashboard缺少'查看資料'按鈕"
fi
echo ""

# 測試Profile頁面
echo "3️⃣ 測試Profile頁面..."
PROFILE=$(curl -s "$BASE_URL/profile/$USER_ID" | grep -o "返回Dashboard")
if [ ! -z "$PROFILE" ]; then
  echo "✅ Profile頁面包含'返回Dashboard'按鈕"
else
  echo "❌ Profile頁面缺少'返回Dashboard'按鈕"
fi
echo ""

# 測試評論頭像功能
echo "4️⃣ 測試評論中的頭像鏈接..."
# 檢查comments-simple.js是否包含profile鏈接
COMMENT_LINK=$(grep -o 'href="/profile/' /home/user/webapp/public/static/comments-simple.js | wc -l)
if [ $COMMENT_LINK -gt 0 ]; then
  echo "✅ 評論系統包含 $COMMENT_LINK 個用戶資料鏈接"
else
  echo "❌ 評論系統缺少用戶資料鏈接"
fi
echo ""

# 測試Market頁面創建者鏈接
echo "5️⃣ 測試Market頁面創建者鏈接..."
MARKET_LINK=$(grep -o 'href="/profile/' /home/user/webapp/public/static/market.js | wc -l)
if [ $MARKET_LINK -gt 0 ]; then
  echo "✅ Market頁面包含創建者資料鏈接"
else
  echo "❌ Market頁面缺少創建者資料鏈接"
fi
echo ""

# 測試API端點
echo "6️⃣ 測試Profile API..."
PROFILE_API=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/profile/$USER_ID" | grep -o '"success":true')
if [ ! -z "$PROFILE_API" ]; then
  echo "✅ Profile API正常工作"
else
  echo "❌ Profile API失敗"
fi
echo ""

echo "================================"
echo "🎉 導航系統測試完成！"
echo ""
echo "🔗 快速訪問鏈接："
echo "Dashboard: $BASE_URL/dashboard"
echo "Profile:   $BASE_URL/profile/$USER_ID"
echo "Market:    $BASE_URL/market"
echo ""
echo "📧 測試帳號: navtest@example.com"
echo "🔑 密碼: Test123!"
