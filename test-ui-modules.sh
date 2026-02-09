#!/bin/bash

echo "=========================================="
echo "🧪 測試 UI 模組載入"
echo "=========================================="

# 檢查文件是否存在
check_file() {
  if [ -f "$1" ]; then
    SIZE=$(wc -c < "$1")
    echo "✅ $1 (${SIZE} bytes)"
  else
    echo "❌ $1 (不存在)"
  fi
}

echo -e "\n📁 檢查 JavaScript 模組..."
check_file "public/static/trading-panel.js"
check_file "public/static/gamification.js"
check_file "public/static/leaderboard.js"
check_file "public/static/social.js"
check_file "public/static/realtime.js"

echo -e "\n📁 檢查現有腳本..."
check_file "public/static/coin-detail.js"
check_file "public/static/dashboard-simple.js"
check_file "public/static/portfolio.js"
check_file "public/static/market.js"
check_file "public/static/auth.js"

echo -e "\n🌐 測試 API 連接..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
if [ "$STATUS" = "200" ]; then
  echo "✅ API 健康檢查通過 (HTTP $STATUS)"
else
  echo "❌ API 健康檢查失敗 (HTTP $STATUS)"
fi

echo -e "\n🔌 測試 SSE 連接..."
timeout 2 curl -s http://localhost:3000/api/realtime/prices > /dev/null 2>&1
if [ $? -eq 124 ]; then
  echo "✅ SSE 串流正常 (連接成功)"
else
  echo "❌ SSE 串流異常"
fi

echo -e "\n📊 統計信息..."
TOTAL_JS=$(find public/static -name "*.js" | wc -l)
TOTAL_SIZE=$(find public/static -name "*.js" -exec wc -c {} + | tail -1 | awk '{print $1}')
TOTAL_LINES=$(find public/static -name "*.js" -exec wc -l {} + | tail -1 | awk '{print $1}')

echo "   總 JavaScript 文件: $TOTAL_JS"
echo "   總文件大小: $TOTAL_SIZE bytes"
echo "   總代碼行數: $TOTAL_LINES"

echo -e "\n=========================================="
echo "✨ UI 模組測試完成！"
echo "=========================================="
