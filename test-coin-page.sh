#!/bin/bash
echo "🧪 測試幣種詳情頁"

# Login and get token
echo "1️⃣ 登入..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trade1770651466@example.com","password":"Trade123!"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ 登入失敗"
  exit 1
fi

echo "✅ 登入成功，Token: ${TOKEN:0:20}..."

# Test coin page with token
echo ""
echo "2️⃣ 測試幣種詳情頁..."
curl -s http://localhost:3000/coin/4 \
  -H "Cookie: auth_token=$TOKEN" \
  | grep -o "<title>[^<]*</title>"

echo ""
echo "3️⃣ 測試價格歷史API..."
curl -s http://localhost:3000/api/coins/4/price-history?limit=5 \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data.data | length'

echo ""
echo "✅ 測試完成"
