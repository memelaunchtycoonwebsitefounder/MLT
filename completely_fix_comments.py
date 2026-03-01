#!/usr/bin/env python3
# Completely rewrite comments HTML generation to use i18n properly

import re

with open('public/static/comments-simple.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the render() method's HTML template
# This is the main issue - the HTML template uses hardcoded English

# Replace Comments header
content = re.sub(
    r'<h2 class="text-2xl font-bold mb-6">\s*<i class="fas fa-comments mr-2"></i>\s*Comments \(\$\{this\.comments\.length\}\)',
    '<h2 class="text-2xl font-bold mb-6">\\n          <i class="fas fa-comments mr-2"></i>\\n          ${typeof i18n !== "undefined" ? i18n.t("coinDetail.comments") : "Comments"} (${this.comments.length})',
    content
)

# Replace Write your comment placeholder
content = re.sub(
    r'placeholder="Write your comment\.\.\."',
    'placeholder="${typeof i18n !== \\"undefined\\" ? i18n.t(\\"coinDetail.writeComment\\") : \\"Write your comment...\\"}"',
    content
)

# Replace Post button
content = re.sub(
    r'<i class="fas fa-paper-plane mr-2"></i>\s*Post\s*</button>',
    '<i class="fas fa-paper-plane mr-2"></i>\\n              ${typeof i18n !== "undefined" ? i18n.t("coinDetail.post") : "Post"}\\n            </button>',
    content
)

# Replace Latest button
content = re.sub(
    r'<button[^>]*id="sort-latest"[^>]*>\s*<i[^>]*></i>\s*Latest',
    '<button class="tab-btn active px-4 py-2 rounded-lg transition" id="sort-latest">\\n            <i class="fas fa-clock mr-2"></i>\\n            ${typeof i18n !== "undefined" ? i18n.t("coinDetail.latest") : "Latest"}',
    content
)

# Replace Popular button  
content = re.sub(
    r'<button[^>]*id="sort-popular"[^>]*>\s*<i[^>]*></i>\s*Popular',
    '<button class="tab-btn px-4 py-2 rounded-lg transition" id="sort-popular">\\n            <i class="fas fa-fire mr-2"></i>\\n            ${typeof i18n !== "undefined" ? i18n.t("coinDetail.popular") : "Popular"}',
    content
)

# Replace no comments message
content = re.sub(
    r'No comments yet\. Be the first to comment!',
    '${typeof i18n !== \\"undefined\\" ? i18n.t(\\"coinDetail.noComments\\") : \\"No comments yet. Be the first to comment!\\"}',
    content
)

print("✅ Comments completely fixed with i18n template strings!")

with open('public/static/comments-simple.js', 'w', encoding='utf-8') as f:
    f.write(content)
