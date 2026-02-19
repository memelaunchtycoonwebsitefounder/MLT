# MemeLaunch Tycoon - 新首頁設計方案
## 📋 設計概述

參考 pump.fun 和 Raydium 等知名 meme launch 平台的設計風格，創建一個現代化、吸引人的首頁。

## 🎨 設計系統

### 配色方案
- **主色調**:
  - 橙色 `#FF6B35` - 主要 CTA、重要元素
  - 黃色 `#F7931E` - 漸變效果
  - 青色 `#00D9FF` - 強調色
  - 紫色 `#9D4EDD` - 次要強調

- **背景色**:
  - 深色主題: `#0A0B0D` → `#16213E` → `#0F3460` (漸變)
  - 玻璃效果: `rgba(255, 255, 255, 0.05)`

### 字體
- **主字體**: Inter (乾淨、現代)
- **等寬字體**: JetBrains Mono (數字、代碼)

### 動畫效果
- 懸停放大: `hover:scale-105`
- 漸變文字動畫: 彩虹色循環
- 浮動動畫: 圖標上下浮動
- 計數動畫: CountUp.js

## 📐 首頁結構 (10 個核心區塊)

### 1. 導航欄 (Navigation)
- Logo + 名稱
- 導航連結: Features, How It Works, Market
- 語言切換器 (EN/中文)
- Login + Start Playing 按鈕

### 2. Hero 區塊
- 大標題: "Launch Your Own Meme Coin Empire"
- 副標題: 簡短描述
- 2 個 CTA 按鈕: "Get 10,000 Free Coins" + "Watch Demo"
- 4 個即時統計卡片:
  - Starting Balance: 10,000
  - Active Players: 從 API 獲取
  - Coins Created: 從 API 獲取
  - 24h Volume: 從 API 獲取

### 3. 即時市場預覽 (Live Market Preview)
- 標題: "🔥 Trending Now"
- 無限輪播: 顯示 12 個熱門幣種
- 每個卡片顯示:
  - 幣種圖片、名稱、符號
  - 當前價格、24h 漲跌幅
  - 迷你圖表 (簡化版)
  - 進度條 (bonding curve progress)
- 點擊跳轉到幣種詳情頁

### 4. 如何運作 (How It Works)
- 4 步驟流程:
  1. 註冊獲得 10,000 金幣
  2. 創建你的第一個 meme 幣
  3. 交易並賺取虛擬利潤
  4. 攀登排行榜

### 5. 功能展示網格 (Features Grid)
- 6 個特色卡片 (3×2 網格):
  1. 100% 無風險
  2. 真實市場機制 (Bonding Curve)
  3. 競爭性排行榜
  4. VIP 特權
  5. AI 交易機器人
  6. 專業 K 線圖表

### 6. 即時統計數據 (Live Statistics)
- 4 個大數字 (CountUp 動畫):
  - 總用戶數
  - 已創建幣種
  - 總交易量
  - 今日交易

### 7. 用戶評價 (Testimonials)
- 3 個用戶評價卡片 (Twitter 風格)
- 包含: 用戶名、角色、評價內容

### 8. 定價方案 (Pricing Plans)
- 免費版 vs VIP 版對比表
- 免費版:
  - 10,000 起始金幣
  - 無限創建幣種
  - 基礎圖表
  - 社區訪問
- VIP 版: Coming Soon

### 9. 常見問題 (FAQ)
- 折疊式問答:
  - 這是真正的加密交易嗎？
  - 如何賺取金幣？
  - 可以提取金幣嗎？
  - 這是免費的嗎？

### 10. 最終 CTA (Final CTA)
- 大標題: "Ready to Launch Your Empire?"
- 副標題: "Join thousands of players..."
- 大按鈕: "Get Started Free"
- 免責聲明: "No credit card • 100% free •即訪問"

### 11. 頁腳 (Footer)
- 連結: About, Privacy, Terms, Contact
- 版權聲明: © 2026 MemeLaunch Tycoon

## 🌍 國際化 (i18n)

### 實現方式
- **客戶端翻譯**: 使用自定義 i18n 管理器
- **無外部依賴**: 純 JavaScript 實現
- **翻譯文件**: `/locales/en.json`, `/locales/zh.json`

### 語言檢測優先級
1. localStorage 中保存的語言 (`mlt_locale`)
2. 瀏覽器語言 (`navigator.language`)
3. 默認語言 (英文)

### 使用方式
```html
<!-- 文本內容 -->
<h1 data-i18n="hero.title">Launch Your Own</h1>

<!-- 屬性翻譯 -->
<input data-i18n-placeholder="hero.emailPlaceholder" />
```

### 語言切換器組件
- 下拉選單顯示語言選項
- 顯示國旗 emoji: 🇺🇸 English, 🇨🇳 中文
- 點擊切換並保存到 localStorage
- 自動重新應用翻譯

## 📊 性能目標

### Lighthouse 分數
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

### Core Web Vitals
- FCP (First Contentful Paint): < 1.5s
- LCP (Largest Contentful Paint): < 2.5s
- CLS (Cumulative Layout Shift): < 0.1
- TTI (Time to Interactive): < 3.5s

### 優化策略
1. **延遲載入**: 使用 `loading="lazy"` 屬性
2. **CDN 資源**: Tailwind CSS, Font Awesome
3. **壓縮圖片**: WebP 格式
4. **最小化 JavaScript**: 使用原生 API，避免重型庫
5. **緩存策略**: 靜態資源使用長期緩存

## 📝 已創建的文件

### 翻譯文件
1. `/home/user/webapp/public/locales/en.json` - 英文翻譯
2. `/home/user/webapp/public/locales/zh.json` - 中文翻譯

### JavaScript 腳本
1. `/home/user/webapp/public/static/i18n.js` - i18n 管理器
2. `/home/user/webapp/public/static/language-switcher.js` - 語言切換組件
3. `/home/user/webapp/public/static/landing-new.js` - 新首頁腳本 (即時數據、統計、輪播)

### 修改的文件
1. `/home/user/webapp/src/index.tsx` - 部分更新 (導航欄和 Hero 區塊)

## 🚀 下一步

1. **完成首頁 HTML** - 整合所有 10 個區塊到 index.tsx
2. **測試 i18n 功能** - 確保語言切換正常工作
3. **添加即時數據** - 整合 API 獲取實時統計
4. **性能優化** - 達到 Lighthouse 90+ 分數
5. **Build 和部署** - 部署到 Cloudflare Pages
6. **驗證** - 測試所有功能和響應式設計

## 💡 技術亮點

1. **無外部 i18n 庫**: 自定義輕量級解決方案 (~5KB)
2. **即時數據更新**: 每 30 秒自動刷新統計
3. **平滑動畫**: CSS + JS 結合的性能優化動畫
4. **無限輪播**: 自動滾動的熱門幣種展示
5. **響應式設計**: Mobile-first 設計理念

## 📱 移動端優化

- 堆疊式布局: 在小屏幕上自動調整為單列
- 觸摸友好: 大按鈕、足夠的觸控區域
- 優化字體大小: 移動端使用更小的字體
- 簡化導航: 漢堡菜單 (如需要)

---

**狀態**: 🟡 進行中 (i18n 系統已完成, 首頁 HTML 正在更新)
**下一步**: 完成首頁 HTML 的所有 10 個區塊
