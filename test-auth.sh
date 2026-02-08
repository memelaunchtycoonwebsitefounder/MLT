#!/bin/bash

# MemeLaunch Tycoon - Authentication System Test Script

API_BASE="http://localhost:3000/api"
TIMESTAMP=$(date +%s)
TEST_EMAIL="authtest${TIMESTAMP}@example.com"
TEST_USERNAME="authtest${TIMESTAMP}"
TEST_PASSWORD="Test1234!"
NEW_PASSWORD="NewTest1234!"

echo "🧪 MemeLaunch Tycoon - Authentication System Tests"
echo "=================================================="
echo ""

# Test 1: User Registration
echo "1️⃣  Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST ${API_BASE}/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"username\": \"${TEST_USERNAME}\",
    \"password\": \"${TEST_PASSWORD}\"
  }")

if echo "$REGISTER_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token')
  USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.user.id')
  BALANCE=$(echo "$REGISTER_RESPONSE" | jq -r '.data.user.virtual_balance')
  echo "✅ Registration successful"
  echo "   User ID: $USER_ID"
  echo "   Starting Balance: $BALANCE"
  echo "   Token: ${TOKEN:0:20}..."
else
  echo "❌ Registration failed"
  echo "$REGISTER_RESPONSE" | jq
  exit 1
fi
echo ""

# Test 2: Get Current User Profile
echo "2️⃣  Testing Get Current User..."
PROFILE_RESPONSE=$(curl -s ${API_BASE}/auth/me \
  -H "Authorization: Bearer ${TOKEN}")

if echo "$PROFILE_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  USERNAME=$(echo "$PROFILE_RESPONSE" | jq -r '.data.username')
  EMAIL=$(echo "$PROFILE_RESPONSE" | jq -r '.data.email')
  echo "✅ Get user profile successful"
  echo "   Username: $USERNAME"
  echo "   Email: $EMAIL"
else
  echo "❌ Get user profile failed"
  echo "$PROFILE_RESPONSE" | jq
fi
echo ""

# Test 3: Login with Correct Credentials
echo "3️⃣  Testing Login (Correct Credentials)..."
LOGIN_RESPONSE=$(curl -s -X POST ${API_BASE}/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\"
  }")

if echo "$LOGIN_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  NEW_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')
  echo "✅ Login successful"
  echo "   Token: ${NEW_TOKEN:0:20}..."
else
  echo "❌ Login failed"
  echo "$LOGIN_RESPONSE" | jq
fi
echo ""

# Test 4: Login with Wrong Password
echo "4️⃣  Testing Login (Wrong Password)..."
WRONG_LOGIN=$(curl -s -X POST ${API_BASE}/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"WrongPassword123!\"
  }")

if echo "$WRONG_LOGIN" | jq -e '.error' > /dev/null 2>&1; then
  echo "✅ Correctly rejected wrong password"
else
  echo "❌ Should have rejected wrong password"
fi
echo ""

# Test 5: Forgot Password Request
echo "5️⃣  Testing Forgot Password..."
FORGOT_RESPONSE=$(curl -s -X POST ${API_BASE}/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\"
  }")

if echo "$FORGOT_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  RESET_TOKEN=$(echo "$FORGOT_RESPONSE" | jq -r '.data.resetLink' | sed 's/.*token=//')
  echo "✅ Forgot password request successful"
  echo "   Reset Token: ${RESET_TOKEN:0:20}..."
else
  echo "❌ Forgot password request failed"
  echo "$FORGOT_RESPONSE" | jq
fi
echo ""

# Test 6: Reset Password
echo "6️⃣  Testing Reset Password..."
RESET_RESPONSE=$(curl -s -X POST ${API_BASE}/auth/reset-password \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"${RESET_TOKEN}\",
    \"newPassword\": \"${NEW_PASSWORD}\"
  }")

if echo "$RESET_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo "✅ Password reset successful"
else
  echo "❌ Password reset failed"
  echo "$RESET_RESPONSE" | jq
fi
echo ""

# Test 7: Login with New Password
echo "7️⃣  Testing Login (New Password)..."
NEW_LOGIN=$(curl -s -X POST ${API_BASE}/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${NEW_PASSWORD}\"
  }")

if echo "$NEW_LOGIN" | jq -e '.success' > /dev/null 2>&1; then
  echo "✅ Login with new password successful"
else
  echo "❌ Login with new password failed"
  echo "$NEW_LOGIN" | jq
fi
echo ""

# Test 8: Duplicate Registration
echo "8️⃣  Testing Duplicate Registration..."
DUP_REGISTER=$(curl -s -X POST ${API_BASE}/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"username\": \"${TEST_USERNAME}_new\",
    \"password\": \"${TEST_PASSWORD}\"
  }")

if echo "$DUP_REGISTER" | jq -e '.error' > /dev/null 2>&1; then
  echo "✅ Correctly rejected duplicate email"
else
  echo "❌ Should have rejected duplicate email"
fi
echo ""

# Test 9: Weak Password Validation
echo "9️⃣  Testing Weak Password Rejection..."
WEAK_PWD=$(curl -s -X POST ${API_BASE}/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"weakpwd${TIMESTAMP}@example.com\",
    \"username\": \"weakpwd${TIMESTAMP}\",
    \"password\": \"123\"
  }")

if echo "$WEAK_PWD" | jq -e '.error' > /dev/null 2>&1; then
  echo "✅ Correctly rejected weak password"
else
  echo "❌ Should have rejected weak password"
fi
echo ""

# Test 10: Invalid Email Format
echo "🔟 Testing Invalid Email Format..."
INVALID_EMAIL=$(curl -s -X POST ${API_BASE}/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"notanemail\",
    \"username\": \"testuser${TIMESTAMP}\",
    \"password\": \"${TEST_PASSWORD}\"
  }")

if echo "$INVALID_EMAIL" | jq -e '.error' > /dev/null 2>&1; then
  echo "✅ Correctly rejected invalid email"
else
  echo "❌ Should have rejected invalid email"
fi
echo ""

echo "=================================================="
echo "🎉 All Authentication Tests Completed!"
echo ""
echo "Test Account Created:"
echo "  Email: ${TEST_EMAIL}"
echo "  Username: ${TEST_USERNAME}"
echo "  Final Password: ${NEW_PASSWORD}"
