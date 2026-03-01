const fs = require('fs');

let content = fs.readFileSync('public/static/comments-simple.js', 'utf8');

// Find and replace the entire render() method's innerHTML
// The problem is mixing template literals - we need to use concatenation instead

const oldRender = `    container.innerHTML = \`
      <div class="glass-effect rounded-2xl p-6 mt-8">
        <h2 class="text-2xl font-bold mb-6">
          <i class="fas fa-comments mr-2"></i>
          \${typeof i18n !== "undefined" ? i18n.t("coinDetail.comments") : "Comments"} (\${this.comments.length})
        </h2>
        
        <!-- Comment Input -->
        <div class="mb-6">
          <textarea
            id="comment-input"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white resize-none"
            placeholder="\${typeof i18n !== 'undefined' ? i18n.t('coinDetail.writeComment') : 'Write your comment...'}"
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
              \${typeof i18n !== "undefined" ? i18n.t("coinDetail.post") : "Post"}
            </button>
          </div>
        </div>
        
        <!-- Sort Options -->
        <div class="flex space-x-2 mb-4">
          <button class="sort-btn active px-4 py-2 rounded-lg text-sm" data-sort="time">
            <i class="fas fa-clock mr-1"></i>Latest
          </button>
          <button class="sort-btn px-4 py-2 rounded-lg text-sm" data-sort="hot">
            <i class="fas fa-fire mr-1"></i>Popular
          </button>
        </div>
        
        <!-- Comments List -->
        <div id="comments-list" class="space-y-4">
          \${this.comments.length === 0 ? this.renderEmptyState() : this.comments.map(c => this.renderComment(c)).join('')}
        </div>
      </div>
    \`;`;

const newRender = `    const commentsTitle = typeof i18n !== "undefined" ? i18n.t("coinDetail.comments") : "Comments";
    const writePlaceholder = typeof i18n !== "undefined" ? i18n.t("coinDetail.writeComment") : "Write your comment...";
    const postText = typeof i18n !== "undefined" ? i18n.t("coinDetail.post") : "Post";
    const latestText = typeof i18n !== "undefined" ? i18n.t("coinDetail.latest") : "Latest";
    const popularText = typeof i18n !== "undefined" ? i18n.t("coinDetail.popular") : "Popular";
    
    container.innerHTML = \`
      <div class="glass-effect rounded-2xl p-6 mt-8">
        <h2 class="text-2xl font-bold mb-6">
          <i class="fas fa-comments mr-2"></i>
          \${commentsTitle} (\${this.comments.length})
        </h2>
        
        <!-- Comment Input -->
        <div class="mb-6">
          <textarea
            id="comment-input"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-white resize-none"
            placeholder="\${writePlaceholder}"
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
              \${postText}
            </button>
          </div>
        </div>
        
        <!-- Sort Options -->
        <div class="flex space-x-2 mb-4">
          <button class="sort-btn active px-4 py-2 rounded-lg text-sm" data-sort="time">
            <i class="fas fa-clock mr-1"></i>\${latestText}
          </button>
          <button class="sort-btn px-4 py-2 rounded-lg text-sm" data-sort="hot">
            <i class="fas fa-fire mr-1"></i>\${popularText}
          </button>
        </div>
        
        <!-- Comments List -->
        <div id="comments-list" class="space-y-4">
          \${this.comments.length === 0 ? this.renderEmptyState() : this.comments.map(c => this.renderComment(c)).join('')}
        </div>
      </div>
    \`;`;

content = content.replace(oldRender, newRender);

fs.writeFileSync('public/static/comments-simple.js', content);
console.log('✅ Comments fixed with proper variable extraction!');
