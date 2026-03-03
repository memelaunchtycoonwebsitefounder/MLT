# 🚀 快速修復指南

## ✅ 已完成

### 1. 移除註冊彈窗 ✅
- 註冊成功後不再顯示彈窗通知
- 直接跳轉到 Dashboard
- 已部署到生產環境

## ⚠️ 需要你執行的步驟

### 修復郵件發送（5 分鐘）

你的 API Key 權限不足，導致 401 錯誤。需要創建一個**完整權限**的 API Key。

#### 步驟 1: 創建新的 API Key

1. **登錄 Resend**  
   訪問: https://resend.com/api-keys

2. **創建 API Key**  
   點擊「Create API Key」按鈕

3. **設置名稱**  
   例如: `MemeLaunch Production`

4. **選擇權限** ⚠️ **重要**  
   必須選擇 **「Full Access」** 或 **「Sending Access」**
   
   - ✅ **Full Access** (推薦) - 完整權限
   - ✅ **Sending Access** - 發送權限（足夠使用）
   - ❌ ~~Restricted~~ - 受限權限（會導致錯誤）

5. **選擇域名**  
   - 如果沒有驗證域名，選擇 **「All Domains」**
   - 如果已驗證，選擇對應域名

6. **複製 Key**  
   ⚠️ 創建後立即複製！只顯示一次！
   
   格式類似: `re_xxxxxxxxxxxxxxxxxx`

#### 步驟 2: 更新 Cloudflare Secret

打開終端（Terminal），執行以下命令：

```bash
cd /home/user/webapp

# 更新 API Key（會提示你輸入新的 Key）
npx wrangler pages secret put RESEND_API_KEY --project-name memelaunch-tycoon
```

當提示 `Enter a secret value:` 時，粘貼你剛才複製的新 API Key，然後按 Enter。

#### 步驟 3: 驗證設置

```bash
# 檢查 Secret 是否更新成功
npx wrangler pages secret list --project-name memelaunch-tycoon
```

應該看到：
```
✅ RESEND_API_KEY
✅ JWT_SECRET
✅ STARTING_BALANCE
```

#### 步驟 4: 測試郵件

1. 訪問 https://memelaunchtycoon.com/signup
2. 使用**真實的 Gmail 地址**註冊
3. 等待 1-3 分鐘
4. 檢查 Gmail 收件箱（或促銷標籤）

#### 步驟 5: 查看 Resend 日誌

1. 登錄 https://resend.com/logs
2. 應該看到狀態為 **200** (成功) 而不是 **401** (錯誤)
3. 確認郵件已發送

## 🎯 預期結果

### 成功標誌
- ✅ Resend 日誌顯示 200 狀態
- ✅ 收到歡迎郵件（1-5 分鐘內）
- ✅ 郵件內容正確顯示
- ✅ 可以點擊郵件中的按鈕

### 如果仍然失敗
提供以下信息：
1. Resend Logs 的錯誤截圖
2. 新 API Key 的權限設置（截圖，遮蓋完整 Key）
3. 註冊時使用的郵箱地址

## 📊 當前狀態檢查

### 已完成 ✅
- [x] 郵件服務代碼已集成
- [x] Cloudflare 環境已配置
- [x] 生產環境已部署
- [x] 移除註冊彈窗通知

### 待完成 ⏳
- [ ] 創建 Full Access API Key
- [ ] 更新 Cloudflare Secret
- [ ] 測試郵件發送
- [ ] 確認收到歡迎郵件

## 🔗 快速鏈接

- **Resend API Keys**: https://resend.com/api-keys
- **Resend Logs**: https://resend.com/logs
- **註冊頁面**: https://memelaunchtycoon.com/signup
- **管理員儀表板**: https://memelaunchtycoon.com/admin-dashboard?token=mlt-admin-2026-secure

## 💡 為什麼需要 Full Access？

你當前的 API Key（`re_Ss1QwEc5_9cN3G2EHZ2uSJqHnMqx6shPX`）是**受限權限**（Restricted），只能發送到特定地址或有其他限制。

**Full Access** 或 **Sending Access** 可以：
- ✅ 發送到任意郵箱地址
- ✅ 使用所有 Resend 功能
- ✅ 查看發送日誌
- ✅ 適合生產環境

## ❓ 常見問題

### Q: 為什麼不直接使用當前的 Key？
A: 當前 Key 權限不足，Resend API 返回 401 錯誤。

### Q: 創建新 Key 會影響舊 Key 嗎？
A: 不會。舊 Key 仍然有效，只是我們用新 Key 替換它。

### Q: 需要驗證域名嗎？
A: 不是必須的，但推薦驗證。可以提高郵件送達率。

### Q: 免費方案夠用嗎？
A: 足夠！每月 3,000 封郵件，對於大多數應用已經很充足。

---

**下一步**: 現在就去 Resend 創建新的 API Key，然後更新 Cloudflare Secret！

完成後告訴我結果 😊
