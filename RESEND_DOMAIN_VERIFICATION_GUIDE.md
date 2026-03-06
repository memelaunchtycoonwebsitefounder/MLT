# 🔧 Resend 域名驗證指南

## 📋 當前狀態
- **域名**: memelaunchtycoon.com
- **狀態**: ❌ Failed（DNS 記錄缺失）
- **提供商**: Cloudflare
- **創建時間**: 3 days ago

## ⚠️ 問題
DNS check failed: All required records are missing. Fix records in Cloudflare.

## 🎯 解決步驟

### 步驟 1: 獲取 Resend DNS 記錄

1. **在 Resend 域名頁面**（你現在的頁面）
   - 點擊 **"Configuration"** 標籤（旁邊的 "Records"）
   - 你會看到需要添加的 DNS 記錄

2. **應該有 3 條記錄**：
   ```
   記錄 1 (TXT - 域名驗證):
   類型: TXT
   名稱: @ (或 memelaunchtycoon.com)
   內容: resend-verify=xxxxx...
   
   記錄 2 (CNAME - DKIM 1):
   類型: CNAME
   名稱: resend._domainkey
   內容: resend._domainkey.resend.com
   
   記錄 3 (CNAME - DKIM 2):
   類型: CNAME
   名稱: resend2._domainkey
   內容: resend2._domainkey.resend.com
   ```

### 步驟 2: 添加記錄到 Cloudflare DNS

1. **登錄 Cloudflare Dashboard**
   - 訪問: https://dash.cloudflare.com
   - 選擇域名: `memelaunchtycoon.com`

2. **進入 DNS 管理**
   - 點擊左側菜單的 **"DNS"** 或 **"DNS Records"**

3. **添加第 1 條記錄（TXT - 驗證）**
   - 點擊 **"Add record"**
   - Type: `TXT`
   - Name: `@`（或留空）
   - Content: `resend-verify=xxxxx...`（從 Resend 複製）
   - TTL: `Auto`
   - Proxy status: `DNS only`（灰色雲朵）
   - 點擊 **"Save"**

4. **添加第 2 條記錄（CNAME - DKIM 1）**
   - 點擊 **"Add record"**
   - Type: `CNAME`
   - Name: `resend._domainkey`
   - Target: `resend._domainkey.resend.com`
   - TTL: `Auto`
   - Proxy status: `DNS only`（灰色雲朵）
   - 點擊 **"Save"**

5. **添加第 3 條記錄（CNAME - DKIM 2）**
   - 點擊 **"Add record"**
   - Type: `CNAME`
   - Name: `resend2._domainkey`
   - Target: `resend2._domainkey.resend.com`
   - TTL: `Auto`
   - Proxy status: `DNS only`（灰色雲朵）
   - 點擊 **"Save"**

### 步驟 3: 驗證 DNS 記錄

1. **等待 DNS 傳播**（1-5 分鐘）

2. **返回 Resend 域名頁面**
   - 點擊 **"Restart"** 按鈕
   - 或點擊 **"Verify"** 按鈕

3. **檢查狀態**
   - 如果成功，狀態會變為 ✅ **Verified**
   - 如果失敗，檢查 DNS 記錄是否正確

## 🔍 驗證 DNS 記錄（命令行）

```bash
# 檢查 TXT 記錄
dig TXT memelaunchtycoon.com +short

# 檢查 CNAME 記錄
dig CNAME resend._domainkey.memelaunchtycoon.com +short
dig CNAME resend2._domainkey.memelaunchtycoon.com +short
```

## 📸 截圖指南

### 我需要看到的內容

如果你不確定如何操作，請給我截圖：

1. **Resend Configuration 標籤**
   - 點擊 "Configuration"
   - 截圖顯示所有需要添加的 DNS 記錄

2. **Cloudflare DNS 頁面**
   - 添加記錄後的 DNS 列表
   - 確認所有 3 條記錄都已添加

## ⚠️ 常見錯誤

### 錯誤 1: Proxy 狀態錯誤
- **問題**: Cloudflare 代理（橙色雲朵）開啟
- **解決**: 將 Proxy status 設為 **DNS only**（灰色雲朵）

### 錯誤 2: 記錄名稱錯誤
- **問題**: 名稱填寫為完整域名（如 `resend._domainkey.memelaunchtycoon.com`）
- **解決**: 只填寫子域名部分（如 `resend._domainkey`）

### 錯誤 3: Content 有空格
- **問題**: 複製時包含多餘空格
- **解決**: 檢查並刪除前後空格

### 錯誤 4: DNS 未傳播
- **問題**: 剛添加記錄，DNS 還沒更新
- **解決**: 等待 5-10 分鐘再驗證

## 🎯 快速操作步驟

1. 在 Resend 點擊 **"Configuration"** 標籤
2. 複製所有 DNS 記錄的詳細信息
3. 登錄 Cloudflare DNS 管理頁面
4. 逐條添加記錄（TXT + 2 個 CNAME）
5. 確保所有記錄的 Proxy status 是 **DNS only**
6. 返回 Resend 點擊 **"Restart"** 或 **"Verify"**
7. 等待驗證成功

## ✅ 驗證成功後

域名驗證成功後，你可以：

1. **更新發件人地址**
   - 從 `onboarding@resend.dev`
   - 改為 `noreply@memelaunchtycoon.com`

2. **更新代碼配置**
   ```bash
   # 我會幫你更新 wrangler.jsonc 和 email.ts
   ```

3. **重新部署**
   ```bash
   npm run build
   npx wrangler pages deploy dist --project-name memelaunch-tycoon
   ```

## 🆘 需要幫助？

如果你遇到困難，請提供：

1. **Resend Configuration 標籤的截圖**
   - 顯示需要添加的 DNS 記錄

2. **Cloudflare DNS 頁面的截圖**
   - 顯示你已添加的記錄

3. **錯誤信息**
   - Resend 顯示的具體錯誤

然後我可以：
- 檢查記錄是否正確
- 告訴你具體該如何修改
- 幫你排查問題

---

**下一步**: 
1. 點擊 Resend 頁面的 **"Configuration"** 標籤
2. 截圖給我看需要添加的 DNS 記錄
3. 我會告訴你具體如何在 Cloudflare 添加

或者如果你已經知道如何操作，直接按照上面的步驟添加記錄即可！
