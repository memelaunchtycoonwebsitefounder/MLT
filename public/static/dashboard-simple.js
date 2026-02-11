/**
 * Dashboard JavaScript - Ultra-Simplified Version
 * No retries, no delays - just direct authentication
 */

console.log('Dashboard: Script loaded');

// Initialize immediately when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

async function init() {
  console.log('Dashboard: Initializing');
  
  // Check authentication
  const token = localStorage.getItem('auth_token');
  console.log('Dashboard: Token check:', token ? 'Found' : 'Not found');
  
  if (!token) {
    console.log('Dashboard: No token, redirecting to login');
    window.location.href = '/login?redirect=/dashboard';
    return;
  }
  
  // Verify token with API
  try {
    console.log('Dashboard: Verifying token with API');
    const response = await axios.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      console.log('Dashboard: Authentication successful');
      const user = response.data.data;
      
      // Update UI
      updateUserUI(user);
      loadDashboardData(user);
    } else {
      throw new Error('Invalid response');
    }
  } catch (error) {
    console.error('Dashboard: Authentication failed:', error);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login?redirect=/dashboard';
  }
}

// Profile navigation functionality
let currentUserId = null;

// Save userId when user data is loaded
function updateUserUI(user) {
  console.log('Dashboard: Updating UI for user:', user.username);
  currentUserId = user.id;  // Store user ID for profile navigation
  
  // Update balance in navbar
  const balanceEl = document.getElementById('balance-display');
  if (balanceEl) {
    balanceEl.textContent = user.virtual_balance.toFixed(2);
  }
  
  // Update total balance in stats
  const totalBalanceEl = document.getElementById('total-balance');
  if (totalBalanceEl) {
    totalBalanceEl.textContent = user.virtual_balance.toFixed(2);
  }
  
  // Update username
  const usernameEl = document.getElementById('username-display');
  if (usernameEl) {
    usernameEl.textContent = user.username;
  }
}

async function loadDashboardData(user) {
  console.log('Dashboard: Loading dashboard data');
  
  try {
    // Load portfolio stats
    const portfolioResponse = await axios.get('/api/portfolio', {
      headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
    });
    
    if (portfolioResponse.data.success) {
      const data = portfolioResponse.data.data;
      const holdings = data.holdings || [];
      const stats = data.stats || {};
      
      // Update portfolio value
      const portfolioValueEl = document.getElementById('portfolio-value');
      if (portfolioValueEl) {
        portfolioValueEl.textContent = (stats.totalValue || 0).toFixed(2);
      }
      
      // Update total P/L
      const totalPnlEl = document.getElementById('total-pnl');
      if (totalPnlEl) {
        const pnl = stats.totalProfitLoss || 0;
        const pnlPercent = stats.totalProfitLossPercent || 0;
        totalPnlEl.textContent = `${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} (${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%)`;
        totalPnlEl.className = `text-2xl font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`;
      }
      
      // Update holdings count
      const holdingsCountEl = document.getElementById('holdings-count');
      if (holdingsCountEl) {
        holdingsCountEl.textContent = holdings.length;
      }
      
      // Update user holdings section
      const userHoldingsEl = document.getElementById('user-holdings');
      if (userHoldingsEl) {
        if (holdings.length === 0) {
          userHoldingsEl.innerHTML = '<p class="text-gray-400 text-center py-4">暫無持倉</p>';
        } else {
          userHoldingsEl.innerHTML = holdings.slice(0, 5).map(holding => `
            <a href="/coin/${holding.coin_id}" class="block p-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <img src="${holding.coin_image_url || '/static/default-coin.svg'}" class="w-10 h-10 rounded-full" onerror="this.src='/static/default-coin.svg'">
                  <div>
                    <p class="font-semibold text-white">${holding.coin_name}</p>
                    <p class="text-sm text-gray-400">${holding.amount} ${holding.coin_symbol}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-white">${(holding.current_value || 0).toFixed(2)} 金幣</p>
                  <p class="text-sm ${(holding.profit_loss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}">
                    ${(holding.profit_loss || 0) >= 0 ? '+' : ''}${(holding.profit_loss || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </a>
          `).join('');
        }
      }
    }
  } catch (error) {
    console.error('Dashboard: Failed to load portfolio:', error);
    // Set default values if portfolio fails
    const portfolioValueEl = document.getElementById('portfolio-value');
    if (portfolioValueEl) portfolioValueEl.textContent = '0.00';
    
    const totalPnlEl = document.getElementById('total-pnl');
    if (totalPnlEl) {
      totalPnlEl.textContent = '+0.00 (0.00%)';
      totalPnlEl.className = 'text-2xl font-bold text-gray-400';
    }
    
    const holdingsCountEl = document.getElementById('holdings-count');
    if (holdingsCountEl) holdingsCountEl.textContent = '0';
  }
  
  // Load recent transactions
  loadRecentTransactions();
  
  // Load trending coins
  loadTrendingCoins();
}

async function loadRecentTransactions() {
  try {
    console.log('Dashboard: Loading recent transactions');
    const response = await axios.get('/api/trades/recent', {
      headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      params: { limit: 5 }
    });
    
    const container = document.getElementById('recent-transactions');
    if (!container) return;
    
    // API should return array directly in data field
    const transactions = response.data.data || [];
    
    if (!Array.isArray(transactions) || transactions.length === 0) {
      container.innerHTML = '<p class="text-gray-400 text-center py-4">暫無交易記錄</p>';
      return;
    }
    
    container.innerHTML = transactions.map(tx => {
      const typeIcon = tx.type === 'buy' ? 'fa-arrow-down' : tx.type === 'sell' ? 'fa-arrow-up' : 'fa-plus-circle';
      const typeClass = tx.type === 'buy' ? 'text-red-400' : tx.type === 'sell' ? 'text-green-400' : 'text-blue-400';
      const typeText = tx.type === 'buy' ? '買入' : tx.type === 'sell' ? '賣出' : '創建';
      
      return `
        <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
          <div class="flex items-center space-x-3">
            <i class="fas ${typeIcon} ${typeClass}"></i>
            <div>
              <p class="font-semibold">${typeText} ${tx.coin_name || 'Unknown'}</p>
              <p class="text-sm text-gray-400">${new Date(tx.timestamp).toLocaleString('zh-TW')}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-semibold">${tx.amount || 0} ${tx.coin_symbol || ''}</p>
            <p class="text-sm ${typeClass}">${tx.type === 'buy' ? '-' : '+'}${(tx.total_cost || 0).toFixed(2)} 金幣</p>
          </div>
        </div>
      `;
    }).join('');
    
    console.log('Dashboard: Recent transactions loaded');
  } catch (error) {
    console.error('Dashboard: Failed to load transactions:', error);
    const container = document.getElementById('recent-transactions');
    if (container) {
      container.innerHTML = '<p class="text-gray-400 text-center py-4">暫無交易記錄</p>';
    }
  }
}

async function loadTrendingCoins() {
  try {
    console.log('Dashboard: Loading trending coins');
    const response = await axios.get('/api/coins/trending/list', {
      params: { limit: 5 }
    });
    
    const container = document.getElementById('trending-coins');
    if (!container) return;
    
    const coins = response.data.data || [];
    
    if (coins.length === 0) {
      container.innerHTML = '<p class="text-gray-400 text-center py-4">暫無熱門幣種</p>';
      return;
    }
    
    container.innerHTML = coins.map(coin => `
      <a href="/coin/${coin.id}" class="block p-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              ${coin.symbol.substring(0, 2)}
            </div>
            <div>
              <p class="font-semibold">${coin.name}</p>
              <p class="text-sm text-gray-400">${coin.symbol}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-semibold">${(coin.current_price || 0).toFixed(4)} 金幣</p>
            <p class="text-sm text-gray-400">市值: ${(coin.market_cap || 0).toLocaleString()}</p>
          </div>
        </div>
      </a>
    `).join('');
    
    console.log('Dashboard: Trending coins loaded');
  } catch (error) {
    console.error('Dashboard: Failed to load trending coins:', error);
  }
}

// Event delegation for button clicks
document.addEventListener('click', (e) => {
  // Logout
  if (e.target.id === 'logout-btn' || e.target.closest('#logout-btn')) {
    console.log('Dashboard: Logging out');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }
  
  // View Profile - header button
  if (e.target.id === 'view-profile-btn' || e.target.closest('#view-profile-btn')) {
    if (currentUserId) {
      console.log('Dashboard: Navigating to profile:', currentUserId);
      window.location.href = `/profile/${currentUserId}`;
    }
    return;
  }
  
  // View Profile - quick action button
  if (e.target.id === 'quick-profile-btn' || e.target.closest('#quick-profile-btn')) {
    if (currentUserId) {
      console.log('Dashboard: Navigating to profile:', currentUserId);
      window.location.href = `/profile/${currentUserId}`;
    }
    return;
  }
});

console.log('Dashboard: Script ready');
