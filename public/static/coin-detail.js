/**
 * Coin Detail Page JavaScript
 * Complete trading panel implementation with all features
 */

let coinData = null;
let userData = null;
let userHoldings = 0;
let currentTab = 'buy';

// Check authentication
const checkAuth = async (retryCount = 0) => {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    if (retryCount < 3) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return checkAuth(retryCount + 1);
    }
    
    const coinId = window.location.pathname.split('/').pop();
    window.location.href = `/login?redirect=/coin/${coinId}`;
    return null;
  }

  try {
    const response = await axios.get('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      localStorage.removeItem('auth_token');
      const coinId = window.location.pathname.split('/').pop();
      window.location.href = `/login?redirect=/coin/${coinId}`;
      return null;
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    localStorage.removeItem('auth_token');
    const coinId = window.location.pathname.split('/').pop();
    window.location.href = `/login?redirect=/coin/${coinId}`;
    return null;
  }
};

// Update user balance display
const updateUserBalance = (balance, mltBalance) => {
  const balanceEl = document.getElementById('user-balance');
  if (balanceEl) {
    balanceEl.textContent = Number(balance || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  
  // Update MLT balance
  const mltBalanceEl = document.getElementById('user-mlt-balance');
  if (mltBalanceEl && mltBalance !== undefined) {
    mltBalanceEl.textContent = Number(mltBalance || 0).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
};

// Load coin data
const loadCoinData = async (skipChart = false) => {
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await axios.get(`/api/coins/${COIN_ID}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.data.success) {
      coinData = response.data.data;
      renderCoinData();
      await loadUserHoldings();
      loadRecentTransactions();
      if (!skipChart) {
        console.log('🔄 Reloading chart with latest data...');
        await initPriceChart();
        console.log('✅ Chart reloaded successfully');
      }
      updateTradeCalculations(); // Update calculations after loading
    }
  } catch (error) {
    console.error('Failed to load coin:', error);
    // Don't redirect on error - user might be in middle of trading
    showNotification('載入幣種資料失敗: ' + (error.response?.data?.message || error.message), 'error');
    // Only redirect if it's the initial load (no coinData yet)
    if (!coinData) {
      setTimeout(() => {
        window.location.href = '/market';
      }, 2000);
    }
  }
};

// Render coin data
const renderCoinData = async () => {
  document.getElementById('loading-state').classList.add('hidden');
  document.getElementById('coin-content').classList.remove('hidden');
  
  // Header
  document.getElementById('coin-image').src = coinData.image_url || '/static/default-coin.svg';
  document.getElementById('coin-name').textContent = coinData.name;
  document.getElementById('coin-symbol').textContent = `$${coinData.symbol}`;
  document.getElementById('coin-creator').textContent = coinData.creator_username || 'Unknown';
  document.getElementById('coin-price').textContent = `$${Number(coinData.current_price || 0).toFixed(8)}`;
  
  // Calculate real price change from price history
  try {
    const response = await axios.get(`/api/coins/${COIN_ID}/price-history?limit=2`);
    let priceChange = 0;
    
    if (response.data.success && response.data.data.data.length >= 2) {
      const history = response.data.data.data;
      const currentPrice = parseFloat(history[0].price);
      const previousPrice = parseFloat(history[1].price);
      
      if (currentPrice && previousPrice && previousPrice > 0) {
        priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;
      }
    }
    
    // Update price change display
    const priceChangeEl = document.getElementById('coin-price-change');
    if (priceChangeEl) {
      const isPositive = priceChange >= 0;
      priceChangeEl.innerHTML = `
        <i class="fas fa-arrow-${isPositive ? 'up' : 'down'} mr-1"></i>
        ${isPositive ? '+' : ''}${priceChange.toFixed(2)}%
      `;
      priceChangeEl.className = `${isPositive ? 'text-green-400' : 'text-red-400'} text-lg mt-2`;
    }
  } catch (error) {
    console.warn('Could not calculate price change:', error);
    // Fallback to neutral display
    const priceChangeEl = document.getElementById('coin-price-change');
    if (priceChangeEl) {
      priceChangeEl.innerHTML = `<i class="fas fa-minus mr-1"></i>0.00%`;
      priceChangeEl.className = 'text-gray-400 text-lg mt-2';
    }
  }
  
  // Stats
  document.getElementById('stat-market-cap').textContent = `$${Number(coinData.market_cap || 0).toFixed(4)}`;
  document.getElementById('stat-supply').textContent = Number(coinData.total_supply || 0).toLocaleString();
  document.getElementById('stat-holders').textContent = Number(coinData.holders_count || 0).toLocaleString();
  document.getElementById('stat-transactions').textContent = Number(coinData.transaction_count || 0).toLocaleString();
  
  // Description
  document.getElementById('coin-description').textContent = coinData.description || '沒有描述';
  
  // Hype score
  const hypeScore = coinData.hype_score || 0;
  document.getElementById('hype-score').textContent = Math.floor(hypeScore);
  document.getElementById('hype-bar').style.width = `${Math.min(hypeScore / 200 * 100, 100)}%`;
  
  // Bonding Curve Progress
  const circulatingSupply = Number(coinData.circulating_supply || 0);
  const totalSupply = Number(coinData.total_supply || 10000);
  const progressPercent = (circulatingSupply / totalSupply * 100).toFixed(2);
  const remaining = totalSupply - circulatingSupply;
  
  document.getElementById('bonding-circulating').textContent = circulatingSupply.toLocaleString();
  document.getElementById('bonding-total').textContent = totalSupply.toLocaleString();
  document.getElementById('bonding-remaining').textContent = `剩餘 ${remaining.toLocaleString()}`;
  document.getElementById('bonding-progress-percent').textContent = `${progressPercent}%`;
  document.getElementById('bonding-progress-bar').style.width = `${progressPercent}%`;
};

// Load user holdings
const loadUserHoldings = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await axios.get('/api/portfolio', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.data.success) {
      const holdings = response.data.data.holdings || [];
      const holding = holdings.find(h => h.coin_id == COIN_ID);
      userHoldings = holding ? holding.amount : 0;
      
      // Update holdings display
      document.getElementById('holdings-amount').textContent = userHoldings.toLocaleString();
      document.getElementById('holdings-symbol').textContent = coinData.symbol;
      
      if (userHoldings > 0) {
        const holdingValue = userHoldings * coinData.current_price;
        document.getElementById('holdings-value').textContent = `$${holdingValue.toFixed(4)}`;
        document.getElementById('holdings-info').classList.remove('hidden');
      } else {
        document.getElementById('holdings-info').classList.add('hidden');
      }
      
      // Update calculations
      updateTradeCalculations();
    }
  } catch (error) {
    console.error('Failed to load holdings:', error);
  }
};

// Load recent transactions
const loadRecentTransactions = async () => {
  try {
    // Note: Coin-specific transaction history endpoint not implemented yet
    // For now, show empty state
    renderTransactions([]);
  } catch (error) {
    console.error('Failed to load transactions:', error);
    renderTransactions([]);
  }
};

// Render transactions
const renderTransactions = (transactions) => {
  const container = document.getElementById('recent-transactions');
  
  if (transactions.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-gray-400">
        <i class="fas fa-inbox text-4xl mb-2"></i>
        <p>暫無交易記錄</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = transactions.slice(0, 10).map(tx => `
    <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 rounded-full ${tx.type === 'buy' ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center">
          <i class="fas fa-arrow-${tx.type === 'buy' ? 'up' : 'down'} text-white text-sm"></i>
        </div>
        <div>
          <p class="font-bold">${tx.type === 'buy' ? '買入' : '賣出'} ${Number(tx.amount).toLocaleString()} ${coinData.symbol}</p>
          <p class="text-sm text-gray-400">${new Date(tx.created_at).toLocaleString('zh-TW')}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="font-bold">$${Number(tx.price).toFixed(8)}</p>
        <p class="text-sm text-gray-400">總計: $${Number(tx.total_cost || tx.amount * tx.price).toFixed(4)}</p>
      </div>
    </div>
  `).join('');
};

// Initialize price chart with Lightweight Charts (TradingView-style)
const initPriceChart = async (limit = 100) => {
  console.log('📊 Loading chart data with limit:', limit);
  
  try {
    // Load real price history from API
    const response = await axios.get(`/api/coins/${COIN_ID}/price-history?limit=${limit}`);
    
    if (!response.data.success) {
      console.error('❌ Failed to load price history');
      return false;
    }
    
    const history = response.data.data.data || [];
    console.log('📊 Loaded', history.length, 'price history records');
    
    // Determine timeframe based on data amount for proper aggregation
    let timeframe = '1m'; // Default 1-minute candles
    if (limit > 60) timeframe = '10m';   // 10-minute candles for more data
    if (limit > 600) timeframe = '1h';   // 1-hour candles for lots of data
    
    console.log(`📊 Using ${timeframe} timeframe for ${history.length} records`);
    
    // Call the Lightweight Charts function
    const success = await window.initLightweightCharts(coinData, history, timeframe);
    
    if (success) {
      console.log('✅ Lightweight Charts initialized successfully');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Price chart error:', error);
    showNotification('無法載入價格圖表', 'error');
    return false;
  }
};

// Setup timeframe buttons for chart
const setupTimeframeButtons = () => {
  const buttons = document.querySelectorAll('.timeframe-btn');
  
  buttons.forEach(btn => {
    btn.addEventListener('click', async () => {
      // Update active state
      buttons.forEach(b => {
        b.classList.remove('active', 'bg-orange-500');
        b.classList.add('bg-white/10');
      });
      btn.classList.remove('bg-white/10');
      btn.classList.add('active', 'bg-orange-500');
      
      // Get timeframe
      const timeframe = btn.dataset.timeframe;
      
      // Calculate limit based on timeframe (for 1-minute candles)
      let limit = 60; // default 1 hour
      switch(timeframe) {
        case '1m':
          limit = 60; // Last 60 minutes (1 hour of 1-min candles)
          break;
        case '10m':
          limit = 144; // Last 24 hours at 10-min intervals
          break;
        case '1h':
          limit = 168; // Last 7 days at 1-hour intervals
          break;
        case '24h':
          limit = 720; // Last 30 days at 24-hour intervals
          break;
      }
      
      console.log('⏰ Switching to timeframe:', timeframe, 'with limit:', limit);
      
      // Reload chart with new timeframe
      await initPriceChart(limit);
    });
  });
};

// ==================== TRADING PANEL ====================

// Setup trading tabs
const setupTradingTabs = () => {
  const buyTab = document.getElementById('buy-tab');
  const sellTab = document.getElementById('sell-tab');
  
  buyTab.addEventListener('click', () => switchTab('buy'));
  sellTab.addEventListener('click', () => switchTab('sell'));
};

// Switch between buy and sell tabs
const switchTab = (tab) => {
  currentTab = tab;
  
  const buyTab = document.getElementById('buy-tab');
  const sellTab = document.getElementById('sell-tab');
  const buyPanel = document.getElementById('buy-panel');
  const sellPanel = document.getElementById('sell-panel');
  
  if (tab === 'buy') {
    buyTab.classList.add('bg-green-500', 'text-white');
    buyTab.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-white/10');
    sellTab.classList.remove('bg-red-500', 'text-white');
    sellTab.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-white/10');
    buyPanel.classList.remove('hidden');
    sellPanel.classList.add('hidden');
  } else {
    sellTab.classList.add('bg-red-500', 'text-white');
    sellTab.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-white/10');
    buyTab.classList.remove('bg-green-500', 'text-white');
    buyTab.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-white/10');
    sellPanel.classList.remove('hidden');
    buyPanel.classList.add('hidden');
  }
  
  updateTradeCalculations();
};

// Setup trade inputs and buttons
const setupTradeInputs = () => {
  // Amount inputs - safe binding
  const buyAmountInput = document.getElementById('buy-amount');
  const sellAmountInput = document.getElementById('sell-amount');
  
  if (buyAmountInput) {
    buyAmountInput.addEventListener('input', updateTradeCalculations);
  }
  if (sellAmountInput) {
    sellAmountInput.addEventListener('input', updateTradeCalculations);
  }
  
  // Buy preset buttons - now using class selector
  const buyPresets = document.querySelectorAll('.buy-preset');
  buyPresets.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = parseInt(btn.dataset.value);
      if (buyAmountInput) buyAmountInput.value = value;
      updateTradeCalculations();
    });
  });
  
  // Sell preset buttons - now using class selector
  const sellPresets = document.querySelectorAll('.sell-preset');
  sellPresets.forEach(btn => {
    btn.addEventListener('click', () => {
      const percent = parseFloat(btn.dataset.percent) / 100;
      const amount = Math.floor(userHoldings * percent);
      if (sellAmountInput) sellAmountInput.value = amount;
      updateTradeCalculations();
    });
  });
  
  // Max buttons - safe binding
  const buyMaxBtn = document.getElementById('buy-max-btn');
  const sellMaxBtn = document.getElementById('sell-max-btn');
  
  if (buyMaxBtn) {
    buyMaxBtn.addEventListener('click', setBuyMax);
  }
  if (sellMaxBtn) {
    sellMaxBtn.addEventListener('click', setSellMax);
  }
  
  // Trade buttons - safe binding
  const buyButton = document.getElementById('buy-button');
  const sellButton = document.getElementById('sell-button');
  
  if (buyButton) {
    buyButton.addEventListener('click', executeBuy);
  }
  if (sellButton) {
    sellButton.addEventListener('click', executeSell);
  }
  
  console.log('✅ Trade inputs setup complete');
};

// Set amount
const setAmount = (amount) => {
  document.getElementById('buy-amount').value = amount;
  updateTradeCalculations();
};

// Set sell percentage
const setSellPercentage = (percentage) => {
  const amount = Math.floor(userHoldings * percentage);
  document.getElementById('sell-amount').value = amount;
  updateTradeCalculations();
};

// Set buy max
const setBuyMax = () => {
  if (!coinData || !userData) return;
  
  const price = coinData.current_price;
  const fee = 0.01; // 1%
  const maxAmount = Math.floor(userData.virtual_balance / (price * (1 + fee)));
  const availableSupply = coinData.total_supply - coinData.circulating_supply;
  const finalAmount = Math.min(maxAmount, availableSupply);
  
  document.getElementById('buy-amount').value = finalAmount;
  updateTradeCalculations();
};

// Set sell max
const setSellMax = () => {
  document.getElementById('sell-amount').value = userHoldings;
  updateTradeCalculations();
};

// Update trade calculations
const updateTradeCalculations = () => {
  if (!coinData || !userData) return;
  
  const price = coinData.current_price;
  const fee = 0.01; // 1% fee
  
  if (currentTab === 'buy') {
    const amount = parseFloat(document.getElementById('buy-amount').value) || 0;
    const subtotal = amount * price;
    const feeAmount = subtotal * fee;
    const total = subtotal + feeAmount;
    
    // Update display
    document.getElementById('buy-price-per-coin').textContent = `$${price.toFixed(8)}`;
    document.getElementById('buy-subtotal').textContent = `$${subtotal.toFixed(4)}`;
    document.getElementById('buy-fee').textContent = `$${feeAmount.toFixed(4)}`;
    document.getElementById('buy-total').textContent = `$${total.toFixed(4)}`;
    
    // Validation
    const buyButton = document.getElementById('buy-button');
    const warningEl = document.getElementById('buy-warning');
    
    if (amount <= 0) {
      buyButton.disabled = true;
      buyButton.classList.add('opacity-50', 'cursor-not-allowed');
      warningEl.textContent = '請輸入購買數量';
      warningEl.classList.remove('hidden');
    } else if (total > userData.virtual_balance) {
      buyButton.disabled = true;
      buyButton.classList.add('opacity-50', 'cursor-not-allowed');
      warningEl.textContent = `餘額不足！需要 ${total.toFixed(2)} 金幣，您只有 ${userData.virtual_balance.toFixed(2)} 金幣`;
      warningEl.classList.remove('hidden');
    } else if (amount > (coinData.total_supply - coinData.circulating_supply)) {
      buyButton.disabled = true;
      buyButton.classList.add('opacity-50', 'cursor-not-allowed');
      warningEl.textContent = '可用供應量不足';
      warningEl.classList.remove('hidden');
    } else {
      buyButton.disabled = false;
      buyButton.classList.remove('opacity-50', 'cursor-not-allowed');
      warningEl.classList.add('hidden');
    }
  } else {
    const amount = parseFloat(document.getElementById('sell-amount').value) || 0;
    const subtotal = amount * price;
    const feeAmount = subtotal * fee;
    const total = subtotal - feeAmount;
    
    // Update display
    document.getElementById('sell-price-per-coin').textContent = `$${price.toFixed(8)}`;
    document.getElementById('sell-subtotal').textContent = `$${subtotal.toFixed(4)}`;
    document.getElementById('sell-fee').textContent = `$${feeAmount.toFixed(4)}`;
    document.getElementById('sell-total').textContent = `$${total.toFixed(4)}`;
    
    // Validation
    const sellButton = document.getElementById('sell-button');
    const warningEl = document.getElementById('sell-warning');
    
    if (amount <= 0) {
      sellButton.disabled = true;
      sellButton.classList.add('opacity-50', 'cursor-not-allowed');
      warningEl.textContent = '請輸入出售數量';
      warningEl.classList.remove('hidden');
    } else if (amount > userHoldings) {
      sellButton.disabled = true;
      sellButton.classList.add('opacity-50', 'cursor-not-allowed');
      warningEl.textContent = `持有量不足！您只有 ${userHoldings} ${coinData.symbol}`;
      warningEl.classList.remove('hidden');
    } else {
      sellButton.disabled = false;
      sellButton.classList.remove('opacity-50', 'cursor-not-allowed');
      warningEl.classList.add('hidden');
    }
  }
};

// Execute buy
const executeBuy = async () => {
  const amount = parseFloat(document.getElementById('buy-amount').value) || 0;
  
  if (amount <= 0) {
    showNotification('請輸入有效數量', 'error');
    return;
  }
  
  const button = document.getElementById('buy-button');
  const originalHTML = button.innerHTML;
  
  button.disabled = true;
  button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>處理中...';
  
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await axios.post('/api/trades/buy', {
      coinId: parseInt(COIN_ID),
      amount: amount
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.data.success) {
      showNotification(`✅ 成功買入 ${amount} ${coinData.symbol}！`, 'success');
      
      // Update user balance
      userData.virtual_balance = response.data.data.newBalance;
      updateUserBalance(userData.virtual_balance, userData.mlt_balance);
      
      // Update coin data (price, market cap, etc.)
      const coinResponse = await axios.get(`/api/coins/${COIN_ID}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (coinResponse.data.success) {
        coinData = coinResponse.data.data;
        renderCoinData();
      }
      
      // Refresh chart with updated data
      if (window.refreshChartAfterTrade) {
        await window.refreshChartAfterTrade(coinData);
      }
      
      // Reload holdings and transactions
      await loadUserHoldings();
      loadRecentTransactions();
      
      // Reset form
      document.getElementById('buy-amount').value = 100;
      updateTradeCalculations();
    }
  } catch (error) {
    console.error('Buy failed:', error);
    const errorMsg = error.response?.data?.message || error.response?.data?.error || '買入失敗，請稍後再試';
    showNotification(errorMsg, 'error');
  } finally {
    button.disabled = false;
    button.innerHTML = originalHTML;
  }
};

// Execute sell
const executeSell = async () => {
  const amount = parseFloat(document.getElementById('sell-amount').value) || 0;
  
  if (amount <= 0) {
    showNotification('請輸入有效數量', 'error');
    return;
  }
  
  if (amount > userHoldings) {
    showNotification('持有量不足', 'error');
    return;
  }
  
  const button = document.getElementById('sell-button');
  const originalHTML = button.innerHTML;
  
  button.disabled = true;
  button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>處理中...';
  
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await axios.post('/api/trades/sell', {
      coinId: parseInt(COIN_ID),
      amount: amount
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.data.success) {
      showNotification(`✅ 成功賣出 ${amount} ${coinData.symbol}！`, 'success');
      
      // Update user balance
      userData.virtual_balance = response.data.data.newBalance;
      updateUserBalance(userData.virtual_balance, userData.mlt_balance);
      
      // Update coin data (price, market cap, etc.)
      const coinResponse = await axios.get(`/api/coins/${COIN_ID}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (coinResponse.data.success) {
        coinData = coinResponse.data.data;
        renderCoinData();
      }
      
      // Refresh chart with updated data
      if (window.refreshChartAfterTrade) {
        await window.refreshChartAfterTrade(coinData);
      }
      
      // Reload holdings and transactions
      await loadUserHoldings();
      loadRecentTransactions();
      
      // Reset form
      document.getElementById('sell-amount').value = 10;
      updateTradeCalculations();
    }
  } catch (error) {
    console.error('Sell failed:', error);
    const errorMsg = error.response?.data?.message || error.response?.data?.error || '賣出失敗，請稍後再試';
    showNotification(errorMsg, 'error');
  } finally {
    button.disabled = false;
    button.innerHTML = originalHTML;
  }
};

// Show notification
const showNotification = (message, type = 'info') => {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };
  
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl ${colors[type]} text-white font-medium animate-slide-in`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
};

// Share functions
const setupShareButtons = () => {
  document.getElementById('share-twitter')?.addEventListener('click', () => {
    const text = encodeURIComponent(`🚀 查看 ${coinData.name} ($${coinData.symbol}) 在 MemeLaunch Tycoon！`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  });
  
  document.getElementById('copy-link')?.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href);
    showNotification('✅ 連結已複製！', 'success');
  });
};

// Logout
const handleLogout = () => {
  localStorage.removeItem('auth_token');
  window.location.href = '/login';
};

// Initialize
const init = async () => {
  console.log('Initializing coin detail page...');
  
  userData = await checkAuth();
  
  if (userData) {
    console.log('User authenticated:', userData.username);
    updateUserBalance(userData.virtual_balance, userData.mlt_balance);
    
    await loadCoinData();
    
    setupTradingTabs();
    setupTradeInputs();
    setupBuySlider();
    setupSellSlider();
    setupBuyPresets();
    setupSellPresets();
    setupShareButtons();
    setupTimeframeButtons();
    
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    
    // Initialize social UI if available
    if (window.SocialUI) {
      window.socialUI = new window.SocialUI(COIN_ID);
      console.log('✅ Social UI initialized');
    }
    
    // Initialize real-time updates if available
    if (window.realtimeUpdates) {
      window.realtimeUpdates.subscribeToPrices((data) => {
        if (data.coins && coinData) {
          const updatedCoin = data.coins.find(c => c.id === parseInt(COIN_ID));
          if (updatedCoin) {
            // Store old price for comparison
            const oldPrice = coinData.current_price;
            
            // Update coinData
            coinData.current_price = updatedCoin.current_price;
            coinData.market_cap = updatedCoin.market_cap;
            coinData.hype_score = updatedCoin.hype_score;
            
            // Update display
            const priceEl = document.getElementById('coin-price');
            if (priceEl) {
              priceEl.textContent = `$${updatedCoin.current_price.toFixed(8)}`;
            }
            
            const marketCapEl = document.getElementById('stat-market-cap');
            if (marketCapEl) {
              marketCapEl.textContent = `$${updatedCoin.market_cap.toFixed(4)}`;
            }
            
            const hypeScoreEl = document.getElementById('hype-score');
            if (hypeScoreEl) {
              hypeScoreEl.textContent = Math.floor(updatedCoin.hype_score || 0);
            }
            
            const hypeBarEl = document.getElementById('hype-bar');
            if (hypeBarEl) {
              const percentage = Math.min((updatedCoin.hype_score / 200) * 100, 100);
              hypeBarEl.style.width = `${percentage}%`;
            }
            
            // Update price change indicator
            const priceChangeEl = document.getElementById('price-change');
            if (priceChangeEl && oldPrice) {
              const change = ((updatedCoin.current_price - oldPrice) / oldPrice) * 100;
              const isPositive = change >= 0;
              
              priceChangeEl.innerHTML = `
                <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>
                ${isPositive ? '+' : ''}${change.toFixed(2)}%
              `;
              priceChangeEl.className = `text-lg mt-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`;
            }
            
            // Update chart with new data point (safely)
            // IMPORTANT: Don't update chart on every price update - only update display
            // The chart will be refreshed on timeframe change or manual reload
            // Real-time chart updates can cause issues with duplicate timestamps
            
            // Just update the display, not the chart
            // Chart will update on next manual refresh or timeframe change
            
            // Update calculations
            updateTradeCalculations();
          }
        }
      });
      
      console.log('✅ Real-time updates initialized');
    }
    
    // Initialize comments system
    if (typeof window.CommentsSystem !== 'undefined') {
      const commentsContainer = document.getElementById('comments-section');
      if (commentsContainer && coinData) {
        const commentsSystem = new window.CommentsSystem({
          coinId: coinData.id,
          containerId: 'comments-section'
        });
        
        console.log('✅ Comments system initialized');
      }
    } else {
      console.warn('⚠️ CommentsSystem not loaded');
    }
    
    // Start auto-refresh for live price updates (every 5 seconds)
    startPriceAutoRefresh();
    
    console.log('✅ Coin detail page fully initialized');
  }
};

// Add animation styles
if (!document.getElementById('animation-styles')) {
  const style = document.createElement('style');
  style.id = 'animation-styles';
  style.textContent = `
    @keyframes slide-in {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `;
  document.head.appendChild(style);
}

// Export functions to window for trading-panel.js
window.loadCoinData = loadCoinData;
window.loadRecentTransactions = loadRecentTransactions;
window.initPriceChart = initPriceChart;

// Auto-refresh price data every 5 seconds (like Pump.fun)
let priceRefreshInterval = null;

const startPriceAutoRefresh = () => {
  // Clear any existing interval
  if (priceRefreshInterval) {
    clearInterval(priceRefreshInterval);
  }
  
  // Refresh price and chart data every 5 seconds
  priceRefreshInterval = setInterval(async () => {
    try {
      // Only reload coin data, DO NOT re-initialize chart
      // Chart auto-updates through refreshChartAfterTrade when data changes
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      const response = await axios.get(`/api/coins/${COIN_ID}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const newData = response.data.data;
        // Only update if price actually changed
        if (coinData && newData.current_price !== coinData.current_price) {
          coinData = newData;
          renderCoinData(); // Update UI only
          console.log('🔄 Price updated:', newData.current_price);
        }
      }
    } catch (error) {
      console.error('❌ Auto-refresh failed:', error);
    }
  }, 5000); // 5 seconds
  
  console.log('✅ Started auto-refresh (5s interval)');
};

const stopPriceAutoRefresh = () => {
  if (priceRefreshInterval) {
    clearInterval(priceRefreshInterval);
    priceRefreshInterval = null;
    console.log('⏹ Stopped auto-refresh');
  }
};

// Start auto-refresh when page loads
window.startPriceAutoRefresh = startPriceAutoRefresh;
window.stopPriceAutoRefresh = stopPriceAutoRefresh;

document.addEventListener('DOMContentLoaded', init);
// Slider handlers for Pump.fun-style trading

// Setup buy amount slider
const setupBuySlider = () => {
  const slider = document.getElementById('buy-amount-slider');
  const input = document.getElementById('buy-amount');
  const display = document.getElementById('buy-amount-display');
  
  if (!slider || !input || !display) return;
  
  // Sync slider with input
  slider.addEventListener('input', (e) => {
    const value = e.target.value;
    input.value = value;
    display.textContent = value;
    updateTradeCalculations();
  });
  
  // Sync input with slider
  input.addEventListener('input', (e) => {
    let value = parseInt(e.target.value) || 1;
    const max = parseInt(slider.max);
    if (value > max) value = max;
    if (value < 1) value = 1;
    
    slider.value = value;
    display.textContent = value;
    updateTradeCalculations();
  });
};

// Setup sell amount slider
const setupSellSlider = () => {
  const slider = document.getElementById('sell-amount-slider');
  const input = document.getElementById('sell-amount');
  const display = document.getElementById('sell-amount-display');
  const percentDisplay = document.getElementById('sell-percentage-display');
  
  if (!slider || !input || !display) return;
  
  // Update max when holdings change
  const updateSliderMax = () => {
    const maxAmount = userHoldings || 100;
    slider.max = maxAmount;
    input.max = maxAmount;
  };
  
  // Sync slider with input
  slider.addEventListener('input', (e) => {
    const value = e.target.value;
    const maxAmount = userHoldings || 100;
    const percent = maxAmount > 0 ? ((value / maxAmount) * 100).toFixed(0) : 0;
    
    input.value = value;
    display.textContent = value;
    percentDisplay.textContent = `${percent}%`;
    updateTradeCalculations();
  });
  
  // Sync input with slider
  input.addEventListener('input', (e) => {
    let value = parseInt(e.target.value) || 1;
    const maxAmount = userHoldings || 100;
    if (value > maxAmount) value = maxAmount;
    if (value < 1) value = 1;
    
    const percent = maxAmount > 0 ? ((value / maxAmount) * 100).toFixed(0) : 0;
    
    slider.value = value;
    display.textContent = value;
    percentDisplay.textContent = `${percent}%`;
    updateTradeCalculations();
  });
  
  // Initial update
  updateSliderMax();
};

// Setup quick preset buttons (buy)
const setupBuyPresets = () => {
  const presets = document.querySelectorAll('.buy-preset');
  const slider = document.getElementById('buy-amount-slider');
  const input = document.getElementById('buy-amount');
  const display = document.getElementById('buy-amount-display');
  
  presets.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.dataset.value;
      if (slider && input && display) {
        slider.value = value;
        input.value = value;
        display.textContent = value;
        updateTradeCalculations();
      }
    });
  });
};

// Setup quick preset buttons (sell)
const setupSellPresets = () => {
  const presets = document.querySelectorAll('.sell-preset');
  const slider = document.getElementById('sell-amount-slider');
  const input = document.getElementById('sell-amount');
  const display = document.getElementById('sell-amount-display');
  const percentDisplay = document.getElementById('sell-percentage-display');
  
  presets.forEach(btn => {
    btn.addEventListener('click', () => {
      const percent = parseInt(btn.dataset.percent);
      const maxAmount = userHoldings || 100;
      const value = Math.floor(maxAmount * percent / 100);
      
      if (slider && input && display) {
        slider.value = value;
        input.value = value;
        display.textContent = value;
        percentDisplay.textContent = `${percent}%`;
        updateTradeCalculations();
      }
    });
  });
};

console.log('✅ Slider handlers loaded');
