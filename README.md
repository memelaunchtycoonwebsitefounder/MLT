# MemeLaunch Tycoon

## 專案概述
- **名稱**: MemeLaunch Tycoon
- **目標**: 一個基於 Web 的 Meme 幣模擬遊戲平台，讓用戶在無風險環境中練習創建和交易 Meme 幣
- **主要特點**: 
  - 零風險虛擬交易環境
  - 遊戲化的加密貨幣學習平台
  - 真實的市場模擬（聯合曲線定價）
  - 社交互動和競爭系統

## 線上訪問

### 開發環境
- **Landing Page**: https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai
- **API Endpoint**: https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai/api/health

### API 測試範例

#### 註冊新用戶
```bash
curl -X POST https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"testuser","password":"password123"}'
```

#### 用戶登入
```bash
curl -X POST https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## 已完成功能

### ✅ Phase 1 - MVP 核心功能
1. **Landing Page** - 完整的 10 個 Section
   - Hero Section（英雄區）
   - Problem Statement（問題陳述）
   - Solution（解決方案）
   - How It Works（如何運作）
   - Features Grid（功能網格）
   - Testimonials（用戶評價）
   - Pricing（定價）
   - Statistics（統計數據）
   - Final CTA（最終行動呼籲）
   - Footer（頁腳）

2. **用戶認證系統**
   - 用戶註冊（電子郵件驗證）
   - 用戶登入
   - JWT 令牌認證
   - 密碼加密（Web Crypto API）
   - 中間件保護

3. **數據庫架構** (Cloudflare D1)
   - Users（用戶表）
   - Coins（幣種表）
   - Transactions（交易表）
   - Holdings（持倉表）
   - Price History（價格歷史）
   - Achievements（成就系統）
   - AI Traders（AI 交易者）
   - Events（事件表）
   - Comments（評論表）

4. **價格模擬引擎**
   - Bonding Curve 聯合曲線定價
   - Hype Score 熱度分數計算
   - 價格波動模擬
   - 市值計算

## 未完成功能

### 🚧 Phase 1 - 待完成
- [ ] Meme Coin 創建功能（圖片上傳/AI 生成）
- [ ] 虛擬錢包與交易系統
- [ ] 市場頁面（幣種列表、篩選、搜尋）
- [ ] 投資組合追蹤（持倉、損益）
- [ ] Dashboard 儀表板
- [ ] 幣種詳情頁面

### 📋 Phase 2 - 核心遊戲機制
- [ ] AI Meme 圖片生成整合
- [ ] 高級價格模擬（Hype Score 算法）
- [ ] 營銷系統（推廣、病毒事件）
- [ ] AI 交易機器人互動
- [ ] 市場事件（牛市、熊市、鯨魚行為）
- [ ] 實時 WebSocket 價格更新
- [ ] 成就系統解鎖

### 🌟 Phase 3 - 社交與成長
- [ ] 社交功能（關注、評論、點讚）
- [ ] 競賽模式（每週挑戰、錦標賽）
- [ ] 公會/團隊系統
- [ ] 推薦計劃
- [ ] 賽季通行證與獎勵
- [ ] 教育內容整合

## 數據架構

### 存儲服務
- **Cloudflare D1**: 關係型數據（用戶、交易、持倉）
- **未來計劃**: 
  - R2 存儲（Meme 圖片）
  - KV 存儲（實時價格、排行榜緩存）

### 主要數據模型

#### Users（用戶）
- 電子郵件、用戶名、密碼哈希
- 虛擬餘額（起始 10,000 金幣）
- 高級餘額（鑽石）
- 等級、經驗值、成就

#### Coins（幣種）
- 創建者、名稱、符號、描述
- 圖片 URL、總供應量、流通量
- 當前價格、市值、熱度分數
- 持有者數量、交易次數

#### Transactions（交易）
- 用戶 ID、幣種 ID、交易類型（買/賣）
- 數量、價格、總成本
- 損益、時間戳

#### Holdings（持倉）
- 用戶 ID、幣種 ID、持有數量
- 平均買入價、總投資額
- 當前價值、損益百分比

## 推薦的下一步開發

1. **建立 Dashboard 儀表板**
   - 用戶統計概覽
   - 投資組合快速視圖
   - 最新市場動態

2. **完成 Meme Coin 創建流程**
   - 3 步驟創建向導
   - 圖片上傳功能
   - 表單驗證與預覽

3. **實作交易系統**
   - 買入/賣出界面
   - 實時價格更新
   - 交易確認與歷史

4. **市場頁面**
   - 所有幣種列表
   - 篩選和排序
   - 搜尋功能
   - 趨勢標籤

5. **投資組合頁面**
   - 持倉詳情
   - 損益追蹤
   - 交易歷史
   - 圖表可視化

## 技術棧

### 前端
- **框架**: Hono (TypeScript)
- **樣式**: Tailwind CSS (CDN)
- **圖標**: Font Awesome 6
- **字體**: Google Fonts (Inter, JetBrains Mono)

### 後端
- **運行環境**: Cloudflare Workers
- **框架**: Hono
- **數據庫**: Cloudflare D1 (SQLite)
- **認證**: JWT with Web Crypto API

### 部署
- **平台**: Cloudflare Pages
- **CLI**: Wrangler 4.x
- **進程管理**: PM2（開發環境）

## 用戶指南

### 如何開始
1. 訪問 Landing Page
2. 點擊「立即開始」註冊
3. 使用電子郵件和密碼註冊
4. 獲得 10,000 虛擬金幣歡迎獎勵
5. 開始探索和創建你的第一枚 Meme 幣

### 遊戲玩法
1. **創建 Meme 幣**: 上傳圖片，設置名稱和供應量
2. **交易市場**: 瀏覽其他用戶的幣種並交易
3. **投資組合**: 追蹤你的持倉和損益
4. **排行榜**: 與其他玩家競爭
5. **成就系統**: 解鎖各種成就獲得獎勵

## 部署狀態

### 當前狀態
- ✅ **本地開發**: 已啟動並運行
- ⏳ **Cloudflare Pages**: 待部署
- ⏳ **生產環境**: 待配置

### 部署信息
- **技術棧**: Hono + TypeScript + Cloudflare Workers
- **數據庫**: Cloudflare D1 (本地開發使用 SQLite)
- **最後更新**: 2026-02-08

## 開發命令

```bash
# 安裝依賴
npm install

# 本地開發
npm run dev

# 構建專案
npm run build

# 啟動沙箱環境
npm run dev:sandbox

# 數據庫遷移
npm run db:migrate:local

# 數據庫重置
npm run db:reset

# PM2 進程管理
pm2 start ecosystem.config.cjs
pm2 restart memelaunch
pm2 logs memelaunch --nostream

# 部署到 Cloudflare
npm run deploy
```

## 環境變數

```bash
# JWT 密鑰
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# 起始餘額
STARTING_BALANCE=10000
```

## Git 提交歷史

1. ✅ 初始化專案並建立 Landing Page
2. ✅ 實作用戶認證系統（Web Crypto API）
3. 🚧 進行中...

## 安全性考量

⚠️ **重要提醒**: 
- 這是一個模擬遊戲，**不涉及真實資金**
- 所有交易都使用虛擬貨幣
- 已在所有頁面明確標註「NO REAL MONEY」
- JWT 密鑰需要在生產環境中更改
- 密碼使用 SHA-256 加密存儲

## 性能指標

### 目標
- 頁面加載時間: < 3 秒
- Time to Interactive: < 5 秒
- Lighthouse 分數: 90+
- 移動端友好（響應式設計）

### 瀏覽器支持
- Chrome（最新 2 個版本）
- Firefox（最新 2 個版本）
- Safari（最新 2 個版本）
- Edge（最新 2 個版本）

## 授權

Copyright © 2026 MemeLaunch. All rights reserved.

---

**最後更新**: 2026-02-08  
**版本**: 0.1.0 (MVP Phase 1 進行中)  
**開發者**: AI Developer Team
