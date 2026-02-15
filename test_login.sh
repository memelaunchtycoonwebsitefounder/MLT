#!/bin/bash

echo "🧪 測試登入功能..."

# 測試登入
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }')

echo "登入回應:"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"

# 提取 token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty' 2>/dev/null)

if [ -n "$TOKEN" ]; then
  echo ""
  echo "✅ 登入成功！Token: ${TOKEN:0:50}..."
  
  # 測試用戶資訊 API
  echo ""
  echo "🔍 測試用戶資訊 API..."
  ME_RESPONSE=$(curl -s -X GET http://localhost:3000/api/auth/me \
    -H "Authorization: Bearer $TOKEN")
  
  echo "用戶資訊回應:"
  echo "$ME_RESPONSE" | jq '.' 2>/dev/null || echo "$ME_RESPONSE"
else
  echo ""
  echo "❌ 登入失敗"
fi

