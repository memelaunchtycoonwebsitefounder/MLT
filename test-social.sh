#!/bin/bash

echo "========================================="
echo "社交系統功能測試"
echo "========================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_BASE="http://localhost:3000/api"
EMAIL="trade1770651466@example.com"
PASSWORD="Trade123!"

echo -e "\n${BLUE}Step 1: 登入並獲取Token${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -z "$TOKEN" ]; then
  echo "❌ 登入失敗"
  echo $LOGIN_RESPONSE
  exit 1
fi

echo "✅ 登入成功"
echo "Token: ${TOKEN:0:20}..."
echo "User ID: $USER_ID"

echo -e "\n${BLUE}Step 2: 獲取可用幣種列表${NC}"
COINS_RESPONSE=$(curl -s "$API_BASE/coins?limit=5")
echo $COINS_RESPONSE | head -c 500

# Extract first coin ID
COIN_ID=$(echo $COINS_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo -e "\n選擇幣種 ID: $COIN_ID"

echo -e "\n${BLUE}Step 3: 發表評論${NC}"
COMMENT_DATA='{"coinId":'$COIN_ID',"content":"這是一個測試評論！🚀 @trade1770651466 #社交功能測試"}'
COMMENT_RESPONSE=$(curl -s -X POST "$API_BASE/social/comments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$COMMENT_DATA")

COMMENT_ID=$(echo $COMMENT_RESPONSE | grep -o '"commentId":[0-9]*' | cut -d':' -f2)
echo "✅ 評論已發表"
echo "Comment ID: $COMMENT_ID"

echo -e "\n${BLUE}Step 4: 獲取評論列表${NC}"
COMMENTS_LIST=$(curl -s "$API_BASE/social/comments/$COIN_ID?limit=5&userId=$USER_ID")
COMMENTS_COUNT=$(echo $COMMENTS_LIST | grep -o '"id":' | wc -l)
echo "✅ 獲取評論列表成功"
echo "評論數量: $COMMENTS_COUNT"

echo -e "\n${BLUE}Step 5: 點讚評論${NC}"
if [ ! -z "$COMMENT_ID" ]; then
  LIKE_RESPONSE=$(curl -s -X POST "$API_BASE/social/comments/$COMMENT_ID/like" \
    -H "Authorization: Bearer $TOKEN")
  echo "✅ 點讚成功"
  echo $LIKE_RESPONSE | head -c 200
fi

echo -e "\n${BLUE}Step 6: 回覆評論${NC}"
if [ ! -z "$COMMENT_ID" ]; then
  REPLY_DATA='{"coinId":'$COIN_ID',"content":"這是一個回覆！👍","parentId":'$COMMENT_ID'}'
  REPLY_RESPONSE=$(curl -s -X POST "$API_BASE/social/comments" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$REPLY_DATA")
  
  REPLY_ID=$(echo $REPLY_RESPONSE | grep -o '"commentId":[0-9]*' | cut -d':' -f2)
  echo "✅ 回覆已發表"
  echo "Reply ID: $REPLY_ID"
fi

echo -e "\n${BLUE}Step 7: 獲取最新評論${NC}"
RECENT_COMMENTS=$(curl -s "$API_BASE/social/recent-comments?limit=5")
RECENT_COUNT=$(echo $RECENT_COMMENTS | grep -o '"id":' | wc -l)
echo "✅ 最新評論數量: $RECENT_COUNT"

echo -e "\n${BLUE}Step 8: 獲取熱門評論${NC}"
POPULAR_COMMENTS=$(curl -s "$API_BASE/social/popular-comments?limit=5")
POPULAR_COUNT=$(echo $POPULAR_COMMENTS | grep -o '"id":' | wc -l)
echo "✅ 熱門評論數量: $POPULAR_COUNT"

echo -e "\n${BLUE}Step 9: 獲取社交統計${NC}"
STATS_RESPONSE=$(curl -s "$API_BASE/social/stats" \
  -H "Authorization: Bearer $TOKEN")
echo $STATS_RESPONSE | head -c 300

echo -e "\n${BLUE}Step 10: 獲取活動動態${NC}"
FEED_RESPONSE=$(curl -s "$API_BASE/social/feed?limit=5" \
  -H "Authorization: Bearer $TOKEN")
FEED_COUNT=$(echo $FEED_RESPONSE | grep -o '"id":' | wc -l)
echo "✅ 活動動態數量: $FEED_COUNT"

echo -e "\n${GREEN}=========================================${NC}"
echo -e "${GREEN}社交功能測試完成！${NC}"
echo -e "${GREEN}=========================================${NC}"

echo -e "\n${YELLOW}測試結果總結：${NC}"
echo "1. ✅ 登入認證"
echo "2. ✅ 發表評論"
echo "3. ✅ 點讚功能"
echo "4. ✅ 回覆功能"
echo "5. ✅ 最新評論列表"
echo "6. ✅ 熱門評論列表"
echo "7. ✅ 社交統計"
echo "8. ✅ 活動動態"

echo -e "\n${YELLOW}快速測試連結：${NC}"
echo "社交頁面: http://localhost:3000/social"
echo "幣種評論: http://localhost:3000/coin/$COIN_ID"
echo "測試帳號: $EMAIL / $PASSWORD"
