// Leaderboard Page JavaScript

let userData = null;
let currentCategory = 'net_worth';
let rankings = [];
let autoRefreshInterval = null;

// Category configurations
const categories = {
  net_worth: {
    name: '淨資產',
    icon: '💰',
    formatter: (value) => `$${(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
  },
  trades: {
    name: '交易量',
    icon: '📊',
    formatter: (value) => `${(value || 0).toLocaleString()} 筆`,
  },
  level: {
    name: '等級',
    icon: '⭐',
    formatter: (value) => `Lv.${value || 0}`,
  },
  profit: {
    name: '利潤',
    icon: '💸',
    formatter: (value) => {
      const profit = value || 0;
      const sign = profit >= 0 ? '+' : '';
      return `${sign}$${profit.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    },
  },
  coins_created: {
    name: '創建幣種',
    icon: '🚀',
    formatter: (value) => `${value || 0} 個`,
  },
};

// Check authentication
const checkAuth = async () => {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    console.log('❌ No auth token found, redirecting to login');
    window.location.href = '/login?redirect=/leaderboard';
    return null;
  }

  try {
    console.log('🔐 Checking authentication...');
    const response = await axios.get('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.data.success) {
      console.log('✅ Authentication successful:', response.data.data);
      return response.data.data;
    } else {
      console.log('❌ Authentication failed');
      localStorage.removeItem('auth_token');
      window.location.href = '/login?redirect=/leaderboard';
      return null;
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    localStorage.removeItem('auth_token');
    window.location.href = '/login?redirect=/leaderboard';
    return null;
  }
};

// Update user balance display
const updateUserBalance = (balance) => {
  const balanceEl = document.getElementById('user-balance');
  if (balanceEl) {
    balanceEl.textContent = `$${(balance || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  }
};

// Load rankings
const loadRankings = async () => {
  const token = localStorage.getItem('auth_token');
  
  if (!token || !userData) {
    console.error('No token or user data');
    return;
  }

  console.log(`📊 Loading ${currentCategory} rankings...`);

  try {
    const response = await axios.get('/api/leaderboard/rankings', {
      params: {
        category: currentCategory,
        limit: 100,
        userId: userData.id,
      },
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.data.success) {
      rankings = response.data.data.rankings;
      const currentUser = response.data.data.currentUser;

      console.log(`✅ Loaded ${rankings.length} rankings`);

      renderTopThree();
      renderRankingsTable();
      renderUserStats(currentUser);
    }
  } catch (error) {
    console.error('載入排行榜失敗:', error);
    showNotification('載入排行榜失敗', 'error');
  }
};

// Render top three podium
const renderTopThree = () => {
  const container = document.getElementById('top-three-container');
  if (!container || rankings.length === 0) return;

  const top3 = rankings.slice(0, 3);
  
  // Reorder for podium: [2nd, 1st, 3rd]
  const podiumOrder = [
    top3[1] || null, // 2nd place (left)
    top3[0] || null, // 1st place (center)
    top3[2] || null, // 3rd place (right)
  ];

  const medals = ['🥈', '🥇', '🥉'];
  const colors = ['#C0C0C0', '#FFD700', '#CD7F32'];
  const heights = ['180px', '220px', '160px'];
  const positions = ['2', '1', '3'];

  let html = '<div class="flex justify-center items-end gap-6 mb-12">';

  podiumOrder.forEach((player, index) => {
    if (!player) {
      html += '<div class="w-48"></div>';
      return;
    }

    const isCurrentUser = userData && player.id === userData.id;
    const borderColor = isCurrentUser ? '#F97316' : colors[index];
    const value = categories[currentCategory].formatter(player.value);

    html += `
      <div class="relative">
        <!-- Podium Card -->
        <div class="glass-effect rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl ${isCurrentUser ? 'ring-4 ring-orange-500' : ''}"
             style="width: 200px; height: ${heights[index]}; border: 3px solid ${borderColor}; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
          
          <!-- Medal -->
          <div class="text-6xl mb-3 animate-bounce-slow">${medals[index]}</div>
          
          <!-- Rank Badge -->
          <div class="inline-block px-4 py-1 rounded-full text-2xl font-bold mb-3"
               style="background: linear-gradient(135deg, ${borderColor}, ${borderColor}90); color: #1a1a1a;">
            #${positions[index]}
          </div>
          
          <!-- Username -->
          <div class="text-lg font-bold mb-2 truncate ${isCurrentUser ? 'text-orange-400' : 'text-white'}">
            ${player.username}
            ${isCurrentUser ? ' 👤' : ''}
          </div>
          
          <!-- Value -->
          <div class="text-2xl font-bold mb-2" style="color: ${borderColor};">
            ${value}
          </div>
          
          <!-- Level -->
          <div class="text-sm text-gray-400">
            等級 ${player.level || 1}
          </div>
        </div>

        <!-- Podium Base -->
        <div class="mt-2 rounded-lg" 
             style="height: ${parseInt(heights[index]) * 0.3}px; background: linear-gradient(180deg, ${borderColor}80, ${borderColor}40);">
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
};

// Render rankings table
const renderRankingsTable = () => {
  const tbody = document.getElementById('rankings-tbody');
  if (!tbody) return;

  let html = '';

  rankings.forEach((player) => {
    const isCurrentUser = userData && player.id === userData.id;
    const value = categories[currentCategory].formatter(player.value);
    
    let rowStyle = '';
    let rankBadge = player.rank;
    let rankColor = 'text-gray-400';

    if (player.rank === 1) {
      rowStyle = 'bg-gradient-to-r from-yellow-500/20 to-transparent';
      rankBadge = '🥇';
      rankColor = 'text-yellow-500';
    } else if (player.rank === 2) {
      rowStyle = 'bg-gradient-to-r from-gray-400/20 to-transparent';
      rankBadge = '🥈';
      rankColor = 'text-gray-400';
    } else if (player.rank === 3) {
      rowStyle = 'bg-gradient-to-r from-orange-600/20 to-transparent';
      rankBadge = '🥉';
      rankColor = 'text-orange-600';
    }

    if (isCurrentUser) {
      rowStyle += ' ring-2 ring-orange-500 bg-orange-500/10';
    }

    html += `
      <tr class="border-b border-gray-700/50 hover:bg-white/5 transition-all duration-200 ${rowStyle}">
        <td class="px-6 py-4">
          <div class="flex items-center gap-2">
            <span class="text-xl font-bold ${rankColor}">${rankBadge}</span>
            ${player.rank > 3 ? `<span class="text-gray-500">#${player.rank}</span>` : ''}
          </div>
        </td>
        <td class="px-6 py-4">
          <div class="flex items-center gap-2">
            <span class="font-bold ${isCurrentUser ? 'text-orange-400' : 'text-white'}">
              ${player.username}
            </span>
            ${isCurrentUser ? '<span class="text-orange-400">👤</span>' : ''}
          </div>
        </td>
        <td class="px-6 py-4">
          <span class="text-xl font-bold ${player.rank <= 3 ? rankColor : 'text-white'}">
            ${value}
          </span>
        </td>
        <td class="px-6 py-4">
          <div class="flex items-center gap-2">
            <span class="text-yellow-400">${getLevelIcon(player.level)}</span>
            <span class="text-gray-300">Lv.${player.level || 1}</span>
          </div>
        </td>
        <td class="px-6 py-4">
          <span class="text-gray-400">${player.coins_created || 0} 個</span>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html || '<tr><td colspan="5" class="text-center py-8 text-gray-400">暫無數據</td></tr>';
};

// Render user stats card
const renderUserStats = (currentUser) => {
  if (!currentUser) {
    console.warn('No current user data for stats');
    return;
  }

  const value = categories[currentCategory].formatter(currentUser.value);

  document.getElementById('user-rank').textContent = `#${currentUser.rank}`;
  document.getElementById('user-stat-value').textContent = value;
  document.getElementById('user-stat-trades').textContent = currentUser.total_trades || currentUser.coins_created || '-';
  document.getElementById('user-stat-level').textContent = `Lv.${currentUser.level || 1}`;
};

// Get level icon
const getLevelIcon = (level) => {
  if (level >= 50) return '👑';
  if (level >= 30) return '💎';
  if (level >= 20) return '🏆';
  if (level >= 10) return '⭐';
  return '🌟';
};

// Setup category filters
const setupCategoryFilters = () => {
  const buttons = document.querySelectorAll('[data-category]');
  
  buttons.forEach(button => {
    button.addEventListener('click', async () => {
      const category = button.getAttribute('data-category');
      
      if (category === currentCategory) return;

      // Update active state
      buttons.forEach(btn => {
        btn.classList.remove('active', 'bg-orange-500', 'text-white');
        btn.classList.add('glass-effect', 'hover:bg-white/10');
      });
      
      button.classList.add('active', 'bg-orange-500', 'text-white');
      button.classList.remove('glass-effect', 'hover:bg-white/10');

      // Update category and reload
      currentCategory = category;
      await loadRankings();
    });
  });
};

// Show notification
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in ${
    type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  } text-white`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
};

// Auto refresh
const startAutoRefresh = () => {
  // Refresh every 30 seconds
  autoRefreshInterval = setInterval(async () => {
    console.log('🔄 Auto-refreshing rankings...');
    await loadRankings();
  }, 30000);
};

const stopAutoRefresh = () => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
};

// Handle logout
const handleLogout = () => {
  localStorage.removeItem('auth_token');
  window.location.href = '/login';
};

// Initialize
const init = async () => {
  console.log('Initializing leaderboard page...');
  
  userData = await checkAuth();
  
  if (userData) {
    console.log('User authenticated:', userData.username);
    updateUserBalance(userData.virtual_balance);
    
    await loadRankings();
    setupCategoryFilters();
    startAutoRefresh();
    
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    console.log('✅ Leaderboard page initialized');
  }
};

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  stopAutoRefresh();
});

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Add animation styles
if (!document.getElementById('leaderboard-animations')) {
  const style = document.createElement('style');
  style.id = 'leaderboard-animations';
  style.textContent = `
    @keyframes bounce-slow {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }
    .animate-bounce-slow {
      animation: bounce-slow 2s infinite;
    }
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `;
  document.head.appendChild(style);
}
