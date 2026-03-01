/**
 * Gamification UI JavaScript
 * Handles achievements, levels, XP, and gamification features
 */

class GamificationUI {
  constructor() {
    this.achievements = [];
    this.userAchievements = [];
    this.level = 1;
    this.xp = 0;
    this.xpForNextLevel = 0;
    this.init();
  }

  async init() {
    await this.loadAchievements();
    this.setupEventListeners();
  }

  async loadAchievements() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetchUtils.get('/api/gamification/achievements', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        this.achievements = response.data.data.achievements;
        this.renderAchievements();
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
  }

  renderAchievements() {
    const container = document.getElementById('achievements-grid');
    if (!container) return;

    container.innerHTML = '';

    // Group by category
    const categories = {
      trading: { name: 'Trading Achievement', icon: 'fa-chart-line', achievements: [] },
      creation: { name: 'Creator Achievement', icon: 'fa-rocket', achievements: [] },
      social: { name: '社交achievement', icon: 'fa-users', achievements: [] },
      milestone: { name: 'Milestone', icon: 'fa-trophy', achievements: [] }
    };

    this.achievements.forEach(ach => {
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
        <h3 class="text-2xl font-bold mb-4 flex items-center">
          <i class="fas ${category.icon} text-orange-500 mr-3"></i>
          ${category.name}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="category-${key}"></div>
      `;
      container.appendChild(categorySection);

      const categoryGrid = document.getElementById(`category-${key}`);
      category.achievements.forEach(ach => {
        categoryGrid.appendChild(this.createAchievementCard(ach));
      });
    });
  }

  createAchievementCard(achievement) {
    const isUnlocked = achievement.completed === 1;
    const progress = achievement.user_progress || 0;
    const requirement = this.getRequirementText(achievement);

    const card = document.createElement('div');
    card.className = `glass-effect rounded-xl p-6 transition-all duration-300 ${
      isUnlocked 
        ? 'border-2 border-yellow-500 hover:shadow-2xl hover:shadow-yellow-500/50' 
        : 'opacity-60 hover:opacity-80'
    } hover:scale-105 cursor-pointer`;

    card.innerHTML = `
      <div class="flex items-start justify-between mb-4">
        <div class="text-5xl">${achievement.icon_emoji || '🏆'}</div>
        ${isUnlocked ? '<i class="fas fa-check-circle text-yellow-500 text-2xl"></i>' : ''}
      </div>
      <h4 class="text-xl font-bold mb-2">${achievement.name}</h4>
      <p class="text-gray-400 text-sm mb-4">${achievement.description}</p>
      
      ${!isUnlocked ? `
        <div class="mb-3">
          <div class="flex justify-between text-xs text-gray-400 mb-1">
            <span>進度</span>
            <span>${progress}/${requirement}</span>
          </div>
          <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-orange-500 to-yellow-500" 
                 style="width: ${Math.min((progress / requirement) * 100, 100)}%"></div>
          </div>
        </div>
      ` : `
        <p class="text-yellow-500 text-sm font-bold">
          <i class="fas fa-star mr-1"></i>已解鎖！
        </p>
      `}
      
      <div class="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <span class="text-xs px-2 py-1 rounded-full ${this.getRarityColor(achievement.rarity)}">
          ${this.getRarityText(achievement.rarity)}
        </span>
        <span class="text-sm font-bold text-orange-500">+${achievement.points} XP</span>
      </div>
    `;

    if (isUnlocked) {
      card.addEventListener('click', () => this.showAchievementDetails(achievement));
    }

    return card;
  }

  getRequirementText(achievement) {
    const req = achievement.requirement;
    if (typeof req === 'string') {
      try {
        const parsed = JSON.parse(req);
        return Object.values(parsed)[0] || 1;
      } catch {
        return 1;
      }
    }
    return 1;
  }

  getRarityColor(rarity) {
    const colors = {
      common: 'bg-gray-500/30 text-gray-300',
      rare: 'bg-blue-500/30 text-blue-300',
      epic: 'bg-purple-500/30 text-purple-300',
      legendary: 'bg-yellow-500/30 text-yellow-300'
    };
    return colors[rarity] || colors.common;
  }

  getRarityText(rarity) {
    const text = {
      common: 'Common',
      rare: '稀有',
      epic: '史詩',
      legendary: '傳奇'
    };
    return text[rarity] || 'Common';
  }

  showAchievementDetails(achievement) {
    // Show modal with achievement details
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70';
    modal.innerHTML = `
      <div class="glass-effect rounded-2xl p-8 max-w-md w-full animate-bounce-in">
        <div class="text-center">
          <div class="text-8xl mb-6">${achievement.icon_emoji || '🏆'}</div>
          <h2 class="text-3xl font-bold mb-4">${achievement.name}</h2>
          <p class="text-gray-300 mb-6">${achievement.description}</p>
          <div class="flex items-center justify-center space-x-4 mb-6">
            <span class="px-4 py-2 rounded-full ${this.getRarityColor(achievement.rarity)}">
              ${this.getRarityText(achievement.rarity)}
            </span>
            <span class="text-xl font-bold text-orange-500">
              <i class="fas fa-star mr-2"></i>+${achievement.points} XP
            </span>
          </div>
          ${achievement.completed_at ? `
            <p class="text-sm text-gray-400 mb-4">
              解鎖時間: ${new Date(achievement.completed_at).toLocaleString('zh-TW')}
            </p>
          ` : ''}
          <button class="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-lg font-bold transition" onclick="this.closest('.fixed').remove()">
            太棒了！
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  setupEventListeners() {
    // Filter achievements
    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        this.filterAchievements(filter);
        
        // Update active button
        document.querySelectorAll('[data-filter]').forEach(b => {
          b.classList.remove('active', 'bg-orange-500', 'text-white');
          b.classList.add('glass-effect', 'text-gray-300');
        });
        btn.classList.remove('glass-effect', 'text-gray-300');
        btn.classList.add('active', 'bg-orange-500', 'text-white');
      });
    });
  }

  filterAchievements(filter) {
    const container = document.getElementById('achievements-grid');
    if (!container) return;

    if (filter === 'all') {
      this.renderAchievements();
      return;
    }

    if (filter === 'unlocked') {
      const unlocked = this.achievements.filter(a => a.completed === 1);
      this.renderFilteredAchievements(unlocked, '已解鎖achievement');
    } else if (filter === 'locked') {
      const locked = this.achievements.filter(a => a.completed !== 1);
      this.renderFilteredAchievements(locked, '未解鎖achievement');
    } else {
      // Filter by category
      const filtered = this.achievements.filter(a => a.category === filter);
      const categoryNames = {
        trading: 'Trading Achievement',
        creation: 'Creator Achievement',
        social: '社交achievement',
        milestone: 'Milestone'
      };
      this.renderFilteredAchievements(filtered, categoryNames[filter] || 'achievement');
    }
  }

  renderFilteredAchievements(achievements, title) {
    const container = document.getElementById('achievements-grid');
    container.innerHTML = `
      <div class="col-span-full mb-4">
        <h3 class="text-2xl font-bold">${title} (${achievements.length})</h3>
      </div>
    `;

    const grid = document.createElement('div');
    grid.className = 'col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
    achievements.forEach(ach => {
      grid.appendChild(this.createAchievementCard(ach));
    });
    container.appendChild(grid);
  }

  showAchievementUnlock(achievement) {
    // Create full-screen unlock animation
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/90';
    overlay.innerHTML = `
      <div class="text-center animate-scale-in">
        <div class="mb-6">
          <div class="text-9xl animate-bounce">${achievement.icon_emoji || '🏆'}</div>
        </div>
        <h2 class="text-6xl font-bold mb-4 gradient-text animate-pulse">Achievement Unlocked！</h2>
        <h3 class="text-4xl font-bold mb-4">${achievement.name}</h3>
        <p class="text-xl text-gray-300 mb-8">${achievement.description}</p>
        <div class="text-3xl font-bold text-orange-500 mb-8">
          <i class="fas fa-star mr-2"></i>+${achievement.points} XP
        </div>
        <button class="px-12 py-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-xl font-bold text-xl transition transform hover:scale-105" 
                onclick="this.closest('.fixed').remove()">
          太棒了！
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    // Create confetti effect
    this.createConfetti();

    // Auto-dismiss after 10 seconds
    setTimeout(() => overlay.remove(), 10000);
  }

  createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
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
      `;
      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 5000);
    }
  }
}

// Level Progress Display
class LevelProgress {
  constructor(userData) {
    this.userData = userData;
    this.render();
  }

  render() {
    const container = document.getElementById('level-progress');
    if (!container) return;

    const level = this.userData.level || 1;
    const currentXP = this.userData.xp || 0;
    const xpForNext = this.calculateXPForNextLevel(level);
    const progress = (currentXP / xpForNext) * 100;

    container.innerHTML = `
      <div class="glass-effect rounded-2xl p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-2xl font-bold">等Level ${level}</h3>
            <p class="text-gray-400">${currentXP.toLocaleString()} / ${xpForNext.toLocaleString()} XP</p>
          </div>
          <div class="text-5xl">
            ${this.getLevelIcon(level)}
          </div>
        </div>
        <div class="w-full h-4 bg-white/10 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 transition-all duration-500" 
               style="width: ${progress}%"></div>
        </div>
        <p class="text-sm text-gray-400 mt-2">還需 ${(xpForNext - currentXP).toLocaleString()} XP 升到下一Level</p>
      </div>
    `;
  }

  calculateXPForNextLevel(level) {
    return (level + 1) * (level + 1) * 100;
  }

  getLevelIcon(level) {
    if (level >= 50) return '👑';
    if (level >= 30) return '💎';
    if (level >= 20) return '🏆';
    if (level >= 10) return '⭐';
    return '🌟';
  }
}

// Export
window.GamificationUI = GamificationUI;
window.LevelProgress = LevelProgress;

// Add confetti animation styles
if (!document.getElementById('confetti-styles')) {
  const style = document.createElement('style');
  style.id = 'confetti-styles';
  style.textContent = `
    @keyframes confetti-fall {
      to {
        transform: translateY(100vh) rotate(360deg);
      }
    }
    @keyframes scale-in {
      from {
        transform: scale(0);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
    @keyframes bounce-in {
      0% { transform: scale(0); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    .animate-scale-in {
      animation: scale-in 0.5s ease-out;
    }
    .animate-bounce-in {
      animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
  `;
  document.head.appendChild(style);
}
