/**
 * Dashboard JavaScript
 * Handles user dashboard functionality
 */

// Check authentication and load user data
const checkAuth = async () => {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    window.location.href = '/login';
    return null;
  }

  try {
    const response = await axios.get('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      return null;
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
    return null;
  }
};

// Update UI with user data
const updateUI = (userData) => {
  // Update balance
  const balanceEl = document.getElementById('user-balance');
  if (balanceEl) {
    balanceEl.textContent = Number(userData.virtual_balance || 0).toLocaleString();
  }

  // Update username
  const usernameEl = document.getElementById('user-username');
  if (usernameEl) {
    usernameEl.textContent = userData.username || 'User';
  }

  // Update email
  const emailEl = document.getElementById('user-email');
  if (emailEl) {
    emailEl.textContent = userData.email || '';
  }

  // Update level
  const levelEl = document.getElementById('user-level');
  if (levelEl) {
    levelEl.textContent = userData.level || 1;
  }

  // Update XP
  const xpEl = document.getElementById('user-xp');
  if (xpEl) {
    xpEl.textContent = userData.xp || 0;
  }

  // Update member since
  const memberSinceEl = document.getElementById('member-since');
  if (memberSinceEl && userData.created_at) {
    const date = new Date(userData.created_at);
    memberSinceEl.textContent = date.toLocaleDateString('zh-TW');
  }
};

// Load portfolio data
const loadPortfolio = async () => {
  const token = localStorage.getItem('auth_token');
  
  try {
    const response = await axios.get('/api/portfolio', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.success) {
      updatePortfolioUI(response.data.data);
    }
  } catch (error) {
    console.error('Failed to load portfolio:', error);
  }
};

// Update portfolio UI
const updatePortfolioUI = (portfolioData) => {
  // Update total value
  const totalValueEl = document.getElementById('portfolio-value');
  if (totalValueEl) {
    const totalValue = portfolioData.holdings?.reduce((sum, h) => sum + (h.current_value || 0), 0) || 0;
    totalValueEl.textContent = totalValue.toLocaleString();
  }

  // Update total profit/loss
  const totalProfitEl = document.getElementById('total-profit');
  if (totalProfitEl) {
    const totalProfit = portfolioData.holdings?.reduce((sum, h) => {
      const currentValue = h.current_value || 0;
      const invested = (h.amount || 0) * (h.avg_buy_price || 0);
      return sum + (currentValue - invested);
    }, 0) || 0;
    
    totalProfitEl.textContent = totalProfit.toLocaleString();
    totalProfitEl.className = totalProfit >= 0 ? 'text-green-400' : 'text-red-400';
  }

  // Update holdings count
  const holdingsCountEl = document.getElementById('holdings-count');
  if (holdingsCountEl) {
    holdingsCountEl.textContent = portfolioData.holdings?.length || 0;
  }

  // Render holdings list
  const holdingsListEl = document.getElementById('holdings-list');
  if (holdingsListEl) {
    if (!portfolioData.holdings || portfolioData.holdings.length === 0) {
      holdingsListEl.innerHTML = `
        <div class="text-center py-12 text-gray-400">
          <i class="fas fa-coins text-5xl mb-4"></i>
          <p class="text-lg">您還沒有任何持倉</p>
          <a href="/market" class="inline-block mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition">
            前往市場交易
          </a>
        </div>
      `;
    } else {
      holdingsListEl.innerHTML = portfolioData.holdings.map(holding => {
        const profit = (holding.current_value || 0) - ((holding.amount || 0) * (holding.avg_buy_price || 0));
        const profitPercent = holding.avg_buy_price ? ((profit / (holding.amount * holding.avg_buy_price)) * 100).toFixed(2) : 0;
        
        return `
          <div class="glass-effect p-4 rounded-lg hover:bg-white/10 transition">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <img src="${holding.coin_image || '/static/default-coin.svg'}" alt="${holding.coin_name}" class="w-12 h-12 rounded-full">
                <div>
                  <h3 class="font-bold">${holding.coin_name}</h3>
                  <p class="text-sm text-gray-400">${holding.coin_symbol}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-bold">${Number(holding.amount || 0).toLocaleString()} 枚</p>
                <p class="text-sm ${profit >= 0 ? 'text-green-400' : 'text-red-400'}">
                  ${profit >= 0 ? '+' : ''}${profit.toFixed(2)} (${profitPercent}%)
                </p>
              </div>
            </div>
            <div class="mt-3 flex justify-between text-sm text-gray-400">
              <span>平均買入: ${Number(holding.avg_buy_price || 0).toFixed(4)}</span>
              <span>當前價格: ${Number(holding.current_price || 0).toFixed(4)}</span>
              <span>價值: ${Number(holding.current_value || 0).toFixed(2)}</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }
};

// Load trending coins
const loadTrendingCoins = async () => {
  try {
    const response = await axios.get('/api/coins/trending');

    if (response.data.success) {
      updateTrendingCoinsUI(response.data.data);
    }
  } catch (error) {
    console.error('Failed to load trending coins:', error);
  }
};

// Update trending coins UI
const updateTrendingCoinsUI = (coins) => {
  const trendingListEl = document.getElementById('trending-coins');
  if (!trendingListEl) return;

  if (!coins || coins.length === 0) {
    trendingListEl.innerHTML = `
      <div class="text-center py-8 text-gray-400">
        <p>暫無熱門幣種</p>
      </div>
    `;
    return;
  }

  trendingListEl.innerHTML = coins.slice(0, 5).map((coin, index) => `
    <a href="/coin/${coin.id}" class="block glass-effect p-4 rounded-lg hover:bg-white/10 transition">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <span class="text-2xl font-bold text-gray-500">#${index + 1}</span>
          <img src="${coin.image_url || '/static/default-coin.svg'}" alt="${coin.name}" class="w-10 h-10 rounded-full">
          <div>
            <h4 class="font-bold">${coin.name}</h4>
            <p class="text-sm text-gray-400">${coin.symbol}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="font-bold">${Number(coin.current_price || 0).toFixed(4)}</p>
          <p class="text-sm text-gray-400">${Number(coin.market_cap || 0).toLocaleString()}</p>
        </div>
      </div>
    </a>
  `).join('');
};

// Load recent transactions
const loadRecentTransactions = async () => {
  const token = localStorage.getItem('auth_token');
  
  try {
    const response = await axios.get('/api/trades/history?limit=10', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.success) {
      updateTransactionsUI(response.data.data);
    }
  } catch (error) {
    console.error('Failed to load transactions:', error);
  }
};

// Update transactions UI
const updateTransactionsUI = (transactions) => {
  const transactionsListEl = document.getElementById('recent-transactions');
  if (!transactionsListEl) return;

  if (!transactions || transactions.length === 0) {
    transactionsListEl.innerHTML = `
      <div class="text-center py-8 text-gray-400">
        <p>暫無交易記錄</p>
      </div>
    `;
    return;
  }

  transactionsListEl.innerHTML = transactions.map(tx => {
    const isBuy = tx.type === 'buy';
    const date = new Date(tx.timestamp);
    
    return `
      <div class="glass-effect p-4 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="${isBuy ? 'bg-green-500' : 'bg-red-500'} w-10 h-10 rounded-full flex items-center justify-center">
              <i class="fas fa-${isBuy ? 'arrow-up' : 'arrow-down'}"></i>
            </div>
            <div>
              <h4 class="font-bold">${isBuy ? '買入' : '賣出'} ${tx.coin_name}</h4>
              <p class="text-sm text-gray-400">${date.toLocaleString('zh-TW')}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-bold">${Number(tx.amount || 0).toLocaleString()} 枚</p>
            <p class="text-sm text-gray-400">@ ${Number(tx.price || 0).toFixed(4)}</p>
          </div>
        </div>
      </div>
    `;
  }).join('');
};

// Handle logout
const handleLogout = () => {
  localStorage.removeItem('auth_token');
  
  // Track logout event
  if (typeof gtag !== 'undefined') {
    gtag('event', 'logout');
  }
  
  window.location.href = '/login';
};

// Initialize dashboard
const initDashboard = async () => {
  // Check auth and load user data
  const userData = await checkAuth();
  
  if (userData) {
    updateUI(userData);
    
    // Load additional data
    await Promise.all([
      loadPortfolio(),
      loadTrendingCoins(),
      loadRecentTransactions()
    ]);
  }

  // Setup event listeners
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Refresh data every 30 seconds
  setInterval(async () => {
    await Promise.all([
      loadPortfolio(),
      loadTrendingCoins(),
      loadRecentTransactions()
    ]);
  }, 30000);
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDashboard);
