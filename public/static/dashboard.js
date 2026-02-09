/**
 * Dashboard JavaScript
 * Handles authenticated dashboard functionality
 */

// Check auth when script loads or when DOM is ready
if (document.readyState === 'loading') {
  // DOM not ready yet, wait for it
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  // DOM is already ready
  initDashboard();
}

function initDashboard() {
  console.log('Dashboard: Initializing...');
  console.log('Dashboard: readyState:', document.readyState);
  checkAuth();
}

async function checkAuth(retryCount = 0) {
  const token = localStorage.getItem('auth_token');
  
  console.log(`Dashboard: Token check (attempt ${retryCount + 1}):`, token ? 'Found' : 'Not found');
  
  if (!token) {
    // Retry a few times in case token is being written
    if (retryCount < 3) {
      console.log('Dashboard: No token yet, retrying in 200ms...');
      setTimeout(() => checkAuth(retryCount + 1), 200);
      return;
    }
    
    console.log('Dashboard: No token after retries, redirecting to login...');
    // Redirect to login if not authenticated
    window.location.href = '/login?redirect=/dashboard';
    return;
  }

  try {
    console.log('Dashboard: Verifying token with API...');
    const response = await axios.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Dashboard: Token valid, user:', response.data.data.username);
    const user = response.data.data;
    updateUserUI(user);
    loadDashboardData(user);
  } catch (error) {
    console.error('Dashboard: Authentication failed:', error);
    console.error('Dashboard: Error details:', error.response?.data);
    localStorage.removeItem('auth_token');
    window.location.href = '/login?redirect=/dashboard';
  }
}

function updateUserUI(user) {
  // Update user info in navigation
  const usernameEl = document.getElementById('username-display');
  const balanceEl = document.getElementById('balance-display');
  const authBtn = document.getElementById('auth-btn');
  const logoutBtn = document.getElementById('logout-btn');

  if (usernameEl) usernameEl.textContent = user.username;
  if (balanceEl) balanceEl.textContent = user.virtual_balance.toFixed(2);
  
  if (authBtn) authBtn.classList.add('hidden');
  if (logoutBtn) logoutBtn.classList.remove('hidden');

  // Update dashboard stats
  document.getElementById('total-balance').textContent = user.virtual_balance.toFixed(2);
  document.getElementById('user-level').textContent = user.level;
  document.getElementById('user-xp').textContent = user.xp;
}

async function loadDashboardData(user) {
  try {
    // Load portfolio stats
    await loadPortfolioStats();
    
    // Load recent transactions
    await loadRecentTransactions();
    
    // Load trending coins
    await loadTrendingCoins();
    
    // Load user holdings
    await loadUserHoldings();
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
}

async function loadPortfolioStats() {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get('/api/portfolio', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const { stats, holdings } = response.data.data;
    
    // Update portfolio value
    document.getElementById('portfolio-value').textContent = stats.totalValue.toFixed(2);
    
    // Update profit/loss
    const pnlEl = document.getElementById('total-pnl');
    const pnlValue = stats.totalProfitLoss;
    const pnlPercent = stats.totalProfitLossPercent;
    
    pnlEl.textContent = `${pnlValue >= 0 ? '+' : ''}${pnlValue.toFixed(2)} (${pnlPercent.toFixed(2)}%)`;
    pnlEl.className = pnlValue >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold';
    
    // Update holdings count
    document.getElementById('holdings-count').textContent = holdings.length;
  } catch (error) {
    console.error('Failed to load portfolio stats:', error);
  }
}

async function loadRecentTransactions() {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get('/api/trades/history?limit=5', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const transactions = response.data.data;
    const container = document.getElementById('recent-transactions');
    
    if (transactions.length === 0) {
      container.innerHTML = '<p class="text-gray-400 text-center py-4">暫無交易記錄</p>';
      return;
    }
    
    container.innerHTML = transactions.map(tx => {
      const typeClass = tx.type === 'buy' ? 'text-green-400' : 'text-red-400';
      const typeIcon = tx.type === 'buy' ? 'fa-arrow-up' : 'fa-arrow-down';
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
            <p class="font-semibold">${tx.amount} ${tx.coin_symbol || ''}</p>
            <p class="text-sm ${typeClass}">${tx.type === 'buy' ? '-' : '+'}${tx.total_cost.toFixed(2)} 金幣</p>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Failed to load transactions:', error);
  }
}

async function loadTrendingCoins() {
  try {
    const response = await axios.get('/api/coins/trending/list?limit=5');
    const coins = response.data.data;
    const container = document.getElementById('trending-coins');
    
    if (coins.length === 0) {
      container.innerHTML = '<p class="text-gray-400 text-center py-4">暫無熱門幣種</p>';
      return;
    }
    
    container.innerHTML = coins.map(coin => `
      <a href="/coin/${coin.id}" class="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
        <div class="flex items-center space-x-3">
          <img src="${coin.image_url || '/static/default-coin.svg'}" alt="${coin.name}" class="w-10 h-10 rounded-full">
          <div>
            <p class="font-semibold">${coin.name}</p>
            <p class="text-sm text-gray-400">${coin.symbol}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="font-semibold">$${coin.current_price.toFixed(6)}</p>
          <p class="text-sm text-gray-400">市值: $${coin.market_cap.toFixed(2)}</p>
        </div>
      </a>
    `).join('');
  } catch (error) {
    console.error('Failed to load trending coins:', error);
  }
}

async function loadUserHoldings() {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get('/api/portfolio', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const { holdings } = response.data.data;
    const container = document.getElementById('user-holdings');
    
    if (holdings.length === 0) {
      container.innerHTML = '<p class="text-gray-400 text-center py-4">您還沒有持倉</p>';
      return;
    }
    
    container.innerHTML = holdings.map(holding => {
      const pnlClass = holding.profit_loss_percent >= 0 ? 'text-green-400' : 'text-red-400';
      
      return `
        <a href="/coin/${holding.coin_id}" class="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
          <div class="flex items-center space-x-3">
            <img src="${holding.coin_image_url || '/static/default-coin.svg'}" alt="${holding.coin_name}" class="w-10 h-10 rounded-full">
            <div>
              <p class="font-semibold">${holding.coin_name}</p>
              <p class="text-sm text-gray-400">${holding.amount} ${holding.coin_symbol}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-semibold">${holding.current_value.toFixed(2)} 金幣</p>
            <p class="text-sm ${pnlClass}">${holding.profit_loss_percent >= 0 ? '+' : ''}${holding.profit_loss_percent.toFixed(2)}%</p>
          </div>
        </a>
      `;
    }).join('');
  } catch (error) {
    console.error('Failed to load holdings:', error);
  }
}

// Logout functionality
document.getElementById('logout-btn')?.addEventListener('click', async () => {
  try {
    const token = localStorage.getItem('auth_token');
    await axios.post('/api/auth/logout', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    localStorage.removeItem('auth_token');
    window.location.href = '/';
  }
});
