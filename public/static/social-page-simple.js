/**
 * Simplified Social Page
 * Activity feed and recent comments
 */

let userData = null;
let currentView = 'feed'; // feed, recent, popular

console.log('🚀 Social page script loaded');

// Check authentication
const checkAuth = async () => {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    window.location.href = '/login?redirect=/social';
    return null;
  }

  try {
    const response = await fetchUtils.get('/api/auth/me', {
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

  if (seconds < 60) return i18n.t('social.time.justNow');
  if (minutes < 60) return `${minutes} ${i18n.t('social.time.minutesAgo')}`;
  if (hours < 24) return `${hours} ${i18n.t('social.time.hoursAgo')}`;
  if (days < 7) return `${days} ${i18n.t('social.time.daysAgo')}`;
  const locale = i18n.currentLanguage === 'zh' ? 'zh-TW' : 'en-US';
  return new Date(timestamp).toLocaleDateString(locale);
};

// Get level icon
const getLevelIcon = (level) => {
  if (level >= 50) return '👑';
  if (level >= 30) return '💎';
  if (level >= 20) return '🏆';
  if (level >= 10) return '⭐';
  return '🌟';
};

// Escape HTML
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
};

// Load activity feed
const loadFeed = async () => {
  const container = document.getElementById('activity-feed');
  const loadingState = document.getElementById('loading-state');
  
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetchUtils.get('/api/social/feed?limit=20', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (loadingState) loadingState.remove();
    
    if (response.data.success) {
      const activities = response.data.data.activities || [];
      console.log(`✅ Loaded ${activities.length} activities`);
      
      if (activities.length === 0) {
        container.innerHTML = `
          <div class="glass-effect rounded-2xl p-12 text-center">
            <i class="fas fa-inbox text-6xl text-gray-600 mb-4"></i>
            <p class="text-gray-400" data-i18n="social.noActivities">No activities yet</p>
          </div>
        `;
        return;
      }
      
      container.innerHTML = activities.map(activity => renderActivity(activity)).join('');
    }
  } catch (error) {
    console.error('Load feed error:', error);
    if (loadingState) loadingState.remove();
    container.innerHTML = `
      <div class="glass-effect rounded-2xl p-12 text-center">
        <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
        <p class="text-gray-400">Load failed，Please try again later</p>
        <button onclick="location.reload()" class="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-bold transition">
          Reload
        </button>
      </div>
    `;
  }
};

// Load recent comments
const loadRecentComments = async () => {
  const container = document.getElementById('activity-feed');
  const loadingState = document.getElementById('loading-state');
  
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetchUtils.get('/api/social/recent-comments?limit=20', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (loadingState) loadingState.remove();
    
    if (response.data.success) {
      const comments = response.data.data.comments || [];
      console.log(`✅ Loaded ${comments.length} recent comments`);
      
      if (comments.length === 0) {
        container.innerHTML = `
          <div class="glass-effect rounded-2xl p-12 text-center">
            <i class="fas fa-comments text-6xl text-gray-600 mb-4"></i>
            <p class="text-gray-400">No comments yet</p>
          </div>
        `;
        return;
      }
      
      container.innerHTML = comments.map(comment => renderComment(comment)).join('');
    }
  } catch (error) {
    console.error('Load recent comments error:', error);
    if (loadingState) loadingState.remove();
    container.innerHTML = `
      <div class="glass-effect rounded-2xl p-12 text-center">
        <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
        <p class="text-gray-400">Load failed</p>
      </div>
    `;
  }
};

// Load popular comments
const loadPopularComments = async () => {
  const container = document.getElementById('activity-feed');
  const loadingState = document.getElementById('loading-state');
  
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetchUtils.get('/api/social/popular-comments?limit=20', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (loadingState) loadingState.remove();
    
    if (response.data.success) {
      const comments = response.data.data.comments || [];
      console.log(`✅ Loaded ${comments.length} popular comments`);
      
      if (comments.length === 0) {
        container.innerHTML = `
          <div class="glass-effect rounded-2xl p-12 text-center">
            <i class="fas fa-fire text-6xl text-gray-600 mb-4"></i>
            <p class="text-gray-400">No popular comments yet</p>
          </div>
        `;
        return;
      }
      
      container.innerHTML = comments.map(comment => renderComment(comment)).join('');
    }
  } catch (error) {
    console.error('Load popular comments error:', error);
    if (loadingState) loadingState.remove();
    container.innerHTML = `
      <div class="glass-effect rounded-2xl p-12 text-center">
        <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
        <p class="text-gray-400">Load failed</p>
      </div>
    `;
  }
};

// Render activity
const renderActivity = (activity) => {
  const timeAgo = formatRelativeTime(activity.created_at);
  const levelIcon = getLevelIcon(activity.level || 1);
  
  let icon = 'fa-bell';
  let iconColor = 'text-blue-500';
  let message = '';
  let link = '';

  switch (activity.activity_type) {
    case 'comment':
      icon = 'fa-comment';
      iconColor = 'text-green-500';
      message = 'posted a comment';
      link = activity.entity_type === 'coin' ? `/coin/${activity.entity_id}` : '';
      break;
    case 'trade':
      icon = 'fa-exchange-alt';
      iconColor = 'text-green-500';
      message = 'made a trade';
      break;
    case 'achievement':
      icon = 'fa-trophy';
      iconColor = 'text-yellow-500';
      message = 'unlocked an achievement';
      link = '/achievements';
      break;
    default:
      message = activity.activity_type;
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
            <span class="font-bold">${escapeHtml(activity.username)}</span>
            <span class="px-2 py-0.5 bg-orange-500/20 text-orange-500 rounded text-xs">
              ${levelIcon} Lv.${activity.level || 1}
            </span>
            <span class="text-gray-400 text-sm">${message}</span>
            <span class="text-gray-500 text-sm">${timeAgo}</span>
          </div>
          
          ${activity.content ? `
            <p class="text-gray-300 mb-3 whitespace-pre-wrap break-words">${escapeHtml(activity.content)}</p>
          ` : ''}
          
          ${link ? `
            <a href="${link}" class="inline-flex items-center text-sm text-orange-500 hover:text-orange-400">
              View Details <i class="fas fa-arrow-right ml-1"></i>
            </a>
          ` : ''}
        </div>
      </div>
    </div>
  `;
};

// Render comment
const renderComment = (comment) => {
  const timeAgo = formatRelativeTime(comment.created_at);
  const levelIcon = getLevelIcon(comment.level || 1);
  
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
            <span class="font-bold">${escapeHtml(comment.username)}</span>
            <span class="px-2 py-0.5 bg-orange-500/20 text-orange-500 rounded text-xs">
              ${levelIcon} Lv.${comment.level || 1}
            </span>
            <span class="text-gray-400 text-sm">${timeAgo}</span>
          </div>
          
          <p class="text-gray-300 mb-3 whitespace-pre-wrap break-words">${escapeHtml(comment.content)}</p>
          
          ${comment.coin_name ? `
            <a href="/coin/${comment.coin_id}" class="inline-flex items-center text-sm text-orange-500 hover:text-orange-400 mb-3">
              <i class="fas fa-coins mr-1"></i>
              ${escapeHtml(comment.coin_name)}
            </a>
          ` : ''}
          
          <div class="flex items-center space-x-4 text-sm text-gray-400 mt-2">
            <span>
              <i class="fas fa-heart mr-1"></i>
              ${comment.likes_count || 0}
            </span>
            ${comment.pinned ? '<span class="text-yellow-500"><i class="fas fa-thumbtack mr-1"></i>Pinned</span>' : ''}
          </div>
        </div>
      </div>
    </div>
  `;
};

// Load trending coins
const loadTrendingCoins = async () => {
  try {
    const response = await fetchUtils.get('/api/coins?sort=hype&limit=5');
    
    if (response.data.success) {
      const coins = response.data.data.coins || [];
      const container = document.getElementById('trending-coins');
      
      if (!container) return;
      
      if (coins.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-sm">No data</p>';
        return;
      }

      container.innerHTML = coins.map((coin, index) => `
        <a href="/coin/${coin.id}" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition">
          <span class="text-xl font-bold text-gray-500">#${index + 1}</span>
          <img src="${coin.image_url}" alt="${coin.name}" class="w-10 h-10 rounded-full" onerror="this.src='/static/default-coin.svg'">
          <div class="flex-1 min-w-0">
            <p class="font-bold truncate">${escapeHtml(coin.name)}</p>
            <p class="text-sm text-gray-400">${i18n.t('social.hypeScore')} ${Math.floor(coin.hype_score || 0)}</p>
          </div>
        </a>
      `).join('');
    }
  } catch (error) {
    console.error('Load trending coins error:', error);
  }
};

// Load social stats
const loadSocialStats = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetchUtils.get('/api/social/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.data.success) {
      const stats = response.data.data || {};
      
      const totalEl = document.getElementById('stat-total-comments');
      const todayEl = document.getElementById('stat-today-comments');
      const usersEl = document.getElementById('stat-active-users');
      
      if (totalEl) totalEl.textContent = stats.total_comments || 0;
      if (todayEl) todayEl.textContent = stats.today_comments || 0;
      if (usersEl) usersEl.textContent = stats.active_users || 0;
    }
  } catch (error) {
    console.error('Load social stats error:', error);
  }
};

// Setup filters
const setupFilters = () => {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterButtons.forEach(b => {
        b.classList.remove('active', 'bg-orange-500');
        b.classList.add('bg-white/10');
      });
      btn.classList.add('active', 'bg-orange-500');
      btn.classList.remove('bg-white/10');
      
      // Load appropriate view
      const filter = btn.dataset.filter;
      currentView = filter;
      
      const container = document.getElementById('activity-feed');
      container.innerHTML = `
        <div id="loading-state" class="glass-effect rounded-2xl p-12 text-center">
          <i class="fas fa-spinner fa-spin text-6xl text-orange-500 mb-4"></i>
          <p class="text-xl text-gray-400" data-i18n="social.loading">Loading...</p>
        </div>
      `;
      
      switch (filter) {
        case 'all':
        case 'following':
          loadFeed();
          break;
        case 'recent':
          loadRecentComments();
          break;
        case 'popular':
          loadPopularComments();
          break;
      }
    });
  });
};

// Setup logout (social page specific)
const setupSocialLogout = () => {
  const logoutBtn = document.getElementById('logout-btn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    });
  }
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
  setupSocialLogout();
  
  // Load initial data
  await Promise.all([
    loadFeed(),
    loadTrendingCoins(),
    loadSocialStats()
  ]);
  
  // Start auto-refresh (every 30 seconds)
  setInterval(() => {
    switch (currentView) {
      case 'all':
      case 'following':
        loadFeed();
        break;
      case 'recent':
        loadRecentComments();
        break;
      case 'popular':
        loadPopularComments();
        break;
    }
    loadTrendingCoins();
    loadSocialStats();
  }, 30000);
  
  // Listen for language changes and reload content
  if (window.i18n) {
    window.i18n.onLocaleChange(async (newLocale) => {
      console.log('Language changed to:', newLocale);
      await loadTrendingCoins(); // Reload to update Hype label
    });
  }
  
  console.log('✅ Social page initialized');
  
  // Hide page loader
  fetchUtils.hidePageLoader();
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
