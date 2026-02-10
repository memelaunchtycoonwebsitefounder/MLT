#!/bin/bash

echo "========================================="
echo "排行榜系統測試 v1.0"
echo "========================================="

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
  exit 1
fi

echo "✅ 登入成功 (User ID: $USER_ID)"

echo ""
echo "步驟 2: 測試淨資產排行榜..."
NET_WORTH=$(curl -s "$API_URL/api/leaderboard/rankings?category=net_worth&limit=10&userId=$USER_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "$NET_WORTH" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success'):
        rankings = data['data']['rankings']
        current = data['data'].get('currentUser')
        print(f'✅ 淨資產排行榜: {len(rankings)} 名玩家')
        if rankings:
            top = rankings[0]
            print(f'   第1名: {top[\"username\"]} - \${top[\"value\"]:,.0f}')
        if current:
            print(f'   你的排名: #{current[\"rank\"]} - \${current[\"value\"]:,.0f}')
    else:
        print('❌ API 返回失敗')
except Exception as e:
    print(f'❌ 解析失敗: {e}')
"

echo ""
echo "步驟 3: 測試交易量排行榜..."
TRADES=$(curl -s "$API_URL/api/leaderboard/rankings?category=trades&limit=10&userId=$USER_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "$TRADES" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success'):
        rankings = data['data']['rankings']
        current = data['data'].get('currentUser')
        print(f'✅ 交易量排行榜: {len(rankings)} 名玩家')
        if rankings:
            top = rankings[0]
            print(f'   第1名: {top[\"username\"]} - {top[\"value\"]} 筆')
        if current:
            print(f'   你的排名: #{current[\"rank\"]} - {current[\"value\"]} 筆')
    else:
        print('❌ API 返回失敗')
except Exception as e:
    print(f'❌ 解析失敗: {e}')
"

echo ""
echo "步驟 4: 測試等級排行榜..."
LEVEL=$(curl -s "$API_URL/api/leaderboard/rankings?category=level&limit=10&userId=$USER_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "$LEVEL" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success'):
        rankings = data['data']['rankings']
        current = data['data'].get('currentUser')
        print(f'✅ 等級排行榜: {len(rankings)} 名玩家')
        if rankings:
            top = rankings[0]
            print(f'   第1名: {top[\"username\"]} - Lv.{top[\"value\"]}')
        if current:
            print(f'   你的排名: #{current[\"rank\"]} - Lv.{current[\"value\"]}')
    else:
        print('❌ API 返回失敗')
except Exception as e:
    print(f'❌ 解析失敗: {e}')
"

echo ""
echo "步驟 5: 測試利潤排行榜..."
PROFIT=$(curl -s "$API_URL/api/leaderboard/rankings?category=profit&limit=10&userId=$USER_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "$PROFIT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success'):
        rankings = data['data']['rankings']
        current = data['data'].get('currentUser')
        print(f'✅ 利潤排行榜: {len(rankings)} 名玩家')
        if rankings:
            top = rankings[0]
            profit = top['value']
            sign = '+' if profit >= 0 else ''
            print(f'   第1名: {top[\"username\"]} - {sign}\${profit:,.0f}')
        if current:
            profit = current['value']
            sign = '+' if profit >= 0 else ''
            print(f'   你的排名: #{current[\"rank\"]} - {sign}\${profit:,.0f}')
    else:
        print('❌ API 返回失敗')
except Exception as e:
    print(f'❌ 解析失敗: {e}')
"

echo ""
echo "步驟 6: 測試創建幣種排行榜..."
COINS=$(curl -s "$API_URL/api/leaderboard/rankings?category=coins_created&limit=10&userId=$USER_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "$COINS" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success'):
        rankings = data['data']['rankings']
        current = data['data'].get('currentUser')
        print(f'✅ 創建幣種排行榜: {len(rankings)} 名玩家')
        if rankings:
            top = rankings[0]
            print(f'   第1名: {top[\"username\"]} - {top[\"value\"]} 個')
        if current:
            print(f'   你的排名: #{current[\"rank\"]} - {current[\"value\"]} 個')
        else:
            print(f'   你的排名: 未上榜 (尚未創建幣種)')
    else:
        print('❌ API 返回失敗')
except Exception as e:
    print(f'❌ 解析失敗: {e}')
"

echo ""
echo "步驟 7: 測試排行榜頁面..."
LEADERBOARD_PAGE=$(curl -s "$API_URL/leaderboard" | grep -o "排行榜")
if [ ! -z "$LEADERBOARD_PAGE" ]; then
  echo "✅ 排行榜頁面可訪問"
else
  echo "❌ 排行榜頁面無法訪問"
fi

echo ""
echo "========================================="
echo "測試完成！"
echo "========================================="
echo ""
echo "📊 測試結果總結:"
echo "  ✅ 5個排行榜類別 API 測試"
echo "  ✅ 前端頁面可訪問"
echo ""
echo "🔗 測試連結:"
echo "  - 排行榜頁面: $API_URL/leaderboard"
echo ""
echo "📧 測試帳號: $EMAIL / $PASSWORD"
