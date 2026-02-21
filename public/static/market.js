/**
 * Market Page JavaScript
 * Handles coin listing, search, filters, and pagination
 */

let currentPage = 1;
let totalPages = 1;
let currentFilters = {
  search: '',
  sortBy: 'created_at',
  order: 'DESC',
  destinyType: '' // Add destiny filter
};

// Check authentication with retry mechanism
const checkAuth = async (retryCount = 0) => {
  const token = localStorage.getItem('auth_token');
  
  console.log(`Market: Token check (attempt ${retryCount + 1}):`, token ? 'Found' : 'Not found');
  
  if (!token) {
    // Retry a few times in case token is being written
    if (retryCount < 3) {
      console.log('Market: No token yet, retrying in 200ms...');
      await new Promise(resolve => setTimeout(resolve, 200));
      return checkAuth(retryCount + 1);
    }
    
    console.log('Market: No token after retries, redirecting to login...');
    window.location.href = '/login?redirect=/market';
    return null;
  }

  try {
    console.log('Market: Verifying token with API...');
    const response = await fetchUtils.get('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.success) {
      console.log('Market: Token valid, user:', response.data.data.username);
      return response.data.data;
    } else {
      console.log('Market: Invalid token response');
      localStorage.removeItem('auth_token');
      window.location.href = '/login?redirect=/market';
      return null;
    }
  } catch (error) {
    console.error('Market: Auth check failed:', error);
    console.error('Market: Error details:', error.response?.data);
    localStorage.removeItem('auth_token');
    window.location.href = '/login?redirect=/market';
    return null;
  }
};

// Update user balance in UI
const updateUserBalance = (balance) => {
  const balanceEl = document.getElementById('user-balance');
  if (balanceEl) {
    balanceEl.textContent = Number(balance || 0).toLocaleString();
  }
};

// Load coins from API
const loadCoins = async (page = 1) => {
  const coinsGrid = document.getElementById('coins-grid');
  const emptyState = document.getElementById('empty-state');
  
  // Show loading
  coinsGrid.innerHTML = `
    <div class="col-span-full text-center py-12">
      <i class="fas fa-spinner fa-spin text-5xl text-orange-500 mb-4"></i>
      <p class="text-xl text-gray-400">載入中...</p>
    </div>
  `;
  emptyState.classList.add('hidden');
  
  try {
    const token = localStorage.getItem('auth_token');
    
    // Build query params
    const params = new URLSearchParams({
      page: page,
      limit: 12,
      sortBy: currentFilters.sortBy,
      order: currentFilters.order
    });
    
    if (currentFilters.search) {
      params.append('search', currentFilters.search);
    }
    
    if (currentFilters.destinyType) {
      params.append('destinyType', currentFilters.destinyType);
    }
    
    const response = await fetchUtils.get(`/api/coins?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      const { coins, pagination } = response.data.data;
      
      currentPage = pagination.page;
      totalPages = pagination.totalPages;
      
      // Update pagination UI
      updatePaginationUI();
      
      // Render coins
      if (coins && coins.length > 0) {
        renderCoins(coins);
      } else {
        coinsGrid.innerHTML = '';
        emptyState.classList.remove('hidden');
      }
      
      // Update stats
      updateStats(pagination.total);
    }
  } catch (error) {
    console.error('Failed to load coins:', error);
    coinsGrid.innerHTML = `
      <div class="col-span-full text-center py-12">
        <i class="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i>
        <p class="text-xl text-gray-400">載入失敗</p>
        <button onclick="loadCoins(${page})" class="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition">
          重試
        </button>
      </div>
    `;
  }
};

// Render coins in grid
const renderCoins = (coins) => {
  const coinsGrid = document.getElementById('coins-grid');
  
  coinsGrid.innerHTML = coins.map(coin => {
    const priceChange = Math.random() * 20 - 10; // Simulated price change
    const priceChangeClass = priceChange >= 0 ? 'text-green-400' : 'text-red-400';
    const priceChangeIcon = priceChange >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
    
    // Calculate bonding curve progress
    const progress = coin.bonding_curve_progress || 0;
    const progressPercent = (progress * 100).toFixed(1);
    
    // Get destiny badge
    const destinyBadge = getDestinyBadge(coin.destiny_type);
    
    // AI and real trade counts
    const aiTrades = coin.ai_trade_count || 0;
    const realTrades = coin.real_trade_count || 0;
    
    return `
      <div class="glass-effect rounded-2xl p-6 hover:bg-white/10 transition cursor-pointer transform hover:scale-105" onclick="window.location.href='/coin/${coin.id}'">
        <!-- Coin Header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <img src="${coin.image_url || '/static/default-coin.svg'}" alt="${coin.name}" class="w-16 h-16 rounded-full" />
            <div>
              <h3 class="text-xl font-bold">${coin.name}</h3>
              <p class="text-sm text-gray-400">${coin.symbol}</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold">${Number(coin.current_price || 0).toFixed(4)}</div>
            <div class="${priceChangeClass} text-sm flex items-center justify-end">
              <i class="fas ${priceChangeIcon} mr-1"></i>
              ${Math.abs(priceChange).toFixed(2)}%
            </div>
          </div>
        </div>

        <!-- Destiny Badge -->
        ${destinyBadge ? `<div class="mb-3">${destinyBadge}</div>` : ''}

        <!-- Mini Bonding Curve Progress -->
        <div class="mb-3">
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="text-gray-400">Bonding Curve</span>
            <span class="text-orange-400 font-bold">${progressPercent}%</span>
          </div>
          <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all" style="width: ${progressPercent}%"></div>
          </div>
        </div>

        <!-- AI Activity Indicators -->
        <div class="flex items-center justify-between text-xs mb-3">
          <div class="flex items-center space-x-2">
            <i class="fas fa-robot text-purple-400"></i>
            <span class="text-gray-400">AI: ${aiTrades}</span>
          </div>
          <div class="flex items-center space-x-2">
            <i class="fas fa-user text-green-400"></i>
            <span class="text-gray-400">真實: ${realTrades}</span>
          </div>
        </div>

        <!-- Coin Stats -->
        <div class="grid grid-cols-2 gap-3 text-sm mb-3">
          <div>
            <p class="text-gray-400">市值</p>
            <p class="font-bold">${Number(coin.market_cap || 0).toLocaleString()}</p>
          </div>
          <div>
            <p class="text-gray-400">供應量</p>
            <p class="font-bold">${Number(coin.total_supply || 0).toLocaleString()}</p>
          </div>
          <div>
            <p class="text-gray-400">持有人</p>
            <p class="font-bold">${Number(coin.holders_count || 0).toLocaleString()}</p>
          </div>
          <div>
            <p class="text-gray-400">交易</p>
            <p class="font-bold">${Number(coin.transaction_count || 0).toLocaleString()}</p>
          </div>
        </div>

        <!-- Hype Score -->
        <div class="mb-3">
          <div class="flex items-center justify-between text-sm mb-1">
            <span class="text-gray-400">
              <i class="fas fa-fire text-orange-500 mr-1"></i>Hype 分數
            </span>
            <span class="font-bold">${coin.hype_score || 0}/200</span>
          </div>
          <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-orange-500 to-pink-500" style="width: ${Math.min((coin.hype_score || 0) / 200 * 100, 100)}%"></div>
          </div>
        </div>

        <!-- Creator -->
        <div class="flex items-center justify-between text-sm text-gray-400">
          <a href="/profile/${coin.creator_id}" class="flex items-center hover:text-orange-500 transition" onclick="event.stopPropagation()">
            <i class="fas fa-user mr-1"></i>
            創建者: ${coin.creator_username || 'Unknown'}
          </a>
          <span>
            <i class="fas fa-clock mr-1"></i>
            ${formatDate(coin.created_at)}
          </span>
        </div>

        <!-- Action Button -->
        <div class="mt-4">
          <button class="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-lg font-bold transition" onclick="event.stopPropagation(); quickTrade('${coin.id}')">
            <i class="fas fa-bolt mr-2"></i>快速交易
          </button>
        </div>
      </div>
    `;
  }).join('');
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

// Update pagination UI
const updatePaginationUI = () => {
  document.getElementById('current-page').textContent = currentPage;
  document.getElementById('total-pages').textContent = totalPages;
  
  const prevBtn = document.getElementById('prev-page-btn');
  const nextBtn = document.getElementById('next-page-btn');
  
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
};

// Update stats
const updateStats = (totalCoins) => {
  document.getElementById('total-coins').textContent = totalCoins.toLocaleString();
  
  // Simulate other stats (in real app, these would come from API)
  document.getElementById('total-volume').textContent = Math.floor(Math.random() * 1000000).toLocaleString();
  document.getElementById('total-holders').textContent = Math.floor(Math.random() * 10000).toLocaleString();
  document.getElementById('trending-count').textContent = Math.min(10, totalCoins);
};

// Quick trade function (placeholder)
const quickTrade = (coinId) => {
  // This will be implemented when we create the trading functionality
  alert(`快速交易功能即將推出！幣種 ID: ${coinId}`);
};

// Setup event listeners
const setupEventListeners = () => {
  // Search input
  const searchInput = document.getElementById('search-input');
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentFilters.search = e.target.value;
      loadCoins(1);
    }, 500);
  });
  
  // Sort select
  const sortSelect = document.getElementById('sort-select');
  sortSelect.addEventListener('change', (e) => {
    const value = e.target.value;
    let [field, order] = value.split('_');
    
    // Handle multi-word field names
    if (value.includes('bonding_curve_progress')) {
      currentFilters.sortBy = 'bonding_curve_progress';
      currentFilters.order = value.endsWith('desc') ? 'DESC' : 'ASC';
    } else if (value.includes('ai_trade_count')) {
      currentFilters.sortBy = 'ai_trade_count';
      currentFilters.order = value.endsWith('desc') ? 'DESC' : 'ASC';
    } else if (value.includes('real_trade_count')) {
      currentFilters.sortBy = 'real_trade_count';
      currentFilters.order = value.endsWith('desc') ? 'DESC' : 'ASC';
    } else {
      // Handle other sorting options
      currentFilters.sortBy = field === 'created' ? 'created_at' : 
                              field === 'current' ? 'current_price' :
                              field === 'market' ? 'market_cap' :
                              field === 'hype' ? 'hype_score' :
                              field === 'transaction' ? 'transaction_count' : 'created_at';
      currentFilters.order = order === 'desc' ? 'DESC' : 'ASC';
    }
    
    // Auto-apply when sort changes
    loadCoins(1);
  });
  
  // Destiny filter
  const destinyFilter = document.getElementById('destiny-filter');
  if (destinyFilter) {
    destinyFilter.addEventListener('change', (e) => {
      currentFilters.destinyType = e.target.value;
      loadCoins(1);
    });
  }
  
  // Apply filters button
  const applyFiltersBtn = document.getElementById('apply-filters-btn');
  applyFiltersBtn.addEventListener('click', () => {
    loadCoins(1);
  });
  
  // Pagination buttons
  const prevBtn = document.getElementById('prev-page-btn');
  const nextBtn = document.getElementById('next-page-btn');
  
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      loadCoins(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      loadCoins(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  
  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    });
  }
};

// Initialize
const init = async () => {
  const userData = await checkAuth();
  
  if (userData) {
    updateUserBalance(userData.virtual_balance);
    setupEventListeners();
    await loadCoins(1);
    
    // Hide page loader after everything is loaded
    fetchUtils.hidePageLoader();
  }
};

// ========================================
// Helper Functions for Enhanced Display
// ========================================

/**
 * Get destiny badge HTML
 */
function getDestinyBadge(destinyType) {
  const badges = {
    'SURVIVAL': '<span class="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold">🛡️ 生存</span>',
    'EARLY_DEATH': '<span class="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold">💀 高風險</span>',
    'LATE_DEATH': '<span class="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-bold">⏳ 中風險</span>',
    'GRADUATION': '<span class="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-bold">🎓 畢業</span>',
    'RUG_PULL': '<span class="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-bold">⚠️ Rug</span>',
    'unknown': ''
  };
  return badges[destinyType] || badges['unknown'];
}

document.addEventListener('DOMContentLoaded', init);
