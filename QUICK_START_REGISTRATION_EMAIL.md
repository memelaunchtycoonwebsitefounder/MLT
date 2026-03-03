# Quick Reference - User Registration & Welcome Email

## ✅ 已完成功能

### 1. 查看註冊人數
**訪問管理員儀表板**：
```
https://memelaunchtycoon.com/admin-dashboard
```

**功能**：
- 📊 總註冊人數
- 📈 今日新增用戶
- 📅 本週新增用戶  
- 📆 本月新增用戶
- 📉 7 天註冊趨勢圖表
- 👥 最近 10 位註冊用戶
- 🔄 每 30 秒自動刷新

### 2. 自動歡迎郵件
**觸發時機**：用戶註冊後立即發送

**郵件內容**：
- 🎉 個性化問候（使用用戶名）
- 💰 起始資金說明（$10,000 + 10,000 MLT）
- 🚀 快速開始按鈕
- 📚 新手提示
- 🔗 社群鏈接

---

## 🚀 快速設置（僅需 2 步）

### 步驟 1：獲取 Resend API 密鑰

1. 訪問 https://resend.com 並註冊（免費）
2. 登錄後進入 **API Keys** 頁面
3. 點擊 **Create API Key**
4. 複製生成的密鑰（格式：`re_...`）

### 步驟 2：配置密鑰到 Cloudflare

```bash
# 在你的電腦運行（不是 sandbox）
npx wrangler secret put RESEND_API_KEY --project-name memelaunch-tycoon

# 輸入你的 API 密鑰並按 Enter
```

**完成！** 🎉 新用戶註冊後會自動收到歡迎郵件。

---

## 📱 本地開發測試

### 方法 A：使用 .dev.vars 文件（推薦）

```bash
cd /home/user/webapp

# 創建 .dev.vars 文件
cat > .dev.vars << 'EOF'
RESEND_API_KEY=re_your_api_key_here
EOF

# 重啟服務
pm2 restart memelaunch
```

### 方法 B：測試註冊流程

1. 訪問 http://localhost:3000/signup
2. 填寫表單（使用真實郵箱）
3. 提交註冊
4. 檢查你的郵箱

---

## 🔍 API 端點

### 用戶統計
```bash
GET /api/admin/stats/users

# 返回：
{
  "total": 150,
  "today": 5,
  "week": 25,
  "month": 80,
  "recent": [...],
  "trend": [...]
}
```

### 用戶列表（分頁）
```bash
GET /api/admin/users?page=1&limit=20

# 返回：
{
  "users": [...],
  "pagination": {
    "page": 1,
    "total": 150
  }
}
```

---

## 🎯 現在你可以：

1. ✅ **查看有多少人註冊**：
   - 訪問 https://memelaunchtycoon.com/admin-dashboard
   - 看到實時統計和趨勢圖

2. ✅ **自動發送歡迎郵件**：
   - 新用戶註冊 → 立即收到精美歡迎郵件
   - 只需配置一次 Resend API 密鑰

3. ✅ **監控用戶增長**：
   - 每日、每週、每月統計
   - 7 天趨勢圖
   - 最新用戶列表

---

## 📞 需要幫助？

查看完整文檔：
```
/home/user/webapp/USER_REGISTRATION_AND_EMAIL_GUIDE.md
```

包含：
- 詳細設置步驟
- 郵件模板預覽
- API 文檔
- 故障排除
- 常見問題

---

**部署狀態**：
- ✅ 代碼已提交到 GitHub
- ✅ 本地測試通過
- ⏳ 待配置 Resend API 密鑰（生產環境）

**下一步**：配置 Resend API 密鑰並部署到生產環境！
