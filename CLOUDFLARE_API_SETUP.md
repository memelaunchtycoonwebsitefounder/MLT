🔑 Cloudflare API Key 設置指南
================================

## 步驟 1: 獲取 Cloudflare API Key

### A. 前往 Cloudflare Dashboard
1. 訪問: https://dash.cloudflare.com/profile/api-tokens
2. 點擊 "Create Token"

### B. 創建 API Token
1. 選擇模板: "Edit Cloudflare Workers"
2. 或者使用 "Custom token" 並設置以下權限:
   - Account > Cloudflare Pages: Edit
   - Account > D1: Edit
   - Zone > Workers Scripts: Edit

### C. 複製 Token
- 點擊 "Create Token"
- **立即複製並保存這個 token**（只會顯示一次）

## 步驟 2: 在 GenSpark 中設置

### 方式 1: 通過 Deploy 標籤頁（推薦）
1. 點擊 GenSpark 左側的 "Deploy" 標籤
2. 找到 "Cloudflare API Key" 設置區域
3. 粘貼你的 API token
4. 點擊保存

### 方式 2: 手動設置環境變數
```bash
export CLOUDFLARE_API_TOKEN="你的-api-token"
```

## 步驟 3: 驗證設置

運行以下命令驗證:
```bash
npx wrangler whoami
```

如果成功，你會看到你的 Cloudflare 帳戶信息。

## 需要幫助？

如果你遇到問題:
1. 確保 token 有正確的權限
2. 確保 token 沒有過期
3. 重新創建 token 並重試

設置完成後，回到這裡繼續部署流程！
