#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FINAL TRANSLATION SCRIPT - All remaining 81 Chinese strings
This is the comprehensive final pass to achieve 100% English
"""

def translate_file(filepath, replacements):
    """Apply translations to a file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"✗ {filepath}: Not found")
        return 0
    
    count = 0
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
            count += 1
    
    if count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ {filepath}: {count} replacements")
    
    return count

print("="*80)
print("FINAL TRANSLATION - REMAINING 81 STRINGS → 100% ENGLISH")
print("="*80)
print()

# ===== social.js (16 strings) =====
social_js = [
    ('最新優先', 'Latest First'),
    ('placeholder="分享你的想法..."', 'placeholder="Share your thoughts..."'),
    ('<i class="fas fa-paper-plane mr-2"></i>發表', '<i class="fas fa-paper-plane mr-2"></i>Post'),
    ('還沒有評論，搶先發表吧！', 'No comments yet, be the first to post!'),
    ("'匿名'", "'Anonymous'"),
    ('<i class="fas fa-reply mr-1"></i>回覆', '<i class="fas fa-reply mr-1"></i>Reply'),
    ('placeholder="回覆 ${comment.username}..."', 'placeholder="Reply to ${comment.username}..."'),
    ('回覆</button>', 'Reply</button>'),
    ("'請輸入評論內容'", "'Please enter comment content'"),
    ("'發表失敗'", "'Post failed'"),
    ("'操作失敗'", "'Operation failed'"),
    ("'評論已刪除'", "'Comment deleted'"),
    ("'刪除失敗'", "'Delete failed'"),
    ("'請輸入回覆內容'", "'Please enter reply content'"),
    ("'回覆成功！'", "'Reply successful!'"),
]

# ===== gamification.js (14 strings) =====
gamification_js = [
    ("name: '社交achievement'", "name: 'Social Achievement'"),
    ('<span>進度</span>', '<span>Progress</span>'),
    ('<i class="fas fa-star mr-1"></i>已解鎖！', '<i class="fas fa-star mr-1"></i>Unlocked!'),
    ("rare: '稀有'", "rare: 'Rare'"),
    ("epic: '史詩'", "epic: 'Epic'"),
    ("legendary: '傳奇'", "legendary: 'Legendary'"),
    ('解鎖時間:', 'Unlock Time:'),
    (".toLocaleString('zh-TW')", ".toLocaleString('en-US')"),
    ('太棒了！', 'Awesome!'),
    ("'已解鎖achievement'", "'Unlocked Achievements'"),
    ("'未解鎖achievement'", "'Locked Achievements'"),
    ("social: '社交achievement'", "social: 'Social Achievement'"),
    ('等Level ${level}', 'Level ${level}'),
    ('還需 ${(xpForNext - currentXP).toLocaleString()} XP 升到下一Level', 'Need ${(xpForNext - currentXP).toLocaleString()} XP for next level'),
]

# ===== leaderboard.js (10 strings) =====
leaderboard_js = [
    ('載入排行榜...', 'Loading leaderboard...'),
    ('載入失敗，Please try again later', 'Load failed, please try again later'),
    ('用戶</th>', 'User</th>'),
    ("'你'", "'You'"),
    (' 粉絲', ' Followers'),
    ("networth: '淨資產'", "networth: 'Net Worth'"),
    ("trades: 'Trades數'", "trades: 'Trades'"),
    ("level: '經驗值'", "level: 'Experience'"),
    ("profit: '總利潤'", "profit: 'Total Profit'"),
    ("'分數'", "'Score'"),
]

# ===== social-page.js (10 strings) =====
social_page_js = [
    ('${months} 個月前', '${months} months ago'),
    ('載入中...', 'Loading...'),
    ('暫無動態', 'No activities'),
    ('回覆</button>', 'Reply</button>'),
    ("message = '進行了一筆交易'", "message = 'made a trade'"),
    ("message = '關注了新用戶'", "message = 'followed a new user'"),
    ("message = '解鎖了新成就'", "message = 'unlocked a new achievement'"),
    ("message = '創建了新幣種'", "message = 'created a new coin'"),
    ("'用戶'", "'User'"),
    ('${user.level || 1} • ${user.value || 0} 筆交易', '${user.level || 1} • ${user.value || 0} trades'),
]

# ===== trading-panel.js (6 strings) =====
trading_panel_js = [
    ("'Please enter購買amount'", "'Please enter purchase amount'"),
    ("'Insufficient balance！需要", "'Insufficient balance! Need"),
    ('可用供應量不足', 'Insufficient available supply'),
    ("'Please enter出售amount'", "'Please enter sell amount'"),
    ('持有量不足！您只有', 'Insufficient holdings! You only have'),
    ('處理中...', 'Processing...'),
]

# ===== profile-page.js (5 strings) =====
profile_page_js = [
    (' 交易</span>', ' Trades</span>'),
    ('MLT 餘額', 'MLT Balance'),
    ('獲得XP', 'Earned XP'),
    ("'操作失敗，Please try again later'", "'Operation failed, please try again later'"),
    ('placeholder="例：Taiwan"', 'placeholder="e.g., Taiwan"'),
]

# ===== social-page-simple.js (5 strings) =====
social_page_simple_js = [
    ('重新載入', 'Reload'),
    ('還沒有評論', 'No comments yet'),
    ('還沒有熱門評論', 'No popular comments yet'),
    ("message = '解鎖了成就'", "message = 'unlocked an achievement'"),
    ('查看詳情 <i', 'View Details <i'),
]

# ===== social-comments.js (4 strings) =====
social_comments_js = [
    ('釘選評論</div>', 'Pinned Comment</div>'),
    ("'請說明Report原因:'", "'Please state the reason for reporting:'"),
    ("'Report已提交，感謝您的反饋'", "'Report submitted, thank you for your feedback'"),
    ("'Report失敗'", "'Report failed'"),
]

# ===== landing.js (4 strings) =====
landing_js = [
    ("'請輸入郵箱地址'", "'Please enter email address'"),
    ("'Submission failed，請稍後重試'", "'Submission failed, please try again later'"),
    ("'Network error，請稍後重試'", "'Network error, please try again later'"),
    ('立即開始（Completely free）', 'Get Started (Completely Free)'),
]

# ===== dashboard-real.js (3 strings) =====
dashboard_real_js = [
    ('你還沒有創建任何幣種', "You haven't created any coins yet"),
    (' 幣</p>', ' tokens</p>'),
    ('暫無熱門幣種', 'No trending coins'),
]

# ===== chart-simple.js (2 strings) =====
chart_simple_js = [
    ('價格:', 'Price:'),
    ('成交量:', 'Volume:'),
]

# ===== create-coin.js (1 string) - Keep as is, it's just checking =====
# This one is OK - just checking if text includes Chinese

# ===== language-switcher.js (1 string) - Keep as is =====
# This one is OK - showing language name in native language

# Apply all translations
files_to_translate = [
    ('public/static/social.js', social_js),
    ('public/static/gamification.js', gamification_js),
    ('public/static/leaderboard.js', leaderboard_js),
    ('public/static/social-page.js', social_page_js),
    ('public/static/trading-panel.js', trading_panel_js),
    ('public/static/profile-page.js', profile_page_js),
    ('public/static/social-page-simple.js', social_page_simple_js),
    ('public/static/social-comments.js', social_comments_js),
    ('public/static/landing.js', landing_js),
    ('public/static/dashboard-real.js', dashboard_real_js),
    ('public/static/chart-simple.js', chart_simple_js),
]

total = 0
for filepath, replacements in files_to_translate:
    count = translate_file(filepath, replacements)
    total += count

print()
print("="*80)
print(f"✅ COMPLETE! Total: {total} replacements")
print("="*80)
print()
print("🎉 All JavaScript files should now be 100% English!")
print("   (Except language-switcher.js '中文' which is correct)")
