#!/bin/bash

# Test Achievements UI
echo "========================================"
echo "成就系統UI測試"
echo "========================================"
echo ""

# Login first
echo "Test 1: 登入測試帳號..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trade1770651466@example.com",
    "password": "Trade123!"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo "✓ 登入成功"
  echo "  Token: ${TOKEN:0:20}..."
else
  echo "✗ 登入失敗"
  echo "  Response: $LOGIN_RESPONSE"
  exit 1
fi

echo ""
echo "Test 2: 獲取成就列表..."
ACHIEVEMENTS=$(curl -s http://localhost:3000/api/gamification/achievements \
  -H "Authorization: Bearer $TOKEN")

echo "$ACHIEVEMENTS" | jq '.' > /dev/null 2>&1
if [ $? -eq 0 ]; then
  TOTAL=$(echo "$ACHIEVEMENTS" | jq '.data.achievements | length')
  echo "✓ 成就系統已載入"
  echo "  成就總數: $TOTAL"
  
  # Show first 3 achievements
  echo ""
  echo "  前3個成就:"
  echo "$ACHIEVEMENTS" | jq -r '.data.achievements[0:3] | .[] | "    - \(.name) (\(.category))"'
else
  echo "✗ 獲取成就失敗"
  echo "  Response: $ACHIEVEMENTS"
fi

echo ""
echo "Test 3: 檢查成就頁面HTML..."
PAGE_HTML=$(curl -s http://localhost:3000/achievements)

# Check for key elements
echo "$PAGE_HTML" | grep -q "achievements-page.js" && echo "✓ JS文件已引用" || echo "✗ JS文件未引用"
echo "$PAGE_HTML" | grep -q "achievements-grid" && echo "✓ 成就容器存在" || echo "✗ 成就容器不存在"
echo "$PAGE_HTML" | grep -q "level-progress-card" && echo "✓ 等級卡片存在" || echo "✗ 等級卡片不存在"
echo "$PAGE_HTML" | grep -q "achievement-modal" && echo "✓ 詳情彈窗存在" || echo "✗ 詳情彈窗不存在"

echo ""
echo "========================================"
echo "✅ UI測試完成！"
echo "========================================"
echo ""
echo "🌐 現在請訪問瀏覽器測試："
echo "   URL: http://localhost:3000/achievements"
echo "   Email: trade1770651466@example.com"
echo "   Password: Trade123!"
echo ""
echo "📝 如果頁面空白，請打開瀏覽器控制台（F12）查看錯誤"
