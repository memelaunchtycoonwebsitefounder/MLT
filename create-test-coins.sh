#!/bin/bash

echo "🪙 創建測試幣種..."

# 從之前註冊的結果獲取token
echo "請使用帳號登入獲取token..."

# 登入用戶1
echo "登入 trade1770651466..."
LOGIN1=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trade1770651466@example.com",
    "password": "Trade123!"
  }')

TOKEN1=$(echo $LOGIN1 | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER1_ID=$(echo $LOGIN1 | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ ! -z "$TOKEN1" ]; then
  echo "✅ 用戶1登入成功 (ID: $USER1_ID)"
else
  echo "❌ 用戶1登入失敗"
  echo "Response: $LOGIN1"
  exit 1
fi

# 登入用戶2
echo "登入 yhomg1..."
LOGIN2=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yhomg1@example.com",
    "password": "Trade123!"
  }')

TOKEN2=$(echo $LOGIN2 | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER2_ID=$(echo $LOGIN2 | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ ! -z "$TOKEN2" ]; then
  echo "✅ 用戶2登入成功 (ID: $USER2_ID)"
else
  echo "❌ 用戶2登入失敗"
  exit 1
fi

echo ""
echo "創建幣種..."

# 用戶1創建幣種
echo "創建 testing3 (T3)..."
COIN1=$(curl -s -X POST "http://localhost:3000/api/coins" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{
    "name": "testing3",
    "symbol": "T3",
    "description": "A testing meme coin",
    "total_supply": 4000
  }')

echo "Response: $COIN1"
COIN1_ID=$(echo $COIN1 | grep -o '"id":[0-9]*' | cut -d':' -f2)
if [ ! -z "$COIN1_ID" ]; then
  echo "✅ 幣種 testing3 創建成功 (ID: $COIN1_ID)"
else
  echo "❌ 幣種 testing3 創建失敗"
fi

sleep 1

echo "創建 MoonShot (MOON)..."
COIN3=$(curl -s -X POST "http://localhost:3000/api/coins" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{
    "name": "MoonShot",
    "symbol": "MOON",
    "description": "To the moon!",
    "total_supply": 4000
  }')

COIN3_ID=$(echo $COIN3 | grep -o '"id":[0-9]*' | cut -d':' -f2)
if [ ! -z "$COIN3_ID" ]; then
  echo "✅ 幣種 MoonShot 創建成功 (ID: $COIN3_ID)"
else
  echo "❌ 幣種 MoonShot 創建失敗"
  echo "Response: $COIN3"
fi

sleep 1

# 用戶2創建幣種
echo "創建 newyear (CNE)..."
COIN2=$(curl -s -X POST "http://localhost:3000/api/coins" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN2" \
  -d '{
    "name": "newyear",
    "symbol": "CNE",
    "description": "Chinese New Year celebration coin",
    "total_supply": 4000
  }')

COIN2_ID=$(echo $COIN2 | grep -o '"id":[0-9]*' | cut -d':' -f2)
if [ ! -z "$COIN2_ID" ]; then
  echo "✅ 幣種 newyear 創建成功 (ID: $COIN2_ID)"
else
  echo "❌ 幣種 newyear 創建失敗"
  echo "Response: $COIN2"
fi

sleep 1

echo "創建 DogeCopy (DOGE2)..."
COIN4=$(curl -s -X POST "http://localhost:3000/api/coins" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN2" \
  -d '{
    "name": "DogeCopy",
    "symbol": "DOGE2",
    "description": "Not the real doge",
    "total_supply": 4000
  }')

COIN4_ID=$(echo $COIN4 | grep -o '"id":[0-9]*' | cut -d':' -f2)
if [ ! -z "$COIN4_ID" ]; then
  echo "✅ 幣種 DogeCopy 創建成功 (ID: $COIN4_ID)"
else
  echo "❌ 幣種 DogeCopy 創建失敗"
  echo "Response: $COIN4"
fi

echo ""
echo "🎉 幣種創建完成！"
echo ""
echo "幣種列表："
echo "- testing3 (T3): ID $COIN1_ID"
echo "- MoonShot (MOON): ID $COIN3_ID"
echo "- newyear (CNE): ID $COIN2_ID"
echo "- DogeCopy (DOGE2): ID $COIN4_ID"
