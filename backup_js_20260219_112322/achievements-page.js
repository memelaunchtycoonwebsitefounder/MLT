/**
 * Achievements Page JavaScript
 * Handles achievement display, filtering, and interactions
 */

let userData = null;
let achievements = [];
let currentFilter = 'all';

// Check authentication
const checkAuth = async () => {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    console.log('❌ No auth token found, redirecting to login');
    window.location.href = '/login?redirect=/achievements';
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
      window.location.href = '/login?redirect=/achievements';
      return null;
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    localStorage.removeItem('auth_token');
    window.location.href = '/login?redirect=/achievements';
    return null;
  }
};

// Load achievements
const loadAchievements = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get('/api/gamification/achievements', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.data.success) {
      achievements = response.data.data.achievements || [];
      renderAchievements();
      updateStats();
      document.getElementById('loading-state').classList.add('hidden');
      document.getElementById('achievements-content').classList.remove('hidden');
    }
  } catch (error) {
    console.error('Failed to load achievements:', error);
    showNotification('載入成就失敗: ' + (error.response?.data?.message || error.message), 'error');
  }
};

// Render achievements
const renderAchievements = () => {
  const container = document.getElementById('achievements-grid');
  container.innerHTML = '';

  // Group by category
  const categories = {
    trading: { name: '交易成就', icon: 'fa-chart-line', color: 'text-green-500', achievements: [] },
    creation: { name: '創作成就', icon: 'fa-rocket', color: 'text-blue-500', achievements: [] },
    social: { name: '社交成就', icon: 'fa-users', color: 'text-pink-500', achievements: [] },
    milestone: { name: '里程碑', icon: 'fa-trophy', color: 'text-yellow-500', achievements: [] }
  };

  // Filter achievements
  let filtered = achievements;
  if (currentFilter === 'unlocked') {
    filtered = achievements.filter(a => a.completed === 1);
  } else if (currentFilter === 'locked') {
    filtered = achievements.filter(a => a.completed !== 1);
  } else if (currentFilter !== 'all') {
    filtered = achievements.filter(a => a.category === currentFilter);
  }

  // Group filtered achievements
  filtered.forEach(ach => {
    const category = ach.category || 'milestone';
    if (categories[category]) {
      categories[category].achievements.push(ach);
    }
  });

  // Render each category
  Object.entries(categories).forEach(([key, category]) => {
    if (category.achievements.length === 0) return;

    const categorySection = document.createElement('div');
    categorySection.className = 'mb-8';
    categorySection.innerHTML = `
      <h2 class="text-3xl font-bold mb-6 flex items-center">
        <i class="fas ${category.icon} ${category.color} mr-3"></i>
        ${category.name}
        <span class="ml-3 text-lg text-gray-400">(${category.achievements.length})</span>
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="category-${key}"></div>
    `;
    container.appendChild(categorySection);

    const categoryGrid = document.getElementById(`category-${key}`);
    category.achievements.forEach(ach => {
      categoryGrid.appendChild(createAchievementCard(ach));
    });
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-center py-20">
        <i class="fas fa-search text-6xl text-gray-500 mb-4"></i>
        <p class="text-xl text-gray-400">沒有符合條件的成就</p>
      </div>
    `;
  }
};

// Create achievement card
const createAchievementCard = (achievement) => {
  const isUnlocked = achievement.completed === 1;
  const progress = achievement.user_progress || 0;
  const requirement = getRequirement(achievement);
  const progressPercent = Math.min((progress / requirement) * 100, 100);

  const card = document.createElement('div');
  card.className = `glass-effect rounded-xl p-6 transition-all duration-300 cursor-pointer ${
    isUnlocked 
      ? 'border-2 border-yellow-500 hover:shadow-2xl hover:shadow-yellow-500/50' 
      : 'opacity-70 hover:opacity-90'
  } hover:scale-105`;

  card.innerHTML = `
    <div class="flex items-start justify-between mb-4">
      <div class="text-6xl">${achievement.icon || '🏆'}</div>
      ${isUnlocked ? '<div class="text-3xl">✅</div>' : ''}
    </div>
    
    <h3 class="text-2xl font-bold mb-2">${achievement.name}</h3>
    <p class="text-gray-400 text-sm mb-4">${achievement.description}</p>
    
    ${!isUnlocked ? `
      <div class="mb-4">
        <div class="flex justify-between text-xs text-gray-400 mb-2">
          <span>進度</span>
          <span>${progress} / ${requirement}</span>
        </div>
        <div class="w-full h-3 bg-white/10 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-500" 
               style="width: ${progressPercent}%"></div>
        </div>
      </div>
    ` : `
      <div class="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
        <p class="text-yellow-300 text-sm font-bold text-center">
          <i class="fas fa-star mr-2"></i>已解鎖！
        </p>
      </div>
    `}
    
    <div class="flex items-center justify-between pt-4 border-t border-white/10">
      <span class="text-xs px-3 py-1 rounded-full ${getRarityColor(achievement.rarity)}">
        ${getRarityText(achievement.rarity)}
      </span>
      <span class="text-sm font-bold text-orange-500">
        <i class="fas fa-star mr-1"></i>+${achievement.points} XP
      </span>
    </div>
  `;

  card.addEventListener('click', () => showAchievementModal(achievement));

  return card;
};

// Get requirement value
const getRequirement = (achievement) => {
  if (achievement.requirement_value) return achievement.requirement_value;
  return 1;
};

// Get rarity color
const getRarityColor = (rarity) => {
  const colors = {
    common: 'bg-gray-500/30 text-gray-300',
    rare: 'bg-blue-500/30 text-blue-300',
    epic: 'bg-purple-500/30 text-purple-300',
    legendary: 'bg-yellow-500/30 text-yellow-300'
  };
  return colors[rarity || 'common'];
};

// Get rarity text
const getRarityText = (rarity) => {
  const text = {
    common: '普通',
    rare: '稀有',
    epic: '史詩',
    legendary: '傳奇'
  };
  return text[rarity || 'common'];
};

// Show achievement modal
const showAchievementModal = (achievement) => {
  const modal = document.getElementById('achievement-modal');
  const isUnlocked = achievement.completed === 1;

  document.getElementById('modal-icon').textContent = achievement.icon || '🏆';
  document.getElementById('modal-name').textContent = achievement.name;
  document.getElementById('modal-description').textContent = achievement.description;
  document.getElementById('modal-rarity').textContent = getRarityText(achievement.rarity);
  document.getElementById('modal-rarity').className = `px-4 py-2 rounded-full ${getRarityColor(achievement.rarity)}`;
  document.getElementById('modal-points').innerHTML = `<i class="fas fa-star mr-2"></i>+${achievement.points} XP`;

  if (isUnlocked && achievement.completed_at) {
    document.getElementById('modal-completed-time').classList.remove('hidden');
    document.getElementById('completed-at').textContent = new Date(achievement.completed_at).toLocaleString('zh-TW');
  } else {
    document.getElementById('modal-completed-time').classList.add('hidden');
  }

  modal.classList.remove('hidden');

  // Add confetti if unlocked
  if (isUnlocked) {
    createConfetti();
  }
};

// Close modal
window.closeModal = () => {
  document.getElementById('achievement-modal').classList.add('hidden');
};

// Create confetti effect
const createConfetti = () => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background-color: ${colors[Math.floor(Math.random() * colors.length)]};
      top: -10px;
      left: ${Math.random() * 100}%;
      opacity: ${Math.random()};
      animation: confetti-fall ${2 + Math.random() * 3}s linear forwards;
      z-index: 9999;
      border-radius: 2px;
    `;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 5000);
  }
};

// Update stats
const updateStats = () => {
  const total = achievements.length;
  const unlocked = achievements.filter(a => a.completed === 1).length;
  const points = achievements.filter(a => a.completed === 1).reduce((sum, a) => sum + (a.points || 0), 0);
  const completion = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  document.getElementById('total-achievements').textContent = total;
  document.getElementById('unlocked-achievements').textContent = unlocked;
  document.getElementById('total-points').textContent = points.toLocaleString();
  document.getElementById('completion-rate').textContent = `${completion}%`;
};

// Update level progress
const updateLevelProgress = () => {
  if (!userData) {
    console.error('❌ updateLevelProgress: userData is null');
    return;
  }

  const level = userData.level || 1;
  const currentXP = userData.xp || 0;
  const xpForNext = calculateXPForNextLevel(level);
  const progress = (currentXP / xpForNext) * 100;
  const remaining = xpForNext - currentXP;

  console.log('📊 Updating level progress:', {
    level,
    currentXP,
    xpForNext,
    progress: `${progress.toFixed(2)}%`,
    remaining
  });

  document.getElementById('user-level').textContent = level;
  document.getElementById('current-xp').textContent = currentXP.toLocaleString();
  document.getElementById('next-level-xp').textContent = xpForNext.toLocaleString();
  document.getElementById('xp-remaining').textContent = remaining.toLocaleString();
  document.getElementById('xp-progress-bar').style.width = `${progress}%`;
  document.getElementById('level-icon').textContent = getLevelIcon(level);
};

// Calculate XP for next level
const calculateXPForNextLevel = (level) => {
  return (level + 1) * (level + 1) * 100;
};

// Get level icon
const getLevelIcon = (level) => {
  if (level >= 50) return '👑';
  if (level >= 30) return '💎';
  if (level >= 20) return '🏆';
  if (level >= 10) return '⭐';
  return '🌟';
};

// Setup filter buttons
const setupFilters = () => {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      
      // Update active button
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active', 'bg-orange-500', 'text-white');
        b.classList.add('glass-effect');
      });
      btn.classList.remove('glass-effect');
      btn.classList.add('active', 'bg-orange-500', 'text-white');
      
      renderAchievements();
    });
  });
};

// Update user balance
const updateUserBalance = (balance) => {
  const balanceEl = document.getElementById('user-balance');
  if (balanceEl) {
    balanceEl.textContent = Number(balance || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
};

// Connect to achievement notifications via SSE
let achievementEventSource = null;

const connectToAchievementStream = () => {
  if (!userData) return;
  
  const userId = userData.id;
  achievementEventSource = new EventSource(`/api/realtime/achievements/${userId}`);
  
  achievementEventSource.addEventListener('connected', (e) => {
    console.log('✅ Achievement notifications connected');
  });
  
  achievementEventSource.addEventListener('achievement_unlocked', (e) => {
    const data = JSON.parse(e.data);
    console.log('🎉 Achievement unlocked:', data.achievement);
    
    // Show confetti animation
    launchConfetti();
    
    // Show achievement unlock notification
    showAchievementUnlockNotification(data.achievement);
    
    // Reload achievements to show updated state
    setTimeout(() => {
      loadAchievements();
    }, 3000);
  });
  
  achievementEventSource.addEventListener('xp_update', (e) => {
    const data = JSON.parse(e.data);
    console.log('⭐ XP updated:', data);
    
    // Update XP display
    if (userData) {
      userData.xp = data.xp;
      userData.level = data.level;
      updateLevelProgress();
    }
  });
  
  achievementEventSource.onerror = (error) => {
    console.error('SSE error:', error);
    achievementEventSource.close();
    
    // Reconnect after 5 seconds
    setTimeout(connectToAchievementStream, 5000);
  };
};

// Launch confetti animation (50 particles)
const launchConfetti = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
  const confettiContainer = document.createElement('div');
  confettiContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
  `;
  document.body.appendChild(confettiContainer);
  
  // Create 50 confetti pieces
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const animationDelay = Math.random() * 0.5;
    const animationDuration = 3 + Math.random() * 2;
    
    confetti.style.cssText = `
      position: absolute;
      left: ${left}%;
      top: -10px;
      width: 10px;
      height: 10px;
      background: ${color};
      opacity: 0.8;
      animation: confetti-fall ${animationDuration}s linear ${animationDelay}s forwards;
    `;
    
    confettiContainer.appendChild(confetti);
  }
  
  // Remove after animation completes
  setTimeout(() => {
    document.body.removeChild(confettiContainer);
  }, 5000);
};

// Show achievement unlock notification with details
const showAchievementUnlockNotification = (achievement) => {
  const notification = document.createElement('div');
  notification.className = 'fixed top-20 right-4 glass-effect rounded-2xl p-6 max-w-md animate-slide-in z-[10000]';
  notification.style.cssText = `
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    border: 2px solid rgba(255, 215, 0, 0.5);
  `;
  
  const rarityColors = {
    common: '#9CA3AF',
    rare: '#3B82F6',
    epic: '#A855F7',
    legendary: '#F59E0B'
  };
  
  const rarityColor = rarityColors[achievement.rarity] || '#9CA3AF';
  
  notification.innerHTML = `
    <div class="text-center">
      <div class="text-6xl mb-4">${achievement.icon || '🏆'}</div>
      <h3 class="text-2xl font-bold mb-2" style="color: ${rarityColor}">
        🎉 成就解鎖！
      </h3>
      <p class="text-xl font-bold mb-2">${achievement.name}</p>
      <p class="text-sm text-gray-300 mb-4">${achievement.description}</p>
      <div class="flex items-center justify-center space-x-4">
        <span class="px-3 py-1 rounded-full text-sm" style="background: ${rarityColor}20; color: ${rarityColor}">
          ${getRarityText(achievement.rarity)}
        </span>
        <span class="text-orange-500 font-bold">
          <i class="fas fa-star mr-1"></i>+${achievement.points} XP
        </span>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(400px)';
    notification.style.transition = 'all 0.5s ease-out';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 5000);
};

const handleLogout = () => {
  // Close SSE connection
  if (achievementEventSource) {
    achievementEventSource.close();
  }
  localStorage.removeItem('auth_token');
  window.location.href = '/login';
};

// Show notification
const showNotification = (message, type = 'info') => {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };
  
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl ${colors[type]} text-white font-medium animate-slide-in`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
};

// Initialize
const init = async () => {
  console.log('Initializing achievements page...');
  
  userData = await checkAuth();
  
  if (userData) {
    console.log('User authenticated:', userData.username);
    updateUserBalance(userData.virtual_balance);
    updateLevelProgress();
    
    await loadAchievements();
    setupFilters();
    
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Close modal on backdrop click
    document.getElementById('achievement-modal').addEventListener('click', (e) => {
      if (e.target.id === 'achievement-modal') {
        closeModal();
      }
    });
    
    // Connect to achievement notifications SSE
    connectToAchievementStream();
    
    console.log('✅ Achievements page initialized');
  }
};

// Add animation styles
if (!document.getElementById('achievement-animations')) {
  const style = document.createElement('style');
  style.id = 'achievement-animations';
  style.textContent = `
    @keyframes confetti-fall {
      to {
        transform: translateY(100vh) rotate(360deg);
      }
    }
    @keyframes bounce-in {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
    @keyframes slide-in {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-bounce-in {
      animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `;
  document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', init);
