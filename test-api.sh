#!/bin/bash

# MemeLaunch Tycoon API Test Script
# This script tests all major API endpoints

API_BASE="http://localhost:3000/api"
TOKEN=""

echo "🚀 MemeLaunch Tycoon API Test"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
RESPONSE=$(curl -s "$API_BASE/health")
if [[ $RESPONSE == *"ok"* ]]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
fi
echo ""

# Test 2: Register New User
echo "2️⃣  Testing User Registration..."
TIMESTAMP=$(date +%s)
REGISTER_DATA=$(cat <<EOF
{
  "email": "test${TIMESTAMP}@example.com",
  "username": "test${TIMESTAMP}",
  "password": "password123"
}
EOF
)

REGISTER_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$REGISTER_DATA" \
  "$API_BASE/auth/register")

if [[ $REGISTER_RESPONSE == *"token"* ]]; then
    echo -e "${GREEN}✓ Registration successful${NC}"
    TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "   Token: ${TOKEN:0:20}..."
else
    echo -e "${RED}✗ Registration failed${NC}"
    echo "   Response: $REGISTER_RESPONSE"
fi
echo ""

# Test 3: Get Current User
echo "3️⃣  Testing Get Current User..."
ME_RESPONSE=$(curl -s \
  -H "Authorization: Bearer $TOKEN" \
  "$API_BASE/auth/me")

if [[ $ME_RESPONSE == *"virtual_balance"* ]]; then
    echo -e "${GREEN}✓ Get user profile passed${NC}"
    echo "   Balance: $(echo $ME_RESPONSE | grep -o '"virtual_balance":[^,]*' | cut -d':' -f2)"
else
    echo -e "${RED}✗ Get user profile failed${NC}"
fi
echo ""

# Test 4: Create Coin
echo "4️⃣  Testing Create Coin..."
CREATE_COIN_DATA=$(cat <<EOF
{
  "name": "Test Meme ${TIMESTAMP}",
  "symbol": "TEST${TIMESTAMP:7:4}",
  "description": "A test meme coin for API testing",
  "imageUrl": "/static/default-coin.svg",
  "totalSupply": 1000000
}
EOF
)

CREATE_COIN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$CREATE_COIN_DATA" \
  "$API_BASE/coins")

if [[ $CREATE_COIN_RESPONSE == *"id"* ]]; then
    echo -e "${GREEN}✓ Coin creation passed${NC}"
    COIN_ID=$(echo $CREATE_COIN_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
    echo "   Coin ID: $COIN_ID"
else
    echo -e "${RED}✗ Coin creation failed${NC}"
    echo "   Response: $CREATE_COIN_RESPONSE"
fi
echo ""

# Test 5: Get Coins List
echo "5️⃣  Testing Get Coins List..."
COINS_RESPONSE=$(curl -s "$API_BASE/coins?limit=5")

if [[ $COINS_RESPONSE == *"coins"* ]]; then
    echo -e "${GREEN}✓ Get coins list passed${NC}"
    COIN_COUNT=$(echo $COINS_RESPONSE | grep -o '"coins":\[' | wc -l)
    echo "   Found coins"
else
    echo -e "${RED}✗ Get coins list failed${NC}"
fi
echo ""

# Test 6: Buy Coin
if [ ! -z "$COIN_ID" ]; then
    echo "6️⃣  Testing Buy Coin..."
    BUY_DATA=$(cat <<EOF
{
  "coinId": $COIN_ID,
  "amount": 100
}
EOF
)

    BUY_RESPONSE=$(curl -s -X POST \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "$BUY_DATA" \
      "$API_BASE/trades/buy")

    if [[ $BUY_RESPONSE == *"transactionId"* ]]; then
        echo -e "${GREEN}✓ Buy coin passed${NC}"
        echo "   Transaction ID: $(echo $BUY_RESPONSE | grep -o '"transactionId":[0-9]*' | cut -d':' -f2)"
    else
        echo -e "${RED}✗ Buy coin failed${NC}"
        echo "   Response: $BUY_RESPONSE"
    fi
    echo ""
else
    echo -e "${YELLOW}⊘ Skipping buy test (no coin ID)${NC}"
    echo ""
fi

# Test 7: Get Portfolio
echo "7️⃣  Testing Get Portfolio..."
PORTFOLIO_RESPONSE=$(curl -s \
  -H "Authorization: Bearer $TOKEN" \
  "$API_BASE/portfolio")

if [[ $PORTFOLIO_RESPONSE == *"stats"* ]]; then
    echo -e "${GREEN}✓ Get portfolio passed${NC}"
    echo "   Holdings: $(echo $PORTFOLIO_RESPONSE | grep -o '"holdings":\[' | wc -l)"
else
    echo -e "${RED}✗ Get portfolio failed${NC}"
fi
echo ""

# Test 8: Get Trade History
echo "8️⃣  Testing Get Trade History..."
HISTORY_RESPONSE=$(curl -s \
  -H "Authorization: Bearer $TOKEN" \
  "$API_BASE/trades/history")

if [[ $HISTORY_RESPONSE == *"transactions"* ]]; then
    echo -e "${GREEN}✓ Get trade history passed${NC}"
else
    echo -e "${RED}✗ Get trade history failed${NC}"
fi
echo ""

# Test 9: Get Leaderboard
echo "9️⃣  Testing Get Leaderboard (Players)..."
LEADERBOARD_RESPONSE=$(curl -s "$API_BASE/leaderboard/players?limit=10")

if [[ $LEADERBOARD_RESPONSE == *"success"* ]]; then
    echo -e "${GREEN}✓ Get leaderboard passed${NC}"
else
    echo -e "${RED}✗ Get leaderboard failed${NC}"
fi
echo ""

# Test 10: Get Trending Coins
echo "🔟 Testing Get Trending Coins..."
TRENDING_RESPONSE=$(curl -s "$API_BASE/coins/trending/list?limit=5")

if [[ $TRENDING_RESPONSE == *"success"* ]]; then
    echo -e "${GREEN}✓ Get trending coins passed${NC}"
else
    echo -e "${RED}✗ Get trending coins failed${NC}"
fi
echo ""

echo "========================================"
echo "✅ API Test Suite Completed"
echo ""
echo "Test Account:"
echo "  Email: test${TIMESTAMP}@example.com"
echo "  Username: test${TIMESTAMP}"
echo "  Password: password123"
echo ""
echo "Created Coin ID: ${COIN_ID:-N/A}"
echo ""
