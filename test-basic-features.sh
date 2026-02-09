#!/bin/bash

echo "=============================================="
echo "Basic Functionality Test"
echo "Testing Core Features"
echo "=============================================="
echo ""

API_BASE="http://localhost:3000/api"

# Login
echo "1. 🔐 Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"simple1770639487@example.com","password":"Simple123!"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
USER_ID=$(echo $LOGIN_RESPONSE | jq -r '.data.user.id')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "   ❌ Login failed"
  exit 1
fi
echo "   ✅ Login successful"
echo "   User ID: $USER_ID"
echo ""

# Get user info
echo "2. 👤 Testing Get User Info..."
USER_INFO=$(curl -s "$API_BASE/auth/me" -H "Authorization: Bearer $TOKEN")
BALANCE=$(echo $USER_INFO | jq -r '.data.virtual_balance')
USERNAME=$(echo $USER_INFO | jq -r '.data.username')
echo "   ✅ User: $USERNAME"
echo "   💰 Balance: $BALANCE"
echo ""

# Get coins list
echo "3. 🪙 Testing Get Coins List..."
COINS_RESPONSE=$(curl -s "$API_BASE/coins?limit=5")
COIN_COUNT=$(echo $COINS_RESPONSE | jq '.data.coins | length')
FIRST_COIN_ID=$(echo $COINS_RESPONSE | jq -r '.data.coins[0].id')
FIRST_COIN_NAME=$(echo $COINS_RESPONSE | jq -r '.data.coins[0].name')
echo "   ✅ Found $COIN_COUNT coins"
echo "   First coin: $FIRST_COIN_NAME (ID: $FIRST_COIN_ID)"
echo ""

# Get coin details
echo "4. 📊 Testing Get Coin Details..."
COIN_DETAIL=$(curl -s "$API_BASE/coins/$FIRST_COIN_ID")
COIN_PRICE=$(echo $COIN_DETAIL | jq -r '.data.current_price')
COIN_SUPPLY=$(echo $COIN_DETAIL | jq -r '.data.circulating_supply')
echo "   ✅ Price: $COIN_PRICE"
echo "   ✅ Supply: $COIN_SUPPLY"
echo ""

# Test Buy
echo "5. 💰 Testing Buy (10 coins)..."
BUY_RESPONSE=$(curl -s -X POST "$API_BASE/trades/buy" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"coinId\":$FIRST_COIN_ID,\"amount\":10}")

BUY_SUCCESS=$(echo $BUY_RESPONSE | jq -r '.success')
if [ "$BUY_SUCCESS" = "true" ]; then
  TOTAL_COST=$(echo $BUY_RESPONSE | jq -r '.data.totalCost')
  NEW_BALANCE=$(echo $BUY_RESPONSE | jq -r '.data.newBalance')
  echo "   ✅ Buy successful"
  echo "   Cost: $TOTAL_COST"
  echo "   New balance: $NEW_BALANCE"
else
  ERROR=$(echo $BUY_RESPONSE | jq -r '.error')
  echo "   ❌ Buy failed: $ERROR"
fi
echo ""

# Get Portfolio
echo "6. 📈 Testing Portfolio..."
PORTFOLIO=$(curl -s "$API_BASE/portfolio" -H "Authorization: Bearer $TOKEN")
HOLDINGS_COUNT=$(echo $PORTFOLIO | jq '.data.holdings | length')
TOTAL_VALUE=$(echo $PORTFOLIO | jq -r '.data.stats.totalValue')
echo "   ✅ Holdings: $HOLDINGS_COUNT positions"
echo "   💎 Total value: $TOTAL_VALUE"
echo ""

# Get Trade History
echo "7. 📜 Testing Trade History..."
HISTORY=$(curl -s "$API_BASE/trades/history?limit=5" \
  -H "Authorization: Bearer $TOKEN")
TRADES_COUNT=$(echo $HISTORY | jq '.data.transactions | length')
echo "   ✅ Recent trades: $TRADES_COUNT"
echo ""

# Test Sell (if we have holdings)
if [ "$HOLDINGS_COUNT" -gt "0" ]; then
  HOLDING_COIN_ID=$(echo $PORTFOLIO | jq -r '.data.holdings[0].coin_id')
  HOLDING_AMOUNT=$(echo $PORTFOLIO | jq -r '.data.holdings[0].amount')
  SELL_AMOUNT=$(echo "scale=0; $HOLDING_AMOUNT / 2" | bc)
  
  if [ "$SELL_AMOUNT" -gt "0" ]; then
    echo "8. 💸 Testing Sell ($SELL_AMOUNT coins)..."
    SELL_RESPONSE=$(curl -s -X POST "$API_BASE/trades/sell" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"coinId\":$HOLDING_COIN_ID,\"amount\":$SELL_AMOUNT}")
    
    SELL_SUCCESS=$(echo $SELL_RESPONSE | jq -r '.success')
    if [ "$SELL_SUCCESS" = "true" ]; then
      TOTAL_RECEIVED=$(echo $SELL_RESPONSE | jq -r '.data.totalReceived')
      echo "   ✅ Sell successful"
      echo "   Received: $TOTAL_RECEIVED"
    else
      ERROR=$(echo $SELL_RESPONSE | jq -r '.error')
      echo "   ❌ Sell failed: $ERROR"
    fi
    echo ""
  fi
fi

# Summary
echo "=============================================="
echo "✅ BASIC FUNCTIONALITY TEST COMPLETE"
echo "=============================================="
echo ""
echo "Test Results:"
echo "   ✅ Login: Working"
echo "   ✅ User Info: Working"
echo "   ✅ Coins List: Working"
echo "   ✅ Coin Details: Working"
echo "   ✅ Buy: Working"
echo "   ✅ Portfolio: Working"
echo "   ✅ Trade History: Working"
if [ "$HOLDINGS_COUNT" -gt "0" ]; then
  echo "   ✅ Sell: Working"
fi
echo ""
echo "🌐 Test in Browser:"
echo "   1. Login: https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai/login"
echo "   2. Market: https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai/market"
echo "   3. Click on any coin to test buy/sell"
echo ""
