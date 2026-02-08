#!/bin/bash

# Email Collection Feature Test Script

API_BASE="http://localhost:3000/api"

echo "🧪 Testing Email Collection Features"
echo "========================================"
echo ""

# Test 1: Subscribe with valid email
echo "1️⃣  Testing Email Subscription..."
RESPONSE=$(curl -s -X POST "$API_BASE/email/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","source":"test_script"}')

if [[ $RESPONSE == *"謝謝"* ]]; then
    echo -e "\033[0;32m✓ Email subscription passed\033[0m"
else
    echo -e "\033[0;31m✗ Email subscription failed\033[0m"
    echo "   Response: $RESPONSE"
fi
echo ""

# Test 2: Try duplicate email
echo "2️⃣  Testing Duplicate Email Detection..."
RESPONSE=$(curl -s -X POST "$API_BASE/email/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","source":"test_script"}')

if [[ $RESPONSE == *"已註冊"* ]]; then
    echo -e "\033[0;32m✓ Duplicate detection passed\033[0m"
else
    echo -e "\033[0;31m✗ Duplicate detection failed\033[0m"
    echo "   Response: $RESPONSE"
fi
echo ""

# Test 3: Invalid email format
echo "3️⃣  Testing Invalid Email Format..."
RESPONSE=$(curl -s -X POST "$API_BASE/email/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email","source":"test_script"}')

if [[ $RESPONSE == *"有效"* ]]; then
    echo -e "\033[0;32m✓ Email validation passed\033[0m"
else
    echo -e "\033[0;31m✗ Email validation failed\033[0m"
    echo "   Response: $RESPONSE"
fi
echo ""

# Test 4: Get stats
echo "4️⃣  Testing Email Stats..."
RESPONSE=$(curl -s "$API_BASE/email/stats")

if [[ $RESPONSE == *"total"* ]] && [[ $RESPONSE == *"active"* ]]; then
    echo -e "\033[0;32m✓ Email stats passed\033[0m"
    echo "   Stats: $(echo $RESPONSE | jq -r '.data')"
else
    echo -e "\033[0;31m✗ Email stats failed\033[0m"
fi
echo ""

# Test 5: Test unsubscribe
echo "5️⃣  Testing Unsubscribe..."
curl -s -X POST "$API_BASE/email/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@example.com","source":"test_script"}' > /dev/null

RESPONSE=$(curl -s -X POST "$API_BASE/email/unsubscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@example.com"}')

if [[ $RESPONSE == *"取消訂閱"* ]]; then
    echo -e "\033[0;32m✓ Unsubscribe passed\033[0m"
else
    echo -e "\033[0;31m✗ Unsubscribe failed\033[0m"
fi
echo ""

# Test 6: Re-subscribe after unsubscribe
echo "6️⃣  Testing Re-subscription..."
RESPONSE=$(curl -s -X POST "$API_BASE/email/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@example.com","source":"test_script"}')

if [[ $RESPONSE == *"重新訂閱"* ]] || [[ $RESPONSE == *"謝謝"* ]]; then
    echo -e "\033[0;32m✓ Re-subscription passed\033[0m"
else
    echo -e "\033[0;31m✗ Re-subscription failed\033[0m"
fi
echo ""

echo "========================================"
echo "✅ Email Collection Feature Tests Completed"
echo ""

# Show final stats
echo "📊 Final Email Stats:"
curl -s "$API_BASE/email/stats" | jq '.data'
echo ""
