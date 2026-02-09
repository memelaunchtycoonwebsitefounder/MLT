#!/bin/bash

API_BASE="http://localhost:3000"
EMAIL="flow$(date +%s)@example.com"
PASSWORD="Flow123!"

echo "=========================================="
echo "完整流程測試"
echo "=========================================="

# 1. 註冊測試
echo -e "\n[Test 1] 註冊新用戶..."
SIGNUP_RESPONSE=$(curl -s -X POST "$API_BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"username\":\"flowtest$(date +%s)\"}")
echo "註冊響應: $SIGNUP_RESPONSE"
TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: ${TOKEN:0:50}..."

# 2. 驗證 token
echo -e "\n[Test 2] 驗證登入狀態..."
AUTH_CHECK=$(curl -s "$API_BASE/api/auth/me" -H "Authorization: Bearer $TOKEN")
echo "認證檢查: $AUTH_CHECK"

# 3. 獲取市場幣種
echo -e "\n[Test 3] 獲取市場幣種..."
COINS=$(curl -s "$API_BASE/api/coins?limit=5")
COIN_ID=$(echo $COINS | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "選擇幣種 ID: $COIN_ID"

# 4. 測試買入
echo -e "\n[Test 4] 買入測試 (10 幣)..."
BUY_RESPONSE=$(curl -s -X POST "$API_BASE/api/trades/buy" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"coinId\":$COIN_ID,\"amount\":10}")
echo "買入響應: $BUY_RESPONSE"

# 5. 檢查投資組合
echo -e "\n[Test 5] 檢查投資組合..."
PORTFOLIO=$(curl -s "$API_BASE/api/portfolio" -H "Authorization: Bearer $TOKEN")
echo "投資組合: $PORTFOLIO"

# 6. 檢查交易歷史
echo -e "\n[Test 6] 檢查交易歷史..."
HISTORY=$(curl -s "$API_BASE/api/trades/history?coinId=$COIN_ID&limit=5" \
  -H "Authorization: Bearer $TOKEN")
echo "交易歷史: $HISTORY"

# 7. 測試 SSE 連接
echo -e "\n[Test 7] 測試實時價格串流 (5秒)..."
timeout 5 curl -N -s "$API_BASE/api/realtime/prices" | head -15

# 8. 測試成就系統
echo -e "\n[Test 8] 檢查成就..."
ACHIEVEMENTS=$(curl -s "$API_BASE/api/gamification/achievements" \
  -H "Authorization: Bearer $TOKEN")
ACHIEVEMENT_COUNT=$(echo $ACHIEVEMENTS | grep -o '"id"' | wc -l)
echo "成就總數: $ACHIEVEMENT_COUNT"

# 9. 測試排行榜
echo -e "\n[Test 9] 檢查排行榜..."
LEADERBOARD=$(curl -s "$API_BASE/api/gamification/leaderboard?type=networth&limit=3")
echo "排行榜前3: $LEADERBOARD"

# 10. 測試訂單創建
echo -e "\n[Test 10] 創建限價單..."
ORDER=$(curl -s -X POST "$API_BASE/api/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"coinId\":$COIN_ID,\"type\":\"limit\",\"side\":\"buy\",\"amount\":5,\"price\":0.015}")
echo "訂單響應: $ORDER"

echo -e "\n=========================================="
echo "✅ 完整流程測試完成"
echo "=========================================="
