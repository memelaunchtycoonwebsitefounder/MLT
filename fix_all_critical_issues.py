#!/usr/bin/env python3
import re

# Fix 1: Profile page syntax error
print("🔧 Fixing profile-page.js syntax error...")
with open('public/static/profile-page.js', 'r', encoding='utf-8') as f:
    profile_content = f.read()

# Fix the syntax error on line 127-128
profile_content = re.sub(
    r'\$\{user\.is_verified \? \'<i class="fas fa-check-circle text-blue-500" title=i18n\.t\(\'profile\.verified\'\)></i>\' : \'\'\}',
    r'${user.is_verified ? `<i class="fas fa-check-circle text-blue-500" title="${typeof i18n !== \'undefined\' ? i18n.t(\'profile.verified\') : \'Verified\'}"></i>` : \'\'}',
    profile_content
)

profile_content = re.sub(
    r'\$\{user\.is_premium \? \'<i class="fas fa-crown text-yellow-500" title=i18n\.t\(\'profile\.premium\'\)></i>\' : \'\'\}',
    r'${user.is_premium ? `<i class="fas fa-crown text-yellow-500" title="${typeof i18n !== \'undefined\' ? i18n.t(\'profile.premium\') : \'Premium\'}"></i>` : \'\'}',
    profile_content
)

with open('public/static/profile-page.js', 'w', encoding='utf-8') as f:
    f.write(profile_content)

print("✅ Profile page syntax fixed!")

# Fix 2: Make comments system bilingual
print("🔧 Making comments system fully bilingual...")
with open('public/static/comments-simple.js', 'r', encoding='utf-8') as f:
    comments_content = f.read()

# Find the render method and make it bilingual
# Already has i18n checks, but need to ensure coin description is also bilingual

# Add coin description i18n to coinData
comments_pattern = r'(this\.comments = \[\];[\s\S]*?)(container\.innerHTML = `)'
def replace_comments(match):
    return match.group(1) + '''
    // Get translations
    const commentsTitle = typeof i18n !== 'undefined' ? i18n.t('coinDetail.comments') : 'Comments';
    const writePlaceholder = typeof i18n !== 'undefined' ? i18n.t('coinDetail.writeComment') : 'Write your comment...';
    const postBtn = typeof i18n !== 'undefined' ? i18n.t('coinDetail.post') : 'Post';
    const latestBtn = typeof i18n !== 'undefined' ? i18n.t('coinDetail.latest') : 'Latest';
    const popularBtn = typeof i18n !== 'undefined' ? i18n.t('coinDetail.popular') : 'Popular';
    const noComments = typeof i18n !== 'undefined' ? i18n.t('coinDetail.noComments') : 'No comments yet. Be the first to comment!';
    
    ''' + match.group(2)

comments_content = re.sub(comments_pattern, replace_comments, comments_content, count=1)

# Replace hardcoded strings in template
comments_content = re.sub(
    r'<h3 class="text-2xl font-bold text-white mb-6">\$\{typeof i18n !== \'undefined\' \? i18n\.t\(\'coinDetail\.comments\'\) : \'Comments\'\} \(\$\{this\.comments\.length\}\)</h3>',
    r'<h3 class="text-2xl font-bold text-white mb-6">${commentsTitle} (${this.comments.length})</h3>',
    comments_content
)

comments_content = re.sub(
    r'placeholder="\$\{typeof i18n !== \'undefined\' \? i18n\.t\(\'coinDetail\.writeComment\'\) : \'Write your comment\.\.\.\'\}"',
    r'placeholder="${writePlaceholder}"',
    comments_content
)

comments_content = re.sub(
    r'<button[^>]*>\$\{typeof i18n !== \'undefined\' \? i18n\.t\(\'coinDetail\.post\'\) : \'Post\'\}</button>',
    r'<button class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600">${postBtn}</button>',
    comments_content
)

with open('public/static/comments-simple.js', 'w', encoding='utf-8') as f:
    f.write(comments_content)

print("✅ Comments system is now bilingual!")

print("\n✅ All critical issues fixed!")
