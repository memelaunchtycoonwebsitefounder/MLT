#!/bin/bash

echo "=== 測試當前系統狀態 ==="

# Get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trade1770651466@example.com","password":"Trade123!"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo -e "\n1. 測試用戶認證"
USER_ID=$(curl -s http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN" \
  | grep -o '"id":[0-9]*' | cut -d':' -f2)
echo "User ID: $USER_ID"

echo -e "\n2. 測試評論API（不帶token）"
curl -s http://localhost:3000/api/social/comments/9 | head -100

echo -e "\n\n3. 測試評論API（帶token）"
curl -s http://localhost:3000/api/social/comments/9 \
  -H "Authorization: Bearer $TOKEN" | head -100

echo -e "\n\n4. 測試Dashboard數據"
curl -s http://localhost:3000/api/portfolio \
  -H "Authorization: Bearer $TOKEN" | head -100

echo -e "\n\n5. 測試持倉數據"
curl -s http://localhost:3000/api/portfolio/holdings \
  -H "Authorization: Bearer $TOKEN" | head -100
