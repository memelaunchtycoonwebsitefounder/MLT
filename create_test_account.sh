#!/bin/bash

echo "🆕 創建新的測試帳號"
echo "================================"
echo ""

# Create new test account
REGISTER=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "RestoredUser",
    "email": "restored@test.com",
    "password": "testpass123"
  }')

SUCCESS=$(echo "$REGISTER" | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
  echo "✅ 新帳號創建成功！"
  echo ""
  echo "📝 登入憑證:"
  echo "   Email: restored@test.com"
  echo "   Password: testpass123"
  echo ""
  echo "💰 帳號資訊:"
  echo "$REGISTER" | jq -r '.data.user | "   用戶名: \(.username)\n   ID: \(.id)\n   MLT 餘額: \(.mlt_balance)\n   虛擬餘額: \(.virtual_balance)"'
  echo ""
  
  # Test login
  echo "🔐 測試登入..."
  LOGIN=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "restored@test.com",
      "password": "testpass123"
    }')
  
  LOGIN_SUCCESS=$(echo "$LOGIN" | jq -r '.success')
  if [ "$LOGIN_SUCCESS" = "true" ]; then
    echo "✅ 登入測試成功！"
  else
    echo "❌ 登入測試失敗"
    echo "$LOGIN" | jq .
  fi
else
  echo "❌ 創建帳號失敗"
  echo "$REGISTER" | jq .
fi

echo ""
echo "================================"

