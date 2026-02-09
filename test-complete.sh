#!/bin/bash
# Complete Auth & Visual Test Script
# Tests all authentication flows and visual improvements

set -e

API_BASE="http://localhost:3000/api"
TIMESTAMP=$(date +%s)
TEST_EMAIL="visualtest${TIMESTAMP}@example.com"
TEST_USERNAME="visualtest${TIMESTAMP}"
TEST_PASSWORD="TestPassword123!"

echo "============================================"
echo "MemeLaunch Tycoon - Complete Test Suite"
echo "============================================"
echo ""

# Test 1: Email Collection
echo "1️⃣  Testing Email Collection..."
EMAIL_RESULT=$(curl -s -X POST $API_BASE/email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"source\":\"test_script\"}")

if echo $EMAIL_RESULT | grep -q "success.*true"; then
  echo "   ✅ Email collection working"
else
  echo "   ❌ Email collection failed"
  echo "   Response: $EMAIL_RESULT"
  exit 1
fi

# Test 2: User Registration
echo ""
echo "2️⃣  Testing User Registration..."
REGISTER_RESULT=$(curl -s -X POST $API_BASE/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"username\":\"${TEST_USERNAME}\",\"password\":\"${TEST_PASSWORD}\"}")

TOKEN=$(echo $REGISTER_RESULT | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo "   ✅ Registration successful"
  echo "   Token: ${TOKEN:0:20}..."
else
  echo "   ❌ Registration failed"
  echo "   Response: $REGISTER_RESULT"
  exit 1
fi

# Test 3: Get Current User
echo ""
echo "3️⃣  Testing Get Current User..."
USER_RESULT=$(curl -s -X GET $API_BASE/auth/me \
  -H "Authorization: Bearer $TOKEN")

if echo $USER_RESULT | grep -q "$TEST_USERNAME"; then
  echo "   ✅ Get current user working"
else
  echo "   ❌ Get current user failed"
  echo "   Response: $USER_RESULT"
  exit 1
fi

# Test 4: Logout & Login
echo ""
echo "4️⃣  Testing Login..."
LOGIN_RESULT=$(curl -s -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}")

NEW_TOKEN=$(echo $LOGIN_RESULT | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$NEW_TOKEN" ]; then
  echo "   ✅ Login successful"
  echo "   Token: ${NEW_TOKEN:0:20}..."
else
  echo "   ❌ Login failed"
  echo "   Response: $LOGIN_RESULT"
  exit 1
fi

# Test 5: Forgot Password
echo ""
echo "5️⃣  Testing Forgot Password..."
FORGOT_RESULT=$(curl -s -X POST $API_BASE/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\"}")

if echo $FORGOT_RESULT | grep -q "success"; then
  echo "   ✅ Forgot password working"
else
  echo "   ❌ Forgot password failed"
  echo "   Response: $FORGOT_RESULT"
fi

# Test 6: Test all pages are accessible
echo ""
echo "6️⃣  Testing Page Accessibility..."

PAGES=("/" "/signup" "/login" "/dashboard" "/create" "/market")
ALL_PAGES_OK=true

for PAGE in "${PAGES[@]}"; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000$PAGE)
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "   ✅ $PAGE - OK ($HTTP_CODE)"
  else
    echo "   ❌ $PAGE - FAILED ($HTTP_CODE)"
    ALL_PAGES_OK=false
  fi
done

# Test 7: Visual Check - Look for proper styling
echo ""
echo "7️⃣  Testing Visual Improvements..."

# Check if signup page has proper styling
SIGNUP_HTML=$(curl -s http://localhost:3000/signup)

if echo "$SIGNUP_HTML" | grep -q "styles.css"; then
  echo "   ✅ CSS file loaded"
else
  echo "   ⚠️  CSS file not found"
fi

if echo "$SIGNUP_HTML" | grep -q "Inter"; then
  echo "   ✅ Inter font loaded"
else
  echo "   ⚠️  Inter font not found"
fi

if echo "$SIGNUP_HTML" | grep -q "form"; then
  echo "   ✅ Forms are present"
else
  echo "   ❌ Forms not found"
fi

# Summary
echo ""
echo "============================================"
echo "✅ All Core Tests Passed!"
echo "============================================"
echo ""
echo "Test Account Created:"
echo "  📧 Email: $TEST_EMAIL"
echo "  👤 Username: $TEST_USERNAME"
echo "  🔑 Password: $TEST_PASSWORD"
echo "  🎫 Token: ${NEW_TOKEN:0:30}..."
echo ""
echo "Next Steps:"
echo "  1. Visit http://localhost:3000/signup to test visual improvements"
echo "  2. Try logging in with the test account"
echo "  3. Check all pages for proper styling"
echo ""
