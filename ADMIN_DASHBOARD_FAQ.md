# 管理員儀表板 & 郵件系統 - 常見問題

## ✅ 管理員儀表板已修復

### 訪問方式

**生產環境（任何人可訪問）**：
```
https://memelaunchtycoon.com/admin-dashboard
```

**當前數據**：
- 📊 總註冊用戶：**165 人**
- 📈 今日新增：0 人
- 📅 本週新增：125 人
- 📆 本月新增：17 人

---

## ⚠️ 安全警告：當前無認證保護

### 問題：任何人都可以訪問管理員儀表板

這意味著：
- ❌ 任何訪客都能看到用戶統計
- ❌ 用戶郵箱地址公開可見
- ❌ 註冊趨勢暴露

### 解決方案 1：簡單 Token 認證（推薦）

創建一個只有你知道的訪問鏈接：

```
https://memelaunchtycoon.com/admin-dashboard?token=your-secret-key-123
```

**實現方法**：我可以為你添加這個功能，只需 5 分鐘。

### 解決方案 2：管理員帳號認證

只有登入的管理員帳號才能訪問。需要：
1. 在數據庫添加 `role` 欄位
2. 修改認證中間件
3. 創建管理員帳號

---

## 📊 在 Cloudflare 直接查看數據

### 方法 1：命令行查詢（最快）

```bash
# 查詢總用戶數
npx wrangler d1 execute memelaunch-db --command="SELECT COUNT(*) as total FROM users"

# 查詢今日註冊
npx wrangler d1 execute memelaunch-db --command="SELECT COUNT(*) as today FROM users WHERE DATE(created_at) = DATE('now')"

# 查詢最近 10 位用戶
npx wrangler d1 execute memelaunch-db --command="SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 10"

# 查詢本週註冊
npx wrangler d1 execute memelaunch-db --command="SELECT COUNT(*) as week FROM users WHERE DATE(created_at) >= DATE('now', '-7 days')"
```

### 方法 2：Cloudflare Dashboard（視覺化）

1. **登入** https://dash.cloudflare.com
2. **選擇** Workers & Pages → D1
3. **點擊** `memelaunch-db` 數據庫
4. **進入** Console 標籤
5. **運行** SQL 查詢：
   ```sql
   SELECT COUNT(*) as total_users FROM users;
   SELECT * FROM users ORDER BY created_at DESC LIMIT 10;
   ```

### 方法 3：API 端點（編程訪問）

```bash
# 用戶統計
curl https://memelaunchtycoon.com/api/admin/stats/users

# 用戶列表（第 1 頁，每頁 20 條）
curl https://memelaunchtycoon.com/api/admin/users?page=1&limit=20
```

---

## 📧 郵件系統：只需要 Resend

### ✅ 使用 Resend.com（推薦）

**為什麼選擇 Resend：**
- 免費額度：每月 3,000 封郵件
- 簡單易用：只需一個 API 密鑰
- 高送達率：專業郵件基礎設施
- 無需 Gmail：完全獨立服務

**設置步驟（2 分鐘）：**

1. **註冊 Resend**：
   - 訪問 https://resend.com
   - 點擊 "Sign Up"（免費）

2. **獲取 API 密鑰**：
   - 登入後進入 "API Keys" 頁面
   - 點擊 "Create API Key"
   - 複製生成的密鑰（格式：`re_...`）

3. **配置到 Cloudflare**：
   ```bash
   npx wrangler secret put RESEND_API_KEY --project-name memelaunch-tycoon
   # 然後輸入你的 API 密鑰
   ```

4. **完成！** 🎉 新用戶註冊後會自動收到歡迎郵件

### ❌ 不需要使用 Gmail

**Gmail 的限制：**
- 每日只能發送 500 封
- 需要開啟「不安全應用訪問」
- 需要應用專用密碼
- 容易被標記為垃圾郵件
- 配置複雜

**Resend vs Gmail 對比：**

| 功能 | Resend | Gmail |
|------|--------|-------|
| 免費額度 | 3,000/月 | 500/天 |
| 設置難度 | ⭐ 簡單 | ⭐⭐⭐ 複雜 |
| 送達率 | 🟢 高 | 🟡 中等 |
| API 友好 | ✅ 是 | ⚠️ 需設置 |
| 需要個人帳號 | ❌ 否 | ✅ 是 |

---

## 🔧 快速操作指南

### 查看註冊統計（3 種方法）

**方法 1：訪問儀表板**
```
https://memelaunchtycoon.com/admin-dashboard
```

**方法 2：命令行查詢**
```bash
npx wrangler d1 execute memelaunch-db --command="SELECT COUNT(*) FROM users"
```

**方法 3：API 調用**
```bash
curl https://memelaunchtycoon.com/api/admin/stats/users
```

### 測試歡迎郵件

1. **配置 Resend API 密鑰**（見上文）

2. **註冊測試帳號**：
   ```
   https://memelaunchtycoon.com/signup
   ```

3. **檢查郵箱**（包括垃圾郵件夾）

4. **查看發送日誌**：
   - 登入 Resend Dashboard
   - 進入 "Emails" 頁面
   - 查看發送狀態

---

## 🎯 下一步建議

### 1. 添加管理員認證（重要！）

**當前風險**：任何人都能看到用戶數據

**解決方案**：
- 選項 A：添加 Token 認證（5 分鐘）
- 選項 B：使用管理員帳號（15 分鐘）

**你需要哪種方案？** 告訴我，我可以立即實現。

### 2. 配置郵件服務（5 分鐘）

**步驟**：
1. 註冊 Resend.com（免費）
2. 獲取 API 密鑰
3. 運行配置命令
4. 測試發送

**需要幫助？** 我可以提供詳細的截圖指南。

### 3. 優化數據展示（可選）

- 添加更多統計圖表
- 導出用戶數據為 CSV
- 設置郵件通知（新用戶註冊時通知你）

---

## 💡 常見問題

### Q: 我忘記了管理員儀表板的 URL？
**A**: `https://memelaunchtycoon.com/admin-dashboard`

### Q: 可以看到每個用戶的詳細信息嗎？
**A**: 可以，訪問 API：
```bash
curl "https://memelaunchtycoon.com/api/admin/users?page=1&limit=20"
```

### Q: 如何導出所有用戶數據？
**A**: 使用 Wrangler 查詢：
```bash
npx wrangler d1 execute memelaunch-db --command="SELECT * FROM users" --json > users.json
```

### Q: 歡迎郵件沒有發送？
**A**: 檢查清單：
1. ✅ Resend API 密鑰已配置？
2. ✅ 用戶填寫了有效郵箱？
3. ✅ 檢查垃圾郵件夾
4. ✅ 登入 Resend Dashboard 查看發送日誌

### Q: 可以自定義歡迎郵件內容嗎？
**A**: 可以！郵件模板在 `src/services/email.ts` 中，修改 `sendWelcomeEmail` 函數的 HTML 內容。

---

## 📞 需要幫助？

1. **添加管理員認證** - 告訴我你想要哪種方案
2. **配置 Resend API** - 我可以提供截圖指南
3. **自定義郵件模板** - 提供你想要的內容
4. **其他問題** - 隨時提問！

---

**部署狀態**：
- ✅ 管理員儀表板已部署：https://memelaunchtycoon.com/admin-dashboard
- ✅ 統計 API 已可用：https://memelaunchtycoon.com/api/admin/stats/users
- ⏳ 待配置：Resend API 密鑰（用於發送郵件）

**當前統計**（2026-03-03）：
- 總用戶：165 人
- 本週新增：125 人
- 本月新增：17 人
