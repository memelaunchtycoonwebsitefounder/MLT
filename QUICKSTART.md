# 🚀 Cloudflare Pages 部署快速指南

## 📋 你需要做的事情

### ⭐ 方式 1: 使用互動式助手（最簡單）

```bash
cd /home/user/webapp
./deploy-helper.sh
```

這個腳本會逐步引導你完成所有步驟！

---

### 📝 方式 2: 手動步驟

#### 步驟 1️⃣: 設置 Cloudflare API Key

**在 GenSpark 中設置：**
1. 點擊左側 "**Deploy**" 標籤
2. 找到 "Cloudflare API Key" 設置
3. 添加你的 API token
4. 保存

**獲取 API Token：**
1. 訪問：https://dash.cloudflare.com/profile/api-tokens
2. 點擊 "Create Token"
3. 選擇 "Edit Cloudflare Workers" 模板
4. 點擊 "Create Token"
5. **複製並保存** token（只顯示一次！）

#### 步驟 2️⃣: 驗證 API Key

```bash
npx wrangler whoami
```

應該看到你的 Cloudflare 帳戶信息。

#### 步驟 3️⃣: 構建項目

```bash
cd /home/user/webapp
npm run build
```

#### 步驟 4️⃣: 創建數據庫

```bash
# 創建 D1 數據庫
npx wrangler d1 create memelaunch-db
```

**重要！** 複製輸出的 `database_id`，然後：

```bash
# 編輯 wrangler.jsonc，找到並替換：
"database_id": "你複製的-database-id"
```

#### 步驟 5️⃣: 應用數據庫遷移

```bash
# 應用所有遷移
npx wrangler d1 migrations apply memelaunch-db --remote

# 導入初始數據
npx wrangler d1 execute memelaunch-db --remote --file=./seed.sql
```

#### 步驟 6️⃣: 創建 Pages 項目

```bash
npx wrangler pages project create webapp \
  --production-branch main \
  --compatibility-date 2024-01-01
```

#### 步驟 7️⃣: 部署！

```bash
npx wrangler pages deploy dist --project-name webapp
```

成功後你會看到 URL：
```
🌍 Production: https://webapp.pages.dev
```

#### 步驟 8️⃣: 設置環境變數

```bash
# 設置 JWT Secret
npx wrangler pages secret put JWT_SECRET --project-name webapp
# 輸入一個強密鑰（至少 32 字符）

# 設置起始餘額
npx wrangler pages secret put STARTING_BALANCE --project-name webapp
# 輸入: 10000
```

---

## ✅ 完成！

你的網站現在運行在：**https://webapp.pages.dev**

### 🧪 測試清單

1. ✅ 訪問網站
2. ✅ 註冊新用戶
3. ✅ 創建幣種
4. ✅ 測試買賣交易
5. ✅ 檢查 AI Trader 活動

---

## 🔄 如何更新網站？

```bash
# 1. 修改代碼
# 2. 重新構建和部署
cd /home/user/webapp
npm run build
npx wrangler pages deploy dist --project-name webapp
```

---

## 📚 有用的命令

```bash
# 查看部署歷史
npx wrangler pages deployment list --project-name webapp

# 查看數據庫
npx wrangler d1 execute memelaunch-db --remote --command="SELECT * FROM users LIMIT 5"

# 更新環境變數
npx wrangler pages secret put KEY_NAME --project-name webapp

# 查看項目信息
npx wrangler pages project list
```

---

## 🆘 遇到問題？

### 問題 1: API Key 認證失敗
```bash
# 檢查認證
npx wrangler whoami

# 如果失敗，重新設置 API Key
# 前往 GenSpark Deploy 標籤頁
```

### 問題 2: 構建失敗
```bash
# 清理並重新安裝
rm -rf node_modules dist
npm install
npm run build
```

### 問題 3: 數據庫錯誤
```bash
# 檢查 database_id 是否正確
cat wrangler.jsonc | grep database_id

# 重新應用遷移
npx wrangler d1 migrations apply memelaunch-db --remote
```

### 問題 4: 部署失敗
```bash
# 查看詳細錯誤
npx wrangler pages deploy dist --project-name webapp --verbose

# 檢查項目是否存在
npx wrangler pages project list
```

---

## 💡 提示

- 📌 保存你的 Cloudflare API Token 在安全的地方
- 📌 第一次部署可能需要 5-10 分鐘
- 📌 部署後等待 1-2 分鐘讓服務完全啟動
- 📌 使用 `deploy-helper.sh` 可以避免手動步驟

---

## 🎯 推薦使用方式

**首次部署：**
```bash
./deploy-helper.sh
```

**日常更新：**
```bash
npm run build && npx wrangler pages deploy dist --project-name webapp
```

**查看完整文檔：**
```bash
cat DEPLOYMENT.md
```

---

**祝部署順利！🚀**

有任何問題隨時問我！
