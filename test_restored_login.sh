#!/bin/bash

echo "🔐 測試恢復的帳號登入"
echo "================================"
echo ""

# Test User 5: QuickTest
echo "測試帳號 1: QuickTest"
LOGIN1=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "quicktest@example.com",
    "password": "testpass"
  }')

SUCCESS1=$(echo "$LOGIN1" | jq -r '.success // .token // "null"')
if [ "$SUCCESS1" != "null" ] && [ "$SUCCESS1" != "" ]; then
  echo "✅ QuickTest 登入成功"
  echo "$LOGIN1" | jq -r '.data.user | "   User: \(.username), MLT: \(.mlt_balance)"'
else
  echo "❌ QuickTest 登入失敗"
  echo "$LOGIN1" | jq -r '.error // .message'
fi

echo ""

# Test User 6: NavTestUser
echo "測試帳號 2: NavTestUser"
LOGIN2=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "navtest@example.com",
    "password": "testpass"
  }')

SUCCESS2=$(echo "$LOGIN2" | jq -r '.success // .token // "null"')
if [ "$SUCCESS2" != "null" ] && [ "$SUCCESS2" != "" ]; then
  echo "✅ NavTestUser 登入成功"
  echo "$LOGIN2" | jq -r '.data.user | "   User: \(.username), MLT: \(.mlt_balance)"'
else
  echo "❌ NavTestUser 登入失敗"
  echo "$LOGIN2" | jq -r '.error // .message'
fi

echo ""
echo "================================"
echo "💡 提示: 如果登入失敗，密碼可能已更改"
echo "   請使用註冊時設置的密碼"
echo "================================"

