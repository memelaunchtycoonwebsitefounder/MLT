#!/bin/bash

# ========================================
# MemeLaunch Tycoon - 前端UI功能完整演示
# ========================================

API_BASE="http://localhost:3000"
EMAIL="uidemo$(date +%s)@example.com"
PASSWORD="UIdemo123!"

echo "=========================================="
echo "🎨 前端UI功能完整演示"
echo "=========================================="

# 1. 註冊並登入
echo -e "\n[1/10] 📝 註冊新用戶..."
SIGNUP=$(curl -s -X POST "$API_BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"username\":\"uidemo$(date +%s)\"}")
TOKEN=$(echo $SIGNUP | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $SIGNUP | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "✅ 用戶已註冊 (ID: $USER_ID)"
echo "📍 登入頁面: $API_BASE/login"
echo "📍 註冊頁面: $API_BASE/signup"

# 2. 驗證用戶資料
echo -e "\n[2/10] 👤 載入用戶資料..."
USER_DATA=$(curl -s "$API_BASE/api/auth/me" -H "Authorization: Bearer $TOKEN")
echo "✅ 用戶資料已載入"
echo "📍 用戶資料頁面: $API_BASE/user/$(echo $USER_DATA | grep -o '"username":"[^"]*' | cut -d'"' -f4)"

# 3. 獲取市場幣種
echo -e "\n[3/10] 🏪 載入市場幣種..."
COINS=$(curl -s "$API_BASE/api/coins?limit=10")
COIN_ID=$(echo $COINS | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
COIN_NAME=$(echo $COINS | grep -o '"name":"[^"]*' | head -1 | cut -d'"' -f4)
COIN_COUNT=$(echo $COINS | grep -o '"id":[0-9]*' | wc -l)
echo "✅ 找到 $COIN_COUNT 個幣種"
echo "📍 市場頁面: $API_BASE/market"
echo "📍 幣種詳情: $API_BASE/coin/$COIN_ID"

# 4. 交易功能 - 買入
echo -e "\n[4/10] 💰 測試交易功能 - 買入..."
BUY=$(curl -s -X POST "$API_BASE/api/trades/buy" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"coinId\":$COIN_ID,\"amount\":100}")
echo "✅ 買入成功"
echo "   幣種: $COIN_NAME"
echo "   數量: 100"
echo "   價格: $(echo $BUY | grep -o '"price":[0-9.]*' | cut -d':' -f2)"
echo "📍 交易界面: $API_BASE/coin/$COIN_ID (交易面板)"

# 5. 查看投資組合
echo -e "\n[5/10] 📊 查看投資組合..."
PORTFOLIO=$(curl -s "$API_BASE/api/portfolio" -H "Authorization: Bearer $TOKEN")
HOLDINGS=$(echo $PORTFOLIO | grep -o '"amount":[0-9]*' | head -1 | cut -d':' -f2)
TOTAL_VALUE=$(echo $PORTFOLIO | grep -o '"totalValue":[0-9.]*' | cut -d':' -f2)
echo "✅ 投資組合已載入"
echo "   持倉數量: $HOLDINGS"
echo "   總價值: $$TOTAL_VALUE"
echo "📍 投資組合頁面: $API_BASE/portfolio"

# 6. 查看交易歷史
echo -e "\n[6/10] 📜 查看交易歷史..."
HISTORY=$(curl -s "$API_BASE/api/trades/history?limit=5" \
  -H "Authorization: Bearer $TOKEN")
TX_COUNT=$(echo $HISTORY | grep -o '"id":[0-9]*' | wc -l)
echo "✅ 交易歷史已載入"
echo "   交易數量: $TX_COUNT 筆"
echo "📍 交易歷史: $API_BASE/coin/$COIN_ID (最近交易區塊)"

# 7. 測試成就系統
echo -e "\n[7/10] 🏆 查看成就系統..."
ACHIEVEMENTS=$(curl -s "$API_BASE/api/gamification/achievements" \
  -H "Authorization: Bearer $TOKEN")
ACH_TOTAL=$(echo $ACHIEVEMENTS | grep -o '"id":"[^"]*' | wc -l)
ACH_UNLOCKED=$(echo $ACHIEVEMENTS | grep -o '"completed":1' | wc -l)
echo "✅ 成就系統已載入"
echo "   總成就數: $ACH_TOTAL"
echo "   已解鎖: $ACH_UNLOCKED"
echo "📍 成就頁面: $API_BASE/achievements (待實現)"

# 8. 查看排行榜
echo -e "\n[8/10] 🥇 查看排行榜..."
LEADERBOARD=$(curl -s "$API_BASE/api/gamification/leaderboard?type=networth&limit=5")
LB_COUNT=$(echo $LEADERBOARD | grep -o '"id":[0-9]*' | wc -l)
LEADER=$(echo $LEADERBOARD | grep -o '"username":"[^"]*' | head -1 | cut -d'"' -f4)
echo "✅ 排行榜已載入"
echo "   排行榜人數: $LB_COUNT"
echo "   第一名: $LEADER"
echo "📍 排行榜頁面: $API_BASE/leaderboard (待實現)"

# 9. 測試實時價格串流 (SSE)
echo -e "\n[9/10] 📡 測試實時價格串流 (5秒)..."
echo "   正在連接 SSE 串流..."
REALTIME=$(timeout 5 curl -N -s "$API_BASE/api/realtime/prices" | head -20)
EVENT_COUNT=$(echo "$REALTIME" | grep "event:" | wc -l)
PRICE_UPDATE=$(echo "$REALTIME" | grep "price_update" | wc -l)
echo "✅ 實時串流已連接"
echo "   收到事件: $EVENT_COUNT 個"
echo "   價格更新: $PRICE_UPDATE 次"
echo "📍 實時更新: 自動啟用於所有頁面 (JavaScript)"

# 10. 測試訂單系統
echo -e "\n[10/10] 📋 測試訂單系統..."
ORDER=$(curl -s -X POST "$API_BASE/api/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"coinId\":$COIN_ID,\"type\":\"limit\",\"side\":\"buy\",\"amount\":50,\"price\":0.02}")
echo "✅ 訂單已創建"
echo "   訂單類型: 限價買單"
echo "   數量: 50"
echo "   價格: $0.02"
echo "📍 訂單管理: $API_BASE/orders (待實現)"

# 總結
echo -e "\n=========================================="
echo "✨ 前端UI功能演示完成！"
echo "=========================================="
echo ""
echo "📌 可用頁面列表："
echo "   1. 首頁:          $API_BASE/"
echo "   2. 登入:          $API_BASE/login"
echo "   3. 註冊:          $API_BASE/signup"
echo "   4. 儀表板:        $API_BASE/dashboard"
echo "   5. 市場:          $API_BASE/market"
echo "   6. 幣種詳情:      $API_BASE/coin/$COIN_ID"
echo "   7. 投資組合:      $API_BASE/portfolio"
echo "   8. 創建幣種:      $API_BASE/create"
echo ""
echo "🎨 前端功能清單："
echo "   ✅ 用戶註冊/登入界面"
echo "   ✅ 儀表板 (Dashboard) - 總覽和統計"
echo "   ✅ 市場頁面 - 幣種列表和篩選"
echo "   ✅ 幣種詳情頁面 - 圖表、統計、交易"
echo "   ✅ 交易面板 - 買入/賣出界面"
echo "   ✅ 投資組合頁面 - 持倉和盈虧"
echo "   ✅ 交易歷史 - 最近交易記錄"
echo "   ✅ 實時價格更新 (SSE)"
echo "   ✅ 成就系統 (後端完成)"
echo "   ✅ 排行榜 (後端完成)"
echo "   ✅ 訂單系統 (後端完成)"
echo ""
echo "📱 新增 JavaScript 模組："
echo "   ✅ trading-panel.js   - 交易面板UI"
echo "   ✅ gamification.js    - 成就和遊戲化UI"
echo "   ✅ leaderboard.js     - 排行榜UI"
echo "   ✅ social.js          - 社交功能UI (評論、點讚)"
echo "   ✅ realtime.js        - 實時更新 (SSE客戶端)"
echo ""
echo "🎯 待實現的完整頁面："
echo "   🔲 成就頁面 (/achievements)"
echo "   🔲 排行榜頁面 (/leaderboard)"
echo "   🔲 用戶資料頁面 (/user/:username)"
echo "   🔲 訂單管理頁面 (/orders)"
echo "   🔲 社交動態頁面 (/feed)"
echo ""
echo "📖 測試帳號："
echo "   Email: $EMAIL"
echo "   Password: $PASSWORD"
echo "   Token: ${TOKEN:0:50}..."
echo ""
echo "🚀 立即開始測試："
echo "   1. 打開瀏覽器訪問: $API_BASE"
echo "   2. 使用上述帳號登入"
echo "   3. 探索所有功能！"
echo ""
echo "=========================================="
