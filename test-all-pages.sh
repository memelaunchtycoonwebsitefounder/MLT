#!/bin/bash

echo "🧪 MemeLaunch 全面功能測試"
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

# 測試所有頁面HTML結構
echo "2️⃣ 測試頁面加載..."

PAGES=(
  "/:首頁"
  "/login:登入頁"
  "/signup:註冊頁"
  "/dashboard:儀表板"
  "/market:市場"
  "/create:創建幣種"
  "/portfolio:投資組合"
  "/profile/7:用戶資料"
  "/achievements:成就"
  "/leaderboard:排行榜"
  "/social:社交"
  "/coin/4:幣種詳情"
)

for page_info in "${PAGES[@]}"; do
  IFS=':' read -r path name <<< "$page_info"
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$path")
  if [ "$STATUS" = "200" ]; then
    echo "  ✅ $name ($path): $STATUS"
  else
    echo "  ❌ $name ($path): $STATUS"
  fi
done

echo ""

# 測試評論編輯功能
echo "3️⃣ 測試評論編輯..."
EDIT_RESPONSE=$(curl -s -X PUT http://localhost:3000/api/social/comments/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content":"測試編輯功能"}')

if echo $EDIT_RESPONSE | grep -q '"success":true'; then
  echo "  ✅ 評論編輯API正常"
else
  echo "  ❌ 評論編輯失敗: $EDIT_RESPONSE"
fi

echo ""

# 測試價格歷史API
echo "4️⃣ 測試價格歷史API..."
PRICE_HISTORY=$(curl -s "http://localhost:3000/api/coins/4/price-history")
if echo $PRICE_HISTORY | grep -q '"success"'; then
  HISTORY_COUNT=$(echo $PRICE_HISTORY | grep -o '"timestamp"' | wc -l)
  echo "  ✅ 價格歷史API正常 (記錄數: $HISTORY_COUNT)"
else
  echo "  ⚠️ 價格歷史API需要實現"
fi

echo ""

# 測試圖表數據
echo "5️⃣ 測試圖表數據..."
COIN_DATA=$(curl -s http://localhost:3000/api/coins/4)
CURRENT_PRICE=$(echo $COIN_DATA | grep -o '"current_price":[0-9.]*' | cut -d':' -f2)
MARKET_CAP=$(echo $COIN_DATA | grep -o '"market_cap":[0-9.]*' | cut -d':' -f2)
echo "  當前價格: $CURRENT_PRICE"
echo "  市值: $MARKET_CAP"

echo ""

# 檢查Dashboard HTML結構
echo "6️⃣ 檢查Dashboard按鈕位置..."
DASHBOARD_HTML=$(curl -s http://localhost:3000/dashboard)
if echo "$DASHBOARD_HTML" | grep -q 'view-profile-btn'; then
  echo "  ✅ 用戶資料按鈕存在"
  # 檢查是否有返回Dashboard的按鈕
  if echo "$DASHBOARD_HTML" | grep -q 'back.*dashboard\|返回.*儀表板'; then
    echo "  ⚠️ 可能有重複的Dashboard導航"
  fi
fi

echo ""

echo "================================"
echo "🎉 測試完成！"
