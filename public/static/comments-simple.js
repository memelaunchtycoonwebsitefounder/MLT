/**
 * Simplified Comments System
 * Core functionality only
 */

class CommentsSystem {
  constructor(options) {
    this.coinId = options.coinId;
    this.containerId = options.containerId;
    this.userId = null;
    this.comments = [];
    
    console.log('💬 Initializing comments system for coin:', this.coinId);
    this.init();
  }
  
  async init() {
    try {
      // Get user info
      const token = localStorage.getItem('auth_token');
      if (!token) {
        this.renderLoginPrompt();
        return;
      }
      
      const userResponse = await axios.get('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (userResponse.data.success) {
        this.userId = userResponse.data.data.id;
        console.log('✅ User authenticated:', this.userId);
        await this.loadComments();
      } else {
        this.renderLoginPrompt();
      }
    } catch (error) {
      console.error('Init error:', error);
      this.renderError('載入失敗');
    }
  }
  
  async loadComments() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`/api/social/comments/${this.coinId}?userId=${this.userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Ensure comments is always an array
        const data = response.data.data;
        this.comments = Array.isArray(data) ? data : [];
        console.log(`✅ Loaded ${this.comments.length} comments`);
        this.render();
      } else {
        this.comments = [];
        this.renderError('載入評論失敗');
      }
    } catch (error) {
      console.error('Load comments error:', error);
      this.comments = [];
      this.renderError('載入評論失敗: ' + error.message);
    }
  }
  
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error('Container not found:', this.containerId);
      return;
    }
    
    container.innerHTML = `
      <div class="glass-effect rounded-2xl p-6 mt-8">
        <h2 class="text-2xl font-bold mb-6">
          <i class="fas fa-comments mr-2"></i>
          評論 (${this.comments.length})
        </h2>
        
        <!-- Comment Input -->
        <div class="mb-6">
          <textarea
            id="comment-input"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white resize-none"
            placeholder="發表您的評論..."
            rows="3"
            maxlength="1000"
          ></textarea>
          <div class="flex items-center justify-between mt-2">
            <span id="char-count" class="text-sm text-gray-400">0 / 1000</span>
            <button
              id="submit-comment-btn"
              class="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-bold transition"
            >
              <i class="fas fa-paper-plane mr-2"></i>
              發表
            </button>
          </div>
        </div>
        
        <!-- Sort Options -->
        <div class="flex space-x-2 mb-4">
          <button class="sort-btn active px-4 py-2 rounded-lg text-sm" data-sort="time">
            <i class="fas fa-clock mr-1"></i>最新
          </button>
          <button class="sort-btn px-4 py-2 rounded-lg text-sm" data-sort="hot">
            <i class="fas fa-fire mr-1"></i>熱門
          </button>
        </div>
        
        <!-- Comments List -->
        <div id="comments-list" class="space-y-4">
          ${this.comments.length === 0 ? this.renderEmptyState() : this.comments.map(c => this.renderComment(c)).join('')}
        </div>
      </div>
    `;
    
    this.setupEventListeners();
  }
  
  renderComment(comment) {
    const timeAgo = this.formatTime(comment.created_at);
    const levelIcon = this.getLevelIcon(comment.level || 1);
    const isOwner = comment.user_id === this.userId;
    const userLiked = comment.user_liked || false;
    
    return `
      <div class="glass-effect rounded-lg p-4 hover:bg-white/5 transition" data-comment-id="${comment.id}">
        <div class="flex items-start space-x-3">
          <a href="/profile/${comment.user_id}" class="flex-shrink-0 cursor-pointer hover:opacity-80 transition">
            <div class="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center">
              ${comment.avatar_url 
                ? `<img src="${comment.avatar_url}" class="w-full h-full rounded-full object-cover">`
                : levelIcon
              }
            </div>
          </a>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2 mb-2">
              <a href="/profile/${comment.user_id}" class="font-bold hover:text-orange-500 transition">
                ${this.escapeHtml(comment.username)}
              </a>
              <span class="px-2 py-0.5 bg-orange-500/20 text-orange-500 rounded text-xs">
                Lv.${comment.level || 1}
              </span>
              <span class="text-gray-400 text-sm">${timeAgo}</span>
              ${comment.edited_at ? '<span class="text-gray-500 text-xs">(已編輯)</span>' : ''}
              ${comment.pinned ? '<span class="text-yellow-500 text-sm"><i class="fas fa-thumbtack mr-1"></i>已釘選</span>' : ''}
            </div>
            
            <p class="text-gray-300 mb-3 whitespace-pre-wrap break-words">${this.escapeHtml(comment.content)}</p>
            
            <div class="flex items-center space-x-4 text-sm">
              <button class="like-btn flex items-center space-x-1 ${userLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 transition" data-id="${comment.id}">
                <i class="fas fa-heart"></i>
                <span>${comment.likes_count || 0}</span>
              </button>
              
              <button class="reply-btn text-gray-400 hover:text-orange-500 transition" data-id="${comment.id}" data-username="${this.escapeHtml(comment.username)}">
                <i class="fas fa-reply mr-1"></i>回覆
              </button>
              
              ${isOwner ? `
                <button class="edit-btn text-gray-400 hover:text-blue-500 transition" data-id="${comment.id}">
                  <i class="fas fa-edit mr-1"></i>編輯
                </button>
                <button class="delete-btn text-gray-400 hover:text-red-500 transition" data-id="${comment.id}">
                  <i class="fas fa-trash mr-1"></i>刪除
                </button>
              ` : `
                <button class="report-btn text-gray-400 hover:text-yellow-500 transition" data-id="${comment.id}">
                  <i class="fas fa-flag mr-1"></i>舉報
                </button>
              `}
            </div>
            
            <!-- Reply Input (Hidden by default) -->
            <div class="reply-input-container hidden mt-3">
              <textarea
                class="reply-input w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm resize-none"
                placeholder="輸入回覆..."
                rows="2"
                maxlength="1000"
              ></textarea>
              <div class="flex justify-end space-x-2 mt-2">
                <button class="cancel-reply-btn px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 rounded transition">取消</button>
                <button class="submit-reply-btn px-3 py-1 text-sm bg-orange-500 hover:bg-orange-600 rounded transition" data-parent-id="${comment.id}">發表回覆</button>
              </div>
            </div>
            
            <!-- Replies -->
            ${comment.replies && comment.replies.length > 0 ? `
              <div class="mt-4 ml-4 border-l-2 border-white/10 pl-4 space-y-3">
                ${comment.replies.map(r => this.renderReply(r)).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
  
  renderReply(reply) {
    const timeAgo = this.formatTime(reply.created_at);
    const levelIcon = this.getLevelIcon(reply.level || 1);
    const isOwner = reply.user_id === this.userId;
    const userLiked = reply.user_liked || false;
    
    return `
      <div class="flex items-start space-x-2" data-comment-id="${reply.id}">
        <a href="/profile/${reply.user_id}" class="flex-shrink-0 cursor-pointer hover:opacity-80 transition">
          <div class="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-sm">
            ${reply.avatar_url 
              ? `<img src="${reply.avatar_url}" class="w-full h-full rounded-full object-cover">`
              : levelIcon
            }
          </div>
        </a>
        
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2 mb-1">
            <a href="/profile/${reply.user_id}" class="font-bold text-sm hover:text-orange-500 transition">
              ${this.escapeHtml(reply.username)}
            </a>
            <span class="px-2 py-0.5 bg-orange-500/20 text-orange-500 rounded text-xs">Lv.${reply.level || 1}</span>
            <span class="text-gray-400 text-xs">${timeAgo}</span>
          </div>
          
          <p class="text-gray-300 text-sm mb-2 whitespace-pre-wrap break-words">${this.escapeHtml(reply.content)}</p>
          
          <div class="flex items-center space-x-3 text-xs">
            <button class="like-btn flex items-center space-x-1 ${userLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 transition" data-id="${reply.id}">
              <i class="fas fa-heart"></i>
              <span>${reply.likes_count || 0}</span>
            </button>
            
            ${isOwner ? `
              <button class="delete-btn text-gray-400 hover:text-red-500 transition" data-id="${reply.id}">
                <i class="fas fa-trash mr-1"></i>刪除
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
  
  renderEmptyState() {
    return `
      <div class="text-center py-12">
        <i class="fas fa-comments text-6xl text-gray-600 mb-4"></i>
        <p class="text-gray-400">還沒有評論，成為第一個發表評論的人吧！</p>
      </div>
    `;
  }
  
  renderLoginPrompt() {
    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = `
        <div class="glass-effect rounded-2xl p-12 text-center">
          <i class="fas fa-sign-in-alt text-6xl text-orange-500 mb-4"></i>
          <p class="text-xl text-gray-300 mb-6">登入後即可查看和發表評論</p>
          <a href="/login?redirect=/coin/${this.coinId}" class="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-bold transition">
            立即登入
          </a>
        </div>
      `;
    }
  }
  
  renderError(message) {
    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = `
        <div class="glass-effect rounded-2xl p-12 text-center">
          <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
          <p class="text-xl text-gray-400">${message}</p>
          <button onclick="location.reload()" class="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-bold transition">
            重新載入
          </button>
        </div>
      `;
    }
  }
  
  setupEventListeners() {
    // Character count
    const input = document.getElementById('comment-input');
    const charCount = document.getElementById('char-count');
    if (input && charCount) {
      input.addEventListener('input', () => {
        charCount.textContent = `${input.value.length} / 1000`;
      });
    }
    
    // Submit comment
    const submitBtn = document.getElementById('submit-comment-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitComment());
    }
    
    // Like buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        this.toggleLike(id, btn);
      });
    });
    
    // Reply buttons
    document.querySelectorAll('.reply-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const container = btn.closest('[data-comment-id]');
        const replyContainer = container.querySelector('.reply-input-container');
        if (replyContainer) {
          replyContainer.classList.toggle('hidden');
        }
      });
    });
    
    // Cancel reply buttons
    document.querySelectorAll('.cancel-reply-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const container = btn.closest('.reply-input-container');
        if (container) {
          container.classList.add('hidden');
          container.querySelector('.reply-input').value = '';
        }
      });
    });
    
    // Submit reply buttons
    document.querySelectorAll('.submit-reply-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const parentId = btn.dataset.parentId;
        const container = btn.closest('.reply-input-container');
        const input = container.querySelector('.reply-input');
        this.submitReply(parentId, input.value, container);
      });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        this.deleteComment(id);
      });
    });
  }
  
  async submitComment() {
    const input = document.getElementById('comment-input');
    const content = input.value.trim();
    
    if (!content) {
      alert('請輸入評論內容');
      return;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post('/api/social/comments', {
        coinId: this.coinId,
        content: content
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        input.value = '';
        document.getElementById('char-count').textContent = '0 / 1000';
        await this.loadComments();
        this.showSuccess('評論發表成功！');
      }
    } catch (error) {
      console.error('Submit comment error:', error);
      alert('發表失敗：' + (error.response?.data?.message || error.message));
    }
  }
  
  async submitReply(parentId, content, container) {
    if (!content.trim()) {
      alert('請輸入回覆內容');
      return;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post('/api/social/comments', {
        coinId: this.coinId,
        content: content.trim(),
        parentId: parseInt(parentId)
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        container.querySelector('.reply-input').value = '';
        container.classList.add('hidden');
        await this.loadComments();
        this.showSuccess('回覆發表成功！');
      }
    } catch (error) {
      console.error('Submit reply error:', error);
      alert('回覆失敗：' + (error.response?.data?.message || error.message));
    }
  }
  
  async toggleLike(commentId, btn) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(`/api/social/comments/${commentId}/like`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const liked = response.data.data.liked;
        const icon = btn.querySelector('i');
        const count = btn.querySelector('span');
        
        if (liked) {
          btn.classList.add('text-red-500');
          btn.classList.remove('text-gray-400');
          count.textContent = parseInt(count.textContent) + 1;
          icon.classList.add('animate-bounce');
          setTimeout(() => icon.classList.remove('animate-bounce'), 500);
        } else {
          btn.classList.remove('text-red-500');
          btn.classList.add('text-gray-400');
          count.textContent = parseInt(count.textContent) - 1;
        }
      }
    } catch (error) {
      console.error('Toggle like error:', error);
      alert('操作失敗');
    }
  }
  
  async deleteComment(commentId) {
    if (!confirm('確定要刪除這條評論嗎？')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.delete(`/api/social/comments/${commentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        await this.loadComments();
        this.showSuccess('評論已刪除');
      }
    } catch (error) {
      console.error('Delete comment error:', error);
      alert('刪除失敗');
    }
  }
  
  showSuccess(message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg z-50 animate-fade-in';
    toast.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
  
  formatTime(timestamp) {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return '剛剛';
    if (minutes < 60) return `${minutes} 分鐘前`;
    if (hours < 24) return `${hours} 小時前`;
    if (days < 7) return `${days} 天前`;
    return new Date(timestamp).toLocaleDateString('zh-TW');
  }
  
  getLevelIcon(level) {
    if (level >= 50) return '👑';
    if (level >= 30) return '💎';
    if (level >= 20) return '🏆';
    if (level >= 10) return '⭐';
    return '🌟';
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export to window
window.CommentsSystem = CommentsSystem;
