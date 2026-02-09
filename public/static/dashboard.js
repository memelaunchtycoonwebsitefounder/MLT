/**
 * Dashboard JavaScript - Simplified Version
 * Handles authenticated dashboard functionality with robust token checking
 */

console.log('=== Dashboard.js Loading ===');
console.log('Script load time:', new Date().toISOString());
console.log('Document readyState:', document.readyState);

// Global state
let isCheckingAuth = false;
let checkAuthAttempts = 0;

// Initialize when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  // DOM already loaded, init immediately
  initDashboard();
}

function initDashboard() {
  console.log('Dashboard: Initializing...');
  console.log('Dashboard: Current URL:', window.location.href);
  console.log('Dashboard: readyState:', document.readyState);
  
  // Wait a tiny bit to ensure any redirecting login page has finished setting token
  setTimeout(() => {
    console.log('Dashboard: Starting auth check after brief delay');
    checkAuth();
  }, 100);
}

async function checkAuth() {
  // Prevent multiple simultaneous checks
  if (isCheckingAuth) {
    console.log('Dashboard: Auth check already in progress, skipping');
    return;
  }
  
  isCheckingAuth = true;
  checkAuthAttempts++;
  
  console.log(`Dashboard: ===== Auth Check Attempt ${checkAuthAttempts} =====`);
  
  try {
    // Check localStorage
    const token = localStorage.getItem('auth_token');
    console.log('Dashboard: localStorage check:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenStart: token ? token.substring(0, 20) + '...' : 'N/A'
    });
    
    if (!token) {
      if (checkAuthAttempts <= 5) {
        console.log(`Dashboard: No token found, retry ${checkAuthAttempts}/5 in 300ms...`);
        isCheckingAuth = false;
        setTimeout(() => checkAuth(), 300);
        return;
      }
      
      console.log('Dashboard: No token after 5 attempts, redirecting to login...');
      window.location.href = '/login?redirect=/dashboard&reason=no_token';
      return;
    }
    
    // Token found, verify with API
    console.log('Dashboard: Token found! Verifying with API...');
    
    const response = await axios.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('Dashboard: API response received:', {
      success: response.data.success,
      username: response.data.data?.username,
      userId: response.data.data?.id
    });
    
    if (response.data.success) {
      console.log('Dashboard: ✅ Authentication successful!');
      const user = response.data.data;
      updateUserUI(user);
      loadDashboardData(user);
    } else {
      console.log('Dashboard: ❌ API returned success=false');
      throw new Error('Invalid API response');
    }
    
  } catch (error) {
    console.error('Dashboard: ❌ Authentication failed:', error.message);
    
    if (error.response) {
      console.error('Dashboard: Error details:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    // Clear invalid token and redirect
    console.log('Dashboard: Clearing token and redirecting to login...');
    localStorage.removeItem('auth_token');
    window.location.href = '/login?redirect=/dashboard&reason=invalid_token';
  } finally {
    isCheckingAuth = false;
  }
}

function updateUserUI(user) {
  console.log('Dashboard: Updating UI for user:', user.username);
  
  try {
    // Update username
    const usernameEl = document.getElementById('username-display');
    if (usernameEl) {
      usernameEl.textContent = user.username;
      console.log('Dashboard: Username updated');
    }
    
    // Update balance
    const balanceEl = document.getElementById('balance-display');
    if (balanceEl) {
      balanceEl.textContent = user.virtual_balance.toFixed(2);
      console.log('Dashboard: Balance updated:', user.virtual_balance);
    }
    
    // Update dashboard stats
    const totalBalanceEl = document.getElementById('total-balance');
    if (totalBalanceEl) {
      totalBalanceEl.textContent = user.virtual_balance.toFixed(2);
    }
    
    const userLevelEl = document.getElementById('user-level');
    if (userLevelEl) {
      userLevelEl.textContent = user.level;
    }
    
    const userXpEl = document.getElementById('user-xp');
    if (userXpEl) {
      userXpEl.textContent = user.xp;
    }
    
    // Hide auth button, show logout button
    const authBtn = document.getElementById('auth-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (authBtn) authBtn.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
    
    console.log('Dashboard: UI update complete');
    
  } catch (error) {
    console.error('Dashboard: Error updating UI:', error);
  }
}

async function loadDashboardData(user) {
  console.log('Dashboard: Loading dashboard data...');
  
  try {
    await Promise.all([
      loadPortfolioStats(),
      loadRecentTransactions(),
      loadTrendingCoins(),
      loadUserHoldings()
    ]);
    console.log('Dashboard: ✅ All data loaded successfully');
  } catch (error) {
    console.error('Dashboard: Error loading data:', error);
  }
}

async function loadPortfolioStats() {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get('/api/portfolio', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const { stats, holdings } = response.data.data;
    
    const portfolioValueEl = document.getElementById('portfolio-value');
    if (portfolioValueEl) {
      portfolioValueEl.textContent = stats.totalValue.toFixed(2);
    }
    
    const pnlEl = document.getElementById('total-pnl');
    if (pnlEl) {
      const pnlValue = stats.totalProfitLoss;
      const pnlPercent = stats.totalProfitLossPercent;
      pnlEl.textContent = `${pnlValue >= 0 ? '+' : ''}${pnlValue.toFixed(2)} (${pnlPercent.toFixed(2)}%)`;
      pnlEl.className = pnlValue >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold';
    }
    
    const holdingsCountEl = document.getElementById('holdings-count');
    if (holdingsCountEl) {
      holdingsCountEl.textContent = holdings.length;
    }
    
    console.log('Dashboard: Portfolio stats loaded');
  } catch (error) {
    console.error('Dashboard: Failed to load portfolio stats:', error);
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
    
    if (!container) return;
    
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
    
    console.log('Dashboard: Recent transactions loaded');
  } catch (error) {
    console.error('Dashboard: Failed to load transactions:', error);
  }
}

async function loadTrendingCoins() {
  try {
    const response = await axios.get('/api/coins/trending/list?limit=5');
    const coins = response.data.data;
    const container = document.getElementById('trending-coins');
    
    if (!container) return;
    
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
    
    console.log('Dashboard: Trending coins loaded');
  } catch (error) {
    console.error('Dashboard: Failed to load trending coins:', error);
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
    
    if (!container) return;
    
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
    
    console.log('Dashboard: User holdings loaded');
  } catch (error) {
    console.error('Dashboard: Failed to load holdings:', error);
  }
}

// Logout functionality
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    console.log('Dashboard: Logout clicked');
    
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post('/api/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Dashboard: Logout API call successful');
    } catch (error) {
      console.error('Dashboard: Logout failed:', error);
    } finally {
      console.log('Dashboard: Clearing token and redirecting...');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  });
}

console.log('=== Dashboard.js Loaded ===');
