/**
 * Dashboard JavaScript
 * Handles authenticated dashboard functionality
 */

const API_BASE = '/api';
let currentUser = null;

// Check authentication on page load
const checkAuthAndLoadDashboard = async () => {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    // Not logged in - redirect to login
    window.location.href = '/login?redirect=/dashboard';
    return;
  }

  try {
    const response = await fetchUtils.get(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.success) {
      currentUser = response.data.data;
      displayDashboard();
      loadDashboardData();
    } else {
      // Invalid token
      localStorage.removeItem('auth_token');
      window.location.href = '/login?redirect=/dashboard';
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    localStorage.removeItem('auth_token');
    window.location.href = '/login?redirect=/dashboard';
  }
};

// Display user info in header
const displayDashboard = () => {
  // Update username display
  const usernameEl = document.getElementById('username-display');
  if (usernameEl) {
    usernameEl.textContent = currentUser.username;
  }

  // Update balance
  const balanceEl = document.getElementById('user-balance');
  if (balanceEl) {
    balanceEl.textContent = Number(currentUser.virtual_balance || 0).toLocaleString();
  }

  // Show user avatar (or initials)
  const avatarEl = document.getElementById('user-avatar');
  if (avatarEl) {
    const initials = currentUser.username.substring(0, 2).toUpperCase();
    avatarEl.textContent = initials;
  }

  // Update level and XP
  const levelEl = document.getElementById('user-level');
  if (levelEl) {
    levelEl.textContent = currentUser.level || 1;
  }

  const xpEl = document.getElementById('user-xp');
  if (xpEl) {
    const xp = currentUser.xp || 0;
    const nextLevelXP = (currentUser.level || 1) * 1000;
    xpEl.textContent = `${xp} / ${nextLevelXP} XP`;
    
    // Update XP progress bar
    const progressBar = document.getElementById('xp-progress');
    if (progressBar) {
      const percentage = (xp / nextLevelXP) * 100;
      progressBar.style.width = `${percentage}%`;
    }
  }
};

// Load dashboard data
const loadDashboardData = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    
    // Load my coins
    await loadMyCoins(token);
    
    // Load portfolio stats
    await loadPortfolioStats(token);
    
    // Load recent activity
    await loadRecentActivity(token);
    
    // Load trending coins
    await loadTrendingCoins();
    
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
};

// Load user's created coins
const loadMyCoins = async (token) => {
  try {
    const response = await fetchUtils.get(`${API_BASE}/coins/my-coins`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.data.success) {
      const coins = response.data.data;
      displayMyCoins(coins);
      updateMyCoinsStats(coins);
    }
  } catch (error) {
    console.error('Failed to load my coins:', error);
  }
};

// Display created coins
const displayMyCoins = (coins) => {
  const container = document.getElementById('my-coins-list');
  if (!container) return;
  
  if (coins.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <i class="fas fa-rocket text-6xl text-gray-600 mb-4"></i>
        <p class="text-gray-400 mb-4">You haven't created any coins yet</p>
        <a href="/create" class="btn-primary inline-block">
          <i class="fas fa-plus mr-2"></i>Create your first coin
        </a>
      </div>
    `;
    return;
  }
  
  const html = coins.slice(0, 3).map(coin => `
    <div class="card" onclick="window.location.href='/coin/${coin.id}'">
      <div class="flex items-center gap-4">
        <img src="${coin.image_url}" alt="${coin.name}" class="w-16 h-16 rounded-lg object-cover" />
        <div class="flex-1">
          <h4 class="font-bold">${coin.name}</h4>
          <p class="text-sm text-gray-400">${coin.symbol}</p>
        </div>
        <div class="text-right">
          <p class="text-lg font-bold text-green-500">$${Number(coin.current_price).toFixed(4)}</p>
          <p class="text-sm text-gray-400">${coin.holders_count} Holders</p>
        </div>
      </div>
    </div>
  `).join('');
  
  container.innerHTML = html;
};

// Update stats from my coins
const updateMyCoinsStats = (coins) => {
  const totalCoinsEl = document.getElementById('total-coins-created');
  if (totalCoinsEl) {
    totalCoinsEl.textContent = coins.length;
  }
  
  const totalValueEl = document.getElementById('total-coins-value');
  if (totalValueEl) {
    const totalValue = coins.reduce((sum, coin) => sum + Number(coin.market_cap || 0), 0);
    totalValueEl.textContent = `$${totalValue.toFixed(2)}`;
  }
};

// Load portfolio statistics
const loadPortfolioStats = async (token) => {
  try {
    const response = await fetchUtils.get(`${API_BASE}/portfolio`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.data.success) {
      const portfolio = response.data.data;
      displayPortfolioStats(portfolio);
    }
  } catch (error) {
    console.error('Failed to load portfolio:', error);
  }
};

// Display portfolio stats
const displayPortfolioStats = (portfolio) => {
  const portfolioValueEl = document.getElementById('portfolio-value');
  if (portfolioValueEl) {
    const totalValue = portfolio.reduce((sum, holding) => {
      return sum + (Number(holding.amount) * Number(holding.current_price || 0));
    }, 0);
    portfolioValueEl.textContent = `$${totalValue.toFixed(2)}`;
  }
  
  const holdingsCountEl = document.getElementById('holdings-count');
  if (holdingsCountEl) {
    holdingsCountEl.textContent = portfolio.length;
  }
};

// Load recent trading activity
const loadRecentActivity = async (token) => {
  try {
    const response = await fetchUtils.get(`${API_BASE}/trades/history?limit=5`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.data.success) {
      const trades = response.data.data;
      displayRecentActivity(trades);
    }
  } catch (error) {
    console.error('Failed to load activity:', error);
  }
};

// Display recent activity
const displayRecentActivity = (trades) => {
  const container = document.getElementById('recent-activity');
  if (!container) return;
  
  if (trades.length === 0) {
    container.innerHTML = `
      <p class="text-center text-gray-400 py-4">No transactions yet</p>
    `;
    return;
  }
  
  const html = trades.map(trade => {
    const typeIcon = trade.type === 'buy' ? 'fa-arrow-up' : 'fa-arrow-down';
    const typeColor = trade.type === 'buy' ? 'text-green-500' : 'text-red-500';
    const typeText = trade.type === 'buy' ? 'Buy' : 'Sell';
    
    return `
      <div class="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
        <div class="flex items-center gap-3">
          <i class="fas ${typeIcon} ${typeColor}"></i>
          <div>
            <p class="font-medium">${typeText} ${trade.coin_symbol}</p>
            <p class="text-sm text-gray-400">${new Date(trade.created_at).toLocaleString('zh-TW')}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="font-bold">${Number(trade.amount).toFixed(2)} tokens</p>
          <p class="text-sm text-gray-400">$${Number(trade.total_cost).toFixed(2)}</p>
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = html;
};

// Load trending coins
const loadTrendingCoins = async () => {
  try {
    const response = await fetchUtils.get(`${API_BASE}/coins/trending/list?limit=5`);
    
    if (response.data.success) {
      const coins = response.data.data;
      displayTrendingCoins(coins);
    }
  } catch (error) {
    console.error('Failed to load trending coins:', error);
  }
};

// Display trending coins
const displayTrendingCoins = (coins) => {
  const container = document.getElementById('trending-coins');
  if (!container) return;
  
  if (coins.length === 0) {
    container.innerHTML = `<p class="text-center text-gray-400 py-4">No trending coins</p>`;
    return;
  }
  
  const html = coins.map((coin, index) => `
    <div class="flex items-center gap-3 py-3 border-b border-gray-700 last:border-0 cursor-pointer hover:bg-gray-800 px-2 rounded transition" 
         onclick="window.location.href='/coin/${coin.id}'">
      <span class="text-gray-500 font-bold w-6">#${index + 1}</span>
      <img src="${coin.image_url}" alt="${coin.name}" class="w-10 h-10 rounded-full object-cover" />
      <div class="flex-1">
        <p class="font-medium">${coin.symbol}</p>
        <p class="text-sm text-gray-400">${coin.name}</p>
      </div>
      <div class="text-right">
        <p class="font-bold text-green-500">$${Number(coin.current_price).toFixed(4)}</p>
        <p class="text-xs text-gray-400">${coin.transaction_count} Trade</p>
      </div>
    </div>
  `).join('');
  
  container.innerHTML = html;
};

// Logout function
const logout = () => {
  localStorage.removeItem('auth_token');
  window.location.href = '/';
};

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAuthAndLoadDashboard();
  
  // Setup logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  
  console.log('✅ Dashboard initialized');
});

// Language switcher support
if (typeof i18n !== 'undefined' && i18n.onLocaleChange) {
    i18n.onLocaleChange(() => {
        location.reload();
    });
}
