/**
 * Social Features JavaScript
 * Handles comments, likes, follows, and social interactions
 */

class SocialUI {
  constructor(coinId) {
    this.coinId = coinId;
    this.comments = [];
    this.currentUser = null;
    this.init();
  }

  async init() {
    await this.loadComments();
    this.setupEventListeners();
    
    // Get current user
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.currentUser = JSON.parse(userStr);
      }
    } catch {}
  }

  async loadComments() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`/api/social/comments/${this.coinId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        this.comments = response.data.data.comments || [];
        this.renderComments();
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  }

  renderComments() {
    const container = document.getElementById('comments-section');
    if (!container) return;

    container.innerHTML = `
      <div class="glass-effect rounded-2xl p-6 mb-8">
        <h2 class="text-2xl font-bold mb-6 flex items-center justify-between">
          <span>
            <i class="fas fa-comments mr-2"></i>
            討論區 (${this.comments.length})
          </span>
          <button id="sort-comments" class="text-sm glass-effect px-4 py-2 rounded-lg hover:bg-white/10 transition">
            <i class="fas fa-sort mr-1"></i>
            最新優先
          </button>
        </h2>

        <!-- Post Comment Form -->
        <div class="mb-8">
          <textarea
            id="comment-input"
            rows="3"
            placeholder="分享你的想法..."
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white resize-none"
            maxlength="1000"
          ></textarea>
          <div class="flex items-center justify-between mt-2">
            <span id="char-count" class="text-sm text-gray-400">0/1000</span>
            <button
              id="post-comment-btn"
              class="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-paper-plane mr-2"></i>發表
            </button>
          </div>
        </div>

        <!-- Comments List -->
        <div id="comments-list" class="space-y-4">
          ${this.comments.length === 0 ? this.renderEmptyState() : ''}
        </div>
      </div>
    `;

    if (this.comments.length > 0) {
      const commentsList = document.getElementById('comments-list');
      this.comments.forEach(comment => {
        commentsList.appendChild(this.createCommentCard(comment));
      });
    }

    // Setup character counter
    const input = document.getElementById('comment-input');
    const charCount = document.getElementById('char-count');
    input?.addEventListener('input', () => {
      charCount.textContent = `${input.value.length}/1000`;
    });
  }

  renderEmptyState() {
    return `
      <div class="text-center py-12">
        <i class="fas fa-comment-slash text-6xl text-gray-500 mb-4"></i>
        <p class="text-xl text-gray-400">還沒有評論，搶先發表吧！</p>
      </div>
    `;
  }

  createCommentCard(comment) {
    const isOwnComment = this.currentUser && this.currentUser.id === comment.user_id;
    const timeAgo = this.getTimeAgo(comment.created_at);
    
    const card = document.createElement('div');
    card.className = 'p-4 bg-white/5 rounded-lg hover:bg-white/10 transition';
    card.dataset.commentId = comment.id;

    card.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
          ${(comment.username || 'U').charAt(0).toUpperCase()}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-2">
              <span class="font-bold">${comment.username || '匿名'}</span>
              ${comment.user_level ? `
                <span class="text-xs px-2 py-0.5 bg-white/10 rounded-full">
                  Lv.${comment.user_level}
                </span>
              ` : ''}
              <span class="text-sm text-gray-400">${timeAgo}</span>
            </div>
            ${isOwnComment ? `
              <button class="text-gray-400 hover:text-white transition" onclick="socialUI.deleteComment(${comment.id})">
                <i class="fas fa-trash"></i>
              </button>
            ` : ''}
          </div>
          <p class="text-gray-300 mb-3 whitespace-pre-wrap">${this.escapeHtml(comment.content)}</p>
          <div class="flex items-center space-x-4">
            <button
              class="like-btn flex items-center space-x-1 text-gray-400 hover:text-pink-500 transition"
              data-comment-id="${comment.id}"
              data-liked="${comment.is_liked ? 'true' : 'false'}"
            >
              <i class="fas fa-heart ${comment.is_liked ? 'text-pink-500' : ''}"></i>
              <span>${comment.likes_count || 0}</span>
            </button>
            <button
              class="reply-btn text-gray-400 hover:text-orange-500 transition"
              data-comment-id="${comment.id}"
            >
              <i class="fas fa-reply mr-1"></i>回覆
            </button>
          </div>
          
          <!-- Reply Form (hidden by default) -->
          <div id="reply-form-${comment.id}" class="hidden mt-4">
            <textarea
              rows="2"
              placeholder="回覆 ${comment.username}..."
              class="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 text-white text-sm resize-none mb-2"
              maxlength="500"
            ></textarea>
            <div class="flex justify-end space-x-2">
              <button
                class="cancel-reply-btn px-4 py-1 text-sm glass-effect rounded hover:bg-white/10 transition"
                data-comment-id="${comment.id}"
              >
                取消
              </button>
              <button
                class="submit-reply-btn px-4 py-1 text-sm bg-orange-500 hover:bg-orange-600 rounded font-bold transition"
                data-comment-id="${comment.id}"
              >
                回覆
              </button>
            </div>
          </div>
          
          <!-- Replies (if any) -->
          ${comment.replies && comment.replies.length > 0 ? `
            <div class="mt-4 space-y-3 pl-4 border-l-2 border-white/10">
              ${comment.replies.map(reply => this.createReplyHTML(reply)).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    return card;
  }

  createReplyHTML(reply) {
    const timeAgo = this.getTimeAgo(reply.created_at);
    return `
      <div class="flex items-start space-x-2">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          ${(reply.username || 'U').charAt(0).toUpperCase()}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2 mb-1">
            <span class="text-sm font-bold">${reply.username || '匿名'}</span>
            <span class="text-xs text-gray-400">${timeAgo}</span>
          </div>
          <p class="text-sm text-gray-300">${this.escapeHtml(reply.content)}</p>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Post comment
    document.getElementById('post-comment-btn')?.addEventListener('click', () => {
      this.postComment();
    });

    // Character count
    const input = document.getElementById('comment-input');
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        this.postComment();
      }
    });

    // Like/unlike comments (event delegation)
    document.addEventListener('click', (e) => {
      const likeBtn = e.target.closest('.like-btn');
      if (likeBtn) {
        this.toggleLike(likeBtn.dataset.commentId, likeBtn);
      }

      const replyBtn = e.target.closest('.reply-btn');
      if (replyBtn) {
        this.showReplyForm(replyBtn.dataset.commentId);
      }

      const cancelReplyBtn = e.target.closest('.cancel-reply-btn');
      if (cancelReplyBtn) {
        this.hideReplyForm(cancelReplyBtn.dataset.commentId);
      }

      const submitReplyBtn = e.target.closest('.submit-reply-btn');
      if (submitReplyBtn) {
        this.submitReply(submitReplyBtn.dataset.commentId);
      }
    });
  }

  async postComment() {
    const input = document.getElementById('comment-input');
    const content = input.value.trim();

    if (!content) {
      this.showNotification('請輸入評論內容', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post('/api/social/comments', {
        coinId: this.coinId,
        content: content
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        this.showNotification('評論發表成功！', 'success');
        input.value = '';
        document.getElementById('char-count').textContent = '0/1000';
        await this.loadComments();
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
      this.showNotification(error.response?.data?.message || '發表失敗', 'error');
    }
  }

  async toggleLike(commentId, button) {
    try {
      const token = localStorage.getItem('auth_token');
      const isLiked = button.dataset.liked === 'true';
      
      if (isLiked) {
        await axios.delete(`/api/social/comments/${commentId}/unlike`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`/api/social/comments/${commentId}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Update UI
      const icon = button.querySelector('i');
      const count = button.querySelector('span');
      const currentCount = parseInt(count.textContent);

      if (isLiked) {
        icon.classList.remove('text-pink-500');
        count.textContent = Math.max(0, currentCount - 1);
        button.dataset.liked = 'false';
      } else {
        icon.classList.add('text-pink-500');
        count.textContent = currentCount + 1;
        button.dataset.liked = 'true';
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      this.showNotification('操作失敗', 'error');
    }
  }

  async deleteComment(commentId) {
    if (!confirm('確定要刪除此評論嗎？')) return;

    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`/api/social/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      this.showNotification('評論已刪除', 'success');
      await this.loadComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      this.showNotification('刪除失敗', 'error');
    }
  }

  showReplyForm(commentId) {
    const form = document.getElementById(`reply-form-${commentId}`);
    if (form) {
      form.classList.remove('hidden');
      form.querySelector('textarea').focus();
    }
  }

  hideReplyForm(commentId) {
    const form = document.getElementById(`reply-form-${commentId}`);
    if (form) {
      form.classList.add('hidden');
      form.querySelector('textarea').value = '';
    }
  }

  async submitReply(parentId) {
    const form = document.getElementById(`reply-form-${parentId}`);
    const textarea = form?.querySelector('textarea');
    const content = textarea?.value.trim();

    if (!content) {
      this.showNotification('請輸入回覆內容', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      await axios.post('/api/social/comments', {
        coinId: this.coinId,
        content: content,
        parentId: parentId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      this.showNotification('回覆成功！', 'success');
      this.hideReplyForm(parentId);
      await this.loadComments();
    } catch (error) {
      console.error('Failed to reply:', error);
      this.showNotification('回覆失敗', 'error');
    }
  }

  getTimeAgo(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return '剛剛';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} 分鐘前`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小時前`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)} 天前`;
    return then.toLocaleDateString('zh-TW');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showNotification(message, type = 'info') {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${colors[type]} text-white font-medium animate-slide-in`;
    notification.textContent = message;
    
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Export
window.SocialUI = SocialUI;
