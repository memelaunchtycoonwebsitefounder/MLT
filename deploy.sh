#!/bin/bash
# 🚀 MemeLaunch Tycoon - 一鍵部署腳本
# 這個腳本會幫你完成所有部署步驟

set -e  # 遇到錯誤立即停止

echo "🚀 MemeLaunch Tycoon 部署腳本"
echo "================================"
echo ""

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 步驟 1: 檢查 Cloudflare API Key
echo "📋 步驟 1/7: 檢查 Cloudflare 認證..."
if ! npx wrangler whoami &>/dev/null; then
    echo -e "${RED}❌ Cloudflare API Key 未設置${NC}"
    echo ""
    echo "請執行以下步驟："
    echo "1. 前往 GenSpark Deploy 標籤頁"
    echo "2. 添加你的 Cloudflare API Key"
    echo "3. 或者運行: setup_cloudflare_api_key"
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ Cloudflare 認證成功${NC}"
fi

# 步驟 2: 創建生產數據庫（如果不存在）
echo ""
echo "📋 步驟 2/7: 檢查數據庫..."
DB_EXISTS=$(npx wrangler d1 list 2>/dev/null | grep "memelaunch-db" || echo "")
if [ -z "$DB_EXISTS" ]; then
    echo "🔧 創建生產數據庫..."
    npx wrangler d1 create memelaunch-db
    echo ""
    echo -e "${YELLOW}⚠️  重要：請複製上面的 database_id 到 wrangler.jsonc${NC}"
    echo "按 Enter 繼續..."
    read
else
    echo -e "${GREEN}✅ 數據庫已存在${NC}"
fi

# 步驟 3: 應用數據庫遷移
echo ""
echo "📋 步驟 3/7: 應用數據庫遷移..."
if npx wrangler d1 migrations apply memelaunch-db --remote; then
    echo -e "${GREEN}✅ 遷移成功${NC}"
else
    echo -e "${YELLOW}⚠️  遷移可能已應用（忽略錯誤）${NC}"
fi

# 步驟 4: 導入初始數據
echo ""
echo "📋 步驟 4/7: 導入初始數據..."
if [ -f "./seed.sql" ]; then
    if npx wrangler d1 execute memelaunch-db --remote --file=./seed.sql; then
        echo -e "${GREEN}✅ 數據導入成功${NC}"
    else
        echo -e "${YELLOW}⚠️  數據可能已存在（忽略錯誤）${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  seed.sql 不存在，跳過${NC}"
fi

# 步驟 5: 構建項目
echo ""
echo "📋 步驟 5/7: 構建項目..."
if npm run build; then
    echo -e "${GREEN}✅ 構建成功${NC}"
else
    echo -e "${RED}❌ 構建失敗${NC}"
    exit 1
fi

# 步驟 6: 創建/更新 Pages 項目
echo ""
echo "📋 步驟 6/7: 檢查 Pages 項目..."
PROJECT_EXISTS=$(npx wrangler pages project list 2>/dev/null | grep "webapp" || echo "")
if [ -z "$PROJECT_EXISTS" ]; then
    echo "🔧 創建 Pages 項目..."
    npx wrangler pages project create webapp \
        --production-branch main \
        --compatibility-date 2024-01-01
    echo -e "${GREEN}✅ 項目創建成功${NC}"
else
    echo -e "${GREEN}✅ 項目已存在${NC}"
fi

# 步驟 7: 部署
echo ""
echo "📋 步驟 7/7: 部署到 Cloudflare Pages..."
if npx wrangler pages deploy dist --project-name webapp; then
    echo ""
    echo -e "${GREEN}🎉 部署成功！${NC}"
    echo ""
    echo "你的網站已部署到："
    echo "🌍 Production: https://webapp.pages.dev"
    echo ""
    echo "下一步："
    echo "1. 設置 JWT Secret:"
    echo "   npx wrangler pages secret put JWT_SECRET --project-name webapp"
    echo ""
    echo "2. 訪問你的網站並測試功能"
    echo ""
else
    echo -e "${RED}❌ 部署失敗${NC}"
    exit 1
fi
