# 🚀 MemeLaunch Tycoon 部署指南

## 📌 部署選項對比

### 選項 1: GenSpark 託管部署（推薦給演示）
- ✅ 一鍵部署
- ✅ 無需配置
- ⚠️ 數據可能不持久
- ⚠️ 通常無自定義域名

### 選項 2: Cloudflare Pages（推薦給生產）
- ✅ 免費且強大
- ✅ 全球 CDN
- ✅ 持久化數據庫
- ✅ 自定義域名
- ⚠️ 需要簡單配置

---

## 🎯 方案 A: GenSpark 託管部署

### 前置準備
```bash
# 1. 確保代碼已提交
cd /home/user/webapp
git add -A
git commit -m "Ready for GenSpark deployment"

# 2. 確保項目已構建
npm run build
```

### 部署步驟

#### 如果 GenSpark 有內建部署按鈕：
1. 點擊 GenSpark 界面的"託管部署"或"Deploy"按鈕
2. 選擇部署目標：
   - **靜態網站**: 部署 `dist/` 目錄
   - **全棧應用**: 包含數據庫和 API
3. 配置環境變數：
   - `NODE_ENV`: production
   - `JWT_SECRET`: 你的密鑰（至少 32 字符）
   - `STARTING_BALANCE`: 10000
4. 點擊"開始部署"

#### 如果需要手動配置：
```bash
# 創建部署配置文件
cat > .genspark-deploy.json << 'EOF'
{
  "name": "memelaunch-tycoon",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "startCommand": "npx wrangler pages dev dist --port 3000",
  "envVars": {
    "NODE_ENV": "production",
    "STARTING_BALANCE": "10000"
  }
}
EOF
```

---

## 🚀 方案 B: Cloudflare Pages（完整控制）

### 自動部署（推薦）

我已為你創建了一鍵部署腳本：

```bash
cd /home/user/webapp
./deploy.sh
```

這個腳本會自動：
1. ✅ 檢查 Cloudflare 認證
2. ✅ 創建生產數據庫
3. ✅ 應用所有遷移
4. ✅ 導入初始數據
5. ✅ 構建項目
6. ✅ 部署到 Cloudflare Pages

### 手動部署（逐步）

#### 步驟 1: 設置 Cloudflare API Key
```bash
# 方法 1: 使用 GenSpark 工具
setup_cloudflare_api_key

# 方法 2: 手動設置
# 前往 GenSpark Deploy 標籤頁添加 API Key
```

#### 步驟 2: 創建生產數據庫
```bash
# 創建數據庫
npx wrangler d1 create memelaunch-db

# 輸出示例：
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**更新 wrangler.jsonc**:
```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "memelaunch-db",
      "database_id": "你複製的-database-id"  // ⚠️ 替換這裡！
    }
  ]
}
```

#### 步驟 3: 應用數據庫遷移
```bash
# 應用所有遷移到生產環境
npx wrangler d1 migrations apply memelaunch-db --remote

# 導入初始數據
npx wrangler d1 execute memelaunch-db --remote --file=./seed.sql
```

#### 步驟 4: 構建項目
```bash
npm run build
```

#### 步驟 5: 創建 Pages 項目
```bash
npx wrangler pages project create webapp \
  --production-branch main \
  --compatibility-date 2024-01-01
```

#### 步驟 6: 部署
```bash
npx wrangler pages deploy dist --project-name webapp
```

#### 步驟 7: 設置環境變數
```bash
# 設置 JWT Secret
npx wrangler pages secret put JWT_SECRET --project-name webapp
# 輸入一個強密鑰（至少 32 字符）

# 設置起始餘額
npx wrangler pages secret put STARTING_BALANCE --project-name webapp
# 輸入: 10000
```

---

## 📊 部署後檢查

### 測試清單
```bash
# 1. 檢查網站是否可訪問
curl https://webapp.pages.dev

# 2. 測試註冊 API
curl -X POST https://webapp.pages.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"Test","password":"Test123!"}'

# 3. 檢查 Scheduler 狀態
curl https://webapp.pages.dev/api/scheduler/status

# 4. 測試數據庫
npx wrangler d1 execute memelaunch-db --remote --command="SELECT COUNT(*) FROM users"
```

---

## 🔄 部署後可以修改嗎？

### ✅ 是的！隨時可以修改

#### 修改代碼
```bash
# 1. 在 Sandbox 修改代碼
# 2. 提交更改
git add -A
git commit -m "Updated features"

# 3. 重新構建和部署
npm run build
npx wrangler pages deploy dist --project-name webapp
```

#### 修改數據庫
```bash
# 1. 創建新的遷移文件
cat > migrations/0021_new_feature.sql << 'EOF'
ALTER TABLE coins ADD COLUMN new_field TEXT;
EOF

# 2. 應用到生產
npx wrangler d1 migrations apply memelaunch-db --remote
```

#### 修改環境變數
```bash
# 更新 secret
npx wrangler pages secret put JWT_SECRET --project-name webapp
```

---

## 🗄️ 數據存儲說明

### 開發環境（當前）
- **位置**: `/home/user/webapp/.wrangler/state/v3/d1/`
- **類型**: SQLite 本地文件
- **大小**: ~4.5 MB（包含所有測試數據）
- **持久性**: ⚠️ 僅在 Sandbox 中存在

### 生產環境（部署後）
- **位置**: Cloudflare D1（雲端）
- **類型**: 分布式 SQLite
- **大小**: 無限制（免費層級 5 GB）
- **持久性**: ✅ 永久保存
- **備份**: 自動備份

### 數據遷移
```bash
# 如果想保留開發數據到生產環境：

# 方法 1: 使用 seed.sql（推薦）
npx wrangler d1 execute memelaunch-db --remote --file=./seed.sql

# 方法 2: 導出本地數據庫
sqlite3 .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite .dump > backup.sql
# 手動編輯 backup.sql 移除不需要的數據
npx wrangler d1 execute memelaunch-db --remote --file=backup.sql
```

---

## ⚠️ 注意事項

### 1. 數據隔離
- ❗ 本地數據和生產數據是**完全獨立**的
- ❗ 部署不會自動同步本地數據
- ❗ 需要手動遷移重要數據

### 2. 環境變數
- 🔒 JWT_SECRET 必須在生產環境設置
- 🔒 不要在代碼中硬編碼密鑰
- 🔒 使用 `wrangler pages secret` 管理敏感資訊

### 3. 數據庫更改
- ⚠️ 使用遷移文件，不要直接修改表結構
- ⚠️ 測試遷移在本地後再應用到生產
- ⚠️ 備份重要數據

### 4. 回滾
- ✅ Cloudflare Pages 保留所有部署版本
- ✅ 可以在 Dashboard 中一鍵回滾
- ✅ 數據庫遷移無法自動回滾（需要手動）

---

## 🆘 常見問題

### Q1: 部署失敗怎麼辦？
**檢查清單**:
```bash
# 1. 確認 API Key
npx wrangler whoami

# 2. 確認構建成功
npm run build

# 3. 確認 database_id 正確
cat wrangler.jsonc | grep database_id

# 4. 查看詳細錯誤
npx wrangler pages deploy dist --project-name webapp --verbose
```

### Q2: 如何查看生產環境日誌？
```bash
# Cloudflare Dashboard > Pages > webapp > Logs
# 或使用 wrangler
npx wrangler pages deployment list --project-name webapp
```

### Q3: 如何更新生產數據庫？
```bash
# 創建遷移文件
echo "ALTER TABLE users ADD COLUMN avatar_url TEXT;" > migrations/0021_avatar.sql

# 應用到生產
npx wrangler d1 migrations apply memelaunch-db --remote
```

### Q4: 如何備份生產數據？
```bash
# 導出數據庫（實驗性功能）
npx wrangler d1 export memelaunch-db > backup_$(date +%Y%m%d).sql
```

### Q5: GenSpark 託管部署會保留數據嗎？
**取決於平台**:
- 如果使用臨時容器：❌ 重啟後數據丟失
- 如果使用持久化卷：✅ 數據保留
- **建議**: 使用 Cloudflare D1 確保數據持久化

---

## 🎯 推薦部署流程

### 首次部署
1. ✅ 使用自動部署腳本: `./deploy.sh`
2. ✅ 設置環境變數
3. ✅ 測試所有功能
4. ✅ 記錄生產 URL

### 日常更新
1. ✅ 在 Sandbox 開發和測試
2. ✅ 提交代碼到 Git
3. ✅ 運行 `npm run build && npx wrangler pages deploy dist --project-name webapp`
4. ✅ 驗證更新成功

### 數據庫更新
1. ✅ 創建遷移文件
2. ✅ 在本地測試: `npm run db:migrate:local`
3. ✅ 應用到生產: `npm run db:migrate:prod`
4. ✅ 驗證數據完整性

---

## 📞 需要幫助？

如果遇到任何問題：
1. 檢查本文檔的"常見問題"部分
2. 運行 `./deploy.sh` 自動診斷
3. 查看 Cloudflare Dashboard 的錯誤日誌
4. 聯繫 GenSpark 支持

---

**祝部署順利！🚀**
