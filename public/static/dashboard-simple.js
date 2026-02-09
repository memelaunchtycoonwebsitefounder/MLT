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

function updateUserUI(user) {
  console.log('Dashboard: Updating UI for user:', user.username);
  
  // Update balance
  const balanceEl = document.getElementById('user-balance');
  if (balanceEl) {
    balanceEl.textContent = user.virtual_balance.toLocaleString();
  }
  
  // Update username
  const usernameEl = document.getElementById('user-username');
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
      const stats = data.stats || {};
      
      // Update portfolio value - use stats object
      const portfolioValueEl = document.getElementById('portfolio-value');
      if (portfolioValueEl && stats.totalValue !== undefined) {
        portfolioValueEl.textContent = stats.totalValue.toLocaleString();
      }
      
      // Update total P/L
      const totalPlEl = document.getElementById('total-pl');
      if (totalPlEl) {
        const pl = stats.totalProfitLoss || 0;
        totalPlEl.textContent = `${pl >= 0 ? '+' : ''}${pl.toFixed(2)}`;
        totalPlEl.className = pl >= 0 ? 'text-green-400' : 'text-red-400';
      }
    }
  } catch (error) {
    console.error('Dashboard: Failed to load portfolio:', error);
    // Don't fail the whole page if portfolio fails
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

// Logout functionality
document.addEventListener('click', (e) => {
  if (e.target.id === 'logout-btn' || e.target.closest('#logout-btn')) {
    console.log('Dashboard: Logging out');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
});

console.log('Dashboard: Script ready');
