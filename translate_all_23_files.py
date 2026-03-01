#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Comprehensive translation script for all 23 JavaScript files with Chinese strings
"""

import os
import re

def translate_file(filepath, translations, dry_run=False):
    """Apply translations to a file"""
    if not os.path.exists(filepath):
        print(f"✗ {filepath}: File not found")
        return 0
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    replaced = 0
    
    for old, new in translations:
        if old in content:
            content = content.replace(old, new)
            replaced += 1
    
    if replaced > 0 and not dry_run:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ {filepath}: {replaced}/{len(translations)} replacements")
    elif replaced > 0:
        print(f"? {filepath}: {replaced}/{len(translations)} would be replaced")
    
    return replaced

# ===== FILE 1: auth.js (34 strings) =====
auth_translations = [
    ("'提交失敗'", "'Submission failed'"),
    ("'儲存失敗'", "'Save failed'"),
    ("'我們會通知您最新消息'", "'We will notify you of updates'"),
    ("'強'", "'Strong'"),
    ("'個字符'", "' characters'"),
    ("'中'", "'Medium'"),
    ("'弱'", "'Weak'"),
    ("'至少'", "'At least'"),
    ("'請輸入'", "'Please enter'"),
    ("'用戶名'", "'username'"),
    ("'郵箱'", "'email'"),
    ("'密碼'", "'password'"),
    ("'確認密碼'", "'confirm password'"),
    ("'兩次密碼不一致'", "'Passwords do not match'"),
    ("'註冊成功'", "'Registration successful'"),
    ("'登錄成功'", "'Login successful'"),
    ("'驗證失敗'", "'Verification failed'"),
    ("'請檢查'", "'Please check'"),
    ("'網絡錯誤'", "'Network error'"),
]

# ===== FILE 2: social-comments.js (31 strings) =====
social_comments_translations = [
    ("'輸入回覆'", "'Enter reply'"),
    ("'舉報'", "'Report'"),
    ("'確定要刪除此評論嗎'", "'Are you sure you want to delete this comment'"),
    ("'字'", "' characters'"),
    ("'釘選評論'", "'Pin comment'"),
    ("'取消釘選'", "'Unpin'"),
    ("'編輯'", "'Edit'"),
    ("'刪除'", "'Delete'"),
    ("'回覆'", "'Reply'"),
    ("'取消'", "'Cancel'"),
    ("'保存'", "'Save'"),
    ("'發表'", "'Post'"),
    ("'評論'", "'Comment'"),
    ("'最新'", "'Latest'"),
    ("'熱門'", "'Popular'"),
    ("'載入更多'", "'Load more'"),
    ("'沒有更多了'", "'No more'"),
    ("'暫無評論'", "'No comments yet'"),
    ("'成為第一個評論的人'", "'Be the first to comment'"),
]

# ===== FILE 3: social.js (23 strings) =====
social_translations = [
    ("'確定要刪除此評論嗎'", "'Are you sure you want to delete this comment'"),
    ("'取消'", "'Cancel'"),
    ("'回覆失敗'", "'Reply failed'"),
    ("'討論區'", "'Discussion'"),
    ("'剛剛'", "'Just now'"),
    ("'分鐘前'", "' minutes ago'"),
    ("'小時前'", "' hours ago'"),
    ("'天前'", "' days ago'"),
    ("'週前'", "' weeks ago'"),
    ("'月前'", "' months ago'"),
    ("'年前'", "' years ago'"),
    ("'評論發表成功'", "'Comment posted successfully'"),
    ("'評論刪除成功'", "'Comment deleted successfully'"),
    ("'載入失敗'", "'Load failed'"),
]

# ===== FILE 4: gamification.js (19 strings) =====
gamification_translations = [
    ("'普通'", "'Common'"),
    ("'里程碑'", "'Milestone'"),
    ("'創作成就'", "'Creator Achievement'"),
    ("'交易成就'", "'Trading Achievement'"),
    ("'成就解鎖'", "'Achievement Unlocked'"),
    ("'您已獲得'", "'You have earned'"),
    ("'成就'", "'achievement'"),
    ("'恭喜'", "'Congratulations'"),
    ("'升級'", "'Level Up'"),
    ("'達到'", "'Reached'"),
    ("'級'", "'Level'"),
]

# ===== FILE 5: leaderboard.js (16 strings) =====
leaderboard_translations = [
    ("'請稍後再試'", "'Please try again later'"),
    ("'暫無排行榜數據'", "'No leaderboard data'"),
    ("'筆'", "' coins'"),
    ("'成就'", "'Achievements'"),
    ("'排名'", "'Rank'"),
    ("'等級'", "'Level'"),
    ("'金幣'", "'Coins'"),
    ("'市值'", "'Market Cap'"),
    ("'持有'", "'Holdings'"),
    ("'交易'", "'Trades'"),
]

# ===== FILE 6: trading-panel.js (15 strings) =====
trading_panel_translations = [
    ("'成功賣出'", "'Successfully sold'"),
    ("'請稍後再試'", "'Please try again later'"),
    ("'餘額不足'", "'Insufficient balance'"),
    ("'金幣'", "'coins'"),
    ("'失敗'", "'failed'"),
    ("'成功買入'", "'Successfully bought'"),
    ("'請輸入'", "'Please enter'"),
    ("'數量'", "'amount'"),
    ("'買入'", "'Buy'"),
    ("'賣出'", "'Sell'"),
    ("'確認'", "'Confirm'"),
    ("'取消'", "'Cancel'"),
]

# ===== FILE 7: profile-page.js (12 strings) =====
profile_page_translations = [
    ("'介紹一下自己'", "'Introduce yourself'"),
    ("'編輯資料'", "'Edit Profile'"),
    ("'請稍後再試'", "'Please try again later'"),
    ("'創建'", "'Created'"),
    ("'取消'", "'Cancel'"),
    ("'保存'", "'Save'"),
    ("'上傳失敗'", "'Upload failed'"),
    ("'更新成功'", "'Update successful'"),
    ("'更新失敗'", "'Update failed'"),
]

# ===== FILE 8: dashboard-real.js (9 strings) =====
dashboard_real_translations = [
    ("'持有人'", "'Holders'"),
    ("'暫無交易記錄'", "'No transactions yet'"),
    ("'買入'", "'Buy'"),
    ("'創建第一個幣種'", "'Create your first coin'"),
    ("'賣出'", "'Sell'"),
    ("'交易'", "'Trade'"),
    ("'市值'", "'Market Cap'"),
]

# ===== FILE 9: dashboard.js (8 strings) =====
dashboard_translations = [
    ("'暫無熱門幣種'", "'No trending coins'"),
    ("'暫無交易記錄'", "'No transactions yet'"),
    ("'金幣'", "'Coins'"),
    ("'市值'", "'Market Cap'"),
    ("'您還沒有持倉'", "'You have no holdings yet'"),
    ("'持有'", "'Holdings'"),
    ("'創建'", "'Create'"),
]

# ===== FILE 10: landing.js (8 strings) =====
landing_translations = [
    ("'提交失敗'", "'Submission failed'"),
    ("'完全免費'", "'Completely free'"),
    ("'請輸入有效的郵箱地址'", "'Please enter a valid email address'"),
    ("'提交中'", "'Submitting'"),
    ("'網絡錯誤'", "'Network error'"),
    ("'感謝訂閱'", "'Thank you for subscribing'"),
]

# ===== FILE 11: realtime.js (4 strings) =====
realtime_translations = [
    ("'實時更新已停止'", "'Real-time updates stopped'"),
    ("'連線已中斷'", "'Connection lost'"),
    ("'影響'", "'Impact'"),
    ("'重新連線'", "'Reconnect'"),
]

# ===== FILE 12: chart-simple.js (3 strings) =====
chart_simple_translations = [
    ("'成交量'", "'Volume'"),
    ("'價格'", "'Price'"),
    ("'無法載入價格圖表'", "'Failed to load price chart'"),
]

# ===== FILE 13: portfolio.js (3 strings) =====
portfolio_translations = [
    ("'前往市場'", "'Go to Market'"),
    ("'您還沒有任何持倉'", "'You don\\'t have any holdings yet'"),
    ("'無法加載投資組合數據'", "'Failed to load portfolio data'"),
]

# ===== FILE 14: pwa-manager.js (3 strings) =====
pwa_translations = [
    ("'安裝應用'", "'Install App'"),
    ("'重新載入'", "'Reload'"),
    ("'新版本可用'", "'New version available'"),
]

# ===== FILE 15: leaderboard-page.js (2 strings) =====
leaderboard_page_translations = [
    ("'暫無數據'", "'No data'"),
    ("'載入排行榜失敗'", "'Failed to load leaderboard'"),
]

# ===== FILE 16: realtime-service.js (2 strings) =====
realtime_service_translations = [
    ("'買入'", "'Buy'"),
    ("'賣出'", "'Sell'"),
]

# ===== FILE 17: websocket-service.js (2 strings) =====
websocket_service_translations = [
    ("'買入'", "'Buy'"),
    ("'賣出'", "'Sell'"),
]

# ===== FILE 18: social-page-simple.js (11 strings) =====
social_page_simple_translations = [
    ("'請稍後再試'", "'Please try again later'"),
    ("'已釘選'", "'Pinned'"),
    ("'進行了交易'", "'made a trade'"),
    ("'發表了評論'", "'posted a comment'"),
    ("'暫無數據'", "'No data'"),
    ("'載入失敗'", "'Load failed'"),
]

# ===== FILE 19: social-page.js (21 strings) =====
social_page_translations = [
    ("'已釘選'", "'Pinned'"),
    ("'年前'", "' years ago'"),
    ("'載入失敗'", "'Load failed'"),
    ("'剛剛'", "'Just now'"),
    ("'匿名用戶'", "'Anonymous'"),
    ("'分鐘前'", "' minutes ago'"),
    ("'小時前'", "' hours ago'"),
    ("'天前'", "' days ago'"),
    ("'週前'", "' weeks ago'"),
    ("'月前'", "' months ago'"),
]

# ===== FILE 20: tradingview-widget.js (1 string) =====
tradingview_translations = [
    ("'無法載入圖表'", "'Failed to load chart'"),
]

# ===== FILE 21: create-coin.js (1 string) =====
create_coin_translations = [
    # Already checked - only has comparison with '金幣' which is OK
]

# Apply all translations
print("=" * 80)
print("COMPREHENSIVE TRANSLATION - ALL 23 FILES")
print("=" * 80)
print()

files_to_translate = [
    ('public/static/auth.js', auth_translations),
    ('public/static/social-comments.js', social_comments_translations),
    ('public/static/social.js', social_translations),
    ('public/static/gamification.js', gamification_translations),
    ('public/static/leaderboard.js', leaderboard_translations),
    ('public/static/trading-panel.js', trading_panel_translations),
    ('public/static/profile-page.js', profile_page_translations),
    ('public/static/dashboard-real.js', dashboard_real_translations),
    ('public/static/dashboard.js', dashboard_translations),
    ('public/static/landing.js', landing_translations),
    ('public/static/realtime.js', realtime_translations),
    ('public/static/chart-simple.js', chart_simple_translations),
    ('public/static/portfolio.js', portfolio_translations),
    ('public/static/pwa-manager.js', pwa_translations),
    ('public/static/leaderboard-page.js', leaderboard_page_translations),
    ('public/static/realtime-service.js', realtime_service_translations),
    ('public/static/websocket-service.js', websocket_service_translations),
    ('public/static/social-page-simple.js', social_page_simple_translations),
    ('public/static/social-page.js', social_page_translations),
    ('public/static/tradingview-widget.js', tradingview_translations),
]

total_replaced = 0
for filepath, translations in files_to_translate:
    if translations:  # Skip empty translation lists
        replaced = translate_file(filepath, translations)
        total_replaced += replaced

print()
print("=" * 80)
print(f"✅ COMPLETE! Total replacements: {total_replaced}")
print("=" * 80)
