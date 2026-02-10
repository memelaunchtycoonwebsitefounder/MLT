#!/bin/bash

echo "======================================"
echo "🧪 社交系統快速測試"
echo "======================================"

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test 1: Check if pages load
echo -e "\n${BLUE}Test 1: 檢查頁面載入${NC}"

echo -n "  - Dashboard 頁面: "
if curl -s http://localhost:3000/dashboard | grep -q "儀表板"; then
  echo -e "${GREEN}✅ OK${NC}"
else
  echo -e "${RED}❌ FAIL${NC}"
fi

echo -n "  - Market 頁面: "
if curl -s http://localhost:3000/market | grep -q "市場"; then
  echo -e "${GREEN}✅ OK${NC}"
else
  echo -e "${RED}❌ FAIL${NC}"
fi

echo -n "  - Social 頁面: "
if curl -s http://localhost:3000/social | grep -q "社交動態"; then
  echo -e "${GREEN}✅ OK${NC}"
else
  echo -e "${RED}❌ FAIL${NC}"
fi

echo -n "  - Coin 詳情頁: "
if curl -s http://localhost:3000/coin/9 | grep -q "幣種詳情"; then
  echo -e "${GREEN}✅ OK${NC}"
else
  echo -e "${RED}❌ FAIL${NC}"
fi

# Test 2: Check scripts
echo -e "\n${BLUE}Test 2: 檢查腳本載入${NC}"

echo -n "  - Social 頁面腳本: "
if curl -s http://localhost:3000/social | grep -q "social-page-simple.js"; then
  echo -e "${GREEN}✅ OK${NC}"
else
  echo -e "${RED}❌ FAIL${NC}"
fi

echo -n "  - Coin 頁面評論腳本: "
if curl -s http://localhost:3000/coin/9 | grep -q "comments-simple.js"; then
  echo -e "${GREEN}✅ OK${NC}"
else
  echo -e "${RED}❌ FAIL${NC}"
fi

echo -n "  - Coin 頁面無 social.js 衝突: "
if ! curl -s http://localhost:3000/coin/9 | grep -q 'src="/static/social.js"'; then
  echo -e "${GREEN}✅ OK (沒有衝突)${NC}"
else
  echo -e "${RED}❌ FAIL (有衝突)${NC}"
fi

# Test 3: Check navigation
echo -e "\n${BLUE}Test 3: 檢查導航鏈接${NC}"

echo -n "  - Dashboard 有社交鏈接: "
if curl -s http://localhost:3000/dashboard | grep -q 'href="/social"'; then
  echo -e "${GREEN}✅ OK${NC}"
else
  echo -e "${RED}❌ FAIL${NC}"
fi

echo -n "  - Market 有社交鏈接: "
if curl -s http://localhost:3000/market | grep -q 'href="/social"'; then
  echo -e "${GREEN}✅ OK${NC}"
else
  echo -e "${RED}❌ FAIL${NC}"
fi

echo -n "  - Coin 頁面有社交鏈接: "
if curl -s http://localhost:3000/coin/9 | grep -q 'href="/social"'; then
  echo -e "${GREEN}✅ OK${NC}"
else
  echo -e "${RED}❌ FAIL${NC}"
fi

# Test 4: API tests
echo -e "\n${BLUE}Test 4: API 功能測試${NC}"

# Login
TOKEN=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"trade1770651466@example.com","password":"Trade123!"}' | \
  grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
  echo -e "  - 登入: ${GREEN}✅ OK${NC}"
  
  # Test comment API
  echo -n "  - 獲取評論列表: "
  if curl -s "http://localhost:3000/api/social/comments/9" | grep -q "success"; then
    echo -e "${GREEN}✅ OK${NC}"
  else
    echo -e "${RED}❌ FAIL${NC}"
  fi
  
  # Test feed API
  echo -n "  - 獲取活動動態: "
  if curl -s "http://localhost:3000/api/social/feed" -H "Authorization: Bearer $TOKEN" | grep -q "success"; then
    echo -e "${GREEN}✅ OK${NC}"
  else
    echo -e "${RED}❌ FAIL${NC}"
  fi
  
  # Test stats API
  echo -n "  - 獲取社交統計: "
  if curl -s "http://localhost:3000/api/social/stats" -H "Authorization: Bearer $TOKEN" | grep -q "total_comments"; then
    echo -e "${GREEN}✅ OK${NC}"
  else
    echo -e "${RED}❌ FAIL${NC}"
  fi
else
  echo -e "  - 登入: ${RED}❌ FAIL${NC}"
fi

echo -e "\n${GREEN}======================================"
echo "測試完成！"
echo "======================================${NC}"

echo -e "\n${BLUE}📱 快速訪問連結：${NC}"
echo "  - Dashboard: http://localhost:3000/dashboard"
echo "  - Market: http://localhost:3000/market"
echo "  - Social: http://localhost:3000/social"
echo "  - Coin: http://localhost:3000/coin/9"
echo ""
echo "  測試帳號: trade1770651466@example.com / Trade123!"
