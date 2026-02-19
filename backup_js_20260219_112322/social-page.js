/**
 * Social Page JavaScript
 * Activity feed and social interactions
 */

let userData = null;
let currentFilter = 'all';
let currentPage = 1;
const pageSize = 20;
let isLoading = false;

// Check authentication
const checkAuth = async () => {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    window.location.href = '/login?redirect=/social';
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
      window.location.href = '/login?redirect=/social';
      return null;
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    localStorage.removeItem('auth_token');
    window.location.href = '/login?redirect=/social';
    return null;
  }
};

// Update user balance
const updateUserBalance = (balance) => {
  const balanceElement = document.getElementById('user-balance');
  if (balanceElement) {
    balanceElement.textContent = balance.toFixed(2);
  }
};

// Format relative time
const formatRelativeTime = (timestamp) => {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diff = now - time;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return '剛剛';
  if (minutes < 60) return `${minutes} 分鐘前`;
  if (hours < 24) return `${hours} 小時前`;
  if (days < 7) return `${days} 天前`;
  if (weeks < 4) return `${weeks} 週前`;
  if (months < 12) return `${months} 個月前`;
  return `${years} 年前`;
};

// Get level icon
const getLevelIcon = (level) => {
  if (level >= 50) return '👑';
  if (level >= 30) return '💎';
  if (level >= 20) return '🏆';
  if (level >= 10) return '⭐';
  return '🌟';
};

// Load activity feed
const loadActivityFeed = async (reset = false) => {
  if (isLoading) return;
  isLoading = true;

  if (reset) {
    currentPage = 1;
    document.getElementById('activity-feed').innerHTML = `
      <div class="glass-effect rounded-2xl p-12 text-center">
        <i class="fas fa-spinner fa-spin text-6xl text-orange-500 mb-4"></i>
        <p class="text-xl text-gray-400">載入中...</p>
      </div>
    `;
  }

  try {
    const token = localStorage.getItem('auth_token');
    let endpoint = '/api/social/feed';
    
    // Adjust endpoint based on filter
    if (currentFilter === 'recent') {
      endpoint = '/api/social/recent-comments';
    } else if (currentFilter === 'popular') {
      endpoint = '/api/social/popular-comments';
    }

    const response = await axios.get(endpoint, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: {
        page: currentPage,
        limit: pageSize
      }
    });

    if (response.data.success) {
      const activities = response.data.data || response.data.comments || [];
      
      if (reset) {
        renderActivityFeed(activities);
      } else {
        appendActivityFeed(activities);
      }

      // Show/hide load more button
      const loadMoreBtn = document.getElementById('load-more-btn');
      if (activities.length === pageSize) {
        loadMoreBtn.classList.remove('hidden');
      } else {
        loadMoreBtn.classList.add('hidden');
      }
    }
  } catch (error) {
    console.error('Error loading activity feed:', error);
    document.getElementById('activity-feed').innerHTML = `
      <div class="glass-effect rounded-2xl p-12 text-center">
        <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
        <p class="text-xl text-gray-400">載入失敗，請稍後再試</p>
      </div>
    `;
  } finally {
    isLoading = false;
  }
};

// Render activity feed
const renderActivityFeed = (activities) => {
  const feedContainer = document.getElementById('activity-feed');
  
  if (activities.length === 0) {
    feedContainer.innerHTML = `
      <div class="glass-effect rounded-2xl p-12 text-center">
        <i class="fas fa-comments text-6xl text-gray-500 mb-4"></i>
        <p class="text-xl text-gray-400">暫無動態</p>
      </div>
    `;
    return;
  }

  feedContainer.innerHTML = activities.map(activity => {
    const isComment = activity.content !== undefined;
    
    if (isComment) {
      return renderCommentActivity(activity);
    } else {
      return renderGenericActivity(activity);
    }
  }).join('');
};

// Append to activity feed
const appendActivityFeed = (activities) => {
  const feedContainer = document.getElementById('activity-feed');
  const loadingState = feedContainer.querySelector('#loading-state');
  if (loadingState) loadingState.remove();

  activities.forEach(activity => {
    const isComment = activity.content !== undefined;
    const html = isComment ? renderCommentActivity(activity) : renderGenericActivity(activity);
    feedContainer.insertAdjacentHTML('beforeend', html);
  });
};

// Render comment activity
const renderCommentActivity = (comment) => {
  const levelIcon = getLevelIcon(comment.level || 1);
  const timeAgo = formatRelativeTime(comment.created_at);
  
  return `
    <div class="glass-effect rounded-2xl p-6 hover:bg-white/5 transition animate-fade-in">
      <div class="flex items-start space-x-4">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-xl">
            ${levelIcon}
          </div>
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2 mb-2">
            <span class="font-bold">${comment.username || '匿名用戶'}</span>
            <span class="px-2 py-1 bg-orange-500/20 text-orange-500 rounded text-xs">
              ${levelIcon} Lv.${comment.level || 1}
            </span>
            <span class="text-gray-400 text-sm">${timeAgo}</span>
          </div>
          
          <div class="mb-3">
            <p class="text-gray-300 break-words">${escapeHtml(comment.content)}</p>
          </div>
          
          ${comment.coin_name ? `
            <a href="/coin/${comment.coin_id}" class="inline-flex items-center text-sm text-orange-500 hover:text-orange-400 mb-3">
              <i class="fas fa-coins mr-1"></i>
              ${escapeHtml(comment.coin_name)}
            </a>
          ` : ''}
          
          <div class="flex items-center space-x-4 text-sm text-gray-400">
            <button class="like-btn hover:text-orange-500 transition" data-comment-id="${comment.id}">
              <i class="fas fa-heart mr-1"></i>
              ${comment.likes_count || 0}
            </button>
            <a href="/coin/${comment.coin_id}#comment-${comment.id}" class="hover:text-orange-500 transition">
              <i class="fas fa-comment mr-1"></i>
              回覆
            </a>
            ${comment.pinned ? '<span class="text-yellow-500"><i class="fas fa-thumbtack mr-1"></i>已釘選</span>' : ''}
          </div>
        </div>
      </div>
    </div>
  `;
};

// Render generic activity
const renderGenericActivity = (activity) => {
  const timeAgo = formatRelativeTime(activity.created_at);
  let icon = 'fa-bell';
  let iconColor = 'text-blue-500';
  let message = activity.activity_type;

  switch (activity.activity_type) {
    case 'trade':
      icon = 'fa-exchange-alt';
      iconColor = 'text-green-500';
      message = '進行了一筆交易';
      break;
    case 'follow':
      icon = 'fa-user-plus';
      iconColor = 'text-purple-500';
      message = '關注了新用戶';
      break;
    case 'achievement':
      icon = 'fa-trophy';
      iconColor = 'text-yellow-500';
      message = '解鎖了新成就';
      break;
    case 'coin_created':
      icon = 'fa-plus-circle';
      iconColor = 'text-orange-500';
      message = '創建了新幣種';
      break;
  }

  return `
    <div class="glass-effect rounded-2xl p-6 hover:bg-white/5 transition animate-fade-in">
      <div class="flex items-start space-x-4">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <i class="fas ${icon} ${iconColor} text-xl"></i>
          </div>
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2 mb-2">
            <span class="font-bold">${activity.username || '用戶'}</span>
            <span class="text-gray-400 text-sm">${message}</span>
            <span class="text-gray-500 text-sm">${timeAgo}</span>
          </div>
          
          ${activity.metadata ? `
            <div class="text-gray-400 text-sm">
              ${JSON.stringify(activity.metadata)}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
};

// Load trending coins
const loadTrendingCoins = async () => {
  try {
    const response = await axios.get('/api/coins?sort=hype&limit=5');
    
    if (response.data.success) {
      const coins = response.data.data || [];
      const container = document.getElementById('trending-coins');
      
      if (coins.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-sm">暫無數據</p>';
        return;
      }

      container.innerHTML = coins.map((coin, index) => `
        <a href="/coin/${coin.id}" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition">
          <span class="text-xl font-bold text-gray-500">#${index + 1}</span>
          <img src="${coin.image_url}" alt="${coin.name}" class="w-10 h-10 rounded-full">
          <div class="flex-1 min-w-0">
            <p class="font-bold truncate">${escapeHtml(coin.name)}</p>
            <p class="text-sm text-gray-400">炒作值 ${Math.floor(coin.hype_score || 0)}</p>
          </div>
        </a>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading trending coins:', error);
  }
};

// Load active users
const loadActiveUsers = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get('/api/leaderboard/rankings', {
      headers: { 'Authorization': `Bearer ${token}` },
      params: {
        category: 'trades',
        limit: 5
      }
    });
    
    if (response.data.success) {
      const users = response.data.data?.rankings || [];
      const container = document.getElementById('active-users');
      
      if (users.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-sm">暫無數據</p>';
        return;
      }

      container.innerHTML = users.map((user, index) => {
        const levelIcon = getLevelIcon(user.level || 1);
        return `
          <div class="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition">
            <span class="text-xl">${levelIcon}</span>
            <div class="flex-1 min-w-0">
              <p class="font-bold truncate">${escapeHtml(user.username)}</p>
              <p class="text-sm text-gray-400">Lv.${user.level || 1} • ${user.value || 0} 筆交易</p>
            </div>
          </div>
        `;
      }).join('');
    }
  } catch (error) {
    console.error('Error loading active users:', error);
  }
};

// Load social stats
const loadSocialStats = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get('/api/social/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.data.success) {
      const stats = response.data.data || {};
      
      document.getElementById('stat-total-comments').textContent = stats.total_comments || 0;
      document.getElementById('stat-today-comments').textContent = stats.today_comments || 0;
      document.getElementById('stat-active-users').textContent = stats.active_users || 0;
    }
  } catch (error) {
    console.error('Error loading social stats:', error);
  }
};

// Escape HTML
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Setup filter buttons
const setupFilters = () => {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterButtons.forEach(b => b.classList.remove('active', 'bg-orange-500'));
      btn.classList.add('active', 'bg-orange-500');
      
      // Update filter and reload
      currentFilter = btn.dataset.filter;
      currentPage = 1;
      loadActivityFeed(true);
    });
  });
};

// Setup load more button
const setupLoadMore = () => {
  const loadMoreBtn = document.getElementById('load-more-btn');
  
  loadMoreBtn.addEventListener('click', () => {
    currentPage++;
    loadActivityFeed(false);
  });
};

// Setup logout
const setupLogout = () => {
  const logoutBtn = document.getElementById('logout-btn');
  
  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  });
};

// Initialize page
const init = async () => {
  console.log('🚀 Initializing social page...');
  
  // Check authentication
  userData = await checkAuth();
  if (!userData) return;

  console.log('✅ User authenticated:', userData);
  
  // Update UI
  updateUserBalance(userData.virtual_balance);
  
  // Setup event listeners
  setupFilters();
  setupLoadMore();
  setupLogout();
  
  // Load initial data
  await Promise.all([
    loadActivityFeed(true),
    loadTrendingCoins(),
    loadActiveUsers(),
    loadSocialStats()
  ]);
  
  // Start auto-refresh (every 30 seconds)
  setInterval(() => {
    if (currentPage === 1) {
      loadActivityFeed(true);
    }
    loadTrendingCoins();
    loadActiveUsers();
    loadSocialStats();
  }, 30000);
  
  console.log('✅ Social page initialized');
};

// Add animation styles
if (!document.getElementById('social-animations')) {
  const style = document.createElement('style');
  style.id = 'social-animations';
  style.textContent = `
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out;
    }
    .filter-btn {
      background-color: rgba(255, 255, 255, 0.1);
    }
    .filter-btn:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
    .filter-btn.active {
      background-color: #F97316;
    }
  `;
  document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', init);
