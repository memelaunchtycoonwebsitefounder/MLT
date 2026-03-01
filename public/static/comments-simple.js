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
      
      const userResponse = await fetchUtils.get('/api/auth/me', {
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
      this.renderError((typeof i18n !== "undefined" ? " + i18n.t("coinDetail.loadFailed") + " : "Load failed"));
    }
  }
  
  async loadComments() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetchUtils.get(`/api/social/comments/${this.coinId}?userId=${this.userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // API returns { success: true, data: { comments: [...] } }
        const data = response.data.data;
        this.comments = Array.isArray(data?.comments) ? data.comments : (Array.isArray(data) ? data : []);
        console.log(`✅ Loaded ${this.comments.length} comments`);
        this.render();
      } else {
        this.comments = [];
        this.renderError((typeof i18n !== "undefined" ? " + i18n.t("coinDetail.loadCommentsFailed") + " : "Failed to load comments"));
      }
    } catch (error) {
      console.error('Load comments error:', error);
      this.comments = [];
      this.renderError('Failed to load comments: ' + error.message);
    }
  }
  
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error('Container not found:', this.containerId);
      return;
    }
    
    // Get i18n strings first to avoid template literal issues
    const commentsTitle = typeof i18n !== "undefined" ? i18n.t("coinDetail.comments") : "Comments";
    const writePlaceholder = typeof i18n !== "undefined" ? i18n.t("coinDetail.writeComment") : "Write your comment...";
    const postText = typeof i18n !== "undefined" ? i18n.t("coinDetail.post") : "Post";
    const latestText = typeof i18n !== "undefined" ? i18n.t("coinDetail.latest") : "Latest";
    const popularText = typeof i18n !== "undefined" ? i18n.t("coinDetail.popular") : "Popular";
    
    container.innerHTML = `
      <div class="glass-effect rounded-2xl p-6 mt-8">
        <h2 class="text-2xl font-bold mb-6">
          <i class="fas fa-comments mr-2"></i>
          ${commentsTitle} (${this.comments.length})
        </h2>
        
        <!-- Comment Input -->
        <div class="mb-6">
          <textarea
            id="comment-input"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white resize-none"
            placeholder="${writePlaceholder}"
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
              ${postText}
            </button>
          </div>
        </div>
        
        <!-- Sort Options -->
        <div class="flex space-x-2 mb-4">
          <button class="sort-btn active px-4 py-2 rounded-lg text-sm" data-sort="time">
            <i class="fas fa-clock mr-1"></i>${latestText}
          </button>
          <button class="sort-btn px-4 py-2 rounded-lg text-sm" data-sort="hot">
            <i class="fas fa-fire mr-1"></i>${popularText}
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
              ${comment.edited_at ? '<span class="text-gray-500 text-xs">(Edited)</span>' : ''}
              ${comment.pinned ? '<span class="text-yellow-500 text-sm"><i class="fas fa-thumbtack mr-1"></i>Pinned</span>' : ''}
            </div>
            
            <p class="comment-content text-gray-300 mb-3 whitespace-pre-wrap break-words">${this.escapeHtml(comment.content)}</p>
            
            <div class="flex items-center space-x-4 text-sm">
              <button class="like-btn flex items-center space-x-1 ${userLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 transition" data-id="${comment.id}">
                <i class="fas fa-heart"></i>
                <span>${comment.likes_count || 0}</span>
              </button>
              
              <button class="reply-btn text-gray-400 hover:text-orange-500 transition" data-id="${comment.id}" data-username="${this.escapeHtml(comment.username)}">
                <i class="fas fa-reply mr-1"></i>Reply
              </button>
              
              ${isOwner ? `
                <button class="edit-btn text-gray-400 hover:text-blue-500 transition" data-id="${comment.id}">
                  <i class="fas fa-edit mr-1"></i>Edit
                </button>
                <button class="delete-btn text-gray-400 hover:text-red-500 transition" data-id="${comment.id}">
                  <i class="fas fa-trash mr-1"></i>Delete
                </button>
              ` : `
                <button class="report-btn text-gray-400 hover:text-yellow-500 transition" data-id="${comment.id}">
                  <i class="fas fa-flag mr-1"></i>Report
                </button>
              `}
            </div>
            
            <!-- Reply Input (Hidden by default) -->
            <div class="reply-input-container hidden mt-3">
              <textarea
                class="reply-input w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm resize-none"
                placeholder="Write your reply..."
                rows="2"
                maxlength="1000"
              ></textarea>
              <div class="flex justify-end space-x-2 mt-2">
                <button class="cancel-reply-btn px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 rounded transition">Cancel</button>
                <button class="submit-reply-btn px-3 py-1 text-sm bg-orange-500 hover:bg-orange-600 rounded transition" data-parent-id="${comment.id}">Post Reply</button>
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
          
          <p class="comment-content text-gray-300 text-sm mb-2 whitespace-pre-wrap break-words">${this.escapeHtml(reply.content)}</p>
          
          <div class="flex items-center space-x-3 text-xs">
            <button class="like-btn flex items-center space-x-1 ${userLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 transition" data-id="${reply.id}">
              <i class="fas fa-heart"></i>
              <span>${reply.likes_count || 0}</span>
            </button>
            
            ${isOwner ? `
              <button class="delete-btn text-gray-400 hover:text-red-500 transition" data-id="${reply.id}">
                <i class="fas fa-trash mr-1"></i>Delete
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
        <p class="text-gray-400">No comments yet, be the first to comment!</p>
      </div>
    `;
  }
  
  renderLoginPrompt() {
    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = `
        <div class="glass-effect rounded-2xl p-12 text-center">
          <i class="fas fa-sign-in-alt text-6xl text-orange-500 mb-4"></i>
          <p class="text-xl text-gray-300 mb-6">Login to view and post comments</p>
          <a href="/login?redirect=/coin/${this.coinId}" class="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-bold transition">
            Login Now
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
            Reload
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
    
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        this.editComment(id);
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
      alert('Please enter comment content');
      return;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetchUtils.post('/api/social/comments', {
        coinId: this.coinId,
        content: content
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        input.value = '';
        document.getElementById('char-count').textContent = '0 / 1000';
        await this.loadComments();
        this.showSuccess((typeof i18n !== "undefined" ? " + i18n.t("coinDetail.commentSuccess") + " : "Comment posted successfully!"));
      }
    } catch (error) {
      console.error('Submit comment error:', error);
      alert('Post failed: ' + (error.response?.data?.message || error.message));
    }
  }
  
  async submitReply(parentId, content, container) {
    if (!content.trim()) {
      alert('Please enter reply content');
      return;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetchUtils.post('/api/social/comments', {
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
        this.showSuccess((typeof i18n !== "undefined" ? " + i18n.t("coinDetail.replySuccess") + " : "Reply posted successfully!"));
      }
    } catch (error) {
      console.error('Submit reply error:', error);
      alert('Reply failed: ' + (error.response?.data?.message || error.message));
    }
  }
  
  async toggleLike(commentId, btn) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetchUtils.post(`/api/social/comments/${commentId}/like`, {}, {
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
      alert((typeof i18n !== "undefined" ? " + i18n.t("coinDetail.operationFailed") + " : "Operation failed"));
    }
  }
  
  async editComment(commentId) {
    const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (!commentElement) return;
    
    const contentElement = commentElement.querySelector('.comment-content');
    const originalContent = contentElement.textContent.trim();
    
    // Replace content with textarea
    contentElement.innerHTML = `
      <textarea class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm resize-none" rows="3" maxlength="1000">${originalContent}</textarea>
      <div class="flex justify-end space-x-2 mt-2">
        <button class="cancel-edit-btn px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 rounded transition">Cancel</button>
        <button class="save-edit-btn px-3 py-1 text-sm bg-orange-500 hover:bg-orange-600 rounded transition">Save</button>
      </div>
    `;
    
    const textarea = contentElement.querySelector('textarea');
    const cancelBtn = contentElement.querySelector('.cancel-edit-btn');
    const saveBtn = contentElement.querySelector('.save-edit-btn');
    
    // Cancel edit
    cancelBtn.addEventListener('click', () => {
      contentElement.textContent = originalContent;
    });
    
    // Save edit
    saveBtn.addEventListener('click', async () => {
      const newContent = textarea.value.trim();
      if (!newContent) {
        alert('Comment cannot be empty');
        return;
      }
      
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetchUtils.put(`/api/social/comments/${commentId}`, 
          { content: newContent },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          await this.loadComments();
          this.showSuccess('Comment updated');
        }
      } catch (error) {
        console.error('Edit comment error:', error);
        alert('Edit failed');
        contentElement.textContent = originalContent;
      }
    });
    
    textarea.focus();
  }
  
  async deleteComment(commentId) {
    if (!confirm((typeof i18n !== "undefined" ? " + i18n.t("coinDetail.confirmDelete") + " : "Are you sure you want to delete this comment?"))) {
      return;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetchUtils.delete(`/api/social/comments/${commentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        await this.loadComments();
        this.showSuccess('Comment deleted');
      }
    } catch (error) {
      console.error('Delete comment error:', error);
      alert('Delete failed');
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
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
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

// 🌐 Language switcher support
if (typeof i18n !== 'undefined') {
  i18n.onLocaleChange(() => {
    console.log('🌐 Language changed in Comments, reloading...');
    window.location.reload();
  });
}
