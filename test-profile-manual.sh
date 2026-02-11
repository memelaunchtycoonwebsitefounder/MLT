#!/bin/bash

echo "=== 手動用戶資料測試 ==="

# Register new user
echo "註冊新用戶..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"manual$(date +%s)@example.com\",\"username\":\"Manual$(date +%s)\",\"password\":\"Test123!\"}")

echo "註冊響應: $RESPONSE"

TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
USER_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | cut -d':' -f2)

echo "Token: $TOKEN"
echo "User ID: $USER_ID"

if [ -z "$TOKEN" ]; then
  echo "❌ 無法獲取token"
  exit 1
fi

# Test get profile
echo -e "\n=== 測試獲取資料 ==="
curl -s "http://localhost:3000/api/profile/$USER_ID" \
  -H "Authorization: Bearer $TOKEN"

# Test update profile  
echo -e "\n\n=== 測試更新資料 ==="
curl -s -X PATCH http://localhost:3000/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bio":"測試簡介","location":"Taiwan"}'

echo -e "\n\n✅ 測試完成"
