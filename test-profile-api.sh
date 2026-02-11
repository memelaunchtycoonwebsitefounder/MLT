#!/bin/bash

echo "=== 用戶資料系統API測試 ==="

# Get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trade1770651466@example.com","password":"Trade123!"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

USER_ID=$(curl -s http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN" \
  | grep -o '"id":[0-9]*' | cut -d':' -f2)

echo -e "\n【1/7】登入成功 - User ID: $USER_ID"

# Test 1: Get user profile
echo -e "\n【2/7】獲取用戶資料..."
PROFILE=$(curl -s http://localhost:3000/api/profile/$USER_ID \
  -H "Authorization: Bearer $TOKEN")
echo "$PROFILE" | head -200
echo "$(echo $PROFILE | grep -o '"success":true' && echo "✅ 獲取成功" || echo "❌ 獲取失敗")"

# Test 2: Update profile
echo -e "\n【3/7】更新用戶資料..."
UPDATE=$(curl -s -X PATCH http://localhost:3000/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bio":"這是我的個人簡介 🚀","location":"Taiwan","website":"https://example.com"}')
echo "$UPDATE" | head -100
echo "$(echo $UPDATE | grep -o '"success":true' && echo "✅ 更新成功" || echo "❌ 更新失敗")"

# Test 3: Get trade history
echo -e "\n【4/7】獲取交易記錄..."
TRADES=$(curl -s "http://localhost:3000/api/profile/$USER_ID/trades?limit=5" \
  -H "Authorization: Bearer $TOKEN")
TRADE_COUNT=$(echo $TRADES | grep -o '"id":[0-9]*' | wc -l)
echo "交易記錄數: $TRADE_COUNT"
echo "$(echo $TRADES | grep -o '"success":true' && echo "✅ 獲取成功" || echo "❌ 獲取失敗")"

# Test 4: Get achievements
echo -e "\n【5/7】獲取成就..."
ACHIEVEMENTS=$(curl -s "http://localhost:3000/api/profile/$USER_ID/achievements" \
  -H "Authorization: Bearer $TOKEN")
ACHIEVEMENT_COUNT=$(echo $ACHIEVEMENTS | grep -o '"key":"[^"]*"' | wc -l)
echo "成就數: $ACHIEVEMENT_COUNT"
echo "$(echo $ACHIEVEMENTS | grep -o '"success":true' && echo "✅ 獲取成功" || echo "❌ 獲取失敗")"

# Test 5: Follow a user (user 16)
echo -e "\n【6/7】關注用戶..."
FOLLOW=$(curl -s -X POST http://localhost:3000/api/profile/16/follow \
  -H "Authorization: Bearer $TOKEN")
echo "$(echo $FOLLOW | grep -o '"success":true' && echo "✅ 關注成功" || echo "$(echo $FOLLOW | head -100)")"

# Test 6: Get followers
echo -e "\n【7/7】獲取粉絲列表..."
FOLLOWERS=$(curl -s "http://localhost:3000/api/profile/$USER_ID/followers" \
  -H "Authorization: Bearer $TOKEN")
FOLLOWERS_COUNT=$(echo $FOLLOWERS | grep -o '"id":[0-9]*' | wc -l)
echo "粉絲數: $FOLLOWERS_COUNT"
echo "$(echo $FOLLOWERS | grep -o '"success":true' && echo "✅ 獲取成功" || echo "❌ 獲取失敗")"

echo -e "\n========================================="
echo "API測試完成！"
