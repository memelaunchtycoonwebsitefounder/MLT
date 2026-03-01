// Social Comments Component
// Twitter-style UI with Discord-level badges

class SocialComments {
  constructor(coinId, userId) {
    this.coinId = coinId;
    this.userId = userId;
    this.comments = [];
    this.sortBy = 'time'; // time or hot
    this.draftKey = `comment_draft_${coinId}`;
    
    // Emoji picker
    this.emojis = ['😀', '😂', '❤️', '🔥', '👍', '👎', '😍', '🤔', '😭', '🎉', '🚀', '💎', '📈', '📉', '💰', '🌙'];
    
    this.init();
  }
  
  init() {
    this.loadDraft();
    this.setupEventListeners();
    this.loadComments();
    
    // Auto-save draft every 2 seconds
    setInterval(() => this.saveDraft(), 2000);
  }
  
  // ============ Draft Management ============
  
  loadDraft() {
    const draft = localStorage.getItem(this.draftKey);
    if (draft) {
      const textarea = document.getElementById('comment-input');
      if (textarea) {
        textarea.value = draft;
        this.updateCharCount();
      }
    }
  }
  
  saveDraft() {
    const textarea = document.getElementById('comment-input');
    if (textarea && textarea.value.trim()) {
      localStorage.setItem(this.draftKey, textarea.value);
    }
  }
  
  clearDraft() {
    localStorage.removeItem(this.draftKey);
  }
  
  // ============ Event Listeners ============
  
  setupEventListeners() {
    // Comment input character count
    const textarea = document.getElementById('comment-input');
    if (textarea) {
      textarea.addEventListener('input', () => this.updateCharCount());
    }
    
    // Sort buttons
    document.querySelectorAll('[data-sort]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sortBy = e.target.getAttribute('data-sort');
        this.changeSortOrder(sortBy);
      });
    });
    
    // Submit comment
    const submitBtn = document.getElementById('submit-comment');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitComment());
    }
    
    // Emoji picker toggle
    const emojiBtn = document.getElementById('emoji-picker-btn');
    if (emojiBtn) {
      emojiBtn.addEventListener('click', () => this.toggleEmojiPicker());
    }
  }
  
  updateCharCount() {
    const textarea = document.getElementById('comment-input');
    const counter = document.getElementById('char-count');
    if (textarea && counter) {
      const length = textarea.value.length;
      counter.textContent = `${length}/1000`;
      counter.className = length > 900 ? 'text-red-500' : 'text-gray-400';
    }
  }
  
  // ============ Load Comments ============
  
  async loadComments() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetchUtils.get(`/api/social/comments/${this.coinId}`, {
        params: {
          sortBy: this.sortBy,
          userId: this.userId
        },
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.data.success) {
        this.comments = response.data.data.comments;
        this.renderComments();
      }
    } catch (error) {
      console.error('Load comments error:', error);
      this.showNotification('Failed to load comments', 'error');
    }
  }
  
  // ============ Render Comments ============
  
  renderComments() {
    const container = document.getElementById('comments-container');
    if (!container) return;
    
    if (this.comments.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-gray-400">
          <i class="fas fa-comments text-4xl mb-3"></i>
          <p>No comments yet, be the first to comment!</p>
        </div>
      `;
      return;
    }
    
    // Separate pinned and regular comments
    const pinnedComments = this.comments.filter(c => c.pinned);
    const regularComments = this.comments.filter(c => !c.pinned);
    
    let html = '';
    
    // Render pinned comments first
    if (pinnedComments.length > 0) {
      html += '<div class="space-y-4 mb-6">';
      pinnedComments.forEach(comment => {
        html += this.renderComment(comment, true);
      });
      html += '</div>';
      
      if (regularComments.length > 0) {
        html += '<div class="border-t border-gray-700 my-6"></div>';
      }
    }
    
    // Render regular comments
    html += '<div class="space-y-4">';
    regularComments.forEach(comment => {
      html += this.renderComment(comment);
    });
    html += '</div>';
    
    container.innerHTML = html;
    
    // Attach event listeners
    this.attachCommentEventListeners();
  }
  
  renderComment(comment, isPinned = false) {
    const isOwner = this.userId && comment.user_id === this.userId;
    const timeAgo = this.getTimeAgo(comment.created_at);
    const levelBadge = this.getLevelBadge(comment.level);
    const editedLabel = comment.edited_at ? '<span class="text-xs text-gray-500">(Edited)</span>' : '';
    
    return `
      <div class="glass-effect rounded-xl p-6 hover:bg-white/5 transition animate-slide-in ${isPinned ? 'ring-2 ring-yellow-500' : ''}" 
           data-comment-id="${comment.id}">
        ${isPinned ? '<div class="flex items-center gap-2 text-yellow-500 text-sm font-bold mb-3"><i class="fas fa-thumbtack"></i> Pinned Comment</div>' : ''}
        
        <!-- Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold">
              ${comment.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-white">${comment.username}</span>
                ${levelBadge}
                <span class="text-gray-500 text-sm">· ${timeAgo}</span>
                ${editedLabel}
              </div>
            </div>
          </div>
          
          ${isOwner ? `
            <div class="flex gap-2">
              <button class="text-gray-400 hover:text-blue-500 transition edit-comment-btn" data-comment-id="${comment.id}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="text-gray-400 hover:text-red-500 transition delete-comment-btn" data-comment-id="${comment.id}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          ` : ''}
        </div>
        
        <!-- Content -->
        <div class="text-white mb-4 comment-content" data-comment-id="${comment.id}">
          ${this.formatContent(comment.content)}
        </div>
        
        <!-- Actions -->
        <div class="flex items-center gap-6 text-gray-400 text-sm">
          <button class="flex items-center gap-2 hover:text-red-500 transition like-btn ${comment.user_liked ? 'text-red-500' : ''}" 
                  data-comment-id="${comment.id}">
            <i class="fas fa-heart"></i>
            <span class="like-count">${comment.likes_count || 0}</span>
          </button>
          
          <button class="flex items-center gap-2 hover:text-blue-500 transition reply-btn" 
                  data-comment-id="${comment.id}" 
                  data-username="${comment.username}">
            <i class="fas fa-reply"></i>
            <span>${comment.replies_count || 0} Replies</span>
          </button>
          
          ${!isOwner ? `
            <button class="flex items-center gap-2 hover:text-yellow-500 transition report-btn" 
                    data-comment-id="${comment.id}">
              <i class="fas fa-flag"></i>
              Report
            </button>
          ` : ''}
        </div>
        
        <!-- Replies -->
        ${comment.replies && comment.replies.length > 0 ? `
          <div class="mt-4 ml-8 space-y-3 border-l-2 border-gray-700 pl-4">
            ${comment.replies.map(reply => this.renderReply(reply)).join('')}
            ${comment.has_more_replies ? `
              <button class="text-blue-500 hover:text-blue-400 text-sm load-more-replies-btn" 
                      data-comment-id="${comment.id}" 
                      data-offset="${comment.replies.length}">
                <i class="fas fa-chevron-down mr-1"></i>
                View more replies...
              </button>
            ` : ''}
          </div>
        ` : ''}
        
        <!-- Reply Form (hidden by default) -->
        <div class="mt-4 hidden reply-form" id="reply-form-${comment.id}">
          <div class="flex gap-3">
            <textarea 
              class="flex-1 bg-gray-800 text-white rounded-lg p-3 resize-none border border-gray-700 focus:border-orange-500 focus:outline-none"
              rows="2" 
              placeholder="Enter reply..."
              id="reply-input-${comment.id}"
              maxlength="1000"></textarea>
            <button class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition submit-reply-btn" 
                    data-comment-id="${comment.id}">
              Replies
            </button>
          </div>
          <div class="text-xs text-gray-400 mt-1">
            <span id="reply-char-count-${comment.id}">0/1000</span>
          </div>
        </div>
      </div>
    `;
  }
  
  renderReply(reply) {
    const isOwner = this.userId && reply.user_id === this.userId;
    const timeAgo = this.getTimeAgo(reply.created_at);
    const levelBadge = this.getLevelBadge(reply.level);
    
    return `
      <div class="glass-effect rounded-lg p-4 hover:bg-white/5 transition" data-comment-id="${reply.id}">
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
              ${reply.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-semibold text-white text-sm">${reply.username}</span>
                ${levelBadge}
                <span class="text-gray-500 text-xs">· ${timeAgo}</span>
              </div>
            </div>
          </div>
          
          ${isOwner ? `
            <button class="text-gray-400 hover:text-red-500 transition text-sm delete-comment-btn" data-comment-id="${reply.id}">
              <i class="fas fa-trash"></i>
            </button>
          ` : ''}
        </div>
        
        <div class="text-white text-sm mb-2">
          ${this.formatContent(reply.content)}
        </div>
        
        <div class="flex items-center gap-4 text-gray-400 text-xs">
          <button class="flex items-center gap-1 hover:text-red-500 transition like-btn ${reply.user_liked ? 'text-red-500' : ''}" 
                  data-comment-id="${reply.id}">
            <i class="fas fa-heart"></i>
            <span class="like-count">${reply.likes_count || 0}</span>
          </button>
          
          <button class="flex items-center gap-1 hover:text-blue-500 transition reply-btn" 
                  data-comment-id="${reply.parent_id}" 
                  data-username="${reply.username}"
                  data-mention="true">
            <i class="fas fa-reply"></i>
            Replies
          </button>
        </div>
      </div>
    `;
  }
  
  // ============ Format & Helper Functions ============
  
  formatContent(content) {
    // Format @mentions
    content = content.replace(/@(\w+)/g, '<span class="text-blue-500 font-semibold">@$1</span>');
    
    // Format line breaks
    content = content.replace(/\n/g, '<br>');
    
    return content;
  }
  
  getLevelBadge(level) {
    let color = 'gray';
    let icon = '🌟';
    
    if (level >= 50) {
      color = 'yellow';
      icon = '👑';
    } else if (level >= 30) {
      color = 'purple';
      icon = '💎';
    } else if (level >= 20) {
      color = 'blue';
      icon = '🏆';
    } else if (level >= 10) {
      color = 'green';
      icon = '⭐';
    }
    
    return `<span class="px-2 py-0.5 rounded text-xs font-bold bg-${color}-500/20 text-${color}-400">${icon} Lv.${level}</span>`;
  }
  
  getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString('zh-TW');
  }
  
  // ============ Actions ============
  
  async submitComment(parentId = null) {
    const inputId = parentId ? `reply-input-${parentId}` : 'comment-input';
    const textarea = document.getElementById(inputId);
    
    if (!textarea) return;
    
    const content = textarea.value.trim();
    
    if (!content) {
      this.showNotification('Please enter comment content', 'error');
      return;
    }
    
    if (content.length > 1000) {
      this.showNotification('Comment length cannot exceed 1000 characters', 'error');
      return;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        this.showNotification('Please login first', 'error');
        return;
      }
      
      const response = await fetchUtils.post('/api/social/comments', {
        coinId: this.coinId,
        content,
        parentId
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        textarea.value = '';
        this.updateCharCount();
        this.clearDraft();
        
        if (parentId) {
          document.getElementById(`reply-form-${parentId}`).classList.add('hidden');
        }
        
        this.showNotification('Comment posted successfully!', 'success');
        await this.loadComments();
      }
    } catch (error) {
      console.error('Submit comment error:', error);
      this.showNotification('Failed to post comment', 'error');
    }
  }
  
  changeSortOrder(sortBy) {
    this.sortBy = sortBy;
    
    // Update button states
    document.querySelectorAll('[data-sort]').forEach(btn => {
      btn.classList.remove('active', 'bg-orange-500', 'text-white');
      btn.classList.add('glass-effect', 'hover:bg-white/10');
    });
    
    const activeBtn = document.querySelector(`[data-sort="${sortBy}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active', 'bg-orange-500', 'text-white');
      activeBtn.classList.remove('glass-effect', 'hover:bg-white/10');
    }
    
    this.loadComments();
  }
  
  toggleEmojiPicker() {
    const picker = document.getElementById('emoji-picker');
    if (picker) {
      picker.classList.toggle('hidden');
    }
  }
  
  insertEmoji(emoji) {
    const textarea = document.getElementById('comment-input');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      textarea.value = text.substring(0, start) + emoji + text.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      textarea.focus();
      this.updateCharCount();
      this.toggleEmojiPicker();
    }
  }
  
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in ${
      type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500'
    } text-white`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
  
  // ============ Attach Event Listeners ============
  
  attachCommentEventListeners() {
    // Like buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const commentId = btn.getAttribute('data-comment-id');
        this.likeComment(commentId, btn);
      });
    });
    
    // Reply buttons
    document.querySelectorAll('.reply-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const commentId = btn.getAttribute('data-comment-id');
        const username = btn.getAttribute('data-username');
        const mention = btn.getAttribute('data-mention');
        this.showReplyForm(commentId, username, mention === 'true');
      });
    });
    
    // Submit reply buttons
    document.querySelectorAll('.submit-reply-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const parentId = btn.getAttribute('data-comment-id');
        this.submitComment(parseInt(parentId));
      });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-comment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const commentId = btn.getAttribute('data-comment-id');
        this.deleteComment(commentId);
      });
    });
    
    // Edit buttons
    document.querySelectorAll('.edit-comment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const commentId = btn.getAttribute('data-comment-id');
        this.editComment(commentId);
      });
    });
    
    // Report buttons
    document.querySelectorAll('.report-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const commentId = btn.getAttribute('data-comment-id');
        this.reportComment(commentId);
      });
    });
    
    // Load more replies buttons
    document.querySelectorAll('.load-more-replies-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const commentId = btn.getAttribute('data-comment-id');
        const offset = btn.getAttribute('data-offset');
        this.loadMoreReplies(commentId, parseInt(offset));
      });
    });
  }
  
  async likeComment(commentId, btn) {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        this.showNotification('Please login first', 'error');
        return;
      }
      
      const response = await fetchUtils.post(`/api/social/comments/${commentId}/like`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const liked = response.data.data.liked;
        const countEl = btn.querySelector('.like-count');
        const currentCount = parseInt(countEl.textContent);
        
        // Animate
        btn.classList.add('animate-bounce');
        setTimeout(() => btn.classList.remove('animate-bounce'), 500);
        
        if (liked) {
          btn.classList.add('text-red-500');
          countEl.textContent = currentCount + 1;
        } else {
          btn.classList.remove('text-red-500');
          countEl.textContent = Math.max(0, currentCount - 1);
        }
      }
    } catch (error) {
      console.error('Like error:', error);
      this.showNotification('Operation failed', 'error');
    }
  }
  
  showReplyForm(commentId, username, addMention) {
    const form = document.getElementById(`reply-form-${commentId}`);
    if (form) {
      form.classList.toggle('hidden');
      
      if (!form.classList.contains('hidden')) {
        const textarea = document.getElementById(`reply-input-${commentId}`);
        if (textarea) {
          if (addMention && username) {
            textarea.value = `@${username} `;
          }
          textarea.focus();
        }
      }
    }
  }
  
  async deleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetchUtils.delete(`/api/social/comments/${commentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        this.showNotification('Comment deleted', 'success');
        await this.loadComments();
      }
    } catch (error) {
      console.error('Delete error:', error);
      this.showNotification('Delete failed', 'error');
    }
  }
  
  async editComment(commentId) {
    const contentEl = document.querySelector(`[data-comment-id="${commentId}"] .comment-content`);
    if (!contentEl) return;
    
    const currentContent = contentEl.textContent.trim();
    const newContent = prompt('Edit comment:', currentContent);
    
    if (!newContent || newContent === currentContent) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetchUtils.put(`/api/social/comments/${commentId}`, {
        content: newContent
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        this.showNotification('Comment updated', 'success');
        await this.loadComments();
      }
    } catch (error) {
      console.error('Edit error:', error);
      this.showNotification('Edit failed', 'error');
    }
  }
  
  async reportComment(commentId) {
    const reason = prompt('Please state the reason for reporting:');
    if (!reason || !reason.trim()) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetchUtils.post(`/api/social/comments/${commentId}/report`, {
        reason: reason.trim()
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        this.showNotification('Report submitted, thank you for your feedback', 'success');
      }
    } catch (error) {
      console.error('Report error:', error);
      this.showNotification(error.response?.data?.error || 'Report failed', 'error');
    }
  }
  
  async loadMoreReplies(commentId, offset) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetchUtils.get(`/api/social/comments/${commentId}/replies`, {
        params: { offset, userId: this.userId },
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.data.success) {
        // Update the comment's replies in the comments array
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
          comment.replies = [...comment.replies, ...response.data.data.replies];
          this.renderComments();
        }
      }
    } catch (error) {
      console.error('Load more replies error:', error);
      this.showNotification('Load failed', 'error');
    }
  }
}

// Export for use
window.SocialComments = SocialComments;
