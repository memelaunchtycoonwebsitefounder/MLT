# 前端更新計劃 - Phase 3

## 概述
基於已完成的 Phase 2 後端系統(MLT 經濟、AI 交易員、Bonding Curve)，現在需要更新前端界面以展示這些新功能。

## 後端狀態確認

### ✅ 已完成功能
1. **Bonding Curve 定價系統**
   - 公式: `Price = InitialPrice × e^(k × progress)`, k = 4.0
   - 價格倍數: 0% → 1.00×, 50% → 7.39×, 100% → 54.60×
   - API: `/api/coins` (創幣), `/api/trades` (買賣)

2. **AI 交易員引擎**
   - 5 種交易員: SNIPER, WHALE, RETAIL, BOT, MARKET_MAKER
   - 自動交易循環 (10 秒間隔)
   - AI 決策邏輯和持倉管理

3. **市場事件系統**
   - 9 種事件類型: COIN_CREATED, SNIPER_ATTACK, WHALE_BUY, RUG_PULL等
   - 命運判定: SURVIVAL, EARLY_DEATH (5分鐘), LATE_DEATH (10分鐘), GRADUATION
   - 死亡/畢業處理機制

4. **創幣 API**
   - 新參數: `initial_mlt_investment` (1800-10000), `pre_purchase_tokens`
   - 最小預購: 100 MLT 成本 (約 45,618 tokens @ initial_mlt_investment=2000)
   - 自動初始化 AI 系統

### 📊 現有數據庫字段
```sql
-- coins 表新增字段
initial_mlt_investment REAL DEFAULT 2000.0
bonding_curve_progress REAL DEFAULT 0.0
bonding_curve_k REAL DEFAULT 4.0
destiny_type TEXT DEFAULT 'unknown'  -- SURVIVAL, EARLY_DEATH, LATE_DEATH, GRADUATION
is_ai_active BOOLEAN DEFAULT 1
ai_trade_count INTEGER DEFAULT 0
real_trade_count INTEGER DEFAULT 0
unique_real_traders INTEGER DEFAULT 0
has_sniper_attack BOOLEAN DEFAULT 0
has_whale_buy BOOLEAN DEFAULT 0
has_rug_pull BOOLEAN DEFAULT 0
-- 等等...

-- price_history 表新增
trader_type TEXT  -- SNIPER, WHALE, RETAIL, BOT, MARKET_MAKER
```

## Phase 3 任務分解

### Phase 3.1: 創幣表單更新 (HIGH PRIORITY) ⚡
**目標**: 更新 `/create` 頁面以支援 MLT 投資和預購計算

**需要修改的文件**:
- `public/static/create-coin.js` - 創幣邏輯
- `src/index.tsx` - Step 2 HTML 添加新 UI 元素

**新增 UI 元素** (在 Step 2):
```html
<!-- MLT 投資滑桿 -->
<div class="mb-6">
  <label class="block text-white mb-2">
    <i class="fas fa-coins mr-2 text-orange-500"></i>初始 MLT 投資
    <span class="text-gray-400 text-sm ml-2">(決定初始價格)</span>
  </label>
  <div class="flex items-center space-x-4">
    <input type="range" id="mlt-investment-slider" min="1800" max="10000" step="100" value="2000" 
           class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer">
    <div class="text-right min-w-[120px]">
      <span id="mlt-investment-value" class="text-2xl font-bold text-orange-400">2,000</span>
      <span class="text-gray-400 ml-1">MLT</span>
    </div>
  </div>
  <div class="mt-2 flex justify-between text-xs text-gray-400">
    <span>最低: 1,800 MLT</span>
    <span>最高: 10,000 MLT</span>
  </div>
</div>

<!-- 預購數量輸入 -->
<div class="mb-6">
  <label class="block text-white mb-2">
    <i class="fas fa-shopping-cart mr-2 text-green-500"></i>預購數量
    <span class="text-gray-400 text-sm ml-2">(必須至少 100 MLT 成本)</span>
  </label>
  <div class="relative">
    <input type="number" id="pre-purchase-amount" 
           min="0" step="1000" value="50000"
           class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-orange-500 focus:outline-none">
    <span class="absolute right-4 top-3 text-gray-400">代幣</span>
  </div>
  <p id="pre-purchase-hint" class="mt-2 text-xs text-gray-400">
    最小預購: <span id="min-pre-purchase">0</span> 代幣 (成本 100 MLT)
  </p>
</div>

<!-- 成本計算摘要 -->
<div class="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/30">
  <h4 class="text-lg font-bold text-white mb-3">
    <i class="fas fa-calculator mr-2"></i>創幣成本摘要
  </h4>
  <div class="space-y-2 text-sm">
    <div class="flex justify-between">
      <span class="text-gray-300">初始投資:</span>
      <span id="cost-initial-investment" class="font-mono text-white">2,000 MLT</span>
    </div>
    <div class="flex justify-between">
      <span class="text-gray-300">預購成本:</span>
      <span id="cost-pre-purchase" class="font-mono text-white">0 MLT</span>
    </div>
    <div class="flex justify-between">
      <span class="text-gray-300">初始價格:</span>
      <span id="cost-initial-price" class="font-mono text-white">0.002 MLT/token</span>
    </div>
    <div class="flex justify-between">
      <span class="text-gray-300">當前價格:</span>
      <span id="cost-current-price" class="font-mono text-white">0.002 MLT/token</span>
    </div>
    <div class="border-t border-gray-700 my-2"></div>
    <div class="flex justify-between items-center">
      <span class="text-white font-bold">總成本:</span>
      <span id="cost-total" class="text-xl font-bold text-orange-400">2,000 MLT</span>
    </div>
    <div class="flex justify-between text-xs">
      <span class="text-gray-400">創幣後餘額:</span>
      <span id="cost-remaining" class="text-gray-300">-- MLT</span>
    </div>
  </div>
</div>
```

**JavaScript 更新** (`create-coin.js`):
```javascript
// 引入 MLT 計算器
// <script src="/static/mlt-calculator.js"></script>

const calculator = new MLTCalculator();

// MLT 投資滑桿事件
document.getElementById('mlt-investment-slider').addEventListener('input', (e) => {
  const investment = parseInt(e.target.value);
  document.getElementById('mlt-investment-value').textContent = investment.toLocaleString();
  updateCostSummary();
});

// 預購數量輸入事件
document.getElementById('pre-purchase-amount').addEventListener('input', () => {
  updateCostSummary();
});

// 更新成本摘要
function updateCostSummary() {
  const investment = parseInt(document.getElementById('mlt-investment-slider').value);
  const supply = parseInt(document.querySelector('input[name="supply"]:checked').value);
  const prePurchase = parseInt(document.getElementById('pre-purchase-amount').value) || 0;
  
  const result = calculator.calculateCreationCost(investment, supply, prePurchase);
  
  // 更新 UI
  document.getElementById('min-pre-purchase').textContent = 
    result.minimumPrePurchase.tokens.toLocaleString();
  document.getElementById('cost-initial-investment').textContent = 
    investment.toLocaleString() + ' MLT';
  document.getElementById('cost-pre-purchase').textContent = 
    result.prePurchaseCost.toFixed(2) + ' MLT';
  document.getElementById('cost-initial-price').textContent = 
    result.initialPrice.toFixed(6) + ' MLT/token';
  document.getElementById('cost-current-price').textContent = 
    result.currentPrice.toFixed(6) + ' MLT/token';
  document.getElementById('cost-total').textContent = 
    result.totalCost.toFixed(2) + ' MLT';
  
  const remaining = (userData?.mlt_balance || 0) - result.totalCost;
  document.getElementById('cost-remaining').textContent = 
    Math.max(0, remaining).toFixed(2) + ' MLT';
    
  // 警告: 餘額不足
  const step2NextBtn = document.getElementById('step-2-next');
  if (remaining < 0) {
    step2NextBtn.disabled = true;
    step2NextBtn.classList.add('opacity-50', 'cursor-not-allowed');
  } else {
    step2NextBtn.disabled = false;
    step2NextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }
}
```

**API 調用更新** (`launchCoin`):
```javascript
const launchCoin = async () => {
  const token = localStorage.getItem('auth_token');
  const investment = parseInt(document.getElementById('mlt-investment-slider').value);
  const prePurchase = parseInt(document.getElementById('pre-purchase-amount').value) || 0;
  
  const requestData = {
    name: coinData.name,
    symbol: coinData.symbol,
    description: coinData.description,
    total_supply: coinData.supply,
    initial_mlt_investment: investment,  // 新增
    pre_purchase_tokens: prePurchase,    // 新增
    image_url: imageUrl,
    twitter_url: coinData.twitterUrl,
    telegram_url: coinData.telegramUrl,
    website_url: coinData.websiteUrl
  };
  
  const response = await axios.post('/api/coins', requestData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  // 成功後顯示 AI 初始化信息
  if (response.data.success) {
    const coin = response.data.data;
    showSuccessModal(coin);
  }
};
```

---

### Phase 3.2: 幣詳情頁更新 (HIGH PRIORITY) ⚡

**目標**: 在 `/coin/:id` 頁面展示 Bonding Curve 進度、AI 活動、事件時間線

**需要修改的文件**:
- `public/static/coin-detail.js`
- `src/index.tsx` - coin detail HTML

**新增 UI 元素**:

```html
<!-- Bonding Curve 進度條 -->
<div class="glass-effect rounded-xl p-6 mb-6">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-xl font-bold text-white">
      <i class="fas fa-chart-line mr-2 text-orange-500"></i>Bonding Curve 進度
    </h3>
    <span id="curve-progress-percent" class="text-2xl font-bold text-orange-400">0%</span>
  </div>
  
  <!-- 進度條 -->
  <div class="relative h-8 bg-gray-800 rounded-full overflow-hidden">
    <div id="curve-progress-bar" class="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-500" style="width: 0%"></div>
    <div class="absolute inset-0 flex items-center justify-between px-4 text-xs font-bold text-white">
      <span>0%</span>
      <span>25%</span>
      <span>50%</span>
      <span>75%</span>
      <span>100% 🎓</span>
    </div>
  </div>
  
  <!-- 里程碑指標 -->
  <div class="grid grid-cols-5 gap-2 mt-4 text-xs">
    <div class="text-center">
      <div class="text-gray-400">初始</div>
      <div id="price-0" class="font-mono text-white">0.002</div>
      <div class="text-gray-500">1.00×</div>
    </div>
    <div class="text-center">
      <div class="text-gray-400">25%</div>
      <div id="price-25" class="font-mono text-white">0.005</div>
      <div class="text-gray-500">2.72×</div>
    </div>
    <div class="text-center">
      <div class="text-gray-400">50%</div>
      <div id="price-50" class="font-mono text-white">0.015</div>
      <div class="text-gray-500">7.39×</div>
    </div>
    <div class="text-center">
      <div class="text-gray-400">75%</div>
      <div id="price-75" class="font-mono text-white">0.040</div>
      <div class="text-gray-500">20.09×</div>
    </div>
    <div class="text-center">
      <div class="text-gray-400">畢業</div>
      <div id="price-100" class="font-mono text-white">0.109</div>
      <div class="text-green-400">54.60×</div>
    </div>
  </div>
  
  <!-- 命運狀態 -->
  <div class="mt-4 p-3 rounded-lg" id="destiny-status">
    <div class="flex items-center space-x-2">
      <i id="destiny-icon" class="fas fa-question-circle text-gray-400"></i>
      <span id="destiny-text" class="text-gray-300">命運未知...</span>
    </div>
  </div>
</div>

<!-- AI 活動面板 -->
<div class="glass-effect rounded-xl p-6 mb-6">
  <h3 class="text-xl font-bold text-white mb-4">
    <i class="fas fa-robot mr-2 text-purple-500"></i>AI 交易活動
  </h3>
  
  <div class="grid grid-cols-2 gap-4 mb-4">
    <!-- AI vs 真實交易 -->
    <div class="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-gray-300">
          <i class="fas fa-robot mr-1"></i>AI 交易
        </span>
        <span id="ai-trade-count" class="text-xl font-bold text-purple-400">0</span>
      </div>
      <div class="text-xs text-gray-400">自動市場做市商</div>
    </div>
    
    <div class="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-gray-300">
          <i class="fas fa-user mr-1"></i>真實交易
        </span>
        <span id="real-trade-count" class="text-xl font-bold text-green-400">0</span>
      </div>
      <div class="text-xs text-gray-400">
        <span id="unique-traders">0</span> 位獨立交易者
      </div>
    </div>
  </div>
  
  <!-- AI 活躍狀態 -->
  <div class="flex items-center justify-between p-3 rounded-lg bg-gray-800">
    <span class="text-sm text-gray-300">AI 系統狀態</span>
    <div id="ai-status" class="flex items-center space-x-2">
      <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span class="text-sm text-green-400 font-bold">運行中</span>
    </div>
  </div>
</div>

<!-- 市場事件時間線 -->
<div class="glass-effect rounded-xl p-6">
  <h3 class="text-xl font-bold text-white mb-4">
    <i class="fas fa-history mr-2 text-blue-500"></i>事件時間線
  </h3>
  
  <div id="event-timeline" class="space-y-3 max-h-96 overflow-y-auto">
    <!-- 動態加載事件 -->
  </div>
</div>
```

**JavaScript 更新** (`coin-detail.js`):
```javascript
// 更新 Bonding Curve 進度
function updateBondingCurveProgress(coin) {
  const progress = coin.bonding_curve_progress * 100;
  document.getElementById('curve-progress-percent').textContent = progress.toFixed(2) + '%';
  document.getElementById('curve-progress-bar').style.width = progress + '%';
  
  // 更新價格里程碑
  const initialPrice = coin.current_price / Math.exp(4.0 * coin.bonding_curve_progress);
  const milestones = [0, 0.25, 0.5, 0.75, 1.0];
  milestones.forEach((p, i) => {
    const price = initialPrice * Math.exp(4.0 * p);
    document.getElementById(`price-${p * 100}`).textContent = price.toFixed(6);
  });
  
  // 命運狀態
  updateDestinyStatus(coin.destiny_type);
}

// 更新命運狀態
function updateDestinyStatus(destinyType) {
  const destinyConfig = {
    'SURVIVAL': {
      icon: 'fa-shield-alt',
      text: '生存模式 - 穩定發展中',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20 border-green-500/30'
    },
    'EARLY_DEATH': {
      icon: 'fa-skull-crossbones',
      text: '早期死亡 - 5 分鐘內面臨風險',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20 border-red-500/30'
    },
    'LATE_DEATH': {
      icon: 'fa-hourglass-half',
      text: '後期死亡 - 10 分鐘內面臨風險',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 border-orange-500/30'
    },
    'GRADUATION': {
      icon: 'fa-graduation-cap',
      text: '已畢業 - 達到 100% 進度! 🎉',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20 border-purple-500/30'
    },
    'RUG_PULL': {
      icon: 'fa-exclamation-triangle',
      text: 'Rug Pull 風險 - 小心詐騙!',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20 border-yellow-500/30'
    }
  };
  
  const config = destinyConfig[destinyType] || destinyConfig['SURVIVAL'];
  const statusDiv = document.getElementById('destiny-status');
  statusDiv.className = `mt-4 p-3 rounded-lg border ${config.bgColor}`;
  
  document.getElementById('destiny-icon').className = `fas ${config.icon} ${config.color}`;
  document.getElementById('destiny-text').className = config.color;
  document.getElementById('destiny-text').textContent = config.text;
}

// 更新 AI 活動
function updateAIActivity(coin) {
  document.getElementById('ai-trade-count').textContent = coin.ai_trade_count || 0;
  document.getElementById('real-trade-count').textContent = coin.real_trade_count || 0;
  document.getElementById('unique-traders').textContent = coin.unique_real_traders || 0;
  
  // AI 狀態
  const aiStatus = document.getElementById('ai-status');
  if (coin.is_ai_active) {
    aiStatus.innerHTML = `
      <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span class="text-sm text-green-400 font-bold">運行中</span>
    `;
  } else {
    aiStatus.innerHTML = `
      <div class="w-2 h-2 bg-gray-500 rounded-full"></div>
      <span class="text-sm text-gray-400">已停止</span>
    `;
  }
}

// 加載事件時間線
async function loadEventTimeline(coinId) {
  try {
    // 假設有 API: /api/coins/:id/events
    const response = await axios.get(`/api/coins/${coinId}/events`);
    const events = response.data.data || [];
    
    const timeline = document.getElementById('event-timeline');
    timeline.innerHTML = '';
    
    if (events.length === 0) {
      timeline.innerHTML = '<p class="text-gray-400 text-center py-4">暫無事件</p>';
      return;
    }
    
    events.forEach(event => {
      const eventEl = createEventElement(event);
      timeline.appendChild(eventEl);
    });
  } catch (error) {
    console.error('Load events error:', error);
  }
}

function createEventElement(event) {
  const eventConfig = {
    'COIN_CREATED': { icon: 'fa-rocket', color: 'text-blue-400', label: '幣種創建' },
    'SNIPER_ATTACK': { icon: 'fa-crosshairs', color: 'text-red-400', label: '狙擊手攻擊' },
    'WHALE_BUY': { icon: 'fa-fish', color: 'text-green-400', label: '鯨魚買入' },
    'RUG_PULL': { icon: 'fa-exclamation-triangle', color: 'text-yellow-400', label: 'Rug Pull' },
    'PANIC_SELL': { icon: 'fa-arrow-down', color: 'text-orange-400', label: '恐慌拋售' },
    'FOMO_BUY': { icon: 'fa-arrow-up', color: 'text-green-400', label: 'FOMO 買入' },
    'VIRAL_MOMENT': { icon: 'fa-fire', color: 'text-pink-400', label: '病毒式傳播' },
    'COIN_DEATH': { icon: 'fa-skull', color: 'text-gray-400', label: '幣種死亡' },
    'COIN_GRADUATION': { icon: 'fa-graduation-cap', color: 'text-purple-400', label: '幣種畢業' }
  };
  
  const config = eventConfig[event.event_type] || eventConfig['COIN_CREATED'];
  
  const div = document.createElement('div');
  div.className = 'flex items-start space-x-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition';
  div.innerHTML = `
    <div class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-700">
      <i class="fas ${config.icon} ${config.color}"></i>
    </div>
    <div class="flex-1">
      <div class="flex items-center justify-between mb-1">
        <span class="font-bold text-white">${config.label}</span>
        <span class="text-xs text-gray-500">${formatTime(event.created_at)}</span>
      </div>
      <p class="text-sm text-gray-400">${event.description || '無詳情'}</p>
      ${event.price_impact ? `<p class="text-xs text-gray-500 mt-1">價格影響: ${(event.price_impact * 100).toFixed(2)}%</p>` : ''}
    </div>
  `;
  
  return div;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return '剛剛';
  if (diffMins < 60) return `${diffMins} 分鐘前`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} 小時前`;
  return date.toLocaleDateString('zh-TW');
}
```

---

### Phase 3.3: 幣列表更新 (MEDIUM PRIORITY) 🟡

**目標**: 在市場列表和首頁添加進度條、AI 活動徽章、命運圖標

**需要修改的文件**:
- `public/static/market.js`
- `public/static/dashboard-simple.js`

**UI 更新** (每個幣卡片):
```html
<div class="coin-card glass-effect rounded-xl p-4">
  <!-- 現有內容 -->
  <div class="flex items-center space-x-3 mb-3">
    <img src="${coin.image_url}" class="w-12 h-12 rounded-full">
    <div>
      <h4 class="font-bold text-white">${coin.name}</h4>
      <span class="text-gray-400 text-sm">$${coin.symbol}</span>
    </div>
    <!-- 新增: 命運圖標 -->
    ${getDestinyBadge(coin.destiny_type)}
  </div>
  
  <!-- 新增: 迷你進度條 -->
  <div class="mb-3">
    <div class="flex items-center justify-between text-xs mb-1">
      <span class="text-gray-400">Bonding Curve</span>
      <span class="text-orange-400 font-bold">${(coin.bonding_curve_progress * 100).toFixed(1)}%</span>
    </div>
    <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
      <div class="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all" 
           style="width: ${coin.bonding_curve_progress * 100}%"></div>
    </div>
  </div>
  
  <!-- 新增: AI 活動指標 -->
  <div class="flex items-center justify-between text-xs mb-3">
    <div class="flex items-center space-x-2">
      <i class="fas fa-robot text-purple-400"></i>
      <span class="text-gray-400">AI: ${coin.ai_trade_count}</span>
    </div>
    <div class="flex items-center space-x-2">
      <i class="fas fa-user text-green-400"></i>
      <span class="text-gray-400">真實: ${coin.real_trade_count}</span>
    </div>
  </div>
  
  <!-- 現有價格和市值 -->
  <div class="flex items-center justify-between">
    <span class="text-gray-400">價格</span>
    <span class="text-white font-bold">${coin.current_price.toFixed(6)} MLT</span>
  </div>
</div>
```

**JavaScript 輔助函數**:
```javascript
function getDestinyBadge(destinyType) {
  const badges = {
    'SURVIVAL': '<span class="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">🛡️ 生存</span>',
    'EARLY_DEATH': '<span class="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">💀 高風險</span>',
    'LATE_DEATH': '<span class="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">⏳ 中風險</span>',
    'GRADUATION': '<span class="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">🎓 畢業</span>',
    'RUG_PULL': '<span class="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">⚠️ Rug</span>',
    'unknown': ''
  };
  return badges[destinyType] || badges['unknown'];
}
```

---

### Phase 3.4: 實時更新 (LOW PRIORITY) 🟢

**目標**: 使用輪詢更新價格和交易數據

**實施方式**:
- 每 5 秒輪詢幣詳情頁數據
- 每 10 秒輪詢市場列表數據
- 使用淡入動畫顯示更新

```javascript
// 在 coin-detail.js 中
let updateInterval;

function startRealTimeUpdates(coinId) {
  updateInterval = setInterval(async () => {
    try {
      const response = await axios.get(`/api/coins/${coinId}`);
      const coin = response.data.data;
      
      // 更新進度條
      updateBondingCurveProgress(coin);
      
      // 更新 AI 活動
      updateAIActivity(coin);
      
      // 重新加載事件
      await loadEventTimeline(coinId);
      
      // 淡入動畫
      document.body.classList.add('data-updated');
      setTimeout(() => {
        document.body.classList.remove('data-updated');
      }, 500);
    } catch (error) {
      console.error('Update error:', error);
    }
  }, 5000); // 5 秒
}

// 頁面卸載時清理
window.addEventListener('beforeunload', () => {
  if (updateInterval) clearInterval(updateInterval);
});
```

---

### Phase 3.5: 圖表改進 (LOW PRIORITY) 🟢

**目標**: 在價格圖表中用顏色區分 AI 和真實交易

**Chart.js 配置**:
```javascript
// 在 coin-detail.js 中
function renderPriceChart(priceHistory) {
  const ctx = document.getElementById('price-chart').getContext('2d');
  
  // 分離 AI 和真實交易
  const aiData = priceHistory
    .filter(p => p.trader_type)
    .map(p => ({ x: new Date(p.timestamp), y: p.price }));
  
  const realData = priceHistory
    .filter(p => !p.trader_type)
    .map(p => ({ x: new Date(p.timestamp), y: p.price }));
  
  new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'AI 交易',
          data: aiData,
          borderColor: 'rgba(168, 85, 247, 0.8)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: 'rgba(168, 85, 247, 1)'
        },
        {
          label: '真實交易',
          data: realData,
          borderColor: 'rgba(34, 197, 94, 0.8)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: 'rgba(34, 197, 94, 1)'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'minute'
          }
        },
        y: {
          beginAtZero: false,
          ticks: {
            callback: (value) => value.toFixed(6) + ' MLT'
          }
        }
      }
    }
  });
}
```

---

## 實施優先級

### 🔴 HIGH (立即實施)
1. **Phase 3.1: 創幣表單** - 阻塞用戶創幣
2. **Phase 3.2: 幣詳情頁** - 展示核心功能

### 🟡 MEDIUM (盡快實施)
3. **Phase 3.3: 幣列表** - 改善用戶體驗

### 🟢 LOW (可選)
4. **Phase 3.4: 實時更新** - 錦上添花
5. **Phase 3.5: 圖表改進** - 視覺增強

---

## 測試清單

### Phase 3.1 測試
- [ ] MLT 滑桿改變時成本正確計算
- [ ] 預購數量低於最小值時顯示警告
- [ ] 餘額不足時禁用「下一步」按鈕
- [ ] 創幣成功後顯示正確的 AI 初始化信息

### Phase 3.2 測試
- [ ] Bonding Curve 進度條正確顯示
- [ ] 價格里程碑計算準確
- [ ] 命運狀態顯示正確顏色和圖標
- [ ] AI vs 真實交易計數更新
- [ ] 事件時間線按時間順序顯示

### Phase 3.3 測試
- [ ] 市場列表顯示迷你進度條
- [ ] 命運徽章正確分類
- [ ] AI/真實交易計數顯示

---

## API 端點需求

### 現有 API
- ✅ `POST /api/coins` - 創幣 (已支援新參數)
- ✅ `GET /api/coins/:id` - 獲取幣詳情
- ✅ `GET /api/coins/trending/list` - 獲取幣列表
- ✅ `GET /api/coins/:id/price-history` - 獲取價格歷史

### 需要新增 (Optional)
- ⚠️ `GET /api/coins/:id/events` - 獲取幣事件列表
- ⚠️ `GET /api/admin/coins/:id/ai-status` - 獲取 AI 狀態詳情

---

## 開發流程

1. **Phase 3.1 實施**:
   - 更新 `src/index.tsx` 創幣頁面 HTML (Step 2)
   - 更新 `public/static/create-coin.js` 邏輯
   - 引入 `public/static/mlt-calculator.js`
   - 測試創幣流程

2. **Phase 3.2 實施**:
   - 更新 `src/index.tsx` 幣詳情頁 HTML
   - 更新 `public/static/coin-detail.js` 邏輯
   - 實現事件時間線
   - 測試所有顯示

3. **Phase 3.3 實施**:
   - 更新 `public/static/market.js`
   - 更新 `public/static/dashboard-simple.js`
   - 測試列表顯示

4. **Build and Deploy**:
   ```bash
   npm run build
   pm2 restart memelaunch
   ```

---

## 預計時間

- Phase 3.1: 1-2 小時
- Phase 3.2: 2-3 小時
- Phase 3.3: 1 小時
- Phase 3.4 + 3.5: 1-2 小時

**總計: 5-8 小時** (含測試和調試)

---

## 完成標準

✅ 所有 High Priority 任務完成
✅ 創幣流程完整支援 MLT 投資
✅ 幣詳情頁展示 Bonding Curve 和 AI 活動
✅ 市場列表顯示進度和命運
✅ 所有測試通過
✅ 部署到生產環境

---

## 參考資料

- Backend API: `/home/user/webapp/API_DOCUMENTATION.md`
- Design Doc: `/home/user/webapp/GAMIFICATION_DESIGN.md`
- Phase 2 Summary: `/home/user/webapp/PHASE_2_COMPLETE.md`
