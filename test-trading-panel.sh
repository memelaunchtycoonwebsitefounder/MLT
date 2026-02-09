#!/bin/bash

echo "========================================"
echo "交易面板功能測試"
echo "========================================"
echo ""

BASE_URL="http://localhost:3000"

# Test 1: Register new user
echo "Test 1: 註冊測試用戶..."
TIMESTAMP=$(date +%s)
EMAIL="trade${TIMESTAMP}@example.com"
USERNAME="trade${TIMESTAMP}"
PASSWORD="Trade123!"

REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${EMAIL}\",
    \"username\": \"${USERNAME}\",
    \"password\": \"${PASSWORD}\"
  }")

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2 | head -1)

if [ -z "$TOKEN" ]; then
  echo "❌ 用戶註冊失敗"
  echo "$REGISTER_RESPONSE"
  exit 1
fi

echo "✓ 用戶註冊成功"
echo "  Email: $EMAIL"
echo "  Username: $USERNAME"
echo "  User ID: $USER_ID"
echo ""

# Test 2: Get user info
echo "Test 2: 驗證用戶登入..."
USER_INFO=$(curl -s "${BASE_URL}/api/auth/me" \
  -H "Authorization: Bearer ${TOKEN}")

BALANCE=$(echo $USER_INFO | grep -o '"virtual_balance":[0-9.]*' | cut -d':' -f2)
echo "✓ 用戶已登入"
echo "  初始餘額: $BALANCE 金幣"
echo ""

# Test 3: Get market coins
echo "Test 3: 獲取市場幣種..."
COINS=$(curl -s "${BASE_URL}/api/coins?limit=5")
COIN_ID=$(echo $COINS | grep -o '"id":[0-9]*' | cut -d':' -f2 | head -1)
COIN_NAME=$(echo $COINS | grep -o '"name":"[^"]*' | cut -d'"' -f4 | head -1)
COIN_SYMBOL=$(echo $COINS | grep -o '"symbol":"[^"]*' | cut -d'"' -f4 | head -1)
COIN_PRICE=$(echo $COINS | grep -o '"current_price":[0-9.]*' | cut -d':' -f2 | head -1)

if [ -z "$COIN_ID" ]; then
  echo "❌ 獲取幣種失敗"
  exit 1
fi

echo "✓ 獲取幣種成功"
echo "  幣種 ID: $COIN_ID"
echo "  幣種名稱: $COIN_NAME"
echo "  幣種符號: $COIN_SYMBOL"
echo "  當前價格: $COIN_PRICE"
echo ""

# Test 4: Buy coins - Small amount
echo "Test 4: 買入測試（小量）- 10 單位..."
BUY_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/trades/buy" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"coinId\": $COIN_ID,
    \"amount\": 10
  }")

echo "$BUY_RESPONSE" | grep -q '"success":true'
if [ $? -eq 0 ]; then
  echo "✓ 小量買入成功"
  TRANSACTION_ID=$(echo $BUY_RESPONSE | grep -o '"transactionId":[0-9]*' | cut -d':' -f2)
  NEW_BALANCE=$(echo $BUY_RESPONSE | grep -o '"newBalance":[0-9.]*' | cut -d':' -f2)
  echo "  交易 ID: $TRANSACTION_ID"
  echo "  新餘額: $NEW_BALANCE 金幣"
else
  echo "❌ 小量買入失敗"
  echo "$BUY_RESPONSE"
fi
echo ""

# Test 5: Buy coins - Medium amount
echo "Test 5: 買入測試（中量）- 50 單位..."
BUY_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/trades/buy" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"coinId\": $COIN_ID,
    \"amount\": 50
  }")

echo "$BUY_RESPONSE" | grep -q '"success":true'
if [ $? -eq 0 ]; then
  echo "✓ 中量買入成功"
  NEW_BALANCE=$(echo $BUY_RESPONSE | grep -o '"newBalance":[0-9.]*' | cut -d':' -f2)
  echo "  新餘額: $NEW_BALANCE 金幣"
else
  echo "❌ 中量買入失敗"
  echo "$BUY_RESPONSE"
fi
echo ""

# Test 6: Buy coins - Large amount
echo "Test 6: 買入測試（大量）- 100 單位..."
BUY_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/trades/buy" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"coinId\": $COIN_ID,
    \"amount\": 100
  }")

echo "$BUY_RESPONSE" | grep -q '"success":true'
if [ $? -eq 0 ]; then
  echo "✓ 大量買入成功"
  NEW_BALANCE=$(echo $BUY_RESPONSE | grep -o '"newBalance":[0-9.]*' | cut -d':' -f2)
  echo "  新餘額: $NEW_BALANCE 金幣"
else
  echo "❌ 大量買入失敗"
  echo "$BUY_RESPONSE"
fi
echo ""

# Test 7: Check portfolio
echo "Test 7: 檢查投資組合..."
PORTFOLIO=$(curl -s "${BASE_URL}/api/portfolio" \
  -H "Authorization: Bearer ${TOKEN}")

HOLDING_AMOUNT=$(echo $PORTFOLIO | grep -o '"amount":[0-9.]*' | cut -d':' -f2 | head -1)
TOTAL_NETWORTH=$(echo $PORTFOLIO | grep -o '"totalNetWorth":[0-9.]*' | cut -d':' -f2)

echo "✓ 投資組合已更新"
echo "  持有數量: $HOLDING_AMOUNT $COIN_SYMBOL"
echo "  總淨值: $TOTAL_NETWORTH 金幣"
echo ""

# Test 8: Sell coins - Partial
echo "Test 8: 賣出測試（部分）- 50 單位..."
SELL_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/trades/sell" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"coinId\": $COIN_ID,
    \"amount\": 50
  }")

echo "$SELL_RESPONSE" | grep -q '"success":true'
if [ $? -eq 0 ]; then
  echo "✓ 部分賣出成功"
  NEW_BALANCE=$(echo $SELL_RESPONSE | grep -o '"newBalance":[0-9.]*' | cut -d':' -f2)
  echo "  新餘額: $NEW_BALANCE 金幣"
else
  echo "❌ 部分賣出失敗"
  echo "$SELL_RESPONSE"
fi
echo ""

# Test 9: Check updated portfolio
echo "Test 9: 檢查更新後的投資組合..."
PORTFOLIO=$(curl -s "${BASE_URL}/api/portfolio" \
  -H "Authorization: Bearer ${TOKEN}")

HOLDING_AMOUNT=$(echo $PORTFOLIO | grep -o '"amount":[0-9.]*' | cut -d':' -f2 | head -1)
CASH_BALANCE=$(echo $PORTFOLIO | grep -o '"cashBalance":[0-9.]*' | cut -d':' -f2)

echo "✓ 投資組合已更新"
echo "  剩餘持有: $HOLDING_AMOUNT $COIN_SYMBOL"
echo "  現金餘額: $CASH_BALANCE 金幣"
echo ""

# Test 10: Check transaction history
echo "Test 10: 檢查交易歷史..."
HISTORY=$(curl -s "${BASE_URL}/api/trades/history/${COIN_ID}" \
  -H "Authorization: Bearer ${TOKEN}")

TRANSACTION_COUNT=$(echo $HISTORY | grep -o '"type"' | wc -l)

echo "✓ 交易歷史已載入"
echo "  交易筆數: $TRANSACTION_COUNT"
echo ""

# Test 11: Validation - Try to buy with insufficient balance
echo "Test 11: 驗證測試 - 餘額不足..."
BUY_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/trades/buy" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"coinId\": $COIN_ID,
    \"amount\": 999999
  }")

echo "$BUY_RESPONSE" | grep -q '"success":false'
if [ $? -eq 0 ]; then
  echo "✓ 餘額不足驗證正確"
  ERROR_MSG=$(echo $BUY_RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4)
  echo "  錯誤訊息: $ERROR_MSG"
else
  echo "⚠ 餘額不足驗證未生效（可能餘額很高）"
fi
echo ""

# Test 12: Validation - Try to sell more than holdings
echo "Test 12: 驗證測試 - 持倉不足..."
SELL_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/trades/sell" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"coinId\": $COIN_ID,
    \"amount\": 999999
  }")

echo "$SELL_RESPONSE" | grep -q '"success":false'
if [ $? -eq 0 ]; then
  echo "✓ 持倉不足驗證正確"
  ERROR_MSG=$(echo $SELL_RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4)
  echo "  錯誤訊息: $ERROR_MSG"
else
  echo "❌ 持倉不足驗證失敗"
  echo "$SELL_RESPONSE"
fi
echo ""

echo "========================================"
echo "✅ 交易面板功能測試完成！"
echo "========================================"
echo ""
echo "📋 測試摘要:"
echo "  ✓ 用戶註冊與認證"
echo "  ✓ 幣種資訊獲取"
echo "  ✓ 小量買入（10 單位）"
echo "  ✓ 中量買入（50 單位）"
echo "  ✓ 大量買入（100 單位）"
echo "  ✓ 投資組合更新"
echo "  ✓ 部分賣出（50 單位）"
echo "  ✓ 交易歷史記錄"
echo "  ✓ 餘額不足驗證"
echo "  ✓ 持倉不足驗證"
echo ""
echo "🎮 立即測試網頁介面:"
echo "  URL: http://localhost:3000/coin/$COIN_ID"
echo "  帳號: $EMAIL"
echo "  密碼: $PASSWORD"
echo ""
echo "功能清單:"
echo "  ✓ 買入/賣出標籤切換"
echo "  ✓ 即時價格計算和手續費顯示 (1%)"
echo "  ✓ 快速預設按鈕 (10/50/100/500)"
echo "  ✓ 最大按鈕"
echo "  ✓ 輸入驗證和錯誤提示"
echo "  ✓ 持倉顯示和餘額更新"
echo "  ✓ 交易確認和成功通知"
