# MemeLaunch Tycoon 🚀

> 零風險的模因幣發射模擬遊戲 - 體驗 Bonding Curve 定價、AI 交易員和市場事件的真實加密貨幣交易!

[![Live Demo](https://img.shields.io/badge/Live-Demo-orange)](https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai)
[![Status](https://img.shields.io/badge/Status-Active-success)]()
[![Phase](https://img.shields.io/badge/Phase-3%20Complete-blue)]()
[![License](https://img.shields.io/badge/License-MIT-blue)]()

## 🎮 專案簡介

MemeLaunch Tycoon 是一個完整的 Web3 模擬遊戲,讓玩家在無風險環境中學習和體驗模因幣的創建、交易和投資策略。使用真實的 Bonding Curve 算法、AI 交易引擎和市場事件系統,提供接近真實的加密貨幣交易體驗。

### ✨ 核心特色

#### 💰 **單一貨幣 MLT 系統**
- 遊戲內唯一貨幣 (MLT - MemeLaunch Token)
- 新用戶起始: **10,000 MLT**
- 創幣成本: **1,800-10,000 MLT** + 預購代幣
- 所有交易使用 MLT 結算

#### 📈 **指數型 Bonding Curve**
- 指數定價公式: `Price = Initial × e^(4 × progress)`
- 價格成長潛力: **1× → 54.6×** (0% → 100% 進度)
- 里程碑倍數:
  - 25%: **2.72×**
  - 50%: **7.39×**
  - 75%: **20.09×**
  - 100%: **54.60×**

#### 🤖 **AI 交易員引擎**
- 5 種 AI 交易員類型:
  - **SNIPER** (狙擊手): 快速買入新幣
  - **WHALE** (鯨魚): 大額交易影響市場
  - **RETAIL** (散戶): 跟風交易
  - **BOT** (機器人): 高頻小額交易
  - **MARKET_MAKER** (做市商): 提供流動性
- 37+ 活躍 AI 交易員
- 真實的市場動態模擬

#### 🎲 **市場事件系統**
- 9 種市場事件:
  - 🎉 COIN_CREATED - 幣種創建
  - ⚡ SNIPER_ATTACK - 狙擊手攻擊
  - 🐋 WHALE_BUY - 鯨魚買入
  - 📉 WHALE_SELL - 鯨魚賣出
  - 🚀 PUMP_EVENT - 拉盤事件
  - 💥 DUMP_EVENT - 砸盤事件
  - ⚠️ RUG_PULL_WARNING - Rug Pull 警告
  - 🎯 WHALE_MANIPULATION - 鯨魚操控
  - 📊 VOLUME_SPIKE - 交易量暴增

#### 🎯 **命運系統**
- 每個幣種創建時分配命運:
  - 🛡️ **SURVIVAL** (5%): 生存並成長
  - 💀 **EARLY_DEATH** (35%): 早期死亡
  - ⏳ **LATE_DEATH** (55%): 後期死亡
  - 🎓 **GRADUATION** (稀有): 畢業到 DEX
  - ⚠️ **RUG_PULL** (5%): Rug Pull

#### ⏱️ **即時更新系統**
- 5 秒輪詢機制
- 實時價格更新
- 交易通知 (Toast UI)
- 動畫進度條
- 價格閃爍效果

## 🌐 線上 URLs

### 🔗 **公開訪問地址**
```
生產環境: https://memelaunchtycoon.com
測試環境: https://e1dfd271.memelaunch-tycoon.pages.dev
```

### 📍 **主要頁面**
| 頁面 | URL | 描述 |
|------|-----|------|
| 🏠 首頁 | `/` | 新版 Landing Page (10 個區塊 + i18n) |
| 📝 註冊 | `/signup` | 註冊新帳號 |
| 🔐 登入 | `/login` | 用戶登入 |
| 📊 儀表板 | `/dashboard` | 用戶儀表板 |
| 🎨 創建幣種 | `/create` | 創幣表單 (含 MLT 計算器) |
| 🏪 市場 | `/market` | 幣種市場列表 |
| 💎 幣詳情 | `/coin/:id` | 幣種詳情頁 (圖表+交易) |
| 💼 投資組合 | `/portfolio` | 持倉和盈虧 |
| 🏆 排行榜 | `/leaderboard` | 玩家排名 |
| 👥 社交 | `/social` | 社交互動 |
| 🎖️ 成就 | `/achievements` | 成就系統 |

### 🔌 **API 端點測試**
```bash
# Health Check
curl https://memelaunchtycoon.com/api/health

# 獲取幣種列表 (前 10 個,按進度排序)
curl "https://memelaunchtycoon.com/api/coins?limit=10&sortBy=bonding_curve_progress&order=DESC"

# 獲取熱門幣種
curl "https://memelaunchtycoon.com/api/coins/trending/list?limit=5"

# 獲取單個幣種詳情
curl https://memelaunchtycoon.com/api/coins/2

# 管理員 - 系統狀態
curl https://memelaunchtycoon.com/api/admin/scheduler/status

# 管理員 - 統計數據
curl https://memelaunchtycoon.com/api/admin/stats
```

### 🧪 **測試帳號**
目前需要註冊新帳號,每個新用戶將獲得 **10,000 MLT** 起始資金。

**註冊流程**:
1. 訪問 `/register`
2. 填寫用戶名、電子郵件、密碼
3. 自動登入,獲得 10,000 MLT
4. 開始創幣和交易!

## 📋 完成功能清單

### ✅ Phase 1 - 基礎系統 (已完成)
- [x] 用戶註冊登入 (JWT 認證)
- [x] 基礎 Bonding Curve 定價
- [x] 幣種 CRUD 操作
- [x] 交易系統 (買/賣)
- [x] 投資組合追蹤
- [x] 排行榜

### ✅ Phase 5 - 完整國際化系統 (已完成, ~4 小時)

#### 5.1 全站翻譯 ✅ (3 小時)
- [x] 翻譯所有 23 個 JavaScript 文件 (~200+ 字串)
- [x] 移除所有中文字串 (除了 language-switcher.js 的 '中文' 標籤)
- [x] 驗證系統: 掃描 34 個 JS 文件,確認 100% 英文化
- [x] 核心文件完成:
  - auth.js (25 字串)
  - social-comments.js (24 字串)
  - market.js (19 字串)
  - coin-detail.js (50+ 字串)
  - trading-panel.js (15 字串)
  - dashboard 系列 (8+ 字串)
  - 其他 16 個文件 (100+ 字串)

#### 5.2 語言切換器集成 ✅ (1 小時)
- [x] 所有 12 個核心頁面添加 i18n.onLocaleChange 監聽器
- [x] 頁面自動重載機制 (語言切換時)
- [x] 涵蓋頁面:
  - market.js, coin-detail.js, comments-simple.js
  - dashboard.js, dashboard-real.js
  - profile-page.js, leaderboard-page.js, leaderboard.js
  - social-page.js, social-page-simple.js
  - landing.js, auth.js
- [x] 驗證腳本: 自動檢查所有頁面的語言切換器配置

#### 5.3 修復關鍵問題 ✅
- [x] 創幣成功彈窗顯示真實數據 (初始價格、市值、排名)
- [x] 所有通知彈窗完全翻譯 (英文模式無中文)
- [x] 市場頁面幣種描述雙語化
- [x] 幣詳情評論系統完全雙語
- [x] 語言切換器完美運作 (EN ↔ ZH 無混合語言)
- [x] OHLCV 數據載入時立即顯示
- [x] 快速交易按鈕導航到幣詳情頁

#### 5.4 翻譯統計 📊
```
HTML i18n 鍵: ~625 鍵 (EN + ZH 完全匹配)
JS 動態字串: ~200+ 字串 (34 個文件)
總翻譯量: ~825+ 條目
語言切換器覆蓋: 100% (12 核心頁面)
中文字串移除: 100% (驗證通過)
```

### ✅ Phase 2 - 核心遊戲機制 (已完成, ~7 小時)

#### 2.1 指數型 Bonding Curve 定價 ✅
- [x] 指數定價公式 (54.6× 成長)
- [x] 動態價格計算
- [x] 買賣滑價模擬
- [x] 費用系統 (1% 交易費)

#### 2.2 AI 交易員引擎 ✅
- [x] 5 種 AI 交易員類型
- [x] 個性化交易策略
- [x] 37+ 活躍 AI 實例
- [x] 真實市場動態模擬

#### 2.3 市場事件系統 ✅
- [x] 9 種市場事件
- [x] 事件機率分配
- [x] 命運系統 (5 種類型)
- [x] 事件觸發邏輯

#### 2.4 背景排程器 ✅
- [x] 10 秒循環任務
- [x] AI 交易自動執行
- [x] 事件調度系統
- [x] 價格歷史記錄

#### 2.5 創幣 API 增強 ✅
- [x] MLT 投資參數 (1,800-10,000)
- [x] 預購代幣邏輯
- [x] 自動 AI 初始化
- [x] 命運分配
- [x] 事件調度啟動

#### 2.6 文檔完善 ✅
- [x] API 文檔 (API_DOCUMENTATION.md)
- [x] 系統設計文檔 (PROJECT_SUMMARY.md)
- [x] 前端更新計劃 (FRONTEND_UPDATE_PLAN.md)
- [x] 遊戲化設計 (GAMIFICATION_DESIGN.md)

### ✅ Phase 3 - 前端增強 (已完成, ~2.5 小時)

#### 3.1 創幣表單增強 ✅ (30 分鐘)
- [x] MLT 投資滑桿 (1,800-10,000)
- [x] 實時預購計算器
- [x] 動態成本總結面板
- [x] 價格成長顯示
- [x] 餘額驗證

#### 3.2 幣詳情頁增強 ✅ (45 分鐘)
- [x] 增強型 Bonding Curve 進度面板
- [x] 里程碑標記 (0/25/50/75/100%)
- [x] 命運狀態顯示
- [x] AI 活動統計面板
- [x] 事件時間線 (9 種事件)
- [x] 價格里程碑表格

#### 3.3 市場列表增強 ✅ (30 分鐘)
- [x] Bonding Curve 進度排序
- [x] AI 活動排序
- [x] 命運類型篩選器
- [x] 迷你進度條
- [x] AI vs 真實交易指示器
- [x] 命運徽章

#### 3.4 即時更新系統 ✅ (30 分鐘)
- [x] RealtimeService 類
- [x] 5 秒輪詢機制
- [x] 幣價訂閱系統
- [x] Toast 通知 UI
- [x] 動畫進度條 (ease-out)
- [x] 價格閃爍效果
- [x] 實時 AI/真實交易計數

#### 3.5 圖表增強 ✅ (45 分鐘)
- [x] 事件標記系統
- [x] AI vs 真實交易顏色區分
- [x] 9 種事件標記樣式
- [x] 全局事件存儲
- [x] 時間線 AI/真實徽章

### ✅ Phase 4 - 新首頁與國際化 (已完成, ~3 小時)

#### 4.1 新首頁設計 ✅ (2 小時)
- [x] 10 個核心區塊實現:
  1. ✅ 導航欄 (Navigation) - 語言切換器 + 按鈕
  2. ✅ Hero 區塊 - 動態漸變標題 + 實時統計
  3. ✅ 實時市場預覽 - 熱門幣種輪播
  4. ✅ 使用說明 (How It Works) - 4 步驟卡片
  5. ✅ 功能展示 (Features Grid) - 6 個功能卡片
  6. ✅ 實時統計 (Live Stats) - CountUp 動畫
  7. ✅ 用戶評價 (Testimonials) - 3 個用戶卡片
  8. ✅ 定價方案 (Pricing) - Free + VIP
  9. ✅ FAQ 問答 - 4 個可展開問答
  10. ✅ 最終 CTA + Footer - 橙色光暈效果
- [x] 設計系統:
  - 顏色: Orange #FF6B35, Yellow #F7931E, Cyan #00D9FF, Purple #9D4EDD
  - 字體: Inter (主要) + JetBrains Mono (等寬)
  - 動畫: 漸變文字、浮動、玻璃效果、光暈
- [x] 響應式設計 (移動優先)
- [x] pump.fun 風格參考

#### 4.2 國際化系統 (i18n) ✅ (1 小時)
- [x] 雙語支援 (英文 + 繁體中文)
- [x] 輕量級 i18n 實現 (~5KB)
- [x] 語言切換器組件
- [x] 自動語言檢測 (瀏覽器 + Cookie)
- [x] 翻譯檔案:
  - `/locales/en.json` - 英文翻譯
  - `/locales/zh.json` - 中文翻譯
- [x] 實時語言切換 (無需重載頁面)

#### 4.3 路由問題修復 ✅
- [x] 解決 Cloudflare Pages 308 重定向循環
- [x] 將 HTML 嵌入 Worker (index.tsx)
- [x] 更新 _routes.json 排除規則
- [x] 部署到生產環境

## 📊 系統統計

### 🎯 開發進度
```
總開發時間: ~17 小時
├─ Phase 2 (後端): 7 小時
├─ Phase 3 (前端): 2.5 小時
├─ Phase 4 (新首頁 + i18n): 3 小時
├─ Phase 5 (完整國際化): 4 小時
└─ 文檔: 0.5 小時

代碼統計:
├─ 總行數: ~8,500 行
├─ Git Commits: 180+ 次
├─ 新文件: 30+ 個
└─ API 端點: 40+ 個

Bundle 大小:
├─ Worker: 471.20 KB
├─ i18n 系統: ~5 KB
└─ Landing Page: 29 KB (HTML)

國際化統計:
├─ HTML i18n 鍵: 625 鍵 (EN + ZH)
├─ JS 動態字串: 200+ 字串
├─ 翻譯文件: 34 個 JS 文件
└─ 語言切換器: 12 核心頁面
```

### 🤖 AI 系統狀態
```
AI 交易員類型: 5 種
活躍 AI 實例: 37 個
├─ SNIPER: 3 個
├─ WHALE: 2 個
├─ RETAIL: 13 個
├─ BOT: 19 個
└─ MARKET_MAKER: 2 個

市場事件類型: 9 種
命運類型: 5 種
```

### 📈 定價系統
```
初始價格: 0.01 MLT
最大成長: 54.6×
價格公式: Price = Initial × e^(4 × progress)
交易費: 1% (買/賣)
```

## 🗄️ 數據模型

### 核心表結構

#### Users 表
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  password_hash TEXT,
  mlt_balance REAL DEFAULT 10000,  -- MLT 餘額
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Coins 表
```sql
CREATE TABLE coins (
  id INTEGER PRIMARY KEY,
  name TEXT,
  symbol TEXT UNIQUE,
  image_url TEXT,
  initial_mlt_investment REAL,     -- 初始 MLT 投資
  pre_purchase_tokens INTEGER,     -- 預購代幣數
  total_supply INTEGER,
  circulating_supply INTEGER,
  current_price REAL,
  bonding_curve_progress REAL,     -- Bonding Curve 進度 (0-1)
  ai_trade_count INTEGER DEFAULT 0,
  real_trade_count INTEGER DEFAULT 0,
  destiny_type TEXT,               -- SURVIVAL, DEATH, GRADUATION, RUG_PULL
  has_sniper_attack BOOLEAN,
  has_whale_buy BOOLEAN,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### AI Traders 表
```sql
CREATE TABLE ai_traders (
  id INTEGER PRIMARY KEY,
  coin_id INTEGER,
  trader_type TEXT,                -- SNIPER, WHALE, RETAIL, BOT, MARKET_MAKER
  personality TEXT,                -- JSON 配置
  mlt_balance REAL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Market Events 表
```sql
CREATE TABLE market_events (
  id INTEGER PRIMARY KEY,
  coin_id INTEGER,
  event_type TEXT,                 -- 9 種事件類型
  scheduled_time DATETIME,
  executed_time DATETIME,
  is_executed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🧮 核心算法

### 📈 指數型 Bonding Curve
```typescript
// 價格計算公式
Price = InitialPrice × e^(4 × progress)

// 進度計算
progress = CirculatingSupply / TotalSupply

// 買入成本 (積分計算)
buyAmount = integrate(Price, supply1, supply2)

// 價格成長倍數
0%: 1.00× (基準)
25%: 2.72×
50%: 7.39×
75%: 20.09×
100%: 54.60×
```

### 🤖 AI 交易策略

#### SNIPER (狙擊手)
```typescript
Strategy: {
  targetTime: '0-30s after creation',
  amount: '5-15% of supply',
  speed: 'instant',
  goal: 'early profit'
}
```

#### WHALE (鯨魚)
```typescript
Strategy: {
  amount: '10-30% of supply',
  frequency: 'low',
  impact: 'high price movement',
  goal: 'market manipulation'
}
```

#### RETAIL (散戶)
```typescript
Strategy: {
  amount: '0.1-5% of supply',
  frequency: 'high',
  behavior: 'FOMO/panic',
  goal: 'follow trends'
}
```

#### BOT (機器人)
```typescript
Strategy: {
  amount: '0.1-1% of supply',
  frequency: 'very high',
  behavior: 'algorithmic',
  goal: 'liquidity provision'
}
```

#### MARKET_MAKER (做市商)
```typescript
Strategy: {
  amount: '1-10% of supply',
  frequency: 'medium',
  behavior: 'both buy/sell',
  goal: 'price stability'
}
```

## 🚀 本地開發

### 先決條件
```bash
Node.js >= 18
npm >= 9
```

### 安裝與啟動
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

# 啟動開發服務器 (使用 PM2)
pm2 start ecosystem.config.cjs

# 查看日誌
pm2 logs memelaunch --nostream

# 測試
curl http://localhost:3000/api/health
```

### 常用命令
```bash
# 數據庫
npm run db:migrate:local    # 本地遷移
npm run db:seed             # 填充測試數據
npm run db:reset            # 重置數據庫

# 開發
npm run dev                 # Vite 開發服務器
npm run dev:sandbox         # Wrangler 沙盒模式
npm run build               # 建構生產版本

# 清理
npm run clean-port          # 清理 3000 端口
pm2 delete all              # 停止所有 PM2 進程

# Git
npm run git:status          # Git 狀態
npm run git:commit "msg"    # Git 提交
```

## 🌐 部署到 Cloudflare Pages

### 1. 準備環境
```bash
# 設置 Cloudflare API Key
# 訪問 Deploy 標籤配置 API Key

# 創建 D1 數據庫
npx wrangler d1 create webapp-production

# 更新 wrangler.jsonc 中的 database_id
```

### 2. 配置 wrangler.jsonc
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "webapp",
  "compatibility_date": "2024-01-01",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "webapp-production",
      "database_id": "your-database-id-here"
    }
  ]
}
```

### 3. 運行遷移
```bash
# 生產數據庫遷移
npx wrangler d1 migrations apply webapp-production
```

### 4. 部署
```bash
# 建構並部署
npm run build
npx wrangler pages deploy dist --project-name webapp

# 獲取 URLs
# Production: https://random-id.webapp.pages.dev
# Branch: https://main.webapp.pages.dev
```

### 5. 設置環境變數
```bash
# 添加 Secret
npx wrangler pages secret put JWT_SECRET --project-name webapp

# 列出 Secrets
npx wrangler pages secret list --project-name webapp
```

## 📂 專案結構

```
webapp/
├── src/
│   ├── index.tsx              # 主應用和路由
│   ├── types.ts               # TypeScript 類型
│   ├── utils/
│   │   ├── index.ts           # 通用工具
│   │   └── bonding-curve.ts   # Bonding Curve 計算
│   ├── services/
│   │   ├── ai-trader-engine.ts    # AI 交易引擎
│   │   ├── market-events.ts       # 市場事件系統
│   │   └── scheduler.ts           # 背景排程器
│   ├── middleware.ts          # 認證中間件
│   └── routes/
│       ├── auth.ts            # 認證路由
│       ├── coins.ts           # 幣種路由
│       ├── trades.ts          # 交易路由
│       ├── portfolio.ts       # 投資組合
│       ├── leaderboard.ts     # 排行榜
│       └── admin.ts           # 管理 API
├── public/
│   ├── index.html             # Landing Page (由 Worker 提供)
│   ├── locales/
│   │   ├── en.json            # 英文翻譯
│   │   └── zh.json            # 中文翻譯
│   └── static/
│       ├── styles.css             # 全局樣式
│       ├── i18n.js                # i18n 系統
│       ├── language-switcher.js   # 語言切換器
│       ├── landing-new.js         # 新首頁 JS
│       ├── landing.js             # 舊首頁 JS
│       ├── auth.js                # 登入/註冊 JS
│       ├── dashboard.js           # 儀表板 JS
│       ├── create-coin.js         # 創幣表單 JS
│       ├── mlt-calculator.js      # MLT 計算器
│       ├── market.js              # 市場列表 JS
│       ├── coin-detail.js         # 幣詳情 JS
│       ├── chart-lightweight.js   # 圖表 (Lightweight Charts)
│       ├── realtime-service.js    # 即時更新服務
│       └── ...
├── migrations/
│   ├── 0001_initial_schema.sql    # 初始 Schema
│   ├── 0002_add_mlt_system.sql    # MLT 系統
│   ├── 0003_add_ai_traders.sql    # AI 交易員
│   └── 0004_add_events.sql        # 市場事件
├── dist/                      # 建構輸出
├── .git/                      # Git 版本控制
├── ecosystem.config.cjs       # PM2 配置
├── wrangler.jsonc             # Cloudflare 配置
├── package.json               # 依賴和腳本
├── API_DOCUMENTATION.md       # API 文檔
├── PROJECT_SUMMARY.md         # 系統設計
└── README.md                  # 本文件
```

## 🔐 安全性

### 已實施
- ✅ bcrypt 密碼加密 (10 rounds)
- ✅ JWT 令牌認證 (7 天)
- ✅ SQL 準備語句 (防注入)
- ✅ CORS 配置
- ✅ 輸入驗證
- ✅ 環境變數管理

### 生產建議
- [ ] 更改 JWT_SECRET
- [ ] 啟用 Rate Limiting
- [ ] Email 驗證
- [ ] CSRF 保護
- [ ] 日誌監控 (Sentry)
- [ ] Cloudflare WAF

## 📚 文檔

### 核心文檔
- 📘 [API 文檔](./API_DOCUMENTATION.md) - 完整 API 參考
- 📗 [系統設計](./PROJECT_SUMMARY.md) - 架構和實現
- 📙 [前端計劃](./FRONTEND_UPDATE_PLAN.md) - UI/UX 設計
- 📕 [遊戲化設計](./GAMIFICATION_DESIGN.md) - 遊戲機制

### 快速鏈接
- [創幣流程](#創建第一個模因幣)
- [交易指南](#開始交易)
- [API 測試](#api-端點測試)
- [部署指南](#部署到-cloudflare-pages)

## 🎓 使用指南

### 創建第一個模因幣

1. **註冊並登入**
   ```
   起始資金: 10,000 MLT
   ```

2. **訪問創幣頁面**
   ```
   URL: /create
   ```

3. **填寫幣種資訊**
   - 上傳圖片 (可選,支援 JPG/PNG/GIF)
   - 設定名稱 (例如: "Doge to the Moon")
   - 設定符號 (例如: "MOON")
   - 添加描述 (可選)
   - 選擇總供應量 (1M - 1B)

4. **配置 MLT 投資**
   - 選擇初始投資: **1,800-10,000 MLT**
   - 系統自動計算預購代幣數
   - 查看價格成長潛力 (最高 54.6×)
   - 確認餘額充足

5. **發射幣種**
   - 查看 AI 質量分數
   - 預覽幣種資訊
   - 點擊「發射」按鈕
   - 成功後自動分配命運
   - AI 交易員開始活動

### 開始交易

1. **瀏覽市場**
   ```
   URL: /market
   排序: 按進度/AI活動/價格
   篩選: 按命運類型
   ```

2. **分析幣種**
   - 查看 Bonding Curve 進度
   - 檢查 AI vs 真實交易數
   - 觀察命運狀態
   - 研究事件時間線

3. **執行交易**
   - 買入: 使用 MLT 購買代幣
   - 賣出: 將代幣換回 MLT
   - 費用: 1% 交易費
   - 滑價: 根據交易量

4. **追蹤投資**
   ```
   URL: /portfolio
   查看: 持倉、盈虧、交易歷史
   ```

### 賺取利潤策略

#### 🎯 策略 1: 狙擊新幣
```
目標: 搶先買入新創建的幣
時機: 創建後 0-30 秒
預期: 快速 2-3× 利潤
風險: 高 (可能是 Rug Pull)
```

#### 🎯 策略 2: 跟隨鯨魚
```
目標: 發現鯨魚買入信號
時機: 看到 WHALE_BUY 事件
預期: 中期 5-10× 利潤
風險: 中 (鯨魚可能賣出)
```

#### 🎯 策略 3: 長期持有
```
目標: SURVIVAL 命運幣種
時機: 進度 < 50%
預期: 長期 20-50× 利潤
風險: 低 (但需要耐心)
```

#### 🎯 策略 4: 套利交易
```
目標: 利用價格波動
時機: AI 頻繁交易時
預期: 小額頻繁利潤
風險: 低 (短期持有)
```

## 📈 性能與監控

### 當前性能
```
頁面加載: < 2 秒
API 響應: < 200ms
並發用戶: 測試中
數據庫: D1 Local
即時更新: 5 秒輪詢
```

### 系統監控
```bash
# 檢查排程器狀態
curl https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai/api/admin/scheduler/status

# 查看系統統計
curl https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai/api/admin/stats

# PM2 進程監控
pm2 list
pm2 monit
```

## 🤝 貢獻指南

### 開發工作流
```bash
# 1. 創建功能分支
git checkout -b feature/your-feature

# 2. 開發和測試
npm run build
pm2 restart memelaunch
curl http://localhost:3000/your-endpoint

# 3. 提交更改
npm run git:commit "feat: your feature description"

# 4. 推送到遠端
git push origin feature/your-feature
```

### 代碼規範
- TypeScript 嚴格模式
- ESLint 配置
- Prettier 格式化
- Commit 消息遵循 Conventional Commits

## 🎓 教育聲明

**⚠️ 重要提醒**

這是一個**教育性質的模擬遊戲**,旨在幫助用戶學習:
- 💡 Bonding Curve 機制
- 💡 加密貨幣市場動態
- 💡 交易策略和風險管理
- 💡 區塊鏈基本概念

**沒有真實金錢風險**:
- ❌ 所有交易使用虛擬 MLT
- ❌ 所有幣種都是虛構的
- ❌ 不構成投資建議
- ❌ 僅供學習和娛樂

## 📞 支援與反饋

### 問題回報
遇到問題時:
1. 檢查瀏覽器控制台
2. 查看 PM2 日誌
3. 測試 API 端點
4. 檢查 JWT 令牌

### 功能請求
建議新功能:
1. 描述使用場景
2. 說明預期行為
3. 提供範例數據

## 📄 授權

MIT License - 自由使用、修改和分發

## 👨‍💻 致謝

由 AI 協助開發,使用現代 Web 技術棧:
- Hono Framework
- Cloudflare Workers/Pages
- TypeScript
- D1 SQLite
- Lightweight Charts
- Tailwind CSS

---

**最後更新**: 2026-03-01  
**版本**: v4.0.0 (Phase 5 Complete - 完整國際化系統)  
**狀態**: ✅ 生產就緒 - 100% 雙語支援

🚀 **立即體驗**: [MemeLaunch Tycoon](https://memelaunchtycoon.com)

---

**開發時間線**:
- MVP v1.0 (Phase 1): 2026-02-08
- v2.0 (Phase 2): 2026-02-13 (後端增強)
- v2.0 (Phase 3): 2026-02-14 (前端增強)
- v3.0 (Phase 4): 2026-02-19 (新首頁 + 國際化)
- v4.0 (Phase 5): 2026-03-01 (完整國際化系統)

**部署狀態**: ✅ 已部署到 Cloudflare Pages
**國際化狀態**: ✅ 100% 雙語支援 (English/Chinese)
