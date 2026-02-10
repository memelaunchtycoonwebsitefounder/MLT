#!/bin/bash

echo "=== MemeLaunch 完整功能測試 ==="

# 1. 登入獲取token
echo -e "\n【1/6】登入測試..."
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

# 2. 測試Dashboard數據
echo -e "\n【2/6】Dashboard數據測試..."
PORTFOLIO=$(curl -s http://localhost:3000/api/portfolio \
  -H "Authorization: Bearer $TOKEN")
  
if echo $PORTFOLIO | grep -q '"success":true'; then
  HOLDINGS_COUNT=$(echo $PORTFOLIO | grep -o '"holdings":\[[^]]*\]' | grep -o '{' | wc -l)
  TOTAL_VALUE=$(echo $PORTFOLIO | grep -o '"totalValue":[0-9.]*' | cut -d':' -f2)
  CASH_BALANCE=$(echo $PORTFOLIO | grep -o '"cashBalance":[0-9.]*' | cut -d':' -f2)
  TOTAL_PL=$(echo $PORTFOLIO | grep -o '"totalProfitLoss":[0-9.-]*' | cut -d':' -f2)
  
  echo "✅ Dashboard數據正常"
  echo "   - 持倉數量: $HOLDINGS_COUNT"
  echo "   - 投資組合價值: $TOTAL_VALUE"
  echo "   - 現金餘額: $CASH_BALANCE"
  echo "   - 總盈虧: $TOTAL_PL"
else
  echo "❌ Dashboard數據載入失敗"
fi

# 3. 測試社交頁面
echo -e "\n【3/6】社交頁面測試..."
FEED=$(curl -s http://localhost:3000/api/social/feed \
  -H "Authorization: Bearer $TOKEN")
  
if echo $FEED | grep -q '"success":true'; then
  ACTIVITY_COUNT=$(echo $FEED | grep -o '"id":[0-9]*' | wc -l)
  echo "✅ 社交動態正常 - 動態數: $ACTIVITY_COUNT"
else
  echo "❌ 社交動態載入失敗"
fi

# 4. 測試評論系統
echo -e "\n【4/6】評論系統測試..."
COMMENTS=$(curl -s http://localhost:3000/api/social/comments/9 \
  -H "Authorization: Bearer $TOKEN")
  
if echo $COMMENTS | grep -q '"success":true'; then
  COMMENT_COUNT=$(echo $COMMENTS | grep -o '"id":[0-9]*' | wc -l)
  echo "✅ 評論系統正常 - 評論數: $COMMENT_COUNT"
else
  echo "❌ 評論載入失敗"
  echo "Response: $COMMENTS"
fi

# 5. 測試頁面載入
echo -e "\n【5/6】頁面載入測試..."
PAGES=("dashboard" "market" "social" "coin/9")
for page in "${PAGES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/$page)
  if [ "$STATUS" == "200" ]; then
    echo "✅ /$page - OK"
  else
    echo "❌ /$page - Failed ($STATUS)"
  fi
done

# 6. 測試導航鏈接
echo -e "\n【6/6】導航測試..."
NAV_LINKS=$(curl -s http://localhost:3000/dashboard | grep -o 'href="/social"' | wc -l)
if [ "$NAV_LINKS" -gt 0 ]; then
  echo "✅ 社交導航鏈接存在"
else
  echo "❌ 缺少社交導航鏈接"
fi

echo -e "\n========================================="
echo "測試完成！"
echo "========================================="
echo -e "\n📱 快速訪問連結:"
echo "   Dashboard: http://localhost:3000/dashboard"
echo "   Market: http://localhost:3000/market"
echo "   Social: http://localhost:3000/social"
echo "   Coin: http://localhost:3000/coin/9"
echo -e "\n🔐 測試帳號:"
echo "   Email: trade1770651466@example.com"
echo "   Password: Trade123!"
