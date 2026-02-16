#!/bin/bash
# 🚀 Cloudflare Pages 部署助手
# 互動式引導部署流程

set -e

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   🚀 MemeLaunch Tycoon - Cloudflare Pages 部署助手      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# 函數：檢查命令是否存在
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $1 已安裝${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 未安裝${NC}"
        return 1
    fi
}

# 函數：顯示進度
show_progress() {
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

# ============================================
# 階段 0: 環境檢查
# ============================================
echo -e "${YELLOW}📋 階段 0/6: 環境檢查${NC}"
echo ""

check_command "node" || { echo "請安裝 Node.js"; exit 1; }
check_command "npm" || { echo "請安裝 npm"; exit 1; }
check_command "git" || { echo "請安裝 git"; exit 1; }

echo ""
echo -e "${GREEN}✅ 環境檢查通過！${NC}"
echo ""
read -p "按 Enter 繼續..."

# ============================================
# 階段 1: Cloudflare API Key 檢查
# ============================================
echo ""
echo -e "${YELLOW}📋 階段 1/6: Cloudflare API Key 檢查${NC}"
echo ""

if npx wrangler whoami &>/dev/null; then
    echo -e "${GREEN}✅ Cloudflare 認證成功！${NC}"
    npx wrangler whoami
else
    echo -e "${RED}❌ 尚未設置 Cloudflare API Key${NC}"
    echo ""
    echo -e "${YELLOW}請按照以下步驟設置:${NC}"
    echo ""
    echo "1. 訪問: https://dash.cloudflare.com/profile/api-tokens"
    echo "2. 點擊 'Create Token'"
    echo "3. 選擇 'Edit Cloudflare Workers' 模板"
    echo "4. 複製生成的 token"
    echo "5. 在 GenSpark Deploy 標籤頁中設置"
    echo ""
    echo "詳細說明請查看: cat CLOUDFLARE_API_SETUP.md"
    echo ""
    read -p "設置完成後按 Enter 繼續，或按 Ctrl+C 退出..."
    
    # 再次檢查
    if npx wrangler whoami &>/dev/null; then
        echo -e "${GREEN}✅ 認證成功！${NC}"
    else
        echo -e "${RED}❌ 認證失敗，請確保 API Key 設置正確${NC}"
        exit 1
    fi
fi

echo ""
read -p "按 Enter 繼續到下一步..."

# ============================================
# 階段 2: 項目構建
# ============================================
echo ""
echo -e "${YELLOW}📋 階段 2/6: 構建項目${NC}"
echo ""

show_progress "開始構建..."
if npm run build; then
    echo -e "${GREEN}✅ 構建成功！${NC}"
    ls -lh dist/
else
    echo -e "${RED}❌ 構建失敗${NC}"
    exit 1
fi

echo ""
read -p "按 Enter 繼續..."

# ============================================
# 階段 3: 數據庫設置
# ============================================
echo ""
echo -e "${YELLOW}📋 階段 3/6: 數據庫設置${NC}"
echo ""

show_progress "檢查數據庫..."
DB_EXISTS=$(npx wrangler d1 list 2>/dev/null | grep "memelaunch-db" || echo "")

if [ -z "$DB_EXISTS" ]; then
    echo "數據庫不存在，正在創建..."
    echo ""
    npx wrangler d1 create memelaunch-db
    echo ""
    echo -e "${YELLOW}⚠️  重要步驟！${NC}"
    echo "請複製上面輸出的 database_id"
    echo ""
    echo "然後編輯 wrangler.jsonc 文件:"
    echo "找到 d1_databases 部分，替換 database_id"
    echo ""
    echo "例如:"
    echo '  "database_id": "你複製的-database-id"'
    echo ""
    read -p "完成後按 Enter 繼續..."
else
    echo -e "${GREEN}✅ 數據庫已存在: memelaunch-db${NC}"
fi

echo ""
show_progress "應用數據庫遷移..."
if npx wrangler d1 migrations apply memelaunch-db --remote; then
    echo -e "${GREEN}✅ 遷移成功！${NC}"
else
    echo -e "${YELLOW}⚠️  遷移可能已應用（可以忽略）${NC}"
fi

echo ""
show_progress "導入初始數據..."
if [ -f "./seed.sql" ]; then
    if npx wrangler d1 execute memelaunch-db --remote --file=./seed.sql; then
        echo -e "${GREEN}✅ 數據導入成功！${NC}"
    else
        echo -e "${YELLOW}⚠️  數據可能已存在（可以忽略）${NC}"
    fi
fi

echo ""
read -p "按 Enter 繼續..."

# ============================================
# 階段 4: 創建 Pages 項目
# ============================================
echo ""
echo -e "${YELLOW}📋 階段 4/6: 創建/檢查 Pages 項目${NC}"
echo ""

show_progress "檢查項目..."
PROJECT_EXISTS=$(npx wrangler pages project list 2>/dev/null | grep "webapp" || echo "")

if [ -z "$PROJECT_EXISTS" ]; then
    echo "項目不存在，正在創建..."
    npx wrangler pages project create webapp \
        --production-branch main \
        --compatibility-date 2024-01-01
    echo -e "${GREEN}✅ 項目創建成功！${NC}"
else
    echo -e "${GREEN}✅ 項目已存在: webapp${NC}"
fi

echo ""
read -p "按 Enter 繼續..."

# ============================================
# 階段 5: 部署
# ============================================
echo ""
echo -e "${YELLOW}📋 階段 5/6: 部署到 Cloudflare Pages${NC}"
echo ""

show_progress "開始部署..."
echo ""

if npx wrangler pages deploy dist --project-name webapp; then
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║      🎉 部署成功！                           ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}你的網站已部署到:${NC}"
    echo ""
    echo "  🌍 Production: https://webapp.pages.dev"
    echo ""
else
    echo -e "${RED}❌ 部署失敗${NC}"
    exit 1
fi

echo ""
read -p "按 Enter 繼續到最後步驟..."

# ============================================
# 階段 6: 配置環境變數
# ============================================
echo ""
echo -e "${YELLOW}📋 階段 6/6: 配置環境變數${NC}"
echo ""

echo "現在需要設置一些重要的環境變數:"
echo ""

# JWT Secret
echo -e "${BLUE}1. 設置 JWT_SECRET${NC}"
echo "這是用於生成用戶登錄 token 的密鑰"
echo ""
read -p "是否現在設置？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "請輸入一個強密鑰（至少 32 字符）:"
    echo "或按 Enter 使用自動生成的密鑰"
    read -p "> " jwt_secret
    
    if [ -z "$jwt_secret" ]; then
        jwt_secret=$(openssl rand -base64 32 2>/dev/null || echo "your-super-secret-jwt-key-change-in-production-$(date +%s)")
        echo "自動生成: $jwt_secret"
    fi
    
    echo "$jwt_secret" | npx wrangler pages secret put JWT_SECRET --project-name webapp
    echo -e "${GREEN}✅ JWT_SECRET 設置成功${NC}"
else
    echo "稍後可以手動設置:"
    echo "  npx wrangler pages secret put JWT_SECRET --project-name webapp"
fi

echo ""

# Starting Balance
echo -e "${BLUE}2. 設置 STARTING_BALANCE${NC}"
echo "新用戶的起始餘額（推薦 10000）"
echo ""
read -p "是否現在設置？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "10000" | npx wrangler pages secret put STARTING_BALANCE --project-name webapp
    echo -e "${GREEN}✅ STARTING_BALANCE 設置成功${NC}"
else
    echo "稍後可以手動設置:"
    echo "  npx wrangler pages secret put STARTING_BALANCE --project-name webapp"
fi

# ============================================
# 完成！
# ============================================
echo ""
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                  🎉 部署完成！                           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BLUE}📊 部署信息:${NC}"
echo "  • 項目名稱: webapp"
echo "  • 生產 URL: https://webapp.pages.dev"
echo "  • 數據庫: memelaunch-db (Cloudflare D1)"
echo ""
echo -e "${BLUE}🔧 後續操作:${NC}"
echo "  1. 訪問你的網站並測試功能"
echo "  2. 註冊新用戶測試"
echo "  3. 創建幣種並測試交易"
echo "  4. 檢查 AI Trader 是否運行"
echo ""
echo -e "${BLUE}📚 有用的命令:${NC}"
echo "  • 查看部署列表:"
echo "    npx wrangler pages deployment list --project-name webapp"
echo ""
echo "  • 查看日誌:"
echo "    訪問 Cloudflare Dashboard > Pages > webapp > Logs"
echo ""
echo "  • 重新部署:"
echo "    npm run build && npx wrangler pages deploy dist --project-name webapp"
echo ""
echo "  • 更新數據庫:"
echo "    npx wrangler d1 migrations apply memelaunch-db --remote"
echo ""
echo -e "${GREEN}祝使用愉快！🚀${NC}"
echo ""
