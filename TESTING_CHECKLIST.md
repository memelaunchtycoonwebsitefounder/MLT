# 🎯 Chart.js完全重寫 + MLT系統 - 測試驗證清單

## 📊 測試環境
- **URL**: https://3000-ialq9sk0j7h42em32rv8h-2e77fc33.sandbox.novita.ai
- **測試帳號**: trade1770651466@example.com / Trade123!
- **用戶ID**: 7
- **MLT餘額**: 10,000 MLT

## 🧪 測試頁面

### 1️⃣ 幣種詳情頁
**URL**: https://3000-ialq9sk0j7h42em32rv8h-2e77fc33.sandbox.novita.ai/coin/4

✅ **K線圖（Chart.js）**
- [ ] 圖表正常顯示（綠色上漲、紅色下跌的柱狀圖）
- [ ] 無 "Value is null" 錯誤
- [ ] 無 "Uncaught TypeError: '' is not a function" 錯誤
- [ ] 價格軸在右側，標籤清晰（$0.00000xxx 格式）
- [ ] 時間軸在底部，顯示時:分格式

✅ **成交量圖（Chart.js）**
- [ ] 成交量柱狀圖顯示
- [ ] 顏色與價格圖同步（綠漲紅跌）
- [ ] Y軸標籤清晰可讀

✅ **OHLC面板**
- [ ] 滑鼠懸停在圖表上時顯示
- [ ] O/H/L/C 值正確顯示（8位小數）
- [ ] Volume 值顯示

✅ **時間框架切換**
- [ ] 點擊 1h 按鈕，圖表更新（約60個數據點）
- [ ] 點擊 24h 按鈕，圖表更新（約100個數據點）
- [ ] 點擊 7d 按鈕，圖表更新（約168個數據點）
- [ ] 點擊 30d 按鈕，圖表更新（約720個數據點）
- [ ] 按鈕高亮狀態正確切換（橙色背景）

✅ **導航欄MLT餘額**
- [ ] 顯示 "10,000 MLT"
- [ ] MLT圖標顯示（金色代幣圖案）
- [ ] 文字有橙→紫漸變效果
- [ ] 背景有漸變光暈效果

✅ **價格變化百分比**
- [ ] 顯示真實的價格變化（不是隨機數）
- [ ] 上漲顯示綠色 + 向上箭頭
- [ ] 下跌顯示紅色 + 向下箭頭

✅ **交易功能**
- [ ] 買入滑動條可拖動
- [ ] 數量和百分比實時更新
- [ ] "立即買入"按鈕可點擊
- [ ] 賣出功能同上

✅ **評論系統**
- [ ] 評論列表正常顯示
- [ ] 可以發表新評論
- [ ] 可以回覆評論
- [ ] 可以點讚

### 2️⃣ 用戶資料頁
**URL**: https://3000-ialq9sk0j7h42em32rv8h-2e77fc33.sandbox.novita.ai/profile/7

✅ **MLT統計卡片**（只在自己的profile顯示）
- [ ] "MLT 餘額" 卡片顯示 10,000
- [ ] "總賺取 MLT" 卡片顯示 0
- [ ] "總支出 MLT" 卡片顯示 0
- [ ] 三個卡片排列整齊（響應式3列）
- [ ] 每個卡片有漸變背景和MLT圖標

✅ **導航欄MLT餘額**
- [ ] 顯示 "10,000 MLT"
- [ ] MLT圖標和漸變效果正常

### 3️⃣ Console檢查

**必須無錯誤**：
- [ ] ❌ 無 "Value is null" 錯誤
- [ ] ❌ 無 "Uncaught TypeError: '' is not a function"
- [ ] ❌ 無 lightweight-charts 相關錯誤
- [ ] ❌ 無紅色錯誤訊息

**可接受的警告**（非關鍵）：
- ⚠️ Tailwind CDN 使用警告（正常，生產環境會優化）
- ⚠️ 表單字段缺少 id/name（不影響功能）

**預期的正常日誌**：
- ✅ "📊 Loading chart data with limit: 100"
- ✅ "📊 Loaded X price history records"
- ✅ "✅ Chart.js charts initialized successfully"
- ✅ "✅ Coin detail page fully initialized"
- ✅ "✅ User authenticated: trade1770651466"
- ✅ "✅ Loaded 4 comments"

### 4️⃣ 網絡檢查（DevTools Network Tab）

✅ **成功的請求**：
- [ ] GET /api/coins/4 → 200 OK
- [ ] GET /api/coins/4/price-history?limit=100 → 200 OK
- [ ] GET /api/auth/me → 200 OK（包含 mlt_balance: 10000）
- [ ] GET /static/chart-simple.js → 200 OK
- [ ] GET /static/coin-detail.js → 200 OK
- [ ] GET chart.js CDN → 200 OK

❌ **不應該有的請求**：
- [ ] lightweight-charts.standalone.production.js → 應該不存在

## 🎉 成功標準

### ✅ 核心功能
1. **圖表顯示** - Chart.js 圖表正常顯示，無錯誤
2. **MLT餘額** - 導航欄和Profile頁正確顯示 10,000 MLT
3. **交易功能** - 買入/賣出正常工作
4. **評論系統** - 可以查看/發表/回覆評論

### ✅ 技術要求
1. **無Console錯誤** - 沒有紅色錯誤訊息
2. **穩定性** - 圖表不閃爍、不崩潰
3. **響應式** - 圖表隨窗口大小調整

### ✅ 用戶體驗
1. **視覺效果** - MLT漸變效果美觀
2. **交互反應** - 按鈕/滑動條響應快速
3. **數據準確** - 價格/餘額/統計數據正確

---

## 📝 測試結果回報格式

請使用以下格式回報測試結果：

```
✅ K線圖顯示：[正常/異常]
✅ MLT餘額顯示：[正常/異常]  
✅ Console錯誤：[無/有]
❌ 發現的問題：[具體描述]
```

---

## 🚀 下一步

測試通過後，我們將繼續：
1. **Sprint 2 階段2** - 完成創幣頁面MLT成本顯示
2. **Sprint 2 階段3** - 實現後端MLT扣款邏輯
3. **部署到Cloudflare Pages** - 正式上線

---

**測試人員**: @你
**測試日期**: 2026-02-11
**版本**: Chart.js v1.0 + MLT System v1.0
