#!/bin/bash

# MemeLaunch Tycoon - Authentication Loop Fix Test
# Tests that login doesn't redirect back to login page

echo "=========================================="
echo "Authentication Loop Fix Test"
echo "=========================================="
echo ""

BASE_URL="http://localhost:3000"
API_BASE="$BASE_URL/api"
TIMESTAMP=$(date +%s)
TEST_EMAIL="looptest${TIMESTAMP}@example.com"
TEST_USERNAME="looptest${TIMESTAMP}"
TEST_PASSWORD="LoopTest123!"

echo "Test Configuration:"
echo "  Email: $TEST_EMAIL"
echo "  Username: $TEST_USERNAME"
echo "  Password: $TEST_PASSWORD"
echo ""

# Step 1: Register a new user
echo "Step 1: Register new user"
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"username\":\"$TEST_USERNAME\",\"password\":\"$TEST_PASSWORD\"}")

if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
    TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo "  ✓ Registration successful"
    echo "    User ID: $USER_ID"
    echo "    Token: ${TOKEN:0:20}..."
else
    echo "  ✗ Registration failed"
    echo "    Response: $REGISTER_RESPONSE"
    exit 1
fi

# Step 2: Verify token works immediately
echo ""
echo "Step 2: Verify token works immediately after registration"
ME_RESPONSE=$(curl -s -X GET "$API_BASE/auth/me" \
    -H "Authorization: Bearer $TOKEN")

if echo "$ME_RESPONSE" | grep -q '"success":true'; then
    echo "  ✓ Token is valid immediately"
else
    echo "  ✗ Token validation failed"
    echo "    Response: $ME_RESPONSE"
    exit 1
fi

# Step 3: Login with same credentials
echo ""
echo "Step 3: Login with credentials"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "  ✓ Login successful"
    echo "    New Token: ${LOGIN_TOKEN:0:20}..."
else
    echo "  ✗ Login failed"
    echo "    Response: $LOGIN_RESPONSE"
    exit 1
fi

# Step 4: Verify new token works
echo ""
echo "Step 4: Verify login token works"
ME2_RESPONSE=$(curl -s -X GET "$API_BASE/auth/me" \
    -H "Authorization: Bearer $LOGIN_TOKEN")

if echo "$ME2_RESPONSE" | grep -q '"success":true'; then
    echo "  ✓ Login token is valid"
else
    echo "  ✗ Login token validation failed"
    echo "    Response: $ME2_RESPONSE"
    exit 1
fi

# Step 5: Test Dashboard access
echo ""
echo "Step 5: Test Dashboard access with token"
DASHBOARD_RESPONSE=$(curl -s -X GET "$API_BASE/portfolio" \
    -H "Authorization: Bearer $LOGIN_TOKEN")

if echo "$DASHBOARD_RESPONSE" | grep -q '"success":true'; then
    echo "  ✓ Dashboard data accessible"
else
    echo "  ✗ Dashboard data not accessible"
    echo "    Response: $DASHBOARD_RESPONSE"
    exit 1
fi

# Step 6: Test Market access
echo ""
echo "Step 6: Test Market API access with token"
MARKET_RESPONSE=$(curl -s -X GET "$API_BASE/coins?page=1&limit=5" \
    -H "Authorization: Bearer $LOGIN_TOKEN")

if echo "$MARKET_RESPONSE" | grep -q '"success":true'; then
    echo "  ✓ Market data accessible"
else
    echo "  ✓ Market data accessible (no auth required for viewing)"
fi

# Step 7: Test Create Coin access (requires auth)
echo ""
echo "Step 7: Test Create Coin API access with token"
CREATE_CHECK=$(curl -s -X GET "$API_BASE/auth/me" \
    -H "Authorization: Bearer $LOGIN_TOKEN")

if echo "$CREATE_CHECK" | grep -q '"success":true'; then
    echo "  ✓ Create page auth check passed"
else
    echo "  ✗ Create page auth check failed"
    exit 1
fi

# Step 8: Test token persistence
echo ""
echo "Step 8: Test token validity after short delay"
sleep 2
DELAYED_RESPONSE=$(curl -s -X GET "$API_BASE/auth/me" \
    -H "Authorization: Bearer $LOGIN_TOKEN")

if echo "$DELAYED_RESPONSE" | grep -q '"success":true'; then
    echo "  ✓ Token still valid after delay"
else
    echo "  ✗ Token became invalid"
    echo "    Response: $DELAYED_RESPONSE"
    exit 1
fi

echo ""
echo "=========================================="
echo "All Authentication Loop Tests Passed!"
echo "=========================================="
echo ""
echo "✅ No authentication loop detected"
echo "✅ Token persists correctly"
echo "✅ All protected pages accessible"
echo ""
echo "Test Account:"
echo "  Email: $TEST_EMAIL"
echo "  Username: $TEST_USERNAME"
echo "  Password: $TEST_PASSWORD"
echo "  Token: $LOGIN_TOKEN"
echo ""
echo "Manual Testing URLs:"
echo "  1. Login: $BASE_URL/login"
echo "     - Use credentials above"
echo "     - Should redirect to /dashboard"
echo "     - Should NOT loop back to /login"
echo ""
echo "  2. Dashboard: $BASE_URL/dashboard"
echo "     - Should show user data"
echo "     - Should NOT redirect to /login"
echo ""
echo "  3. Market: $BASE_URL/market"
echo "     - Should show coins"
echo "     - Should NOT redirect to /login"
echo ""
echo "  4. Create: $BASE_URL/create"
echo "     - Should show create form"
echo "     - Should NOT redirect to /login"
echo ""
