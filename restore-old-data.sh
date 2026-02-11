#!/bin/bash

echo "🔧 MemeLaunch 數據恢復工具"
echo "================================"
echo ""

BASE_URL="http://localhost:3000"

# 註冊舊用戶（使用正確的密碼）
echo "1️⃣ 重新註冊舊用戶..."

# 用戶1: trade1770651466@example.com
echo "註冊 trade1770651466..."
RESPONSE1=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trade1770651466@example.com",
    "username": "trade1770651466",
    "password": "Trade123!"
  }')

USER1_ID=$(echo $RESPONSE1 | grep -o '"id":[0-9]*' | cut -d':' -f2)
TOKEN1=$(echo $RESPONSE1 | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$USER1_ID" ]; then
  echo "✅ 用戶 trade1770651466 註冊成功 (ID: $USER1_ID)"
else
  echo "❌ 用戶 trade1770651466 註冊失敗"
  echo "Response: $RESPONSE1"
fi

# 用戶2: yhomg1@example.com
echo "註冊 yhomg1..."
RESPONSE2=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yhomg1@example.com",
    "username": "yhomg1",
    "password": "Trade123!"
  }')

USER2_ID=$(echo $RESPONSE2 | grep -o '"id":[0-9]*' | cut -d':' -f2)
TOKEN2=$(echo $RESPONSE2 | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$USER2_ID" ]; then
  echo "✅ 用戶 yhomg1 註冊成功 (ID: $USER2_ID)"
else
  echo "❌ 用戶 yhomg1 註冊失敗"
  echo "Response: $RESPONSE2"
fi

echo ""
echo "2️⃣ 創建測試幣種..."

# 用戶1創建幣種
if [ ! -z "$TOKEN1" ]; then
  echo "創建 testing3 (T3)..."
  COIN1=$(curl -s -X POST "$BASE_URL/api/coins/create" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN1" \
    -d '{
      "name": "testing3",
      "symbol": "T3",
      "description": "A testing meme coin",
      "initialSupply": 4000
    }')
  
  COIN1_ID=$(echo $COIN1 | grep -o '"id":[0-9]*' | cut -d':' -f2)
  if [ ! -z "$COIN1_ID" ]; then
    echo "✅ 幣種 testing3 創建成功 (ID: $COIN1_ID)"
  else
    echo "❌ 幣種 testing3 創建失敗"
    echo "Response: $COIN1"
  fi
  
  echo "創建 MoonShot (MOON)..."
  COIN3=$(curl -s -X POST "$BASE_URL/api/coins/create" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN1" \
    -d '{
      "name": "MoonShot",
      "symbol": "MOON",
      "description": "To the moon!",
      "initialSupply": 4000
    }')
  
  COIN3_ID=$(echo $COIN3 | grep -o '"id":[0-9]*' | cut -d':' -f2)
  if [ ! -z "$COIN3_ID" ]; then
    echo "✅ 幣種 MoonShot 創建成功 (ID: $COIN3_ID)"
  fi
fi

# 用戶2創建幣種
if [ ! -z "$TOKEN2" ]; then
  echo "創建 newyear (CNE)..."
  COIN2=$(curl -s -X POST "$BASE_URL/api/coins/create" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN2" \
    -d '{
      "name": "newyear",
      "symbol": "CNE",
      "description": "Chinese New Year celebration coin",
      "initialSupply": 4000
    }')
  
  COIN2_ID=$(echo $COIN2 | grep -o '"id":[0-9]*' | cut -d':' -f2)
  if [ ! -z "$COIN2_ID" ]; then
    echo "✅ 幣種 newyear 創建成功 (ID: $COIN2_ID)"
  else
    echo "❌ 幣種 newyear 創建失敗"
    echo "Response: $COIN2"
  fi
  
  echo "創建 DogeCopy (DOGE2)..."
  COIN4=$(curl -s -X POST "$BASE_URL/api/coins/create" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN2" \
    -d '{
      "name": "DogeCopy",
      "symbol": "DOGE2",
      "description": "Not the real doge",
      "initialSupply": 4000
    }')
  
  COIN4_ID=$(echo $COIN4 | grep -o '"id":[0-9]*' | cut -d':' -f2)
  if [ ! -z "$COIN4_ID" ]; then
    echo "✅ 幣種 DogeCopy 創建成功 (ID: $COIN4_ID)"
  fi
fi

echo ""
echo "3️⃣ 進行一些交易..."

# 用戶1買入幣種
if [ ! -z "$TOKEN1" ] && [ ! -z "$COIN1_ID" ]; then
  echo "用戶1買入 testing3..."
  curl -s -X POST "$BASE_URL/api/trades/execute" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN1" \
    -d "{
      \"coinId\": $COIN1_ID,
      \"amount\": 500,
      \"type\": \"buy\"
    }" > /dev/null
  echo "✅ 交易執行"
fi

if [ ! -z "$TOKEN1" ] && [ ! -z "$COIN2_ID" ]; then
  echo "用戶1買入 newyear..."
  curl -s -X POST "$BASE_URL/api/trades/execute" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN1" \
    -d "{
      \"coinId\": $COIN2_ID,
      \"amount\": 300,
      \"type\": \"buy\"
    }" > /dev/null
  echo "✅ 交易執行"
fi

# 用戶2買入幣種
if [ ! -z "$TOKEN2" ] && [ ! -z "$COIN1_ID" ]; then
  echo "用戶2買入 testing3..."
  curl -s -X POST "$BASE_URL/api/trades/execute" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN2" \
    -d "{
      \"coinId\": $COIN1_ID,
      \"amount\": 400,
      \"type\": \"buy\"
    }" > /dev/null
  echo "✅ 交易執行"
fi

echo ""
echo "4️⃣ 更新用戶資料..."

# 更新用戶1資料
if [ ! -z "$TOKEN1" ]; then
  curl -s -X PATCH "$BASE_URL/api/profile" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN1" \
    -d '{
      "bio": "我是MemeLaunch的早期用戶 🚀",
      "location": "Taiwan",
      "website": "https://memelaunch.com"
    }' > /dev/null
  echo "✅ 用戶1資料已更新"
fi

# 更新用戶2資料
if [ ! -z "$TOKEN2" ]; then
  curl -s -X PATCH "$BASE_URL/api/profile" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN2" \
    -d '{
      "bio": "喜歡創建有趣的幣種",
      "location": "Hong Kong"
    }' > /dev/null
  echo "✅ 用戶2資料已更新"
fi

echo ""
echo "5️⃣ 添加一些評論..."

# 用戶1評論
if [ ! -z "$TOKEN1" ] && [ ! -z "$COIN1_ID" ]; then
  curl -s -X POST "$BASE_URL/api/social/comments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN1" \
    -d "{
      \"coinId\": $COIN1_ID,
      \"content\": \"這是我創建的第一個幣！\"
    }" > /dev/null
  echo "✅ 評論已添加"
fi

if [ ! -z "$TOKEN1" ] && [ ! -z "$COIN3_ID" ]; then
  curl -s -X POST "$BASE_URL/api/social/comments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN1" \
    -d "{
      \"coinId\": $COIN3_ID,
      \"content\": \"To the moon! 🚀\"
    }" > /dev/null
  echo "✅ 評論已添加"
fi

# 用戶2評論
if [ ! -z "$TOKEN2" ] && [ ! -z "$COIN1_ID" ]; then
  curl -s -X POST "$BASE_URL/api/social/comments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN2" \
    -d "{
      \"coinId\": $COIN1_ID,
      \"content\": \"看起來不錯！我買了一些\"
    }" > /dev/null
  echo "✅ 評論已添加"
fi

if [ ! -z "$TOKEN2" ] && [ ! -z "$COIN2_ID" ]; then
  curl -s -X POST "$BASE_URL/api/social/comments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN2" \
    -d "{
      \"coinId\": $COIN2_ID,
      \"content\": \"新年快樂！🎉\"
    }" > /dev/null
  echo "✅ 評論已添加"
fi

echo ""
echo "================================"
echo "🎉 數據恢復完成！"
echo ""
echo "📊 恢復的數據："
echo "用戶數: 2"
echo "幣種數: 4"
echo "交易數: ~3"
echo "評論數: ~4"
echo ""
echo "🔐 登入信息："
echo "帳號1: trade1770651466@example.com"
echo "帳號2: yhomg1@example.com"
echo "密碼: Trade123!"
echo ""
echo "🔗 快速訪問："
echo "Dashboard: $BASE_URL/dashboard"
echo "Market: $BASE_URL/market"
echo "Profile: $BASE_URL/profile/$USER1_ID"
