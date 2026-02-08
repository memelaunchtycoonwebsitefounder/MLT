/**
 * Market Page JavaScript
 * Handles coin listing, search, filters, and pagination
 */

let currentPage = 1;
let totalPages = 1;
let currentFilters = {
  search: '',
  sortBy: 'created_at',
  order: 'DESC'
};

// Check authentication
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
    
    const response = await axios.get(`/api/coins?${params.toString()}`, {
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

        <!-- Coin Stats -->
        <div class="grid grid-cols-2 gap-3 text-sm">
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
        <div class="mt-4">
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
        <div class="mt-4 flex items-center justify-between text-sm text-gray-400">
          <span>
            <i class="fas fa-user mr-1"></i>
            創建者: ${coin.creator_username || 'Unknown'}
          </span>
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
    const [sortBy, order] = e.target.value.split('_');
    currentFilters.sortBy = sortBy === 'created' ? 'created_at' : 
                            sortBy === 'current' ? 'current_price' :
                            sortBy === 'market' ? 'market_cap' :
                            sortBy === 'hype' ? 'hype_score' :
                            sortBy === 'transaction' ? 'transaction_count' : 'created_at';
    currentFilters.order = order === 'desc' ? 'DESC' : 'ASC';
  });
  
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
  }
};

document.addEventListener('DOMContentLoaded', init);
