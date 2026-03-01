/**
 * Leaderboard UI JavaScript
 * Displays rankings and competitive features
 */

class LeaderboardUI {
  constructor() {
    this.currentCategory = 'networth';
    this.leaderboardData = [];
    this.myRank = null;
    this.init();
  }

  async init() {
    await this.loadLeaderboard(this.currentCategory);
    this.setupEventListeners();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
      this.loadLeaderboard(this.currentCategory, false);
    }, 30000);
  }

  async loadLeaderboard(category, showLoading = true) {
    try {
      if (showLoading) {
        this.showLoading();
      }

      const response = await fetchUtils.get(`/api/gamification/leaderboard?type=${category}&limit=100`);

      if (response.data.success) {
        this.leaderboardData = response.data.data.leaderboard;
        this.renderLeaderboard();
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      this.showError();
    }
  }

  setupEventListeners() {
    // Category tabs
    document.querySelectorAll('[data-category]').forEach(tab => {
      tab.addEventListener('click', () => {
        const category = tab.dataset.category;
        this.switchCategory(category);
        
        // Update active tab
        document.querySelectorAll('[data-category]').forEach(t => {
          t.classList.remove('active', 'bg-orange-500', 'text-white');
          t.classList.add('glass-effect', 'text-gray-300');
        });
        tab.classList.remove('glass-effect', 'text-gray-300');
        tab.classList.add('active', 'bg-orange-500', 'text-white');
      });
    });
  }

  switchCategory(category) {
    this.currentCategory = category;
    this.loadLeaderboard(category);
  }

  showLoading() {
    const container = document.getElementById('leaderboard-container');
    if (container) {
      container.innerHTML = `
        <div class="text-center py-20">
          <i class="fas fa-spinner fa-spin text-6xl text-orange-500 mb-4"></i>
          <p class="text-xl text-gray-400">Loading leaderboard...</p>
        </div>
      `;
    }
  }

  showError() {
    const container = document.getElementById('leaderboard-container');
    if (container) {
      container.innerHTML = `
        <div class="text-center py-20">
          <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
          <p class="text-xl text-gray-400">Load failed, please try again later</p>
        </div>
      `;
    }
  }

  renderLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    if (!container) return;

    if (this.leaderboardData.length === 0) {
      container.innerHTML = `
        <div class="text-center py-20">
          <i class="fas fa-inbox text-6xl text-gray-500 mb-4"></i>
          <p class="text-xl text-gray-400">No leaderboard data</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';

    // Top 3 podium
    if (this.leaderboardData.length >= 3) {
      const podium = this.createPodium(this.leaderboardData.slice(0, 3));
      container.appendChild(podium);
    }

    // Rest of the leaderboard
    const table = this.createLeaderboardTable(this.leaderboardData);
    container.appendChild(table);
  }

  createPodium(top3) {
    const podiumDiv = document.createElement('div');
    podiumDiv.className = 'mb-12';

    // Reorder: 2nd, 1st, 3rd
    const reordered = [top3[1], top3[0], top3[2]];
    const heights = ['h-48', 'h-64', 'h-40'];
    const medals = ['🥈', '🥇', '🥉'];
    const colors = [
      'from-gray-400 to-gray-600',
      'from-yellow-400 to-yellow-600',
      'from-orange-400 to-orange-600'
    ];

    podiumDiv.innerHTML = `
      <div class="flex items-end justify-center gap-8 mb-8">
        ${reordered.map((user, index) => {
          if (!user) return '';
          const actualRank = index === 1 ? 1 : index === 0 ? 2 : 3;
          return `
            <div class="flex flex-col items-center">
              <div class="text-6xl mb-2">${medals[index]}</div>
              <div class="w-32 text-center mb-4">
                <div class="text-xl font-bold mb-1">${user.username}</div>
                <div class="text-3xl font-bold gradient-text">#${actualRank}</div>
                <div class="text-sm text-gray-400 mt-1">${this.formatScore(user)}</div>
              </div>
              <div class="w-32 ${heights[index]} bg-gradient-to-b ${colors[index]} rounded-t-xl flex items-center justify-center">
                <div class="text-white text-4xl font-bold">${actualRank}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    return podiumDiv;
  }

  createLeaderboardTable(data) {
    const tableDiv = document.createElement('div');
    tableDiv.className = 'glass-effect rounded-2xl overflow-hidden';

    const currentUserId = this.getCurrentUserId();

    tableDiv.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-white/5">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-bold uppercase">Rank</th>
              <th class="px-6 py-4 text-left text-sm font-bold uppercase">User</th>
              <th class="px-6 py-4 text-right text-sm font-bold uppercase">${this.getCategoryLabel()}</th>
              <th class="px-6 py-4 text-center text-sm font-bold uppercase">Level</th>
              <th class="px-6 py-4 text-center text-sm font-bold uppercase">Achievements</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((user, index) => {
              const rank = index + 1;
              const isCurrentUser = user.id === currentUserId;
              return `
                <tr class="border-t border-white/10 hover:bg-white/5 transition ${
                  isCurrentUser ? 'bg-orange-500/20' : ''
                }">
                  <td class="px-6 py-4">
                    <div class="flex items-center">
                      ${this.getRankBadge(rank)}
                      <span class="ml-2 font-bold">#${rank}</span>
                      ${isCurrentUser ? '<span class="ml-2 text-xs px-2 py-1 bg-orange-500 rounded-full">You</span>' : ''}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        ${user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div class="font-bold">${user.username}</div>
                        <div class="text-xs text-gray-400">
                          <i class="fas fa-user-friends mr-1"></i>${user.followers_count || 0} Followers
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="text-xl font-bold gradient-text">
                      ${this.formatScore(user)}
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <div class="inline-flex items-center px-3 py-1 bg-white/10 rounded-full">
                      <span class="text-2xl mr-1">${this.getLevelIcon(user.level || 1)}</span>
                      <span class="font-bold">Lv.${user.level || 1}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <div class="text-yellow-500 font-bold">
                      <i class="fas fa-trophy mr-1"></i>${user.achievements_count || 0}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    return tableDiv;
  }

  getRankBadge(rank) {
    if (rank === 1) return '<span class="text-3xl">🥇</span>';
    if (rank === 2) return '<span class="text-3xl">🥈</span>';
    if (rank === 3) return '<span class="text-3xl">🥉</span>';
    if (rank <= 10) return '<i class="fas fa-star text-yellow-500 text-xl"></i>';
    return '';
  }

  getLevelIcon(level) {
    if (level >= 50) return '👑';
    if (level >= 30) return '💎';
    if (level >= 20) return '🏆';
    if (level >= 10) return '⭐';
    return '🌟';
  }

  getCategoryLabel() {
    const labels = {
      networth: 'Net Worth',
      trades: 'Trades',
      level: 'Experience',
      profit: 'Total Profit'
    };
    return labels[this.currentCategory] || 'Score';
  }

  formatScore(user) {
    switch (this.currentCategory) {
      case 'networth':
        return `$${(user.total_networth || 0).toLocaleString()}`;
      case 'trades':
        return `${(user.total_trades || 0).toLocaleString()}  coins`;
      case 'level':
        return `${(user.xp || 0).toLocaleString()} XP`;
      case 'profit':
        return `$${(user.total_profit || 0).toLocaleString()}`;
      default:
        return user.total_networth || 0;
    }
  }

  getCurrentUserId() {
    // Try to get from stored user data
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch {}
    return null;
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('leaderboard-container')) {
    window.leaderboardUI = new LeaderboardUI();
  }
});

// Export
window.LeaderboardUI = LeaderboardUI;

// Language switcher support
if (typeof i18n !== 'undefined' && i18n.onLocaleChange) {
    i18n.onLocaleChange(() => {
        location.reload();
    });
}
