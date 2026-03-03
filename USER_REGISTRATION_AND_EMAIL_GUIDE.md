# User Registration Statistics & Welcome Email Setup Guide

## 📊 功能概述

### 1. 用戶註冊統計
- **實時查看註冊人數**：總數、今日、本週、本月
- **註冊趨勢圖表**：最近 7 天的視覺化趨勢
- **最近註冊用戶列表**：顯示最新 10 位用戶
- **自動刷新**：每 30 秒自動更新數據

### 2. 歡迎郵件系統
- **自動發送**：用戶註冊後立即發送歡迎郵件
- **美觀模板**：專業的 HTML 郵件設計
- **包含內容**：
  - 個性化問候（使用用戶名）
  - 起始資金說明（$10,000 + 10,000 MLT）
  - 快速開始按鈕
  - 新手提示
  - 社群鏈接

---

## 🚀 快速開始

### 訪問管理員儀表板

1. **本地開發環境**：
   ```
   http://localhost:3000/admin-dashboard
   ```

2. **生產環境**：
   ```
   https://memelaunchtycoon.com/admin-dashboard
   ```

### 管理員儀表板功能

- ✅ 顯示總註冊人數
- ✅ 顯示今日新增用戶
- ✅ 顯示本週新增用戶
- ✅ 顯示本月新增用戶
- ✅ 註冊趨勢圖表（7 天）
- ✅ 最近註冊用戶列表
- ✅ 每 30 秒自動刷新
- ✅ 手動刷新按鈕

---

## 📧 郵件系統設置（Resend API）

### 步驟 1：註冊 Resend 帳號

1. **訪問** https://resend.com
2. **註冊免費帳號**：
   - 免費額度：每月 3,000 封郵件
   - 每日限制：100 封郵件
   - 完全滿足個人項目需求

### 步驟 2：獲取 API 密鑰

1. 登錄 Resend 儀表板
2. 進入 **API Keys** 頁面
3. 點擊 **Create API Key**
4. 複製生成的 API 密鑰（格式：`re_...`）

### 步驟 3：配置 API 密鑰

#### 方法 A：使用 Wrangler Secret（生產環境推薦）

```bash
# 在項目目錄運行
cd /home/user/webapp
npx wrangler secret put RESEND_API_KEY --project-name memelaunch-tycoon

# 然後輸入你的 API 密鑰
```

#### 方法 B：使用 .dev.vars 文件（本地開發）

創建 `.dev.vars` 文件：
```bash
cd /home/user/webapp
cat > .dev.vars << 'EOF'
RESEND_API_KEY=re_your_api_key_here
EOF
```

**重要**：確保 `.dev.vars` 已在 `.gitignore` 中（已包含）

### 步驟 4：驗證郵件域名（可選，用於生產環境）

#### 使用 Resend 免費測試域名
- 無需配置
- 可以立即發送測試郵件
- 郵件會顯示 "via resend.dev"

#### 配置自定義域名（生產環境推薦）
1. 在 Resend 儀表板添加你的域名
2. 添加 DNS 記錄（DKIM, SPF, DMARC）
3. 等待驗證完成（通常 5-30 分鐘）
4. 更新 `wrangler.jsonc` 中的 `EMAIL_FROM`：
   ```jsonc
   {
     "vars": {
       "EMAIL_FROM": "MemeLaunch Tycoon <noreply@yourdomain.com>"
     }
   }
   ```

---

## 🧪 測試郵件功能

### 方法 1：註冊新用戶

1. 訪問註冊頁面：
   ```
   https://memelaunchtycoon.com/signup
   ```

2. 填寫註冊表單：
   - 使用**真實郵箱地址**
   - 設置用戶名和密碼

3. 提交註冊

4. 檢查郵箱：
   - 查收歡迎郵件
   - 郵件標題：🎉 歡迎加入 MemeLaunch Tycoon！開始你的交易之旅
   - 檢查垃圾郵件資料夾（如果沒收到）

### 方法 2：檢查控制台日誌

在本地開發環境：
```bash
cd /home/user/webapp
pm2 logs --nostream | grep EMAIL
```

你應該看到類似的日誌：
```
[REGISTER] Welcome email sent to: user@example.com
```

如果郵件發送失敗：
```
[REGISTER] Failed to send welcome email: [error message]
```

### 方法 3：使用 API 直接測試

使用 curl 測試註冊 API：
```bash
curl -X POST https://memelaunchtycoon.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password123"
  }'
```

---

## 📊 API 端點

### 用戶統計 API

**GET** `/api/admin/stats/users`

返回數據：
```json
{
  "success": true,
  "data": {
    "total": 150,
    "today": 5,
    "week": 25,
    "month": 80,
    "recent": [
      {
        "id": 150,
        "username": "newuser",
        "email": "newuser@example.com",
        "created_at": "2026-03-02T10:30:00Z"
      }
    ],
    "trend": [
      { "date": "2026-03-02", "count": 5 },
      { "date": "2026-03-01", "count": 8 }
    ]
  }
}
```

### 用戶列表 API（分頁）

**GET** `/api/admin/users?page=1&limit=20`

返回數據：
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 150,
        "username": "newuser",
        "email": "newuser@example.com",
        "virtual_balance": 10000,
        "mlt_balance": 10000,
        "created_at": "2026-03-02T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

## 🎨 歡迎郵件內容

### 郵件包含：

1. **個性化問候**：使用用戶名
2. **起始資金說明**：
   - 💰 $10,000 虛擬交易資金
   - 🪙 10,000 MLT 平台代幣
3. **快速開始按鈕**：直接跳轉到交易面板
4. **新手提示**：
   - 觀察市場趨勢
   - 使用止損功能
   - 參與社群討論
   - 完成每日任務
5. **頁尾鏈接**：
   - 🏠 首頁
   - 📊 市場
   - 🏆 排行榜

### 郵件設計特點：

- ✅ 響應式設計（手機、平板、桌面完美顯示）
- ✅ 漸變背景和按鈕
- ✅ 品牌色系（橙色 #FF6B35）
- ✅ 易讀字體和間距
- ✅ HTML + 純文本版本（兼容所有郵件客戶端）

---

## 🔧 故障排除

### 郵件沒有發送？

**檢查清單：**

1. **API 密鑰已配置？**
   ```bash
   # 檢查生產環境
   npx wrangler secret list --project-name memelaunch-tycoon
   
   # 檢查本地環境
   cat .dev.vars
   ```

2. **API 密鑰有效？**
   - 登錄 Resend 儀表板
   - 檢查 API Keys 頁面
   - 確認密鑰未過期或刪除

3. **查看控制台日誌**：
   ```bash
   pm2 logs --nostream | grep -A 5 "REGISTER"
   ```

4. **測試 Resend API 連接**：
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer your_api_key_here" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "test@resend.dev",
       "to": "your@email.com",
       "subject": "Test",
       "html": "<p>Test email</p>"
     }'
   ```

### 郵件進入垃圾郵件？

**解決方案：**

1. **配置自定義域名**（見上文"步驟 4"）
2. **添加 DNS 記錄**：
   - SPF: `v=spf1 include:_spf.resend.com ~all`
   - DMARC: `v=DMARC1; p=none; pct=100; rua=mailto:dmarc@yourdomain.com`
3. **避免垃圾郵件詞彙**：
   - 不使用全大寫標題
   - 避免過多感嘆號
   - 提供取消訂閱鏈接

### 管理員儀表板顯示錯誤？

**可能原因：**

1. **數據庫未初始化**：
   ```bash
   npx wrangler d1 migrations apply memelaunch-db --local
   ```

2. **API 路由未啟用**：
   - 檢查 `src/index.tsx` 是否包含：
     ```typescript
     app.route('/api/admin', admin);
     ```

3. **CORS 問題**：
   - 檢查瀏覽器控制台
   - 確認 `cors()` 中間件已啟用

---

## 📝 代碼文件說明

### 新增文件：

1. **`src/services/email.ts`** (11.8 KB)
   - 郵件服務核心邏輯
   - `sendEmail()` - 通用郵件發送
   - `sendWelcomeEmail()` - 歡迎郵件模板
   - `sendPasswordResetEmail()` - 密碼重置郵件

2. **`src/routes/admin.ts`** (更新)
   - 新增 `GET /api/admin/stats/users` - 用戶統計
   - 新增 `GET /api/admin/users` - 用戶列表（分頁）

3. **`src/index.tsx`** (更新)
   - 新增 `GET /admin-dashboard` - 管理員儀表板頁面

4. **`src/routes/auth.ts`** (更新)
   - 註冊成功後自動發送歡迎郵件
   - 非阻塞式發送（不影響註冊流程）

5. **`src/types.ts`** (更新)
   - 添加 `RESEND_API_KEY` 和 `EMAIL_FROM` 環境變量

6. **`wrangler.jsonc`** (更新)
   - 添加 `EMAIL_FROM` 默認值

### 配置文件：

- **`.dev.vars`** (本地開發，需手動創建)
  ```
  RESEND_API_KEY=re_your_api_key_here
  ```

---

## 🎯 下一步計劃

### 已完成 ✅
- ✅ 用戶統計 API 端點
- ✅ 管理員儀表板頁面
- ✅ Resend 郵件服務集成
- ✅ 註冊時自動發送歡迎郵件
- ✅ 配置文檔

### 待辦事項 📋

1. **測試郵件功能**：
   - 註冊測試帳號
   - 驗證郵件送達
   - 檢查郵件樣式

2. **部署到生產環境**：
   ```bash
   cd /home/user/webapp
   npm run build
   npx wrangler pages deploy dist --project-name memelaunch-tycoon
   ```

3. **配置 Resend API 密鑰**（生產環境）：
   ```bash
   npx wrangler secret put RESEND_API_KEY --project-name memelaunch-tycoon
   ```

4. **監控郵件發送**：
   - 登錄 Resend 儀表板
   - 查看郵件統計
   - 檢查送達率

---

## 💡 使用建議

### 管理員儀表板
- **定期查看**：每天登錄查看新增用戶
- **分析趨勢**：觀察註冊高峰時段
- **優化營銷**：根據數據調整推廣策略

### 郵件系統
- **測試先行**：生產環境前先用測試郵箱驗證
- **監控配額**：注意免費版限制（3,000/月）
- **優化內容**：根據用戶反饋調整郵件模板
- **追蹤效果**：檢查郵件打開率和點擊率

### 安全建議
- ✅ API 密鑰使用 Secrets 管理
- ✅ 不要在代碼中硬編碼密鑰
- ✅ `.dev.vars` 已在 `.gitignore` 中
- ✅ 定期更換 API 密鑰

---

## 📞 支援資源

- **Resend 文檔**: https://resend.com/docs
- **Resend API 參考**: https://resend.com/docs/api-reference
- **Cloudflare Workers 文檔**: https://developers.cloudflare.com/workers/
- **Hono 框架文檔**: https://hono.dev/

---

## 🎉 總結

你現在擁有：

1. ✅ **實時用戶統計系統** - 隨時查看註冊人數和趨勢
2. ✅ **自動歡迎郵件** - 新用戶註冊後立即收到精美郵件
3. ✅ **管理員儀表板** - 視覺化展示用戶數據和趨勢圖
4. ✅ **易於擴展** - 可輕鬆添加更多郵件模板（密碼重置、活動通知等）

**下一步：配置 Resend API 密鑰，然後測試註冊流程！** 🚀
