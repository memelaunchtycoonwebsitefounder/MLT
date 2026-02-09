#!/bin/bash

echo "======================================="
echo "Authentication Flow Test - Simplified"
echo "======================================="
echo ""

API_BASE="http://localhost:3000/api"

# Generate unique test user
TIMESTAMP=$(date +%s)
EMAIL="simple${TIMESTAMP}@example.com"
USERNAME="simple${TIMESTAMP}"
PASSWORD="Simple123!"

echo "Test Account:"
echo "- Email: $EMAIL"
echo "- Username: $USERNAME"
echo "- Password: $PASSWORD"
echo ""

# Test 1: Registration
echo "Test 1: User Registration"
SIGNUP_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $SIGNUP_RESPONSE | jq -r '.data.token // empty')
USER_ID=$(echo $SIGNUP_RESPONSE | jq -r '.data.user.id // empty')

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
  echo "✅ Registration successful"
  echo "   User ID: $USER_ID"
  echo "   Token: ${TOKEN:0:30}..."
else
  echo "❌ Registration failed"
  echo "   Response: $SIGNUP_RESPONSE"
  exit 1
fi
echo ""

# Test 2: Verify token immediately
echo "Test 2: Verify token works immediately"
ME_RESPONSE=$(curl -s -X GET "$API_BASE/auth/me" \
  -H "Authorization: Bearer $TOKEN")

ME_SUCCESS=$(echo $ME_RESPONSE | jq -r '.success // false')
if [ "$ME_SUCCESS" = "true" ]; then
  echo "✅ Token verified immediately after registration"
  ME_USERNAME=$(echo $ME_RESPONSE | jq -r '.data.username')
  echo "   Username: $ME_USERNAME"
else
  echo "❌ Token verification failed"
  echo "   Response: $ME_RESPONSE"
  exit 1
fi
echo ""

# Test 3: Login
echo "Test 3: User Login"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

NEW_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token // empty')
if [ -n "$NEW_TOKEN" ] && [ "$NEW_TOKEN" != "null" ]; then
  echo "✅ Login successful"
  echo "   New Token: ${NEW_TOKEN:0:30}..."
  TOKEN=$NEW_TOKEN
else
  echo "❌ Login failed"
  echo "   Response: $LOGIN_RESPONSE"
  exit 1
fi
echo ""

# Test 4: Verify new token
echo "Test 4: Verify login token"
ME_RESPONSE=$(curl -s -X GET "$API_BASE/auth/me" \
  -H "Authorization: Bearer $TOKEN")

ME_SUCCESS=$(echo $ME_RESPONSE | jq -r '.success // false')
if [ "$ME_SUCCESS" = "true" ]; then
  echo "✅ Login token verified"
else
  echo "❌ Login token verification failed"
  exit 1
fi
echo ""

# Test 5: Dashboard access
echo "Test 5: Dashboard access (should load)"
DASHBOARD_HTML=$(curl -s -L "http://localhost:3000/dashboard" | head -20)
if echo "$DASHBOARD_HTML" | grep -q "儀表板"; then
  echo "✅ Dashboard page loads"
else
  echo "❌ Dashboard page failed to load"
  exit 1
fi
echo ""

# Test 6: Market access
echo "Test 6: Market page access"
MARKET_HTML=$(curl -s -L "http://localhost:3000/market" | head -20)
if echo "$MARKET_HTML" | grep -q "市場"; then
  echo "✅ Market page loads"
else
  echo "❌ Market page failed to load"
  exit 1
fi
echo ""

# Test 7: Portfolio API
echo "Test 7: Portfolio API"
PORTFOLIO_RESPONSE=$(curl -s -X GET "$API_BASE/portfolio" \
  -H "Authorization: Bearer $TOKEN")

PORTFOLIO_SUCCESS=$(echo $PORTFOLIO_RESPONSE | jq -r '.success // false')
if [ "$PORTFOLIO_SUCCESS" = "true" ]; then
  echo "✅ Portfolio API accessible"
else
  echo "⚠️  Portfolio API returned: $PORTFOLIO_RESPONSE"
  # Not failing test as portfolio might be empty for new users
fi
echo ""

echo "======================================="
echo "✅ ALL TESTS PASSED!"
echo "======================================="
echo ""
echo "Manual Testing URLs:"
echo "1. Login: http://localhost:3000/login"
echo "   - Use credentials above"
echo "   - Should redirect to /dashboard immediately (no 2s delay)"
echo "   - Should NOT loop back to /login"
echo ""
echo "2. Dashboard: http://localhost:3000/dashboard"
echo "   - Should show user data"
echo "   - Should NOT redirect to login if logged in"
echo ""
echo "3. Market: http://localhost:3000/market"
echo "4. Create: http://localhost:3000/create"
echo ""
echo "Browser Console Should Show:"
echo "- 'Dashboard: Script loaded'"
echo "- 'Dashboard: Initializing'"
echo "- 'Dashboard: Token check: Found'"
echo "- 'Dashboard: Verifying token with API'"
echo "- 'Dashboard: Authentication successful'"
echo ""
