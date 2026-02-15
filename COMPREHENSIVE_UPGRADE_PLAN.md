# 🚀 MemeLaunch 重大升級計劃

## 📅 日期：2026-02-11

---

## 🎯 總體目標

將MemeLaunch升級為**真實的Meme幣發射平台**，參考Pump.fun、Raydium等頂級平台。

---

## 📋 完整需求列表

### 🔴 **緊急修復**（優先級：最高）

#### 1. K線圖完整顯示
- [ ] 添加OHLC數據面板（左上角顯示）
- [ ] 添加當前價格標記（右側價格軸）
- [ ] 添加垂直網格線
- [ ] 修復蠟燭圖數據準確性
- [ ] 添加圖表工具提示（顯示詳細OHLC）
- [ ] 添加時間軸標籤

#### 2. 交易量圖修復
- [ ] 確保正確顯示
- [ ] 修復顏色邏輯（綠/紅）
- [ ] 同步時間軸與主圖

#### 3. 評論系統修復
- [ ] 檢查CSS顯示問題
- [ ] 修復JavaScript初始化
- [ ] 確保評論正常加載

#### 4. 交易功能測試與修復
- [ ] 測試買入功能
- [ ] 測試賣出功能
- [ ] 修復滑塊同步問題
- [ ] 驗證價格計算邏輯

---

### 🟠 **MLT遊戲幣系統**（優先級：高）

#### 1. MLT幣種創建
```javascript
MLT (MemeLaunch Token)
- 用途：平台原生代幣
- 功能：
  - 創建Meme幣（需要消耗MLT）
  - 購買幣種保護功能
  - 交易手續費
```

#### 2. MLT圖片生成
**需求**：
- 顏色方案：橙色 + 紫色漸變
- 風格：現代、專業
- 尺寸：256x256, 512x512
- 格式：PNG，透明背景

**Logo設計元素**：
- 火箭 🚀（象徵發射）
- 硬幣 💰（象徵代幣）
- 閃電 ⚡（象徵快速）

#### 3. 系統整合
- [ ] 創建MLT表（users表添加mlt_balance）
- [ ] 所有金幣 → MLT
- [ ] 更新UI顯示
- [ ] 更新交易邏輯
- [ ] 添加MLT充值/提現（可選）

---

### 🟡 **創幣流程升級**（優先級：中）

#### 1. 基本信息
```
現有：
- 名稱
- 符號
- 圖片

新增：
- 詳細描述（支持Markdown）
- 總供應量（用戶可設定）
- 初始價格（建議範圍）
```

#### 2. 社交媒體連結
```
可選添加：
- 🐦 Twitter/X
- 📱 Telegram
- 💬 Discord
- 🌐 官方網站
- 📧 Email
```

#### 3. 幣種符號設置
```
- 允許用戶自定義符號（3-10字符）
- 符號唯一性檢查
- 符號格式驗證
```

#### 4. 幣種保護功能（Revoke系統）
```
使用MLT購買保護：

1. Revoke Freeze（凍結權限）
   - 成本：100 MLT
   - 效果：無法凍結代幣轉賬

2. Revoke Mint（鑄造權限）
   - 成本：200 MLT
   - 效果：固定總供應量，無法增發

3. Revoke Update（更新權限）
   - 成本：150 MLT
   - 效果：無法修改幣種信息

4. Full Revoke Bundle（全套保護）
   - 成本：400 MLT（節省50 MLT）
   - 效果：所有保護功能
```

---

### 🟢 **真實交易機制**（優先級：中）

#### 1. 參考平台研究

**Pump.fun特點**：
- Bonding Curve定價
- 自動做市商(AMM)
- 流動性池
- 漸進式上市（達到市值目標後上Raydium）

**Raydium特點**：
- 流動性池（LP）
- Swap交易
- 流動性挖礦
- 費用結構（0.25%）

**需要實現**：
- [ ] 改進Bonding Curve算法
- [ ] 流動性池概念
- [ ] 自動上市機制
- [ ] 真實的價格發現

#### 2. 交易系統升級
```
現有：直接買賣
升級：
- Bonding Curve定價（更真實）
- 滑點保護
- 最小/最大交易限制
- 交易手續費（0.3% → MLT）
```

---

## 📊 數據庫結構升級

### 新表：mlt_balance
```sql
-- 用戶MLT餘額（可以直接添加到users表）
ALTER TABLE users ADD COLUMN mlt_balance REAL DEFAULT 10000;
```

### 新表：coin_protection
```sql
CREATE TABLE coin_protection (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id INTEGER NOT NULL,
  freeze_revoked INTEGER DEFAULT 0,
  mint_revoked INTEGER DEFAULT 0,
  update_revoked INTEGER DEFAULT 0,
  revoke_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);
```

### 更新coins表
```sql
ALTER TABLE coins ADD COLUMN twitter_link TEXT;
ALTER TABLE coins ADD COLUMN telegram_link TEXT;
ALTER TABLE coins ADD COLUMN discord_link TEXT;
ALTER TABLE coins ADD COLUMN website_link TEXT;
ALTER TABLE coins ADD COLUMN long_description TEXT;
```

---

## 🎨 UI/UX改進

### 1. 創幣頁面重設計
```
步驟1: 基本信息
- 名稱、符號、圖片
- 總供應量

步驟2: 詳細描述
- 長描述（Markdown編輯器）
- 社交媒體連結

步驟3: 保護功能
- 選擇保護選項
- 顯示MLT成本

步驟4: 確認與創建
- 預覽
- 確認成本
- 創建
```

### 2. 幣種詳情頁增強
```
添加：
- 社交媒體圖標連結
- 保護狀態徽章
- 詳細描述區塊
```

---

## 🛠️ 技術實施順序

### Sprint 1: Bug修復（1-2小時）
1. K線圖完整顯示
2. 交易量圖修復
3. 評論系統修復
4. 交易功能測試

### Sprint 2: MLT系統（2-3小時）
1. 生成MLT圖片
2. 數據庫升級
3. 更新所有UI
4. 更新交易邏輯

### Sprint 3: 創幣流程（3-4小時）
1. 新建創幣表單
2. 社交媒體連結
3. 保護功能UI
4. 整合MLT消耗

### Sprint 4: 交易機制（3-4小時）
1. 研究真實平台
2. 改進Bonding Curve
3. 實現流動性概念
4. 測試與優化

---

## ❓ 需要用戶確認的問題

1. **MLT初始餘額**：
   - 每個用戶初始獲得多少MLT？
   - 建議：10,000 MLT

2. **創幣成本**：
   - 創建一個Meme幣需要多少MLT？
   - 建議：500 MLT

3. **MLT圖片設計**：
   - 需要提供參考圖片嗎？
   - 或者我生成一個您來確認？

4. **保護功能價格**：
   - 上述價格（100-400 MLT）合理嗎？

5. **平台參考**：
   - 主要參考Pump.fun的風格？
   - 還是需要其他平台的元素？

---

## 📈 成功指標

- [ ] K線圖完整顯示
- [ ] 所有交易功能正常
- [ ] MLT系統運行
- [ ] 創幣流程完整
- [ ] UI/UX專業度提升

---

**準備好開始了嗎？請告訴我：**
1. 是否同意這個計劃？
2. 需要調整哪些優先級？
3. MLT的相關設置（初始餘額、創幣成本等）
4. 是否需要我先生成MLT圖片供您確認？

**我建議的執行順序**：
1. 先修復所有Bug（Sprint 1）
2. 實現MLT系統（Sprint 2）
3. 再進行其他升級

讓我知道您的想法！ 🚀
