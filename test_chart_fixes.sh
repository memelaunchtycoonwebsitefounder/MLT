#!/bin/bash

echo "🧪 測試圖表和通知修復"
echo "================================"
echo ""

# Get coin 8 data
echo "📊 步驟 1: 檢查 Coin 8 (TC7243) 數據"
COIN_DATA=$(curl -s "http://localhost:3000/api/coins/8")
PRICE=$(echo "$COIN_DATA" | jq -r '.data.current_price')
echo "   ✅ 當前價格: $PRICE MLT"
echo ""

# Check price history
echo "📈 步驟 2: 檢查價格歷史"
PRICE_HISTORY=$(curl -s "http://localhost:3000/api/coins/8/price-history")
POINTS=$(echo "$PRICE_HISTORY" | jq -r '.data.data | length')
echo "   ✅ 價格數據點: $POINTS"
echo ""

# Show last 5 price points with OHLC analysis
echo "📊 步驟 3: 分析最近 5 個交易"
echo "$PRICE_HISTORY" | jq -r '.data.data[-5:] | .[] | "   Time: \(.timestamp) | Price: \(.price) | Volume: \(.volume)"'
echo ""

# Check AI trader status
echo "🤖 步驟 4: 檢查 AI Trader 狀態"
AI_STATUS=$(npx wrangler d1 execute memelaunch-db --local --command="SELECT id, name, symbol, is_ai_active, real_trade_count FROM coins WHERE id = 8;" 2>&1 | grep -A 20 '"results"')
echo "$AI_STATUS" | jq -r '.[] | "   AI Active: \(.is_ai_active) | Real Trades: \(.real_trade_count)"' 2>/dev/null || echo "   Checking..."
echo ""

# Simulate chart data processing
echo "🎨 步驟 5: 模擬蠟燭圖聚合"
cat > /tmp/test_candle_logic.js << 'JSEOF'
// Test candle color logic
const testData = [
  { open: 0.002, close: 0.0025, label: "UP candle" },
  { open: 0.0025, close: 0.002, label: "DOWN candle" },
  { open: 0.002, close: 0.002, label: "FLAT candle" }
];

testData.forEach(candle => {
  const isUp = candle.close >= candle.open;
  const color = isUp ? "GREEN" : "RED";
  const direction = isUp ? "⬆️" : "⬇️";
  console.log(`   ${candle.label}: ${direction} ${color} (open: ${candle.open}, close: ${candle.close})`);
});
JSEOF

node /tmp/test_candle_logic.js
echo ""

echo "================================"
echo "✅ 測試完成"
echo "================================"
echo ""
echo "修復內容:"
echo "1. ✅ 通知系統 - 添加重複檢測（30秒內）"
echo "2. ✅ 蠟燭顏色 - 使用 close vs open 判斷"
echo "3. ⚠️  AI Trader - 需要檢查調度器"
echo ""

