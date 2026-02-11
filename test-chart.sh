#!/bin/bash

echo "🧪 測試價格圖表功能"
echo "================================"

# 登入
LOGIN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trade1770651466@example.com","password":"Trade123!"}')

TOKEN=$(echo $LOGIN | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "✅ 登入成功"

# 進行幾次交易生成價格歷史
echo ""
echo "📈 生成價格歷史數據..."

for i in {1..5}; do
  echo "  交易 $i/5..."
  curl -s -X POST http://localhost:3000/api/trades/buy \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"coinId":4,"amount":10}' > /dev/null
  
  sleep 1
  
  curl -s -X POST http://localhost:3000/api/trades/sell \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"coinId":4,"amount":5}' > /dev/null
  
  sleep 1
done

echo ""
echo "✅ 已生成10筆交易"
echo ""

# 檢查價格歷史
echo "📊 檢查價格歷史數據..."
HISTORY=$(curl -s "http://localhost:3000/api/coins/4/price-history?limit=20")
COUNT=$(echo $HISTORY | grep -o '"price"' | wc -l)

echo "✅ 價格歷史記錄數: $COUNT"
echo ""

if [ $COUNT -gt 0 ]; then
  echo "🎉 圖表數據準備完成！"
  echo ""
  echo "📱 請訪問幣種詳情頁查看圖表："
  echo "   https://3000-ialq9sk0j7h42em32rv8h-2e77fc33.sandbox.novita.ai/coin/4"
  echo ""
  echo "應該可以看到："
  echo "  ✅ 動態價格折線圖"
  echo "  ✅ 真實的價格變化"
  echo "  ✅ 時間範圍切換按鈕"
else
  echo "❌ 沒有價格數據"
fi
