# 📧 郵件系統問題排查

## ⚠️ 當前問題

### 問題 1: API Key 權限錯誤
**錯誤信息**: `401 - "restricted api key"`

**原因**: Resend API Key 的權限設置不正確

### 解決方案

#### 步驟 1: 檢查 API Key 權限
1. 訪問 https://resend.com/api-keys
2. 找到你的 API Key: `re_Ss1QwEc5_9cN3G2EHZ2uSJqHnMqx6shPX`
3. 檢查權限設置

#### 步驟 2: 創建新的 API Key（推薦）
**重要**: 你當前的 API Key 可能權限不足，需要創建一個完整權限的 Key

1. **登錄 Resend**: https://resend.com/login
2. **進入 API Keys**: 點擊左側菜單「API Keys」
3. **創建新 Key**: 點擊「Create API Key」按鈕
4. **設置名稱**: 例如 "MemeLaunch Production"
5. **選擇權限**: **必須選擇「Full Access」或「Sending Access」**
   - ✅ **Full Access** (推薦) - 完整權限
   - ✅ **Sending Access** - 只能發送郵件（足夠使用）
   - ❌ **Restricted** - 受限權限（會導致 401 錯誤）
6. **選擇域名**: 
   - 如果已驗證域名，選擇對應域名
   - 如果沒有，選擇「All Domains」
7. **複製 Key**: 創建後立即複製新的 API Key（只顯示一次！）

#### 步驟 3: 更新 Cloudflare Secret
```bash
cd /home/user/webapp

# 更新 API Key（粘貼新的 Key）
npx wrangler pages secret put RESEND_API_KEY --project-name memelaunch-tycoon

# 驗證設置
npx wrangler pages secret list --project-name memelaunch-tycoon
```

#### 步驟 4: 重新部署
```bash
npm run build
npx wrangler pages deploy dist --project-name memelaunch-tycoon
```

## 📋 API Key 權限說明

### Full Access（完整權限）✅ 推薦
- 可以發送郵件
- 可以查看郵件日誌
- 可以管理域名
- 可以查看統計數據
- **用於生產環境**

### Sending Access（發送權限）✅ 足夠
- 只能發送郵件
- 無法查看日誌或統計
- **也可用於生產環境**

### Restricted（受限權限）❌ 不推薦
- 權限受限
- 可能只能發送到特定地址
- **會導致 401 錯誤**
- **不適合生產環境**

## 🧪 測試新的 API Key

### 方法 1: 直接測試（推薦）
註冊一個新賬戶，查看 Resend 日誌：

```bash
# 1. 訪問網站註冊
https://memelaunchtycoon.com/signup

# 2. 使用真實 Gmail 地址註冊

# 3. 登錄 Resend 查看日誌
https://resend.com/logs

# 4. 應該看到狀態 200（成功）而不是 401（錯誤）
```

### 方法 2: API 測試
```bash
# 使用新的 API Key 測試
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_NEW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "MemeLaunch Tycoon <noreply@memelaunchtycoon.com>",
    "to": "your-email@gmail.com",
    "subject": "Test Email",
    "html": "<p>This is a test email</p>"
  }'

# 成功的響應應該是：
# {"id": "some-id-here"}

# 401 錯誤響應：
# {"name": "restricted api key", "message": "..."}
```

## 📊 驗證域名（可選但推薦）

### 為什麼要驗證域名？
- ✅ 提高郵件送達率（不易進垃圾郵件）
- ✅ 使用自定義發件人地址（例如：noreply@memelaunchtycoon.com）
- ✅ 提升品牌信譽
- ✅ 避免被標記為垃圾郵件

### 如何驗證域名？
1. **登錄 Resend**: https://resend.com/domains
2. **添加域名**: 點擊「Add Domain」
3. **輸入域名**: `memelaunchtycoon.com`
4. **複製 DNS 記錄**: Resend 會提供 3 條 DNS 記錄
5. **添加到 Cloudflare DNS**:
   - 登錄 Cloudflare Dashboard
   - 選擇域名 `memelaunchtycoon.com`
   - 進入 DNS 設置
   - 添加 Resend 提供的 TXT 和 CNAME 記錄
6. **驗證**: 返回 Resend 點擊「Verify Domain」

### DNS 記錄示例
```
類型: TXT
名稱: @
內容: resend-verify=xxxxx...

類型: CNAME  
名稱: resend._domainkey
內容: resend._domainkey.resend.com

類型: CNAME
名稱: resend2._domainkey  
內容: resend2._domainkey.resend.com
```

## ⚙️ 完整設置檢查清單

### Resend 端
- [ ] 創建了 Full Access 或 Sending Access 的 API Key
- [ ] API Key 沒有域名限制（或已選擇正確域名）
- [ ] API Key 沒有 IP 白名單限制
- [ ] （可選）已驗證域名 memelaunchtycoon.com

### Cloudflare 端  
- [ ] 已更新 RESEND_API_KEY secret
- [ ] Secret 列表中顯示 RESEND_API_KEY
- [ ] 已重新部署到生產環境
- [ ] 部署成功無錯誤

### 測試端
- [ ] 註冊新賬戶測試
- [ ] Resend 日誌顯示 200 狀態
- [ ] 收到歡迎郵件
- [ ] 郵件內容正確顯示

## 🔍 常見錯誤和解決方案

### 錯誤 1: "restricted api key"
**原因**: API Key 權限不足  
**解決**: 創建 Full Access 或 Sending Access 的 Key

### 錯誤 2: "Invalid API key"
**原因**: API Key 錯誤或已刪除  
**解決**: 檢查 Key 是否正確，或創建新 Key

### 錯誤 3: "Domain not verified"
**原因**: 使用未驗證的域名發送  
**解決**: 驗證域名或使用 Resend 提供的默認域名

### 錯誤 4: "Rate limit exceeded"
**原因**: 超過發送速率限制  
**解決**: 等待一段時間或升級計劃

### 錯誤 5: "Invalid recipient"
**原因**: 收件人地址無效  
**解決**: 確認郵件地址格式正確

## 📝 重要提醒

### API Key 安全
- ✅ **永遠不要**在前端代碼中暴露 API Key
- ✅ **永遠不要**提交 API Key 到 Git
- ✅ **使用** Cloudflare Secrets 存儲
- ✅ **定期輪換** API Key

### 免費方案限制
- 每月 3,000 封郵件
- 每天 100 封郵件
- 無需信用卡
- 足夠大多數應用使用

### 升級建議
如果需要更多配額：
- Pro 計劃: $20/月，50,000 封郵件
- Scale 計劃: $80/月，250,000 封郵件
- 企業計劃: 自定義價格

## 🆘 需要幫助？

如果問題仍然存在：
1. 截圖 Resend API Keys 頁面（遮蓋完整 Key）
2. 截圖 Resend Logs 頁面的錯誤信息
3. 提供錯誤時間點
4. 告訴我具體測試步驟

---

**下一步**: 請按照「步驟 2」創建新的 Full Access API Key，然後更新 Cloudflare Secret
