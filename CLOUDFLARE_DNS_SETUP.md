# 🎯 Cloudflare DNS 記錄設置指南

根據你的 Resend 截圖，需要添加以下 DNS 記錄到 Cloudflare：

## 📋 需要添加的記錄

### ✅ 記錄 1: DKIM 驗證 (TXT)
```
Type: TXT
Name: resend._domainkey
Content: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDM8tKu8RtAuvxDIDAQAB
TTL: Auto
Proxy Status: DNS only (灰色雲朵)
```

⚠️ **注意**: Content 的完整值請從 Resend "Records" 標籤複製（點擊 Content 欄位可以複製完整值）

### ✅ 記錄 2: SPF - MX 記錄
```
Type: MX
Name: send
Content: feedback-smtp.us-east-1.amazonses.com
Priority: 10
TTL: Auto
Proxy Status: DNS only (灰色雲朵)
```

### ✅ 記錄 3: SPF - TXT 記錄
```
Type: TXT
Name: send
Content: v=spf1 include:amazonses.com ~all
TTL: Auto
Proxy Status: DNS only (灰色雲朵)
```

### ✅ 記錄 4: DMARC (可選但推薦)
```
Type: TXT
Name: _dmarc
Content: v=DMARC1; p=none;
TTL: Auto
Proxy Status: DNS only (灰色雲朵)
```

## 🔧 在 Cloudflare 添加記錄

### 步驟 1: 打開 Cloudflare DNS 管理
1. 訪問: https://dash.cloudflare.com
2. 選擇域名: `memelaunchtycoon.com`
3. 點擊左側 **"DNS"** 菜單

### 步驟 2: 添加記錄 1 (DKIM TXT)
1. 點擊 **"Add record"**
2. **Type**: 選擇 `TXT`
3. **Name**: 輸入 `resend._domainkey`
4. **Content**: 
   - 返回 Resend 的 "Records" 標籤
   - 找到 DKIM 的 TXT 記錄
   - 點擊 Content 欄位複製完整值（以 `p=MIG...` 開頭）
   - 粘貼到 Cloudflare
5. **TTL**: 保持 `Auto`
6. **Proxy status**: 點擊雲朵圖標，確保是 **灰色**（DNS only）
7. 點擊 **"Save"**

### 步驟 3: 添加記錄 2 (SPF MX)
1. 點擊 **"Add record"**
2. **Type**: 選擇 `MX`
3. **Name**: 輸入 `send`
4. **Mail server**: 輸入 `feedback-smtp.us-east-1.amazonses.com`
5. **Priority**: 輸入 `10`
6. **TTL**: 保持 `Auto`
7. **Proxy status**: 確保是 **灰色**（DNS only）
8. 點擊 **"Save"**

### 步驟 4: 添加記錄 3 (SPF TXT)
1. 點擊 **"Add record"**
2. **Type**: 選擇 `TXT`
3. **Name**: 輸入 `send`
4. **Content**: 輸入 `v=spf1 include:amazonses.com ~all`
5. **TTL**: 保持 `Auto`
6. **Proxy status**: 確保是 **灰色**（DNS only）
7. 點擊 **"Save"**

### 步驟 5: 添加記錄 4 (DMARC - 可選)
1. 點擊 **"Add record"**
2. **Type**: 選擇 `TXT`
3. **Name**: 輸入 `_dmarc`
4. **Content**: 輸入 `v=DMARC1; p=none;`
5. **TTL**: 保持 `Auto`
6. **Proxy status**: 確保是 **灰色**（DNS only）
7. 點擊 **"Save"**

## ⏱️ 等待 DNS 傳播

添加完所有記錄後：
1. 等待 **5-10 分鐘**（DNS 傳播時間）
2. 返回 Resend 域名頁面
3. 點擊右上角的 **"Restart"** 按鈕
4. 或點擊 **"Verify"** 按鈕
5. 刷新頁面，狀態應該變為 ✅ **Verified**

## 🔍 如何複製完整的 DKIM 記錄

在 Resend 的 "Records" 標籤中：
1. 找到 **DKIM** 部分的 TXT 記錄
2. 點擊 **Content** 欄位
3. 會彈出一個框顯示完整值
4. 或者點擊旁邊的 **複製** 圖標
5. 完整值應該類似：`p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDM8tKu...很長的字符串...QIDAQAB`

## ⚠️ 重要提醒

### ❌ 常見錯誤
1. **Proxy Status 是橙色** → 必須改為灰色（DNS only）
2. **Name 填寫完整域名** → 只填寫子域名部分
   - ❌ 錯誤: `resend._domainkey.memelaunchtycoon.com`
   - ✅ 正確: `resend._domainkey`
3. **DKIM Content 不完整** → 必須複製完整值（很長的字符串）
4. **有多餘空格** → 刪除前後空格

### ✅ 正確設置檢查
- [ ] 添加了 1 個 TXT 記錄（resend._domainkey）
- [ ] 添加了 1 個 MX 記錄（send）
- [ ] 添加了 1 個 TXT 記錄（send）
- [ ] 添加了 1 個 TXT 記錄（_dmarc，可選）
- [ ] 所有記錄的 Proxy Status 都是灰色（DNS only）
- [ ] 等待了 5-10 分鐘
- [ ] 在 Resend 點擊了 "Restart" 或 "Verify"

## 🎉 驗證成功後

域名驗證成功後，告訴我，我會幫你：
1. 更新發件人地址為 `noreply@memelaunchtycoon.com`
2. 更新代碼配置
3. 重新部署
4. 測試郵件發送

---

**下一步**: 按照上面的步驟添加記錄到 Cloudflare，然後告訴我完成了！
