# 🚀 MemeLaunch Tycoon - Quick Start Guide

## 📦 專案已完成內容

### ✅ MVP Phase 1 (100% 完成)

**後端 API (Hono + Cloudflare D1)**
- ✅ 用戶認證系統（註冊、登入、JWT）
- ✅ 模因幣 CRUD 操作
- ✅ 虛擬交易引擎（買入/賣出）
- ✅ 投資組合管理
- ✅ 排行榜系統
- ✅ Bonding Curve 定價算法

**前端 UI (Vanilla JS + Tailwind CSS)**
- ✅ 現代化 Landing Page
- ✅ 互動式 Dashboard
- ✅ 認證表單（登入/註冊）
- ✅ 響應式設計

**測試與部署**
- ✅ 完整 API 測試套件（10/10 通過）
- ✅ 本地開發環境運行
- ✅ Git 版本控制
- ✅ 項目備份創建

## 🌐 線上訪問

**開發環境 URL**: https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai

### 快速體驗
1. 訪問上述 URL
2. 點擊「開始遊戲」或「註冊」
3. 填寫：
   - 電子郵件：任意有效格式
   - 用戶名：3-20 字符（字母、數字、下劃線）
   - 密碼：至少 6 個字符
4. 自動獲得 **10,000 金幣**
5. 開始創建模因幣或瀏覽市場！

## 🧪 測試 API

### 運行完整測試
```bash
cd /home/user/webapp
./test-api.sh
```

### 手動測試示例

**1. 註冊新用戶**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

**2. 創建模因幣**
```bash
curl -X POST http://localhost:3000/api/coins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Moon Doge",
    "symbol": "MOON",
    "description": "To the moon!",
    "totalSupply": 1000000
  }'
```

**3. 買入幣種**
```bash
curl -X POST http://localhost:3000/api/trades/buy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "coinId": 1,
    "amount": 100
  }'
```

## 📂 專案結構

```
webapp/
├── src/
│   ├── index.tsx              # 主應用 + 所有頁面 HTML
│   ├── types.ts               # TypeScript 類型
│   ├── utils.ts               # 工具函數（JWT、定價算法）
│   ├── middleware.ts          # 認證中間件
│   └── routes/
│       ├── auth.ts            # 認證 API
│       ├── coins.ts           # 幣種 API
│       ├── trades.ts          # 交易 API
│       ├── portfolio.ts       # 投資組合 API
│       └── leaderboard.ts     # 排行榜 API
├── migrations/
│   └── 0001_initial_schema.sql  # 數據庫結構
├── public/static/
│   └── default-coin.svg       # 預設幣種圖示
├── dist/                      # 建構輸出
├── test-api.sh                # API 測試腳本
├── ecosystem.config.cjs       # PM2 配置
├── wrangler.jsonc             # Cloudflare 配置
└── README.md                  # 完整文檔
```

## 🗄️ 數據模型總覽

### Users 表
- `id` - 用戶 ID（自增）
- `email` - 電子郵件（唯一）
- `username` - 用戶名（唯一）
- `password_hash` - 密碼哈希
- `virtual_balance` - 虛擬金幣餘額
- `level`, `xp`, `achievements` - 遊戲進度

### Coins 表
- `id` - 幣種 ID
- `creator_id` - 創建者
- `name`, `symbol`, `description` - 基本資訊
- `total_supply`, `circulating_supply` - 供應量
- `current_price`, `market_cap` - 價格數據
- `hype_score` - 炒作指數

### Transactions 表
- `type` - 交易類型（buy/sell/create）
- `amount`, `price`, `total_cost` - 交易數據

### Holdings 表
- `user_id`, `coin_id` - 持倉關聯
- `avg_buy_price` - 平均買入價
- `profit_loss_percent` - 盈虧百分比

## 🚀 本地開發

### 啟動服務
```bash
# 方式 1: 使用 PM2（推薦）
npm run build
pm2 start ecosystem.config.cjs
pm2 logs memelaunch --nostream

# 方式 2: 直接運行
npm run build
npm run dev:sandbox
```

### 停止服務
```bash
pm2 stop memelaunch
# 或
pm2 delete memelaunch
```

### 數據庫管理
```bash
# 應用遷移（首次啟動）
npm run db:migrate:local

# 重置數據庫
rm -rf .wrangler/state/v3/d1
npm run db:migrate:local

# 查詢數據庫
npm run db:console:local -- --command="SELECT * FROM users"
```

## 🎮 遊戲玩法

### 新手教程

1. **註冊並獲得起始資金**
   - 10,000 金幣免費贈送

2. **創建你的第一個模因幣**
   - 花費 100 金幣
   - 設定名稱和供應量
   - 初始價格 $0.01

3. **開始交易**
   - 買入其他玩家的幣種
   - 價格隨供需變動（Bonding Curve）
   - 等待價格上漲後賣出

4. **追蹤投資組合**
   - 實時盈虧計算
   - 歷史交易記錄

5. **挑戰排行榜**
   - 比拼財富、利潤、交易量

### 定價機制

**Bonding Curve 公式**:
```
Price = 0.01 × (1 + 0.0001 × Sold_Supply)^1.5
Final_Price = Price × Hype_Multiplier × Random(0.95, 1.05)
Hype_Multiplier = 1 + (Hype_Score / 10000)
```

**Hype Score 計算**:
- 基礎值：100
- 每次交易：+0.01 × 交易數量
- 每小時衰減：-5%（無活動時）

## 📊 API 端點速查

| 端點 | 方法 | 認證 | 說明 |
|------|------|------|------|
| `/api/health` | GET | ❌ | 健康檢查 |
| `/api/auth/register` | POST | ❌ | 註冊 |
| `/api/auth/login` | POST | ❌ | 登入 |
| `/api/auth/me` | GET | ✅ | 獲取個人資料 |
| `/api/coins` | GET | ❌ | 幣種列表 |
| `/api/coins/:id` | GET | ❌ | 幣種詳情 |
| `/api/coins` | POST | ✅ | 創建幣種 |
| `/api/coins/trending/list` | GET | ❌ | 熱門幣種 |
| `/api/trades/buy` | POST | ✅ | 買入 |
| `/api/trades/sell` | POST | ✅ | 賣出 |
| `/api/trades/history` | GET | ✅ | 交易歷史 |
| `/api/portfolio` | GET | ✅ | 投資組合 |
| `/api/leaderboard/players` | GET | ❌ | 玩家排行 |
| `/api/leaderboard/coins` | GET | ❌ | 幣種排行 |
| `/api/leaderboard/traders` | GET | ❌ | 交易員排行 |

## 🔐 安全注意事項

### 開發環境
- JWT Secret: `your-super-secret-jwt-key-change-in-production`
- 密碼加密: bcrypt (10 rounds)
- 本地數據庫: SQLite

### 生產部署前必做
- [ ] 更改 JWT_SECRET 環境變數
- [ ] 創建生產 D1 數據庫
- [ ] 設置 Cloudflare API Token
- [ ] 配置 CORS 白名單
- [ ] 啟用 Rate Limiting
- [ ] 添加 Email 驗證

## 📈 下一步開發建議

### 高優先級
1. **完整的創建幣種頁面** (`/create`)
   - 3 步驟向導
   - 圖片上傳功能
   - 實時預覽

2. **市場頁面** (`/market`)
   - 幣種卡片網格
   - 篩選和排序
   - 搜尋功能

3. **幣種詳情頁面** (`/coin/:id`)
   - 價格圖表（Recharts）
   - 買入/賣出表單
   - 交易歷史

### 中優先級
4. **投資組合頁面** (`/portfolio`)
   - 持倉表格
   - 盈虧圖表
   - 匯總統計

5. **排行榜頁面** (`/leaderboard`)
   - 多個排行榜切換
   - 分頁和搜尋

### 高級功能（Phase 2）
6. **AI 模因生成** - 整合 DALL-E/Stable Diffusion
7. **AI 交易機器人** - 模擬其他玩家
8. **市場事件系統** - 牛市/熊市/鯨魚
9. **成就系統** - 徽章和獎勵
10. **WebSocket** - 實時價格更新

## 📦 項目備份

**備份文件**: https://www.genspark.ai/api/files/s/UBKvaWw4

**包含內容**:
- 完整源代碼
- 數據庫遷移腳本
- 配置文件
- Git 歷史記錄

**恢復方法**:
```bash
# 下載並解壓
wget https://www.genspark.ai/api/files/s/UBKvaWw4 -O backup.tar.gz
tar -xzf backup.tar.gz

# 安裝依賴
cd /home/user/webapp
npm install

# 啟動
npm run build
npm run db:migrate:local
pm2 start ecosystem.config.cjs
```

## 🆘 故障排除

### 問題：端口被佔用
```bash
npm run clean-port
# 或
fuser -k 3000/tcp
```

### 問題：數據庫錯誤
```bash
# 重置數據庫
rm -rf .wrangler/state/v3/d1
npm run db:migrate:local
```

### 問題：PM2 無法啟動
```bash
# 清理 PM2
pm2 delete all
pm2 kill

# 重新啟動
npm run build
pm2 start ecosystem.config.cjs
```

### 問題：JWT 驗證失敗
- 檢查 Token 是否過期（7 天有效期）
- 確認 Authorization header 格式：`Bearer <token>`
- 驗證 JWT_SECRET 配置正確

## 🎓 教育聲明

**這是一個模擬遊戲，不涉及真實金錢或加密貨幣**

- ⚠️ 所有交易都是虛擬的
- ⚠️ 所有幣種都是虛構的
- ⚠️ 所有利潤都是模擬的
- ⚠️ 不構成任何投資建議

## 📞 技術支援

如遇問題，請：
1. 查看瀏覽器開發者工具（F12）的 Console 和 Network
2. 檢查 PM2 日誌：`pm2 logs memelaunch --nostream`
3. 運行測試腳本：`./test-api.sh`
4. 查閱完整 README.md

---

**最後更新**: 2026-02-08  
**版本**: MVP v1.0.0  
**狀態**: ✅ 所有測試通過

**立即體驗**: [https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai](https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai) 🚀
