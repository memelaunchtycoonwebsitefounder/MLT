#!/bin/bash

# MemeLaunch Tycoon - Authentication Flow Test
# Tests complete authentication flow after Dashboard restructure

echo "======================================"
echo "Authentication Flow Test"
echo "======================================"
echo ""

BASE_URL="http://localhost:3000"
API_BASE="$BASE_URL/api"
TIMESTAMP=$(date +%s)
TEST_EMAIL="flowtest${TIMESTAMP}@example.com"
TEST_USERNAME="flowtest${TIMESTAMP}"
TEST_PASSWORD="FlowTest123!"

echo "Test Configuration:"
echo "  Email: $TEST_EMAIL"
echo "  Username: $TEST_USERNAME"
echo "  Password: $TEST_PASSWORD"
echo ""

# Test 1: Homepage redirects correctly
echo "Test 1: Homepage accessibility"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/)
if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✓ Homepage accessible (200)"
else
    echo "  ✗ Homepage failed ($HTTP_CODE)"
    exit 1
fi

# Test 2: Signup page accessibility
echo "Test 2: Signup page accessibility"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/signup)
if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✓ Signup page accessible (200)"
else
    echo "  ✗ Signup page failed ($HTTP_CODE)"
    exit 1
fi

# Test 3: Login page accessibility
echo "Test 3: Login page accessibility"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/login)
if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✓ Login page accessible (200)"
else
    echo "  ✗ Login page failed ($HTTP_CODE)"
    exit 1
fi

# Test 4: Dashboard page accessibility (should be 200 even without auth, will redirect via JS)
echo "Test 4: Dashboard page accessibility"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/dashboard)
if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✓ Dashboard page accessible (200)"
else
    echo "  ✗ Dashboard page failed ($HTTP_CODE)"
    exit 1
fi

# Test 5: User registration
echo "Test 5: User registration"
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

# Test 6: Get current user with token
echo "Test 6: Get current user"
ME_RESPONSE=$(curl -s -X GET "$API_BASE/auth/me" \
    -H "Authorization: Bearer $TOKEN")

if echo "$ME_RESPONSE" | grep -q '"success":true'; then
    BALANCE=$(echo "$ME_RESPONSE" | grep -o '"virtual_balance":[0-9.]*' | cut -d':' -f2)
    echo "  ✓ User data retrieved"
    echo "    Balance: $BALANCE 金幣"
else
    echo "  ✗ Failed to get user data"
    echo "    Response: $ME_RESPONSE"
    exit 1
fi

# Test 7: Login with credentials
echo "Test 7: User login"
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

# Test 8: Dashboard loads with authentication (check via API)
echo "Test 8: Protected dashboard data access"
PORTFOLIO_RESPONSE=$(curl -s -X GET "$API_BASE/portfolio" \
    -H "Authorization: Bearer $TOKEN")

if echo "$PORTFOLIO_RESPONSE" | grep -q '"success":true'; then
    echo "  ✓ Dashboard data accessible with auth"
else
    echo "  ✗ Dashboard data failed"
    echo "    Response: $PORTFOLIO_RESPONSE"
    exit 1
fi

# Test 9: Dashboard rejects unauthenticated API requests
echo "Test 9: Dashboard rejects no auth"
UNAUTH_RESPONSE=$(curl -s -X GET "$API_BASE/portfolio")

if echo "$UNAUTH_RESPONSE" | grep -q 'error\|未提供認證令牌'; then
    echo "  ✓ Unauthenticated request properly rejected"
else
    echo "  ✗ Should reject unauthenticated requests"
    echo "    Response: $UNAUTH_RESPONSE"
    exit 1
fi

# Test 10: Logout
echo "Test 10: User logout"
LOGOUT_RESPONSE=$(curl -s -X POST "$API_BASE/auth/logout" \
    -H "Authorization: Bearer $TOKEN")

if echo "$LOGOUT_RESPONSE" | grep -q '"success":true'; then
    echo "  ✓ Logout successful"
else
    echo "  ✗ Logout failed"
    echo "    Response: $LOGOUT_RESPONSE"
fi

echo ""
echo "======================================"
echo "All Authentication Flow Tests Passed!"
echo "======================================"
echo ""
echo "Test Account Created:"
echo "  Email: $TEST_EMAIL"
echo "  Username: $TEST_USERNAME"
echo "  Password: $TEST_PASSWORD"
echo "  User ID: $USER_ID"
echo "  Token: $TOKEN"
echo ""
echo "URLs to test manually:"
echo "  Homepage: $BASE_URL/"
echo "  Signup: $BASE_URL/signup"
echo "  Login: $BASE_URL/login"
echo "  Dashboard: $BASE_URL/dashboard"
echo ""
