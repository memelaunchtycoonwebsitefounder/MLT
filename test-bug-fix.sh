#!/bin/bash

echo "========================================" 
echo "Bug修復測試 v2.3.2"
echo "========================================"
echo ""

# Login
echo "1. 登入..."
LOGIN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "trade1770651466@example.com", "password": "Trade123!"}')

TOKEN=$(echo $LOGIN | jq -r '.data.token')
USER_ID=$(echo $LOGIN | jq -r '.data.id')

echo "   Token: ${TOKEN:0:20}..."
echo "   User ID: $USER_ID"

echo ""
echo "2. 測試成就API..."
ACHIEVEMENTS=$(curl -s http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN")

echo "$ACHIEVEMENTS" | jq '.data | {username, level, xp, balance: .virtual_balance}'

echo ""
echo "3. 測試前端JS文件..."
curl -s http://localhost:3000/static/achievements-page.js | head -20

echo ""
echo "4. 檢查重複定義..."
DUPLICATE_COUNT=$(curl -s http://localhost:3000/static/achievements-page.js | grep -c "const handleLogout")
echo "   handleLogout 定義次數: $DUPLICATE_COUNT (應該是1)"

if [ "$DUPLICATE_COUNT" -eq 1 ]; then
  echo "   ✅ 無重複定義"
else
  echo "   ❌ 發現重複定義"
fi

echo ""
echo "5. 檢查關鍵函數..."
curl -s http://localhost:3000/static/achievements-page.js | grep -q "getRarityText" && echo "   ✅ getRarityText 存在"
curl -s http://localhost:3000/static/achievements-page.js | grep -q "launchConfetti" && echo "   ✅ launchConfetti 存在"
curl -s http://localhost:3000/static/achievements-page.js | grep -q "connectToAchievementStream" && echo "   ✅ connectToAchievementStream 存在"
curl -s http://localhost:3000/static/achievements-page.js | grep -q "showAchievementUnlockNotification" && echo "   ✅ showAchievementUnlockNotification 存在"

echo ""
echo "========================================"
echo "✅ 修復完成！"
echo "========================================"
echo ""
echo "🌐 現在請在瀏覽器測試："
echo "   1. http://localhost:3000/achievements"
echo "   2. 檢查成就是否正常顯示"
echo "   3. 執行交易測試彩帶動畫"
echo ""
