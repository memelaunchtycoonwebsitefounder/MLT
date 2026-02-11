# 🚀 Pump.fun風格改進建議 - MemeLaunch升級方案

## 📊 當前問題分析

### 1. 視覺問題
- ❌ Dashboard導航按鈕重疊/混亂
- ❌ 缺少專業的交易圖表
- ❌ 數據展示不夠真實

### 2. 功能問題
- ❌ 沒有價格歷史記錄
- ❌ 沒有K線圖/蠟燭圖
- ❌ 缺少實時數據感

---

## 🎯 Pump.fun核心特徵分析

### A. 視覺設計
```
✅ 簡潔的深色主題
✅ 大型互動式價格圖表 (TradingView風格)
✅ 實時更新的數據面板
✅ Bonding Curve進度條視覺化
✅ 24h交易量和價格變化
```

### B. 交易功能
```
✅ 快速買入/賣出 (1-click trading)
✅ 滑點設置 (0.5% - 5%)
✅ 即時價格預覽
✅ Gas費用估算
✅ 交易歷史時間線
```

### C. 數據真實感
```
✅ 逐tick價格更新
✅ 交易深度圖
✅ Holder分佈餅圖
✅ Top Holders列表
✅ 交易活動feed
```

---

## 🛠️ 具體實現方案

### Phase 1: 價格歷史系統 (必需) ⚡ HIGH

#### 1.1 創建價格歷史表
```sql
CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id INTEGER NOT NULL,
  price REAL NOT NULL,
  volume REAL NOT NULL,          -- 該時間點的交易量
  market_cap REAL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  interval_type TEXT DEFAULT '1m',  -- 1m, 5m, 15m, 1h, 1d
  FOREIGN KEY (coin_id) REFERENCES coins(id)
);

CREATE INDEX idx_price_history_coin_time ON price_history(coin_id, timestamp);
CREATE INDEX idx_price_history_interval ON price_history(coin_id, interval_type, timestamp);
```

#### 1.2 在每次交易時記錄價格
```typescript
// src/routes/trades.ts - 在買入/賣出後添加
await c.env.DB.prepare(`
  INSERT INTO price_history (coin_id, price, volume, market_cap, interval_type)
  VALUES (?, ?, ?, ?, '1m')
`).bind(coinId, currentPrice, amount, newMarketCap).run();
```

#### 1.3 創建價格歷史API
```typescript
// GET /api/coins/:id/price-history?interval=1h&limit=100
coins.get('/:id/price-history', async (c) => {
  const coinId = parseInt(c.req.param('id'));
  const interval = c.req.query('interval') || '1h';
  const limit = parseInt(c.req.query('limit') || '100');
  
  const history = await c.env.DB.prepare(`
    SELECT price, volume, market_cap, timestamp
    FROM price_history
    WHERE coin_id = ? AND interval_type = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `).bind(coinId, interval, limit).all();
  
  return successResponse({
    coin_id: coinId,
    interval,
    data: history.results.reverse() // 時間順序
  });
});
```

---

### Phase 2: TradingView風格圖表 ⚡ HIGH

#### 2.1 選擇圖表庫
**推薦: Lightweight Charts by TradingView**
```html
<!-- CDN -->
<script src="https://unpkg.com/lightweight-charts@4.1.0/dist/lightweight-charts.standalone.production.js"></script>
```

**優點**:
- 🚀 超快性能
- 📱 響應式設計
- 🎨 高度可自定義
- 💰 完全免費開源

#### 2.2 實現K線圖
```javascript
// public/static/tradingview-chart.js
class TradingChart {
  constructor(containerId, coinId) {
    this.container = document.getElementById(containerId);
    this.coinId = coinId;
    this.chart = null;
    this.candlestickSeries = null;
    this.volumeSeries = null;
    this.init();
  }
  
  init() {
    // 創建圖表
    this.chart = LightweightCharts.createChart(this.container, {
      width: this.container.clientWidth,
      height: 400,
      layout: {
        background: { color: '#0A0B0D' },
        textColor: '#DDD',
      },
      grid: {
        vertLines: { color: '#1A1B1F' },
        horzLines: { color: '#1A1B1F' },
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
      },
      timeScale: {
        borderColor: '#2B2B43',
        timeVisible: true,
        secondsVisible: false,
      },
    });
    
    // 蠟燭圖
    this.candlestickSeries = this.chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    
    // 成交量
    this.volumeSeries = this.chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });
    
    this.loadData();
  }
  
  async loadData() {
    try {
      const response = await axios.get(`/api/coins/${this.coinId}/price-history?interval=1h&limit=168`); // 7 days
      
      if (response.data.success) {
        const data = response.data.data;
        
        // 轉換為蠟燭圖格式
        const candleData = this.aggregateToCandles(data, '1h');
        const volumeData = candleData.map(c => ({
          time: c.time,
          value: c.volume,
          color: c.close >= c.open ? '#26a69a80' : '#ef535080'
        }));
        
        this.candlestickSeries.setData(candleData);
        this.volumeSeries.setData(volumeData);
      }
    } catch (error) {
      console.error('Failed to load chart data:', error);
    }
  }
  
  aggregateToCandles(priceHistory, interval) {
    // 將價格歷史聚合為蠟燭圖數據
    // [{ time, open, high, low, close, volume }]
    const candles = [];
    const intervalMs = this.getIntervalMs(interval);
    
    let currentCandle = null;
    
    priceHistory.forEach(point => {
      const timestamp = Math.floor(new Date(point.timestamp).getTime() / 1000);
      const roundedTime = Math.floor(timestamp / (intervalMs / 1000)) * (intervalMs / 1000);
      
      if (!currentCandle || currentCandle.time !== roundedTime) {
        if (currentCandle) candles.push(currentCandle);
        currentCandle = {
          time: roundedTime,
          open: point.price,
          high: point.price,
          low: point.price,
          close: point.price,
          volume: point.volume || 0
        };
      } else {
        currentCandle.high = Math.max(currentCandle.high, point.price);
        currentCandle.low = Math.min(currentCandle.low, point.price);
        currentCandle.close = point.price;
        currentCandle.volume += point.volume || 0;
      }
    });
    
    if (currentCandle) candles.push(currentCandle);
    return candles;
  }
  
  getIntervalMs(interval) {
    const intervals = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000
    };
    return intervals[interval] || intervals['1h'];
  }
  
  updatePrice(newPrice) {
    // 實時更新最新價格
    const lastCandle = this.candlestickSeries.dataByIndex(this.candlestickSeries.data().length - 1);
    if (lastCandle) {
      lastCandle.close = newPrice;
      lastCandle.high = Math.max(lastCandle.high, newPrice);
      lastCandle.low = Math.min(lastCandle.low, newPrice);
      this.candlestickSeries.update(lastCandle);
    }
  }
}

// 使用
const chart = new TradingChart('chart-container', coinId);
```

#### 2.3 幣種詳情頁集成
```html
<!-- src/index.tsx - Coin detail page -->
<div class="glass-card rounded-2xl p-6">
  <div class="flex justify-between items-center mb-4">
    <h3 class="text-xl font-bold">價格走勢</h3>
    <div class="flex space-x-2">
      <button class="interval-btn px-3 py-1 rounded bg-white/10" data-interval="1h">1H</button>
      <button class="interval-btn px-3 py-1 rounded bg-white/10" data-interval="4h">4H</button>
      <button class="interval-btn px-3 py-1 rounded bg-white/10" data-interval="1d">1D</button>
      <button class="interval-btn px-3 py-1 rounded bg-white/10" data-interval="1w">1W</button>
    </div>
  </div>
  <div id="chart-container" style="width: 100%; height: 400px;"></div>
</div>

<script src="https://unpkg.com/lightweight-charts@4.1.0/dist/lightweight-charts.standalone.production.js"></script>
<script src="/static/tradingview-chart.js"></script>
```

---

### Phase 3: Pump.fun風格交易面板 ⚡ MEDIUM

#### 3.1 交易面板UI設計
```html
<div class="glass-card rounded-2xl p-6">
  <div class="flex space-x-4 mb-6">
    <button class="trade-type-btn flex-1 py-3 bg-green-500 rounded-lg font-bold" data-type="buy">
      買入
    </button>
    <button class="trade-type-btn flex-1 py-3 bg-gray-700 rounded-lg font-bold" data-type="sell">
      賣出
    </button>
  </div>
  
  <!-- Bonding Curve Progress -->
  <div class="mb-6">
    <div class="flex justify-between text-sm mb-2">
      <span>Bonding Curve進度</span>
      <span id="curve-progress">45%</span>
    </div>
    <div class="w-full h-3 bg-white/10 rounded-full overflow-hidden">
      <div id="curve-bar" class="h-full bg-gradient-to-r from-blue-500 to-green-500" style="width: 45%"></div>
    </div>
    <p class="text-xs text-gray-400 mt-1">達到100%後將在DEX上線</p>
  </div>
  
  <!-- Amount Input -->
  <div class="mb-4">
    <label class="text-sm text-gray-400 mb-2 block">金額</label>
    <input type="number" id="trade-amount" class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-lg" placeholder="輸入金額">
    
    <!-- Quick Amount Buttons -->
    <div class="flex space-x-2 mt-2">
      <button class="quick-amount flex-1 py-2 bg-white/5 hover:bg-white/10 rounded text-sm" data-amount="100">100</button>
      <button class="quick-amount flex-1 py-2 bg-white/5 hover:bg-white/10 rounded text-sm" data-amount="500">500</button>
      <button class="quick-amount flex-1 py-2 bg-white/5 hover:bg-white/10 rounded text-sm" data-amount="1000">1000</button>
      <button class="quick-amount flex-1 py-2 bg-white/5 hover:bg-white/10 rounded text-sm" data-amount="max">MAX</button>
    </div>
  </div>
  
  <!-- Price Preview -->
  <div class="glass-effect rounded-lg p-4 mb-4 space-y-2">
    <div class="flex justify-between text-sm">
      <span class="text-gray-400">預計價格</span>
      <span id="preview-price" class="font-semibold">0.0105 金幣</span>
    </div>
    <div class="flex justify-between text-sm">
      <span class="text-gray-400">滑點容忍度</span>
      <span id="slippage" class="font-semibold">0.5%</span>
    </div>
    <div class="flex justify-between text-sm">
      <span class="text-gray-400">手續費</span>
      <span id="fee" class="font-semibold">0.50 金幣 (0.5%)</span>
    </div>
    <div class="border-t border-white/10 pt-2 mt-2 flex justify-between">
      <span class="font-semibold">總計</span>
      <span id="total-cost" class="font-bold text-lg">105.50 金幣</span>
    </div>
  </div>
  
  <!-- Trade Button -->
  <button id="execute-trade-btn" class="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg font-bold text-lg transition">
    立即買入
  </button>
</div>
```

#### 3.2 實時價格計算
```javascript
// public/static/pump-trading.js
class PumpTrading {
  constructor(coinId) {
    this.coinId = coinId;
    this.coin = null;
    this.tradeType = 'buy';
    this.init();
  }
  
  async init() {
    await this.loadCoin();
    this.setupEventListeners();
    this.startPriceUpdates();
  }
  
  async loadCoin() {
    const response = await axios.get(`/api/coins/${this.coinId}`);
    this.coin = response.data.data;
    this.updateUI();
  }
  
  setupEventListeners() {
    // Trade type toggle
    document.querySelectorAll('.trade-type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.tradeType = e.target.dataset.type;
        this.updateTradeType();
      });
    });
    
    // Amount input
    document.getElementById('trade-amount').addEventListener('input', () => {
      this.calculatePreview();
    });
    
    // Quick amount buttons
    document.querySelectorAll('.quick-amount').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const amount = e.target.dataset.amount;
        if (amount === 'max') {
          this.setMaxAmount();
        } else {
          document.getElementById('trade-amount').value = amount;
          this.calculatePreview();
        }
      });
    });
    
    // Execute trade
    document.getElementById('execute-trade-btn').addEventListener('click', () => {
      this.executeTrade();
    });
  }
  
  updateTradeType() {
    const buyBtn = document.querySelector('[data-type="buy"]');
    const sellBtn = document.querySelector('[data-type="sell"]');
    const executeBtn = document.getElementById('execute-trade-btn');
    
    if (this.tradeType === 'buy') {
      buyBtn.classList.add('bg-green-500');
      buyBtn.classList.remove('bg-gray-700');
      sellBtn.classList.add('bg-gray-700');
      sellBtn.classList.remove('bg-red-500');
      executeBtn.textContent = '立即買入';
      executeBtn.className = 'w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg font-bold text-lg transition';
    } else {
      sellBtn.classList.add('bg-red-500');
      sellBtn.classList.remove('bg-gray-700');
      buyBtn.classList.add('bg-gray-700');
      buyBtn.classList.remove('bg-green-500');
      executeBtn.textContent = '立即賣出';
      executeBtn.className = 'w-full py-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 rounded-lg font-bold text-lg transition';
    }
    
    this.calculatePreview();
  }
  
  calculatePreview() {
    const amount = parseFloat(document.getElementById('trade-amount').value) || 0;
    if (amount <= 0) return;
    
    const currentPrice = this.coin.current_price;
    const slippagePercent = 0.5; // 0.5%
    const feePercent = 0.5; // 0.5%
    
    let estimatedPrice = currentPrice;
    
    if (this.tradeType === 'buy') {
      // 買入時價格會上漲（bonding curve）
      const priceImpact = (amount / this.coin.total_supply) * 0.1; // 簡化的價格影響
      estimatedPrice = currentPrice * (1 + priceImpact);
    } else {
      // 賣出時價格會下跌
      const priceImpact = (amount / this.coin.circulating_supply) * 0.1;
      estimatedPrice = currentPrice * (1 - priceImpact);
    }
    
    const slippage = estimatedPrice * (slippagePercent / 100);
    const finalPrice = this.tradeType === 'buy' ? estimatedPrice + slippage : estimatedPrice - slippage;
    
    const subtotal = amount * finalPrice;
    const fee = subtotal * (feePercent / 100);
    const total = subtotal + fee;
    
    // Update UI
    document.getElementById('preview-price').textContent = `${finalPrice.toFixed(6)} 金幣`;
    document.getElementById('slippage').textContent = `${slippagePercent}%`;
    document.getElementById('fee').textContent = `${fee.toFixed(2)} 金幣 (${feePercent}%)`;
    document.getElementById('total-cost').textContent = `${total.toFixed(2)} 金幣`;
  }
  
  async executeTrade() {
    const amount = parseFloat(document.getElementById('trade-amount').value);
    if (!amount || amount <= 0) {
      alert('請輸入有效金額');
      return;
    }
    
    const endpoint = this.tradeType === 'buy' ? '/api/trades/buy' : '/api/trades/sell';
    const token = localStorage.getItem('auth_token');
    
    try {
      const response = await axios.post(endpoint, {
        coinId: this.coinId,
        amount: amount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        alert(`${this.tradeType === 'buy' ? '買入' : '賣出'}成功！`);
        this.loadCoin(); // Reload coin data
        document.getElementById('trade-amount').value = '';
      }
    } catch (error) {
      alert(`交易失敗: ${error.response?.data?.error || error.message}`);
    }
  }
  
  startPriceUpdates() {
    // 每3秒更新一次價格
    setInterval(async () => {
      await this.loadCoin();
    }, 3000);
  }
  
  updateUI() {
    // Update bonding curve progress
    const progress = (this.coin.circulating_supply / this.coin.total_supply) * 100;
    document.getElementById('curve-progress').textContent = `${progress.toFixed(1)}%`;
    document.getElementById('curve-bar').style.width = `${progress}%`;
    
    this.calculatePreview();
  }
}
```

---

### Phase 4: 真實感數據展示 ⚡ MEDIUM

#### 4.1 24h統計面板
```html
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <div class="glass-card p-4 rounded-lg">
    <p class="text-sm text-gray-400 mb-1">當前價格</p>
    <p class="text-2xl font-bold" id="current-price">0.0105</p>
    <p class="text-sm text-green-400" id="price-change">+5.6%</p>
  </div>
  
  <div class="glass-card p-4 rounded-lg">
    <p class="text-sm text-gray-400 mb-1">24h交易量</p>
    <p class="text-2xl font-bold" id="volume-24h">1,234</p>
    <p class="text-sm text-gray-400">金幣</p>
  </div>
  
  <div class="glass-card p-4 rounded-lg">
    <p class="text-sm text-gray-400 mb-1">市值</p>
    <p class="text-2xl font-bold" id="market-cap">42,000</p>
    <p class="text-sm text-gray-400">金幣</p>
  </div>
  
  <div class="glass-card p-4 rounded-lg">
    <p class="text-sm text-gray-400 mb-1">持有人數</p>
    <p class="text-2xl font-bold" id="holders">156</p>
    <p class="text-sm text-green-400" id="holders-change">+12</p>
  </div>
</div>
```

#### 4.2 交易活動Feed
```html
<div class="glass-card rounded-2xl p-6">
  <h3 class="text-xl font-bold mb-4">最近交易</h3>
  <div id="trade-feed" class="space-y-2 max-h-96 overflow-y-auto">
    <!-- 動態生成 -->
  </div>
</div>

<script>
// 實時交易feed
async function loadTradeFeed(coinId) {
  const response = await axios.get(`/api/coins/${coinId}/recent-trades?limit=20`);
  const trades = response.data.data;
  
  const feedHtml = trades.map(trade => `
    <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
      <div class="flex items-center space-x-3">
        <div class="${trade.type === 'buy' ? 'text-green-400' : 'text-red-400'}">
          <i class="fas ${trade.type === 'buy' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
        </div>
        <div>
          <p class="font-semibold">${trade.type === 'buy' ? '買入' : '賣出'}</p>
          <p class="text-sm text-gray-400">${formatTimeAgo(trade.timestamp)}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="font-semibold">${trade.amount.toFixed(2)}</p>
        <p class="text-sm text-gray-400">@ ${trade.price.toFixed(6)}</p>
      </div>
    </div>
  `).join('');
  
  document.getElementById('trade-feed').innerHTML = feedHtml;
}

// 每5秒刷新
setInterval(() => loadTradeFeed(coinId), 5000);
</script>
```

#### 4.3 Top Holders列表
```html
<div class="glass-card rounded-2xl p-6">
  <h3 class="text-xl font-bold mb-4">Top持有人</h3>
  <div id="top-holders" class="space-y-3">
    <!-- 動態生成 -->
  </div>
</div>

<script>
async function loadTopHolders(coinId) {
  const response = await axios.get(`/api/coins/${coinId}/top-holders?limit=10`);
  const holders = response.data.data;
  
  const holdersHtml = holders.map((holder, index) => `
    <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
      <div class="flex items-center space-x-3">
        <span class="text-xl font-bold text-gray-500">#${index + 1}</span>
        <a href="/profile/${holder.user_id}" class="hover:text-coinbase-blue transition">
          ${holder.username}
        </a>
      </div>
      <div class="text-right">
        <p class="font-semibold">${holder.amount.toLocaleString()}</p>
        <p class="text-sm text-gray-400">${holder.percentage.toFixed(2)}%</p>
      </div>
    </div>
  `).join('');
  
  document.getElementById('top-holders').innerHTML = holdersHtml;
}
</script>
```

---

## 📈 實施優先級

### 🔴 Phase 1: 價格歷史系統 (1-2小時)
**必需** - 沒有這個，後續圖表無法實現
- 創建price_history表
- 修改交易API記錄價格
- 創建價格歷史API

### 🔴 Phase 2: TradingView圖表 (2-3小時)
**高優先級** - 大幅提升專業感
- 集成Lightweight Charts
- 實現K線圖
- 添加時間間隔切換

### 🟡 Phase 3: Pump.fun交易面板 (3-4小時)
**中優先級** - 改善用戶體驗
- 重新設計交易UI
- 實現實時價格預覽
- 添加Bonding Curve進度條

### 🟡 Phase 4: 真實感數據 (2-3小時)
**中優先級** - 增強真實感
- 24h統計面板
- 交易活動feed
- Top Holders列表

---

## 🎨 視覺設計參考

### Pump.fun配色方案
```css
:root {
  --bg-primary: #0A0B0D;
  --bg-secondary: #1A1B1F;
  --accent-green: #26a69a;
  --accent-red: #ef5350;
  --accent-blue: #0052FF;
  --text-primary: #FFFFFF;
  --text-secondary: #9CA3AF;
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
}
```

### 字體推薦
```css
font-family: 'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif;
```

---

## 🚀 快速開始

### 立即實現最小版本 (MVP)

**Step 1**: 創建price_history表並記錄價格
**Step 2**: 添加簡單的Chart.js折線圖
**Step 3**: 優化Dashboard導航（已完成）

**預計時間**: 2-3小時可完成基礎版本

---

## 📊 效果預期

### Before (當前)
- ❌ 沒有歷史數據
- ❌ 靜態價格顯示
- ❌ 簡單的交易按鈕
- ❌ 缺少真實感

### After (實現後)
- ✅ 完整的K線圖
- ✅ 實時價格更新
- ✅ 專業交易面板
- ✅ pump.fun級別的體驗

---

**要開始實現嗎？我建議從Phase 1開始！**
