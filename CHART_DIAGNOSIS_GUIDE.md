# 🔧 K線圖問題診斷指南

## 當前狀況
- **問題**：K線圖不顯示，"Value is null"錯誤
- **可能原因**：數據加載時序問題、Lightweight Charts初始化失敗

## 📋 診斷步驟（請您幫忙測試）

### 步驟1：檢查控制台日誌
打開 https://3000-ialq9sk0j7h42em32rv8h-2e77fc33.sandbox.novita.ai/coin/4

在瀏覽器按 F12 打開控制台，查找以下日誌：

**應該看到的成功日誌**：
```
✅ Coin data loaded
📊 Loading chart data with limit: 100
📊 Setting X candles to chart
✅ TradingView chart loaded with X data points
```

**請記錄**：
1. 是否看到 "📊 Loading chart data" ？
2. candleData.length 是多少？
3. 是否看到 "No valid candle data" 警告？
4. "Value is null" 錯誤發生在哪一行？

---

### 步驟2：檢查價格歷史API
在控制台執行以下命令：

```javascript
// 檢查API返回
fetch('/api/coins/4/price-history?limit=100', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  }
})
.then(r => r.json())
.then(d => {
  console.log('API Response:', d);
  console.log('Data count:', d.data?.data?.length);
  console.log('First item:', d.data?.data?.[0]);
})
```

**請告訴我**：
1. API是否成功？ (success: true?)
2. 返回了多少條數據？
3. 第一條數據的結構是什麼？ (price, timestamp, volume?)

---

### 步驟3：檢查圖表容器
在控制台執行：

```javascript
// 檢查DOM元素
console.log('Price chart:', document.getElementById('price-chart'));
console.log('Volume chart:', document.getElementById('volume-chart'));
console.log('Lightweight Charts:', typeof window.LightweightCharts);
```

**請告訴我**：
1. price-chart 和 volume-chart 元素存在嗎？
2. LightweightCharts 是否已加載？ (應該是 'object')

---

### 步驟4：手動測試圖表初始化
在控制台執行以下完整測試：

```javascript
// 完整診斷腳本
(async function diagnose() {
  console.log('=== K線圖診斷開始 ===');
  
  // 1. 檢查容器
  const container = document.getElementById('price-chart');
  console.log('1. Container exists:', !!container);
  console.log('   Container size:', container?.clientWidth, 'x', container?.clientHeight);
  
  // 2. 檢查庫
  console.log('2. LightweightCharts loaded:', typeof window.LightweightCharts);
  
  // 3. 檢查數據
  const token = localStorage.getItem('auth_token');
  const response = await fetch('/api/coins/4/price-history?limit=10', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  console.log('3. API success:', data.success);
  console.log('   Data count:', data.data?.data?.length);
  console.log('   Sample data:', data.data?.data?.[0]);
  
  // 4. 驗證數據格式
  if (data.data?.data?.[0]) {
    const item = data.data.data[0];
    console.log('4. Data validation:');
    console.log('   - price:', item.price, typeof item.price);
    console.log('   - timestamp:', item.timestamp, typeof item.timestamp);
    console.log('   - volume:', item.volume, typeof item.volume);
    console.log('   - price is number:', !isNaN(parseFloat(item.price)));
    console.log('   - price > 0:', parseFloat(item.price) > 0);
  }
  
  // 5. 測試創建圖表
  if (window.LightweightCharts && container) {
    try {
      const testChart = window.LightweightCharts.createChart(container, {
        width: container.clientWidth,
        height: 300
      });
      console.log('5. Chart creation: SUCCESS ✅');
      testChart.remove();
    } catch (e) {
      console.error('5. Chart creation FAILED:', e);
    }
  }
  
  console.log('=== 診斷結束 ===');
})();
```

**請將整個輸出截圖或複製給我！**

---

## 🎯 可能的解決方案

根據診斷結果，可能需要：

### 方案A：數據問題
如果數據為空或格式錯誤：
- 檢查price_history表是否有數據
- 驗證API返回格式
- 確認數據過濾邏輯

### 方案B：初始化時序問題
如果圖表容器或庫未加載：
- 延遲初始化圖表
- 使用 DOMContentLoaded 事件
- 檢查script加載順序

### 方案C：Lightweight Charts問題
如果庫本身有問題：
- 降級到舊版本
- 或改用Chart.js（更簡單）
- 或使用TradingView Widget

---

## 🚀 臨時替代方案

如果K線圖持續有問題，我們可以：

1. **使用Chart.js折線圖**（簡單穩定）
2. **嵌入TradingView Widget**（功能完整）
3. **使用HTML5 Canvas自繪**（完全控制）

---

## 📝 請回覆

完成上述診斷步驟後，請告訴我：

1. **步驟1-3的結果**（日誌內容）
2. **步驟4的完整輸出**（診斷腳本結果）
3. **您的建議**：
   - 繼續調試Lightweight Charts？
   - 還是改用Chart.js？
   - 還是嵌入TradingView Widget？

我會根據診斷結果提供精確的修復方案！🔧
