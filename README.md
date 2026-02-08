# MemeLaunch Tycoon 🚀

> 一個零風險的模因幣發射模擬遊戲 - 在虛擬環境中體驗加密貨幣交易的刺激！

[![Live Demo](https://img.shields.io/badge/Live-Demo-orange)](https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai)
[![Status](https://img.shields.io/badge/Status-Active-success)]()
[![License](https://img.shields.io/badge/License-MIT-blue)]()

## 🎮 專案簡介

MemeLaunch Tycoon 是一個完全模擬的 Web 遊戲，讓玩家在無風險環境中學習和體驗模因幣（Meme Coin）的創建、交易和投資策略。這不是真實的加密貨幣平台，所有交易都使用虛擬金幣。

### ✨ 核心特色

- 🎨 **創建模因幣** - 上傳圖片、設定名稱和供應量
- 💰 **虛擬交易** - 使用 Bonding Curve 算法的真實價格模擬
- 📊 **投資組合追蹤** - 即時盈虧計算和歷史記錄
- 🏆 **排行榜系統** - 與全球玩家競爭
- 🔐 **安全認證** - JWT 令牌和密碼加密
- 📱 **響應式設計** - 完美支援手機和桌面

## 🌐 線上體驗

### 生產環境 URLs
- **主頁**: https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai
- **儀表板**: https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai/dashboard
- **API Health**: https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai/api/health

### 測試帳號
目前需要註冊新帳號，每個新用戶將獲得 **10,000 金幣** 起始資金。

## 📋 已完成功能 (MVP Phase 1)

### ✅ 用戶系統
- [x] 用戶註冊（電子郵件 + 用戶名 + 密碼）
- [x] 用戶登入（JWT 認證）
- [x] 個人資料查詢
- [x] 起始資金分配（10,000 金幣）

### ✅ 模因幣系統
- [x] 創建新幣種（僅需 100 金幣）
- [x] 幣種列表（分頁、搜尋、排序）
- [x] 幣種詳情頁面
- [x] 熱門幣種排行

### ✅ 交易系統
- [x] 買入功能（Bonding Curve 定價）
- [x] 賣出功能（動態價格計算）
- [x] 交易歷史記錄
- [x] 持倉管理

### ✅ 投資組合
- [x] 持倉列表與價值計算
- [x] 盈虧百分比追蹤
- [x] 總資產淨值統計

### ✅ 排行榜
- [x] 玩家財富排行
- [x] 幣種市值排行
- [x] 交易員利潤排行

### ✅ 前端介面
- [x] 現代化 Landing Page
- [x] 互動式儀表板
- [x] Glassmorphism 設計風格
- [x] 響應式佈局

## 📊 API 端點總覽

### 認證相關
- `POST /api/auth/register` - 註冊新用戶
- `POST /api/auth/login` - 用戶登入
- `GET /api/auth/me` - 獲取當前用戶資料（需認證）

### 幣種相關
- `GET /api/coins` - 獲取幣種列表（支援分頁、搜尋、排序）
- `GET /api/coins/:id` - 獲取單個幣種詳情
- `POST /api/coins` - 創建新幣種（需認證）
- `GET /api/coins/trending/list` - 獲取熱門幣種

### 交易相關
- `POST /api/trades/buy` - 買入幣種（需認證）
- `POST /api/trades/sell` - 賣出幣種（需認證）
- `GET /api/trades/history` - 獲取交易歷史（需認證）

### 投資組合相關
- `GET /api/portfolio` - 獲取投資組合（需認證）
- `GET /api/portfolio/performance` - 獲取投資表現數據（需認證）

### 排行榜相關
- `GET /api/leaderboard/players` - 玩家排行榜
- `GET /api/leaderboard/coins` - 幣種排行榜
- `GET /api/leaderboard/traders` - 交易員排行榜

## 🗄️ 數據模型

### Users 表
- 用戶基本資料（email, username, password_hash）
- 虛擬餘額和高級餘額
- 等級和經驗值系統
- 成就徽章

### Coins 表
- 幣種資訊（名稱、代號、描述、圖片）
- 供應量和流通量
- 當前價格和市值
- Hype Score（炒作指數）
- 持有人數和交易次數

### Transactions 表
- 交易類型（buy/sell/create）
- 數量、價格、總成本
- 時間戳

### Holdings 表
- 用戶持倉
- 平均買入價
- 當前價值和盈虧

### Leaderboard 表
- 賽季排名
- 總利潤和最佳交易

## 🎨 設計系統

### 配色方案
- **主色**: `#FF6B35` (橙色 - 能量與興奮)
- **次色**: `#F7931E` (金色 - 財富與成功)
- **強調色**: `#00D9FF` (青色 - 科技感)
- **深色背景**: `#1A1A2E`, `#16213E`, `#0F3460`
- **淺色**: `#F5F7FA`

### UI 風格
- Glassmorphism（玻璃擬態）效果
- 平滑動畫和過渡
- 加密貨幣主題視覺元素
- Mobile-first 響應式設計

## 🧮 核心算法

### Bonding Curve 定價公式
```typescript
Price(t) = Initial_Price × (1 + 0.0001 × Total_Supply_Sold)^1.5
Hype_Multiplier = 1 + (Hype_Score / 10000)
Final_Price = Price(t) × Hype_Multiplier × Random(0.95, 1.05)
```

### Hype Score 計算
```typescript
Hype_Score = Base_Hype + Marketing_Boost + 
             Holder_Count × 2 + 
             Transaction_Volume × 0.5 + 
             Social_Actions × 10
// 每小時衰減 5% (如果無活動)
Hype_Score = Hype_Score × 0.95
```

## 🚀 快速開始

### 先決條件
- Node.js 18+
- npm 或 yarn
- Cloudflare Workers 帳號（生產部署）

### 本地開發

```bash
# 克隆專案
git clone <your-repo-url>
cd webapp

# 安裝依賴
npm install

# 初始化本地數據庫
npm run db:migrate:local

# 建構專案
npm run build

# 使用 PM2 啟動開發伺服器
pm2 start ecosystem.config.cjs

# 或直接使用 wrangler
npm run dev:sandbox

# 查看日誌
pm2 logs memelaunch --nostream
```

### 部署到 Cloudflare Pages

```bash
# 建構生產版本
npm run build

# 創建 Cloudflare D1 數據庫
npx wrangler d1 create memelaunch-db

# 更新 wrangler.jsonc 中的 database_id

# 運行遷移
npm run db:migrate:prod

# 部署
npm run deploy:prod
```

## 🔧 技術棧

### 後端
- **框架**: Hono (輕量級 Web 框架)
- **運行時**: Cloudflare Workers
- **數據庫**: Cloudflare D1 (SQLite)
- **認證**: JWT + bcryptjs

### 前端
- **核心**: Vanilla JavaScript + TypeScript
- **樣式**: Tailwind CSS (CDN)
- **圖標**: Font Awesome
- **HTTP**: Axios

### 開發工具
- **建構工具**: Vite
- **部署工具**: Wrangler CLI
- **進程管理**: PM2 (開發環境)

## 📂 專案結構

```
webapp/
├── src/
│   ├── index.tsx          # 主應用入口和路由
│   ├── types.ts           # TypeScript 類型定義
│   ├── utils.ts           # 工具函數
│   ├── middleware.ts      # 認證中間件
│   └── routes/
│       ├── auth.ts        # 認證路由
│       ├── coins.ts       # 幣種路由
│       ├── trades.ts      # 交易路由
│       ├── portfolio.ts   # 投資組合路由
│       └── leaderboard.ts # 排行榜路由
├── public/
│   └── static/
│       └── default-coin.svg  # 預設幣種圖示
├── migrations/
│   └── 0001_initial_schema.sql  # 數據庫 Schema
├── dist/                  # 建構輸出目錄
├── .git/                  # Git 版本控制
├── ecosystem.config.cjs   # PM2 配置
├── wrangler.jsonc         # Cloudflare 配置
├── package.json           # 依賴和腳本
└── README.md              # 本文件
```

## 🔐 安全性

### 已實施的安全措施
- ✅ 密碼使用 bcrypt 加密（Salt rounds: 10）
- ✅ JWT 令牌認證（7 天有效期）
- ✅ 輸入驗證（電子郵件、用戶名、密碼）
- ✅ SQL 準備語句（防止 SQL 注入）
- ✅ CORS 配置
- ✅ 環境變數管理

### 生產環境建議
- [ ] 更改 JWT_SECRET 為強隨機字符串
- [ ] 啟用 HTTPS（Cloudflare 自動提供）
- [ ] 設置 Rate Limiting
- [ ] 添加 Email 驗證
- [ ] 實施 CSRF 保護
- [ ] 日誌監控（Sentry）

## 📈 待實施功能 (Phase 2 & 3)

### Phase 2 - 核心遊戲機制（未來 3-6 週）
- [ ] AI 模因圖片生成（整合 OpenAI DALL-E 或 Stability AI）
- [ ] 進階價格模擬（市場事件、波動性）
- [ ] 營銷系統（推廣、病毒活動）
- [ ] AI 交易機器人（模擬其他玩家）
- [ ] 市場事件（牛市、熊市、鯨魚移動）
- [ ] WebSocket 即時價格更新
- [ ] 成就系統（首個幣種、10x 利潤等）

### Phase 3 - 社交與成長（7-12 週）
- [ ] 社交功能（關注、評論、點讚、分享）
- [ ] 競賽模式（每週挑戰、錦標賽）
- [ ] 公會/團隊系統
- [ ] 推薦計劃
- [ ] 賽季通行證與獎勵
- [ ] 教育內容整合
- [ ] 移動應用（PWA）

## 🎯 推薦下一步開發

根據當前進度，建議按以下優先級開發：

1. **創建幣種完整流程頁面** (高優先級)
   - 3 步驟向導（圖片上傳 → 幣種詳情 → 預覽與發射）
   - 圖片裁剪和預覽功能
   
2. **市場頁面增強** (高優先級)
   - 完整的幣種卡片設計
   - 篩選器（按市值、Hype Score、新幣）
   - 搜尋自動完成

3. **幣種詳情頁面** (高優先級)
   - 價格圖表（使用 Recharts）
   - 買入/賣出介面
   - 評論區

4. **投資組合頁面** (中優先級)
   - 持倉詳細列表
   - 盈虧圖表
   - 交易歷史表格

5. **AI 機器人模擬器** (中優先級)
   - 背景定時任務
   - 隨機買入/賣出
   - 價格波動模擬

## 🤝 使用指南

### 新用戶註冊流程
1. 訪問首頁，點擊「開始遊戲」
2. 填寫電子郵件、用戶名和密碼（至少 6 個字符）
3. 註冊成功後自動登入，獲得 10,000 金幣

### 創建第一個模因幣
1. 在儀表板點擊「創建模因幣」
2. 設定幣種名稱（例如：Doge Moon）
3. 設定總供應量（1 - 10 億）
4. 可選：上傳自定義圖片
5. 支付 100 金幣創建費用

### 開始交易
1. 瀏覽市場頁面，尋找有潛力的幣種
2. 點擊幣種查看詳情
3. 輸入購買數量，確認交易
4. 在投資組合追蹤你的持倉

### 賺取利潤
1. 等待幣種價格上漲（由 Hype Score 和供需驅動）
2. 在適當時機賣出
3. 利潤將自動加入你的金幣餘額
4. 查看排行榜，看看你的排名

## 📊 性能目標

### 當前性能
- ✅ 頁面加載時間: < 2 秒
- ✅ API 響應時間: < 200ms（本地）
- ✅ 支援並發用戶: 測試中

### 優化計劃
- [ ] 圖片 CDN 和壓縮
- [ ] 數據庫查詢優化
- [ ] Redis 緩存層（熱門數據）
- [ ] Service Worker（離線支援）

## 📄 授權

MIT License - 可自由使用、修改和分發

## 👨‍💻 開發者

由 AI 協助開發，使用 Cloudflare Workers + Hono 技術棧

## 🆘 問題回報

如遇到問題，請：
1. 檢查瀏覽器控制台錯誤
2. 查看 API 響應狀態碼
3. 確認 JWT 令牌有效性

## 🎓 教育聲明

**重要提醒**: 這是一個教育性質的模擬遊戲，旨在幫助用戶學習加密貨幣和區塊鏈概念。

- ⚠️ **沒有真實金錢交易**
- ⚠️ **所有幣種都是虛構的**
- ⚠️ **所有金幣都是虛擬的**
- ⚠️ **不構成投資建議**

---

**最後更新**: 2026-02-08  
**版本**: MVP v1.0.0  
**狀態**: ✅ 開發環境運行中

🚀 **立即體驗**: [https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai](https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai)
