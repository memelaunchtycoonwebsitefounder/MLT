/**
 * Coin Detail Page JavaScript
 * Handles coin display, trading, and chart visualization
 */

let coinData = null;
let userData = null;
let priceChart = null;
let userHoldings = 0;

// Check authentication
const checkAuth = async (retryCount = 0) => {
  const token = localStorage.getItem('auth_token');
  
  console.log(`CoinDetail: Token check (attempt ${retryCount + 1}):`, token ? 'Found' : 'Not found');
  
  if (!token) {
    // Retry a few times in case token is being written
    if (retryCount < 3) {
      console.log('CoinDetail: No token yet, retrying in 200ms...');
      await new Promise(resolve => setTimeout(resolve, 200));
      return checkAuth(retryCount + 1);
    }
    
    console.log('CoinDetail: No token after retries, redirecting to login...');
    const coinId = window.location.pathname.split('/').pop();
    window.location.href = `/login?redirect=/coin/${coinId}`;
    return null;
  }

  try {
    console.log('CoinDetail: Verifying token with API...');
    const response = await axios.get('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.success) {
      console.log('CoinDetail: Token valid, user:', response.data.data.username);
      return response.data.data;
    } else {
      console.log('CoinDetail: Invalid token response');
      localStorage.removeItem('auth_token');
      const coinId = window.location.pathname.split('/').pop();
      window.location.href = `/login?redirect=/coin/${coinId}`;
      return null;
    }
  } catch (error) {
    console.error('CoinDetail: Auth check failed:', error);
    console.error('CoinDetail: Error details:', error.response?.data);
    localStorage.removeItem('auth_token');
    const coinId = window.location.pathname.split('/').pop();
    window.location.href = `/login?redirect=/coin/${coinId}`;
    return null;
  }
};

// Update user balance
const updateUserBalance = (balance) => {
  const balanceEl = document.getElementById('user-balance');
  if (balanceEl) {
    balanceEl.textContent = Number(balance || 0).toLocaleString();
  }
};

// Load coin data
const loadCoinData = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await axios.get(`/api/coins/${COIN_ID}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      coinData = response.data.data;
      renderCoinData();
      loadUserHoldings();
      loadRecentTransactions();
      initPriceChart();
    }
  } catch (error) {
    console.error('Failed to load coin:', error);
    alert('載入幣種資料失敗');
    window.location.href = '/market';
  }
};

// Render coin data
const renderCoinData = () => {
  document.getElementById('loading-state').classList.add('hidden');
  document.getElementById('coin-content').classList.remove('hidden');
  
  // Header
  document.getElementById('coin-image').src = coinData.image_url || '/static/default-coin.svg';
  document.getElementById('coin-name').textContent = coinData.name;
  document.getElementById('coin-symbol').textContent = `$${coinData.symbol}`;
  document.getElementById('coin-creator').textContent = coinData.creator_username || 'Unknown';
  document.getElementById('coin-price').textContent = Number(coinData.current_price || 0).toFixed(4);
  
  // Price change (simulated)
  const priceChange = Math.random() * 20 - 10;
  const priceChangeEl = document.getElementById('coin-price-change');
  const priceChangeClass = priceChange >= 0 ? 'text-green-400' : 'text-red-400';
  const priceChangeIcon = priceChange >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
  priceChangeEl.innerHTML = `<i class="fas ${priceChangeIcon} mr-1"></i>${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%`;
  priceChangeEl.className = priceChangeClass + ' text-lg mt-2';
  
  // Stats
  document.getElementById('stat-market-cap').textContent = Number(coinData.market_cap || 0).toLocaleString();
  document.getElementById('stat-supply').textContent = Number(coinData.total_supply || 0).toLocaleString();
  document.getElementById('stat-holders').textContent = Number(coinData.holders_count || 0).toLocaleString();
  document.getElementById('stat-transactions').textContent = Number(coinData.transaction_count || 0).toLocaleString();
  
  // Description
  document.getElementById('coin-description').textContent = coinData.description || '沒有描述';
  
  // Hype score
  const hypeScore = coinData.hype_score || 0;
  document.getElementById('hype-score').textContent = hypeScore;
  document.getElementById('hype-bar').style.width = `${Math.min(hypeScore / 200 * 100, 100)}%`;
  
  // Update trade prices
  updateTradePrices();
};

// Load user holdings
const loadUserHoldings = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await axios.get('/api/portfolio', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      const holdings = response.data.data.holdings || [];
      const holding = holdings.find(h => h.coin_id == COIN_ID);
      userHoldings = holding ? holding.amount : 0;
      document.getElementById('user-holdings').textContent = userHoldings.toLocaleString();
    }
  } catch (error) {
    console.error('Failed to load holdings:', error);
  }
};

// Load recent transactions
const loadRecentTransactions = async () => {
  const container = document.getElementById('recent-transactions');
  
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await axios.get(`/api/trades/history?coin_id=${COIN_ID}&limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      // API returns {transactions: [], pagination: {}}
      const data = response.data.data || {};
      const transactions = data.transactions || [];
      
      if (transactions.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400 py-4">暫無交易記錄</p>';
        return;
      }
      
      container.innerHTML = transactions.map(tx => {
        const isBuy = tx.type === 'buy';
        const bgClass = isBuy ? 'bg-green-500/20' : 'bg-red-500/20';
        const textClass = isBuy ? 'text-green-400' : 'text-red-400';
        const icon = isBuy ? 'fa-arrow-up' : 'fa-arrow-down';
        
        return `
          <div class="flex items-center justify-between p-3 ${bgClass} rounded-lg">
            <div class="flex items-center space-x-3">
              <div class="${textClass}">
                <i class="fas ${icon}"></i>
              </div>
              <div>
                <p class="font-bold">${isBuy ? '買入' : '賣出'}</p>
                <p class="text-sm text-gray-400">${formatDate(tx.timestamp)}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-bold">${Number(tx.amount || 0).toLocaleString()}</p>
              <p class="text-sm text-gray-400">@ ${Number(tx.price || 0).toFixed(4)}</p>
            </div>
          </div>
        `;
      }).join('');
    }
  } catch (error) {
    console.error('Failed to load transactions:', error);
    container.innerHTML = '<p class="text-center text-gray-400 py-4">載入失敗</p>';
  }
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes}分鐘前`;
  if (hours < 24) return `${hours}小時前`;
  if (days < 7) return `${days}天前`;
  
  return date.toLocaleDateString('zh-TW');
};

// Initialize price chart
const initPriceChart = () => {
  const ctx = document.getElementById('price-chart');
  
  // Generate sample price data
  const priceData = generatePriceData('24h');
  
  priceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: priceData.labels,
      datasets: [{
        label: '價格',
        data: priceData.prices,
        borderColor: 'rgb(255, 107, 53)',
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(255, 107, 53, 0.5)',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.6)'
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.6)',
            callback: function(value) {
              return value.toFixed(4);
            }
          }
        }
      }
    }
  });
  
  // Setup timeframe buttons
  document.querySelectorAll('.timeframe-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.timeframe-btn').forEach(b => {
        b.classList.remove('active', 'bg-orange-500');
        b.classList.add('hover:bg-white/10');
      });
      btn.classList.add('active', 'bg-orange-500');
      btn.classList.remove('hover:bg-white/10');
      
      const timeframe = btn.dataset.timeframe;
      updateChart(timeframe);
    });
  });
};

// Generate price data (simulated)
const generatePriceData = (timeframe) => {
  const basePrice = coinData.current_price || 0.01;
  let dataPoints = 24;
  let labelFormat = 'time';
  
  if (timeframe === '1h') {
    dataPoints = 12;
  } else if (timeframe === '7d') {
    dataPoints = 7;
    labelFormat = 'date';
  } else if (timeframe === '30d') {
    dataPoints = 30;
    labelFormat = 'date';
  }
  
  const labels = [];
  const prices = [];
  
  for (let i = dataPoints; i >= 0; i--) {
    let label;
    if (labelFormat === 'time') {
      const date = new Date(Date.now() - i * 60 * 60 * 1000);
      label = date.getHours() + ':00';
    } else {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      label = `${date.getMonth() + 1}/${date.getDate()}`;
    }
    labels.push(label);
    
    // Generate random walk price
    const change = (Math.random() - 0.5) * basePrice * 0.1;
    const price = i === 0 ? basePrice : (prices[prices.length - 1] || basePrice) + change;
    prices.push(Math.max(price, basePrice * 0.5));
  }
  
  return { labels, prices };
};

// Update chart
const updateChart = (timeframe) => {
  const priceData = generatePriceData(timeframe);
  priceChart.data.labels = priceData.labels;
  priceChart.data.datasets[0].data = priceData.prices;
  priceChart.update();
};

// Setup trading tabs
const setupTradingTabs = () => {
  const buyTab = document.getElementById('buy-tab');
  const sellTab = document.getElementById('sell-tab');
  const buyPanel = document.getElementById('buy-panel');
  const sellPanel = document.getElementById('sell-panel');
  
  buyTab.addEventListener('click', () => {
    buyTab.classList.add('bg-green-500');
    buyTab.classList.remove('hover:bg-white/10');
    sellTab.classList.remove('bg-red-500');
    sellTab.classList.add('hover:bg-white/10');
    buyPanel.classList.remove('hidden');
    sellPanel.classList.add('hidden');
  });
  
  sellTab.addEventListener('click', () => {
    sellTab.classList.add('bg-red-500');
    sellTab.classList.remove('hover:bg-white/10');
    buyTab.classList.remove('bg-green-500');
    buyTab.classList.add('hover:bg-white/10');
    sellPanel.classList.remove('hidden');
    buyPanel.classList.add('hidden');
  });
};

// Update trade prices
const updateTradePrices = () => {
  const price = coinData.current_price || 0;
  
  // Buy panel
  const buyAmount = parseFloat(document.getElementById('buy-amount').value) || 0;
  document.getElementById('buy-unit-price').textContent = price.toFixed(4);
  document.getElementById('buy-total-cost').textContent = (buyAmount * price).toFixed(2);
  
  // Sell panel
  const sellAmount = parseFloat(document.getElementById('sell-amount').value) || 0;
  document.getElementById('sell-unit-price').textContent = price.toFixed(4);
  document.getElementById('sell-total-revenue').textContent = (sellAmount * price).toFixed(2);
};

// Setup trade inputs
const setupTradeInputs = () => {
  const buyAmountInput = document.getElementById('buy-amount');
  const sellAmountInput = document.getElementById('sell-amount');
  
  buyAmountInput.addEventListener('input', updateTradePrices);
  sellAmountInput.addEventListener('input', updateTradePrices);
};

// Buy coin
const buyCoin = async () => {
  const buyBtn = document.getElementById('buy-btn');
  const buyBtnText = document.getElementById('buy-btn-text');
  const tradeMessage = document.getElementById('trade-message');
  const amount = parseFloat(document.getElementById('buy-amount').value) || 0;
  
  if (amount <= 0) {
    showTradeMessage('請輸入有效數量', 'error');
    return;
  }
  
  const totalCost = amount * coinData.current_price;
  if (totalCost > userData.virtual_balance) {
    showTradeMessage('餘額不足', 'error');
    return;
  }
  
  buyBtn.disabled = true;
  buyBtnText.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>處理中...';
  
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await axios.post('/api/trades/buy', {
      coinId: COIN_ID,
      amount: amount
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      showTradeMessage('✅ 買入成功！', 'success');
      
      // Refresh data
      userData = await checkAuth();
      updateUserBalance(userData.virtual_balance);
      await loadCoinData();
      await loadUserHoldings();
      
      // Track event
      if (typeof gtag !== 'undefined') {
        gtag('event', 'buy_coin', {
          coin_id: COIN_ID,
          amount: amount
        });
      }
    }
  } catch (error) {
    console.error('Buy failed:', error);
    const message = error.response?.data?.error || '買入失敗';
    showTradeMessage(message, 'error');
  } finally {
    buyBtn.disabled = false;
    buyBtnText.innerHTML = '<i class="fas fa-arrow-up mr-2"></i>買入';
  }
};

// Sell coin
const sellCoin = async () => {
  const sellBtn = document.getElementById('sell-btn');
  const sellBtnText = document.getElementById('sell-btn-text');
  const amount = parseFloat(document.getElementById('sell-amount').value) || 0;
  
  if (amount <= 0) {
    showTradeMessage('請輸入有效數量', 'error');
    return;
  }
  
  if (amount > userHoldings) {
    showTradeMessage('持倉不足', 'error');
    return;
  }
  
  sellBtn.disabled = true;
  sellBtnText.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>處理中...';
  
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await axios.post('/api/trades/sell', {
      coinId: COIN_ID,
      amount: amount
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      showTradeMessage('✅ 賣出成功！', 'success');
      
      // Refresh data
      userData = await checkAuth();
      updateUserBalance(userData.virtual_balance);
      await loadCoinData();
      await loadUserHoldings();
      
      // Track event
      if (typeof gtag !== 'undefined') {
        gtag('event', 'sell_coin', {
          coin_id: COIN_ID,
          amount: amount
        });
      }
    }
  } catch (error) {
    console.error('Sell failed:', error);
    const message = error.response?.data?.error || '賣出失敗';
    showTradeMessage(message, 'error');
  } finally {
    sellBtn.disabled = false;
    sellBtnText.innerHTML = '<i class="fas fa-arrow-down mr-2"></i>賣出';
  }
};

// Show trade message
const showTradeMessage = (message, type = 'error') => {
  const tradeMessage = document.getElementById('trade-message');
  tradeMessage.textContent = message;
  tradeMessage.classList.remove('hidden', 'bg-red-500/20', 'border-red-500', 'text-red-400', 'bg-green-500/20', 'border-green-500', 'text-green-400');
  
  if (type === 'error') {
    tradeMessage.classList.add('bg-red-500/20', 'border', 'border-red-500', 'text-red-400');
  } else {
    tradeMessage.classList.add('bg-green-500/20', 'border', 'border-green-500', 'text-green-400');
  }
  
  setTimeout(() => {
    tradeMessage.classList.add('hidden');
  }, 5000);
};

// Share functions
const setupShareButtons = () => {
  document.getElementById('share-twitter').addEventListener('click', () => {
    const text = encodeURIComponent(`🚀 查看 ${coinData.name} ($${coinData.symbol}) 在 MemeLaunch Tycoon！`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  });
  
  document.getElementById('copy-link').addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href);
    const btn = document.getElementById('copy-link');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check mr-2"></i>已複製！';
    setTimeout(() => {
      btn.innerHTML = originalHTML;
    }, 2000);
  });
};

// Logout
const handleLogout = () => {
  localStorage.removeItem('auth_token');
  window.location.href = '/login';
};

// Initialize
const init = async () => {
  userData = await checkAuth();
  
  if (userData) {
    updateUserBalance(userData.virtual_balance);
    await loadCoinData();
    setupTradingTabs();
    setupTradeInputs();
    setupShareButtons();
    
    // Setup trade buttons
    document.getElementById('buy-btn').addEventListener('click', buyCoin);
    document.getElementById('sell-btn').addEventListener('click', sellCoin);
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Initialize new UI modules
    if (window.TradingPanel && coinData) {
      window.tradingPanel = new window.TradingPanel(COIN_ID, coinData, userData);
      console.log('✅ Trading Panel initialized');
    }
    
    if (window.SocialUI) {
      window.socialUI = new window.SocialUI(COIN_ID);
      console.log('✅ Social UI initialized');
    }
    
    if (window.realtimeUpdates) {
      // Subscribe to real-time price updates
      window.realtimeUpdates.subscribeToPrices((data) => {
        if (data.coins) {
          const updatedCoin = data.coins.find(c => c.id === parseInt(COIN_ID));
          if (updatedCoin) {
            coinData.current_price = updatedCoin.current_price;
            coinData.market_cap = updatedCoin.market_cap;
            coinData.hype_score = updatedCoin.hype_score;
            
            // Update display
            document.getElementById('coin-price').textContent = `$${updatedCoin.current_price.toFixed(8)}`;
            document.getElementById('stat-market-cap').textContent = `$${updatedCoin.market_cap.toFixed(4)}`;
            document.getElementById('hype-score').textContent = Math.floor(updatedCoin.hype_score || 0);
            
            const percentage = Math.min((updatedCoin.hype_score / 200) * 100, 100);
            document.getElementById('hype-bar').style.width = `${percentage}%`;
            
            // Update trading panel
            if (window.tradingPanel) {
              window.tradingPanel.updateCoinData(coinData);
            }
          }
        }
      });
      
      console.log('✅ Real-time updates initialized');
    }
  }
};

document.addEventListener('DOMContentLoaded', init);
