/**
 * User Profile Page JavaScript
 * Complete user profile with edit, follow, achievements, and trade history
 */

class UserProfile {
  constructor() {
    this.userId = null;
    this.currentUser = null;
    this.profileData = null;
    this.isOwnProfile = false;
    this.init();
  }

  async init() {
    console.log('💼 Initializing User Profile');
    
    // Get user ID from URL
    const pathParts = window.location.pathname.split('/');
    this.userId = parseInt(pathParts[pathParts.length - 1]);
    
    if (!this.userId) {
      window.location.href = '/dashboard';
      return;
    }

    // Authenticate
    const token = localStorage.getItem('auth_token');
    if (!token) {
      window.location.href = `/login?redirect=/profile/${this.userId}`;
      return;
    }

    try {
      // Get current user
      const userResponse = await axios.get('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (userResponse.data.success) {
        this.currentUser = userResponse.data.data;
        console.log('✅ Current user:', this.currentUser.username);
        
        // Update navigation balances
        this.updateNavBalances();
        
        await this.loadProfile();
      }
    } catch (error) {
      console.error('Auth error:', error);
      localStorage.removeItem('auth_token');
      window.location.href = `/login?redirect=/profile/${this.userId}`;
    }
  }

  async loadProfile() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`/api/profile/${this.userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        this.profileData = response.data.data;
        this.isOwnProfile = response.data.data.isOwnProfile;
        console.log('✅ Profile loaded:', this.profileData.user.username);
        this.render();
      }
    } catch (error) {
      console.error('Load profile error:', error);
      document.getElementById('profile-content').innerHTML = `
        <div class="text-center py-12">
          <i class="fas fa-exclamation-circle text-6xl text-red-500 mb-4"></i>
          <h2 class="text-2xl font-bold mb-2">載入失敗</h2>
          <p class="text-gray-400 mb-4">無法載入用戶資料</p>
          <a href="/dashboard" class="btn-primary">返回主頁</a>
        </div>
      `;
    }
  }

  render() {
    const { user, stats, followStats, isFollowing } = this.profileData;
    
    document.getElementById('profile-content').innerHTML = `
      <!-- Profile Header -->
      <div class="glass-effect rounded-2xl overflow-hidden mb-6">
        <!-- Banner -->
        <div class="h-48 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 relative">
          ${user.banner_url ? `<img src="${user.banner_url}" class="w-full h-full object-cover">` : ''}
        </div>
        
        <!-- Profile Info -->
        <div class="relative px-6 pb-6">
          <!-- Avatar -->
          <div class="absolute -top-16 left-6">
            <div class="w-32 h-32 rounded-full border-4 border-gray-900 bg-gray-800 flex items-center justify-center overflow-hidden">
              ${user.avatar_url 
                ? `<img src="${user.avatar_url}" class="w-full h-full object-cover">`
                : `<i class="fas fa-user text-5xl text-gray-600"></i>`
              }
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-6 flex justify-end">
            <div class="space-x-3">
              ${this.isOwnProfile 
                ? `<button onclick="userProfile.showEditModal()" class="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-bold transition">
                    <i class="fas fa-edit mr-2"></i>編輯資料
                  </button>`
                : `<button 
                    onclick="userProfile.toggleFollow()" 
                    id="follow-btn"
                    class="px-6 py-2 ${isFollowing ? 'bg-gray-600 hover:bg-gray-700' : 'bg-orange-500 hover:bg-orange-600'} rounded-lg font-bold transition">
                    <i class="fas fa-${isFollowing ? 'user-minus' : 'user-plus'} mr-2"></i>
                    ${isFollowing ? '取消關注' : '關注'}
                  </button>`
              }
            </div>
          </div>

          <!-- User Info -->
          <div class="mt-6">
            <div class="flex items-center space-x-3 mb-2">
              <h1 class="text-3xl font-bold">${user.username}</h1>
              ${user.is_verified ? '<i class="fas fa-check-circle text-blue-500" title="已認證"></i>' : ''}
              ${user.is_premium ? '<i class="fas fa-crown text-yellow-500" title="高級會員"></i>' : ''}
            </div>
            
            <div class="flex items-center space-x-4 text-gray-400 mb-4">
              <span><i class="fas fa-trophy mr-2"></i>等級 ${user.level}</span>
              <span><i class="fas fa-star mr-2"></i>${user.xp} XP</span>
              ${user.location ? `<span><i class="fas fa-map-marker-alt mr-2"></i>${user.location}</span>` : ''}
            </div>

            ${user.bio ? `<p class="text-gray-300 mb-4">${user.bio}</p>` : ''}

            <!-- Social Links -->
            <div class="flex items-center space-x-4 mb-4">
              ${user.website ? `<a href="${user.website}" target="_blank" class="text-blue-400 hover:text-blue-300"><i class="fas fa-globe mr-1"></i>網站</a>` : ''}
              ${user.twitter_handle ? `<a href="https://twitter.com/${user.twitter_handle.replace('@', '')}" target="_blank" class="text-blue-400 hover:text-blue-300"><i class="fab fa-twitter mr-1"></i>${user.twitter_handle}</a>` : ''}
              ${user.discord_handle ? `<span class="text-purple-400"><i class="fab fa-discord mr-1"></i>${user.discord_handle}</span>` : ''}
            </div>

            <!-- Stats -->
            <div class="flex items-center space-x-6">
              <button onclick="userProfile.showFollowers()" class="hover:text-orange-500 transition">
                <span class="font-bold">${followStats.followers_count}</span>
                <span class="text-gray-400"> 粉絲</span>
              </button>
              <button onclick="userProfile.showFollowing()" class="hover:text-orange-500 transition">
                <span class="font-bold">${followStats.following_count}</span>
                <span class="text-gray-400"> 關注</span>
              </button>
              ${stats ? `
                <span>
                  <span class="font-bold">${stats.total_trades || 0}</span>
                  <span class="text-gray-400"> 交易</span>
                </span>
                <span>
                  <span class="font-bold">${stats.coins_created || 0}</span>
                  <span class="text-gray-400"> 創建</span>
                </span>
              ` : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- MLT Economy Stats (Only for own profile) -->
      ${this.isOwnProfile ? `
      <div class="grid md:grid-cols-3 gap-6 mb-6">
        <!-- MLT Balance Card -->
        <div class="glass-effect rounded-2xl p-6 bg-gradient-to-br from-orange-500/10 to-purple-500/10 border border-orange-500/20">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-white">MLT 餘額</h3>
            <img src="/static/mlt-token.png" class="w-12 h-12" alt="MLT" />
          </div>
          <p class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400 mb-2">
            ${Number(user.mlt_balance || 0).toLocaleString()}
          </p>
          <p class="text-sm text-gray-400">MemeLaunch Token</p>
        </div>

        <!-- MLT Earned Card -->
        <div class="glass-effect rounded-2xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-white">總賺取</h3>
            <i class="fas fa-arrow-up text-green-500 text-2xl"></i>
          </div>
          <p class="text-4xl font-bold text-green-400 mb-2">
            ${Number(user.total_mlt_earned || 0).toLocaleString()}
          </p>
          <p class="text-sm text-gray-400">MLT</p>
        </div>

        <!-- MLT Spent Card -->
        <div class="glass-effect rounded-2xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-white">總支出</h3>
            <i class="fas fa-arrow-down text-red-500 text-2xl"></i>
          </div>
          <p class="text-4xl font-bold text-red-400 mb-2">
            ${Number(user.total_mlt_spent || 0).toLocaleString()}
          </p>
          <p class="text-sm text-gray-400">MLT</p>
        </div>
      </div>
      ` : ''}

      <!-- Tabs -->
      <div class="glass-effect rounded-2xl mb-6">
        <div class="flex border-b border-white/10">
          <button onclick="userProfile.switchTab('trades')" id="tab-trades" class="tab-btn active px-6 py-4 font-bold transition">
            <i class="fas fa-exchange-alt mr-2"></i>交易記錄
          </button>
          <button onclick="userProfile.switchTab('achievements')" id="tab-achievements" class="tab-btn px-6 py-4 font-bold transition">
            <i class="fas fa-trophy mr-2"></i>成就
          </button>
          <button onclick="userProfile.switchTab('holdings')" id="tab-holdings" class="tab-btn px-6 py-4 font-bold transition">
            <i class="fas fa-coins mr-2"></i>持倉
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div id="tab-content" class="glass-effect rounded-2xl p-6 min-h-[400px]">
        <!-- Content will be loaded here -->
      </div>
    `;

    // Load default tab
    this.switchTab('trades');
    this.setupLogout();
  }

  async switchTab(tab) {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');

    // Load tab content
    const content = document.getElementById('tab-content');
    content.innerHTML = '<div class="text-center py-12"><i class="fas fa-spinner fa-spin text-4xl text-orange-500"></i></div>';

    switch(tab) {
      case 'trades':
        await this.loadTrades();
        break;
      case 'achievements':
        await this.loadAchievements();
        break;
      case 'holdings':
        await this.loadHoldings();
        break;
    }
  }

  async loadTrades() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`/api/profile/${this.userId}/trades?limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        const trades = response.data.data.trades;
        const content = document.getElementById('tab-content');

        if (trades.length === 0) {
          content.innerHTML = `
            <div class="text-center py-12">
              <i class="fas fa-exchange-alt text-6xl text-gray-600 mb-4"></i>
              <p class="text-xl text-gray-400">暫無交易記錄</p>
            </div>
          `;
          return;
        }

        content.innerHTML = `
          <div class="space-y-3">
            ${trades.map(trade => `
              <a href="/coin/${trade.coin_id}" class="block p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <img src="${trade.coin_image || '/static/default-coin.svg'}" 
                         class="w-12 h-12 rounded-full" 
                         onerror="this.src='/static/default-coin.svg'">
                    <div>
                      <div class="font-bold">${trade.coin_name} (${trade.coin_symbol})</div>
                      <div class="text-sm text-gray-400">${new Date(trade.timestamp).toLocaleString('zh-TW')}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-bold ${trade.action === 'buy' ? 'text-green-400' : 'text-red-400'}">
                      ${trade.action === 'buy' ? '買入' : '賣出'} ${parseFloat(trade.amount).toFixed(2)}
                    </div>
                    <div class="text-sm text-gray-400">
                      @ ${parseFloat(trade.price).toFixed(4)} = ${parseFloat(trade.total_value).toFixed(2)} 金幣
                    </div>
                  </div>
                </div>
              </a>
            `).join('')}
          </div>
        `;
      }
    } catch (error) {
      console.error('Load trades error:', error);
      document.getElementById('tab-content').innerHTML = `
        <div class="text-center py-12 text-red-400">載入失敗</div>
      `;
    }
  }

  async loadAchievements() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`/api/profile/${this.userId}/achievements`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        const { achievements, stats } = response.data.data;
        const content = document.getElementById('tab-content');

        content.innerHTML = `
          <!-- Achievement Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white/5 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-orange-500">${stats.total_unlocked}</div>
              <div class="text-sm text-gray-400">已解鎖</div>
            </div>
            <div class="bg-white/5 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-blue-500">${stats.total_available}</div>
              <div class="text-sm text-gray-400">總成就</div>
            </div>
            <div class="bg-white/5 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-green-500">${stats.total_xp_earned}</div>
              <div class="text-sm text-gray-400">獲得XP</div>
            </div>
            <div class="bg-white/5 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-purple-500">${stats.completion_rate}%</div>
              <div class="text-sm text-gray-400">完成度</div>
            </div>
          </div>

          ${achievements.length === 0 
            ? `<div class="text-center py-12">
                <i class="fas fa-trophy text-6xl text-gray-600 mb-4"></i>
                <p class="text-xl text-gray-400">還沒有解鎖任何成就</p>
                <p class="text-gray-500 mt-2">開始交易來解鎖成就吧！</p>
              </div>`
            : `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${achievements.map(ach => `
                  <div class="bg-white/5 rounded-lg p-4">
                    <div class="flex items-start space-x-4">
                      <div class="text-4xl">${ach.icon}</div>
                      <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-1">
                          <h3 class="font-bold">${ach.name}</h3>
                          <span class="text-xs px-2 py-1 rounded ${this.getRarityClass(ach.rarity)}">
                            ${ach.rarity}
                          </span>
                        </div>
                        <p class="text-sm text-gray-400 mb-2">${ach.description}</p>
                        <div class="flex items-center justify-between text-sm">
                          <span class="text-green-400">
                            <i class="fas fa-star mr-1"></i>+${ach.xp_reward} XP
                          </span>
                          <span class="text-gray-500">
                            ${new Date(ach.unlocked_at).toLocaleDateString('zh-TW')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>`
          }
        `;
      }
    } catch (error) {
      console.error('Load achievements error:', error);
      document.getElementById('tab-content').innerHTML = `
        <div class="text-center py-12 text-red-400">載入失敗</div>
      `;
    }
  }

  async loadHoldings() {
    document.getElementById('tab-content').innerHTML = `
      <div class="text-center py-12">
        <i class="fas fa-coins text-6xl text-gray-600 mb-4"></i>
        <p class="text-xl text-gray-400">持倉功能即將推出</p>
      </div>
    `;
  }

  getRarityClass(rarity) {
    const classes = {
      'common': 'bg-gray-600',
      'rare': 'bg-blue-600',
      'epic': 'bg-purple-600',
      'legendary': 'bg-orange-600'
    };
    return classes[rarity] || 'bg-gray-600';
  }

  async toggleFollow() {
    try {
      const token = localStorage.getItem('auth_token');
      const isFollowing = this.profileData.isFollowing;
      
      const response = await axios({
        method: isFollowing ? 'DELETE' : 'POST',
        url: `/api/profile/${this.userId}/follow`,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        this.profileData.isFollowing = !isFollowing;
        this.profileData.followStats.followers_count += isFollowing ? -1 : 1;
        this.render();
      }
    } catch (error) {
      console.error('Toggle follow error:', error);
      alert('操作失敗，請稍後再試');
    }
  }

  showEditModal() {
    const { user } = this.profileData;
    const modal = document.createElement('div');
    modal.id = 'edit-modal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="glass-effect rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold">編輯資料</h2>
          <button onclick="document.getElementById('edit-modal').remove()" class="text-gray-400 hover:text-white">
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>

        <form id="edit-form" class="space-y-4">
          <div>
            <label class="block text-sm font-bold mb-2">個人簡介</label>
            <textarea 
              id="edit-bio" 
              class="input w-full h-24 resize-none" 
              placeholder="介紹一下自己..."
              maxlength="500"
            >${user.bio || ''}</textarea>
            <div class="text-xs text-gray-400 text-right mt-1">
              <span id="bio-count">${(user.bio || '').length}</span> / 500
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold mb-2">所在地</label>
              <input type="text" id="edit-location" class="input w-full" value="${user.location || ''}" placeholder="例：Taiwan">
            </div>
            <div>
              <label class="block text-sm font-bold mb-2">個人網站</label>
              <input type="url" id="edit-website" class="input w-full" value="${user.website || ''}" placeholder="https://...">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold mb-2">Twitter</label>
              <input type="text" id="edit-twitter" class="input w-full" value="${user.twitter_handle || ''}" placeholder="@username">
            </div>
            <div>
              <label class="block text-sm font-bold mb-2">Discord</label>
              <input type="text" id="edit-discord" class="input w-full" value="${user.discord_handle || ''}" placeholder="username#1234">
            </div>
          </div>

          <div class="flex space-x-3 pt-4">
            <button type="submit" class="btn-primary flex-1">
              <i class="fas fa-save mr-2"></i>保存
            </button>
            <button type="button" onclick="document.getElementById('edit-modal').remove()" class="btn-secondary flex-1">
              取消
            </button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    // Character counter
    document.getElementById('edit-bio').addEventListener('input', (e) => {
      document.getElementById('bio-count').textContent = e.target.value.length;
    });

    // Form submit
    document.getElementById('edit-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.updateProfile();
    });
  }

  async updateProfile() {
    try {
      const token = localStorage.getItem('auth_token');
      const data = {
        bio: document.getElementById('edit-bio').value,
        location: document.getElementById('edit-location').value,
        website: document.getElementById('edit-website').value,
        twitter_handle: document.getElementById('edit-twitter').value,
        discord_handle: document.getElementById('edit-discord').value
      };

      const response = await axios.patch('/api/profile', data, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        document.getElementById('edit-modal').remove();
        await this.loadProfile();
      }
    } catch (error) {
      console.error('Update profile error:', error);
      alert('更新失敗，請稍後再試');
    }
  }

  async showFollowers() {
    // TODO: Implement followers modal
    alert('粉絲列表功能即將推出');
  }

  async showFollowing() {
    // TODO: Implement following modal
    alert('關注列表功能即將推出');
  }

  updateNavBalances() {
    // Update virtual balance
    const balanceEl = document.getElementById('user-balance');
    if (balanceEl && this.currentUser) {
      balanceEl.textContent = Number(this.currentUser.virtual_balance || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    
    // Update MLT balance
    const mltBalanceEl = document.getElementById('user-mlt-balance');
    if (mltBalanceEl && this.currentUser) {
      mltBalanceEl.textContent = Number(this.currentUser.mlt_balance || 0).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    }
  }

  setupLogout() {
    const logoutBtn = document.getElementById('logout-btn-dropdown');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      });
    }
    
    // Setup dropdown toggle
    const menuBtn = document.getElementById('user-menu-btn');
    const dropdown = document.getElementById('user-dropdown');
    const usernameDisplay = document.getElementById('username-display');
    
    if (menuBtn && dropdown) {
      // Set username in dropdown button
      if (this.currentUser && usernameDisplay) {
        usernameDisplay.textContent = this.currentUser.username;
      }
      
      // Toggle dropdown
      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!dropdown.classList.contains('hidden')) {
          if (!e.target.closest('#user-dropdown') && !e.target.closest('#user-menu-btn')) {
            dropdown.classList.add('hidden');
          }
        }
      });
    }
  }
}

// Global instance
let userProfile;

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    userProfile = new UserProfile();
  });
} else {
  userProfile = new UserProfile();
}
