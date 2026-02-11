#!/bin/bash

echo "=== 快速用戶資料系統測試 ==="

# Register and get token
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser'$RANDOM'@example.com","username":"TestUser'$RANDOM'","password":"Test123!"}')

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
USER_ID=$(echo $RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

echo "✅ 用戶已註冊 - ID: $USER_ID"

# Test 1: Get profile
echo -e "\n【測試1】獲取用戶資料..."
curl -s "http://localhost:3000/api/profile/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.' 2>/dev/null || echo "沒有jq，顯示原始數據"

# Test 2: Update profile
echo -e "\n【測試2】更新資料..."
curl -s -X PATCH http://localhost:3000/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bio":"我是測試用戶 🎮","location":"Taiwan","website":"https://memelaunch.example"}' | jq '.' 2>/dev/null

# Test 3: Get achievements
echo -e "\n【測試3】獲取成就..."
curl -s "http://localhost:3000/api/profile/$USER_ID/achievements" \
  -H "Authorization: Bearer $TOKEN" | head -300

echo -e "\n\n✅ 所有API測試完成！"
echo "Token: $TOKEN"
echo "User ID: $USER_ID"
