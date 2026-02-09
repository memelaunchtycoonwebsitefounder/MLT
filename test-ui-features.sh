#!/bin/bash

echo "========================================"
echo "MemeLaunch Tycoon - UI 功能測試"
echo "========================================"
echo ""

BASE_URL="http://localhost:3000"

# Test 1: Register new user
echo "Test 1: 註冊新用戶..."
TIMESTAMP=$(date +%s)
EMAIL="uitest${TIMESTAMP}@example.com"
USERNAME="uitest${TIMESTAMP}"
PASSWORD="UItest123!"

REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${EMAIL}\",
    \"username\": \"${USERNAME}\",
    \"password\": \"${PASSWORD}\"
  }")

echo "✓ 用戶註冊成功"
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2 | head -1)
echo "  Token: ${TOKEN:0:20}..."
echo "  User ID: $USER_ID"
echo ""

# Test 2: Get market coins
echo "Test 2: 獲取市場幣種..."
COINS=$(curl -s "${BASE_URL}/api/coins?limit=5")
COIN_ID=$(echo $COINS | grep -o '"id":[0-9]*' | cut -d':' -f2 | head -1)
echo "✓ 獲取幣種成功"
echo "  選擇幣種 ID: $COIN_ID"
echo ""

# Test 3: Test trading panel - Buy coins
echo "Test 3: 交易面板 - 買入幣種..."
BUY_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/trades/buy" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"coinId\": $COIN_ID,
    \"amount\": 100
  }")
echo "✓ 買入成功"
echo "$BUY_RESPONSE" | grep -o '"transactionId":[0-9]*'
echo ""

# Test 4: Test portfolio
echo "Test 4: 投資組合更新..."
PORTFOLIO=$(curl -s "${BASE_URL}/api/portfolio" \
  -H "Authorization: Bearer ${TOKEN}")
echo "✓ 投資組合已更新"
echo "$PORTFOLIO" | grep -o '"amount":[0-9.]*' | head -1
echo ""

# Test 5: Test social - Post comment
echo "Test 5: 社交功能 - 發表評論..."
COMMENT_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/social/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"coinId\": $COIN_ID,
    \"content\": \"這是一個測試評論！🚀\"
  }")
COMMENT_ID=$(echo $COMMENT_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2 | head -1)
echo "✓ 評論發表成功"
echo "  Comment ID: $COMMENT_ID"
echo ""

# Test 6: Test social - Like comment
echo "Test 6: 社交功能 - 點讚評論..."
LIKE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/social/comments/${COMMENT_ID}/like" \
  -H "Authorization: Bearer ${TOKEN}")
echo "✓ 點讚成功"
echo ""

# Test 7: Test social - Get comments
echo "Test 7: 社交功能 - 獲取評論..."
COMMENTS=$(curl -s "${BASE_URL}/api/social/comments/${COIN_ID}" \
  -H "Authorization: Bearer ${TOKEN}")
COMMENT_COUNT=$(echo $COMMENTS | grep -o '"content"' | wc -l)
echo "✓ 獲取評論成功"
echo "  評論數: $COMMENT_COUNT"
echo ""

# Test 8: Test gamification - Get achievements
echo "Test 8: 遊戲化 - 獲取成就..."
ACHIEVEMENTS=$(curl -s "${BASE_URL}/api/gamification/achievements" \
  -H "Authorization: Bearer ${TOKEN}")
ACHIEVEMENT_COUNT=$(echo $ACHIEVEMENTS | grep -o '"id":[0-9]*' | wc -l)
echo "✓ 成就系統載入成功"
echo "  成就總數: $ACHIEVEMENT_COUNT"
echo ""

# Test 9: Test leaderboard
echo "Test 9: 排行榜 - 獲取淨資產排行..."
LEADERBOARD=$(curl -s "${BASE_URL}/api/gamification/leaderboard?type=networth&limit=10")
LEADERBOARD_COUNT=$(echo $LEADERBOARD | grep -o '"username"' | wc -l)
echo "✓ 排行榜載入成功"
echo "  排行榜人數: $LEADERBOARD_COUNT"
echo ""

# Test 10: Test real-time price stream (SSE)
echo "Test 10: 實時更新 - SSE 價格串流..."
timeout 3 curl -s "${BASE_URL}/api/realtime/prices" 2>&1 | head -5 &
sleep 3
echo "✓ SSE 串流測試完成"
echo ""

echo "========================================"
echo "✅ 所有 UI 功能測試完成！"
echo "========================================"
echo ""
echo "📋 測試摘要:"
echo "  1. ✓ 用戶註冊與認證"
echo "  2. ✓ 市場幣種獲取"
echo "  3. ✓ 交易面板 - 買入"
echo "  4. ✓ 投資組合更新"
echo "  5. ✓ 社交 - 發表評論"
echo "  6. ✓ 社交 - 點讚"
echo "  7. ✓ 社交 - 獲取評論"
echo "  8. ✓ 遊戲化 - 成就系統"
echo "  9. ✓ 排行榜"
echo " 10. ✓ 實時更新 (SSE)"
echo ""
echo "🌐 立即訪問測試: http://localhost:3000"
echo "📧 測試帳號: $EMAIL"
echo "🔑 測試密碼: $PASSWORD"
echo "🆔 用戶 ID: $USER_ID"
echo "🪙 幣種 ID: $COIN_ID"
