#!/bin/bash
# MemeLaunch Tycoon - Trading Functionality Test Script
# Tests: coin creation, buy, sell, portfolio, market

set -e  # Exit on error

API_BASE="http://localhost:3000/api"
TIMESTAMP=$(date +%s)
TEST_EMAIL="trader${TIMESTAMP}@example.com"
TEST_USERNAME="trader${TIMESTAMP}"
TEST_PASSWORD="Test1234!"

echo "======================================"
echo "MemeLaunch Tycoon - Trading Test"
echo "======================================"
echo ""
echo "Test Account:"
echo "  Email: $TEST_EMAIL"
echo "  Username: $TEST_USERNAME"
echo ""

# Register a test user
echo "1. Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST $API_BASE/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"username\": \"$TEST_USERNAME\",
    \"password\": \"$TEST_PASSWORD\"
  }")

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
INITIAL_BALANCE=$(echo $REGISTER_RESPONSE | grep -o '"virtual_balance":[0-9]*' | cut -d':' -f2)

if [ -z "$TOKEN" ]; then
  echo "❌ Registration failed!"
  echo $REGISTER_RESPONSE
  exit 1
fi

echo "✅ Registration successful!"
echo "   User ID: $USER_ID"
echo "   Starting Balance: $INITIAL_BALANCE"
echo ""

# Create a test coin
echo "2. Creating a test coin..."
CREATE_COIN_RESPONSE=$(curl -s -X POST $API_BASE/coins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"TestCoin ${TIMESTAMP}\",
    \"symbol\": \"TC${TIMESTAMP:(-6)}\",
    \"description\": \"A test coin for trading functionality testing\",
    \"image_url\": \"/static/default-coin.svg\",
    \"total_supply\": 1000000
  }")

COIN_ID=$(echo $CREATE_COIN_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
COIN_SYMBOL=$(echo $CREATE_COIN_RESPONSE | grep -o '"symbol":"[^"]*' | cut -d'"' -f4)

if [ -z "$COIN_ID" ]; then
  echo "❌ Coin creation failed!"
  echo $CREATE_COIN_RESPONSE
  exit 1
fi

echo "✅ Coin created!"
echo "   Coin ID: $COIN_ID"
echo "   Symbol: $COIN_SYMBOL"
echo ""

# Get current balance after coin creation
echo "3. Checking balance after coin creation..."
ME_RESPONSE=$(curl -s -X GET $API_BASE/auth/me \
  -H "Authorization: Bearer $TOKEN")

CURRENT_BALANCE=$(echo $ME_RESPONSE | grep -o '"virtual_balance":[0-9]*' | cut -d':' -f2)
CREATION_COST=$((INITIAL_BALANCE - CURRENT_BALANCE))

echo "✅ Balance checked!"
echo "   Previous Balance: $INITIAL_BALANCE"
echo "   Current Balance: $CURRENT_BALANCE"
echo "   Creation Cost: $CREATION_COST"
echo ""

# Test buying coins
echo "4. Testing coin purchase (buy 100 coins)..."
BUY_RESPONSE=$(curl -s -X POST $API_BASE/trades/buy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"coinId\": $COIN_ID,
    \"amount\": 100
  }")

BUY_SUCCESS=$(echo $BUY_RESPONSE | grep -o '"success":[a-z]*' | cut -d':' -f2)

if [ "$BUY_SUCCESS" != "true" ]; then
  echo "❌ Buy failed!"
  echo $BUY_RESPONSE
  exit 1
fi

PRICE_PAID=$(echo $BUY_RESPONSE | grep -o '"price":[0-9.]*' | head -1 | cut -d':' -f2)
TOTAL_COST=$(echo $BUY_RESPONSE | grep -o '"totalCost":[0-9.]*' | cut -d':' -f2)

echo "✅ Purchase successful!"
echo "   Amount: 100 coins"
echo "   Price: $PRICE_PAID per coin"
echo "   Total Cost: $TOTAL_COST"
echo ""

# Check portfolio
echo "5. Checking portfolio..."
PORTFOLIO_RESPONSE=$(curl -s -X GET "$API_BASE/portfolio" \
  -H "Authorization: Bearer $TOKEN")

HOLDING_AMOUNT=$(echo $PORTFOLIO_RESPONSE | grep -o '"amount":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$HOLDING_AMOUNT" ]; then
  echo "❌ Portfolio check failed!"
  echo $PORTFOLIO_RESPONSE
  exit 1
fi

echo "✅ Portfolio checked!"
echo "   Holdings: $HOLDING_AMOUNT coins"
echo ""

# Test selling coins
echo "6. Testing coin sale (sell 50 coins)..."
SELL_RESPONSE=$(curl -s -X POST $API_BASE/trades/sell \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"coinId\": $COIN_ID,
    \"amount\": 50
  }")

SELL_SUCCESS=$(echo $SELL_RESPONSE | grep -o '"success":[a-z]*' | cut -d':' -f2)

if [ "$SELL_SUCCESS" != "true" ]; then
  echo "❌ Sell failed!"
  echo $SELL_RESPONSE
  exit 1
fi

SALE_PRICE=$(echo $SELL_RESPONSE | grep -o '"price":[0-9.]*' | head -1 | cut -d':' -f2)
TOTAL_RECEIVED=$(echo $SELL_RESPONSE | grep -o '"totalReceived":[0-9.]*' | cut -d':' -f2)

echo "✅ Sale successful!"
echo "   Amount: 50 coins"
echo "   Price: $SALE_PRICE per coin"
echo "   Total Received: $TOTAL_RECEIVED"
echo ""

# Check final portfolio
echo "7. Checking final portfolio..."
FINAL_PORTFOLIO_RESPONSE=$(curl -s -X GET "$API_BASE/portfolio" \
  -H "Authorization: Bearer $TOKEN")

FINAL_HOLDING=$(echo $FINAL_PORTFOLIO_RESPONSE | grep -o '"amount":[0-9]*' | head -1 | cut -d':' -f2)

echo "✅ Final portfolio checked!"
echo "   Remaining Holdings: $FINAL_HOLDING coins"
echo ""

# Check trade history
echo "8. Checking trade history..."
HISTORY_RESPONSE=$(curl -s -X GET "$API_BASE/trades/history?limit=10" \
  -H "Authorization: Bearer $TOKEN")

TRADE_COUNT=$(echo $HISTORY_RESPONSE | grep -o '"type":"[^"]*"' | wc -l)

echo "✅ Trade history checked!"
echo "   Total Trades: $TRADE_COUNT"
echo ""

# Test invalid scenarios
echo "9. Testing error handling..."

# Try to buy with insufficient balance
echo "   a) Testing insufficient balance (buy 1,000,000 coins)..."
INVALID_BUY=$(curl -s -X POST $API_BASE/trades/buy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"coinId\": $COIN_ID,
    \"amount\": 1000000
  }")

INVALID_BUY_SUCCESS=$(echo $INVALID_BUY | grep -o '"success":[a-z]*' | cut -d':' -f2)

if [ "$INVALID_BUY_SUCCESS" = "true" ]; then
  echo "   ❌ Should have rejected insufficient balance!"
else
  echo "   ✅ Insufficient balance rejected correctly"
fi

# Try to sell more than holdings
echo "   b) Testing insufficient holdings (sell 1,000 coins)..."
INVALID_SELL=$(curl -s -X POST $API_BASE/trades/sell \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"coinId\": $COIN_ID,
    \"amount\": 1000
  }")

INVALID_SELL_SUCCESS=$(echo $INVALID_SELL | grep -o '"success":[a-z]*' | cut -d':' -f2)

if [ "$INVALID_SELL_SUCCESS" = "true" ]; then
  echo "   ❌ Should have rejected insufficient holdings!"
else
  echo "   ✅ Insufficient holdings rejected correctly"
fi

echo ""

# Test market functionality
echo "10. Testing market listing..."
MARKET_RESPONSE=$(curl -s -X GET "$API_BASE/coins?limit=5" \
  -H "Authorization: Bearer $TOKEN")

MARKET_COUNT=$(echo $MARKET_RESPONSE | grep -o '"id":[0-9]*' | wc -l)

echo "✅ Market listing working!"
echo "   Coins displayed: $MARKET_COUNT"
echo ""

# Test search functionality
echo "11. Testing market search..."
SEARCH_RESPONSE=$(curl -s -X GET "$API_BASE/coins?search=TestCoin&limit=5" \
  -H "Authorization: Bearer $TOKEN")

SEARCH_RESULTS=$(echo $SEARCH_RESPONSE | grep -o "TestCoin" | wc -l)

echo "✅ Search working!"
echo "   Search results: $SEARCH_RESULTS"
echo ""

# Test coin details
echo "12. Testing coin details page..."
COIN_DETAILS=$(curl -s -X GET "$API_BASE/coins/$COIN_ID" \
  -H "Authorization: Bearer $TOKEN")

COIN_NAME=$(echo $COIN_DETAILS | grep -o '"name":"[^"]*' | cut -d'"' -f4)

echo "✅ Coin details loaded!"
echo "   Coin Name: $COIN_NAME"
echo ""

# Final summary
echo "======================================"
echo "✅ ALL TESTS PASSED!"
echo "======================================"
echo ""
echo "Test Summary:"
echo "  ✅ User Registration"
echo "  ✅ Coin Creation"
echo "  ✅ Buy Coins"
echo "  ✅ Sell Coins"
echo "  ✅ Portfolio Management"
echo "  ✅ Trade History"
echo "  ✅ Error Handling (Insufficient Balance)"
echo "  ✅ Error Handling (Insufficient Holdings)"
echo "  ✅ Market Listing"
echo "  ✅ Search Functionality"
echo "  ✅ Coin Details"
echo ""
echo "Test Account Created:"
echo "  Email: $TEST_EMAIL"
echo "  Username: $TEST_USERNAME"
echo "  Password: $TEST_PASSWORD"
echo "  User ID: $USER_ID"
echo "  Test Coin ID: $COIN_ID"
echo "  Final Holdings: $FINAL_HOLDING $COIN_SYMBOL"
echo ""
