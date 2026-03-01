#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Precise translation script with exact string matching
"""

import re

def translate_file(filepath):
    """Translate a specific file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"✗ {filepath}: Not found")
        return 0
    
    original = content
    
    # Define replacements specific to each file
    replacements = []
    
    if 'auth.js' in filepath:
        replacements = [
            ('處理中...', 'Processing...'),
            ('至少 8 個字符', 'At least 8 characters'),
            ('至少 1 個大寫字母', 'At least 1 uppercase letter'),
            ('至少 1 個數字', 'At least 1 number'),
            ('至少 1 個特殊字符', 'At least 1 special character'),
            ('弱 - ', 'Weak - '),
            ('中等 - ', 'Medium - '),
            ('強 - 密碼安全', 'Strong - Password secure'),
            ('太好了！我們會通知您最新消息 🎉', 'Great! We will notify you of updates 🎉'),
            ('提交失敗，請稍後再試', 'Submission failed, please try again later'),
            ('請填寫所有欄位', 'Please fill in all fields'),
            ('密碼至少需要 8 個字符', 'Password must be at least 8 characters'),
            ('儲存失敗，請重試', 'Save failed, please try again'),
            ('註冊成功！正在跳轉...', 'Registration successful! Redirecting...'),
            ('註冊失敗，請稍後再試', 'Registration failed, please try again later'),
            ('登入成功！正在跳轉...', 'Login successful! Redirecting...'),
            ('登入失敗，請檢查您的郵箱和密碼', 'Login failed, please check your email and password'),
            ('請輸入您的郵箱', 'Please enter your email'),
            ('如果該郵箱已註冊，您將收到密碼重置連結', 'If the email is registered, you will receive a password reset link'),
            ('請求失敗，請稍後再試', 'Request failed, please try again later'),
            ('無效的重置連結', 'Invalid reset link'),
            ('密碼不匹配', 'Passwords do not match'),
            ('密碼已成功重置！正在跳轉到登入頁面...', 'Password reset successfully! Redirecting to login page...'),
            ('重置失敗，請稍後再試', 'Reset failed, please try again later'),
            ('已登出', 'Logged out'),
        ]
    
    elif 'social-comments.js' in filepath:
        replacements = [
            ('載入評論失敗', 'Failed to load comments'),
            ('尚無評論，成為第一個留言的人！', 'No comments yet, be the first to comment!'),
            ('(已編輯)', '(Edited)'),
            (' 回覆', ' Replies'),
            ('舉報', 'Report'),
            ('查看更多回覆...', 'View more replies...'),
            ('輸入回覆...', 'Enter reply...'),
            ('回覆', 'Reply'),
            ('剛剛', 'Just now'),
            (' 分鐘前', ' minutes ago'),
            (' 小時前', ' hours ago'),
            (' 天前', ' days ago'),
            ('請輸入評論內容', 'Please enter comment content'),
            ('評論長度不能超過 1000 字', 'Comment length cannot exceed 1000 characters'),
            ('請先登入', 'Please login first'),
            ('評論發表成功！', 'Comment posted successfully!'),
            ('發表評論失敗', 'Failed to post comment'),
            ('操作失敗', 'Operation failed'),
            ('確定要刪除此評論嗎？', 'Are you sure you want to delete this comment?'),
            ('評論已刪除', 'Comment deleted'),
            ('刪除失敗', 'Delete failed'),
            ('編輯評論:', 'Edit comment:'),
            ('評論已更新', 'Comment updated'),
            ('編輯失敗', 'Edit failed'),
            ('請說明舉報原因:', 'Please state the reason for reporting:'),
            ('舉報已提交，感謝您的反饋', 'Report submitted, thank you for your feedback'),
            ('舉報失敗', 'Report failed'),
            ('載入失敗', 'Load failed'),
        ]
    
    elif 'dashboard.js' in filepath:
        replacements = [
            ('暫無交易記錄', 'No transactions yet'),
            (' 金幣', ' Coins'),
            ('暫無熱門幣種', 'No trending coins'),
            ('市值: $', 'Market Cap: $'),
            ('您還沒有持倉', 'You have no holdings yet'),
        ]
    
    elif 'dashboard-real.js' in filepath:
        replacements = [
            ('持有人', 'Holders'),
            ('暫無交易記錄', 'No transactions yet'),
            ('買入', 'Buy'),
            ('創建第一個幣種', 'Create your first coin'),
            ('賣出', 'Sell'),
            ('交易', 'Trade'),
            ('市值', 'Market Cap'),
        ]
    
    elif 'gamification.js' in filepath:
        replacements = [
            ('普通', 'Common'),
            ('里程碑', 'Milestone'),
            ('創作成就', 'Creator Achievement'),
            ('交易成就', 'Trading Achievement'),
            ('成就解鎖', 'Achievement Unlocked'),
            ('您已獲得', 'You have earned'),
            ('成就', 'achievement'),
            ('恭喜', 'Congratulations'),
            ('升級', 'Level Up'),
            ('達到', 'Reached'),
            ('級', 'Level'),
        ]
    
    elif 'leaderboard.js' in filepath:
        replacements = [
            ('請稍後再試', 'Please try again later'),
            ('暫無排行榜數據', 'No leaderboard data'),
            ('筆', ' coins'),
            ('成就', 'Achievements'),
            ('排名', 'Rank'),
            ('等級', 'Level'),
            ('金幣', 'Coins'),
            ('市值', 'Market Cap'),
            ('持有', 'Holdings'),
            ('交易', 'Trades'),
        ]
    
    elif 'trading-panel.js' in filepath:
        replacements = [
            ('成功賣出', 'Successfully sold'),
            ('請稍後再試', 'Please try again later'),
            ('餘額不足', 'Insufficient balance'),
            ('金幣', 'coins'),
            ('失敗', 'failed'),
            ('成功買入', 'Successfully bought'),
            ('請輸入', 'Please enter'),
            ('數量', 'amount'),
            ('買入', 'Buy'),
            ('賣出', 'Sell'),
            ('確認', 'Confirm'),
            ('取消', 'Cancel'),
        ]
    
    elif 'profile-page.js' in filepath:
        replacements = [
            ('介紹一下自己', 'Introduce yourself'),
            ('編輯資料', 'Edit Profile'),
            ('請稍後再試', 'Please try again later'),
            ('創建', 'Created'),
            ('取消', 'Cancel'),
            ('保存', 'Save'),
            ('上傳失敗', 'Upload failed'),
            ('更新成功', 'Update successful'),
            ('更新失敗', 'Update failed'),
        ]
    
    elif 'landing.js' in filepath:
        replacements = [
            ('提交失敗', 'Submission failed'),
            ('完全免費', 'Completely free'),
            ('請輸入有效的郵箱地址', 'Please enter a valid email address'),
            ('提交中', 'Submitting'),
            ('網絡錯誤', 'Network error'),
            ('感謝訂閱', 'Thank you for subscribing'),
        ]
    
    elif 'realtime.js' in filepath:
        replacements = [
            ('實時更新已停止', 'Real-time updates stopped'),
            ('連線已中斷', 'Connection lost'),
            ('影響', 'Impact'),
            ('重新連線', 'Reconnect'),
        ]
    
    elif 'portfolio.js' in filepath:
        replacements = [
            ('前往市場', 'Go to Market'),
            ("您還沒有任何持倉", "You don't have any holdings yet"),
            ('無法加載投資組合數據', 'Failed to load portfolio data'),
        ]
    
    elif 'pwa-manager.js' in filepath:
        replacements = [
            ('安裝應用', 'Install App'),
            ('重新載入', 'Reload'),
            ('新版本可用', 'New version available'),
        ]
    
    elif 'leaderboard-page.js' in filepath:
        replacements = [
            ('暫無數據', 'No data'),
            ('載入排行榜失敗', 'Failed to load leaderboard'),
        ]
    
    elif 'social-page' in filepath:
        replacements = [
            ('已釘選', 'Pinned'),
            ('年前', ' years ago'),
            ('載入失敗', 'Load failed'),
            ('剛剛', 'Just now'),
            ('匿名用戶', 'Anonymous'),
            (' 分鐘前', ' minutes ago'),
            (' 小時前', ' hours ago'),
            (' 天前', ' days ago'),
            (' 週前', ' weeks ago'),
            (' 月前', ' months ago'),
            ('請稍後再試', 'Please try again later'),
            ('進行了交易', 'made a trade'),
            ('發表了評論', 'posted a comment'),
            ('暫無數據', 'No data'),
        ]
    
    elif 'social.js' in filepath:
        replacements = [
            ('確定要刪除此評論嗎', 'Are you sure you want to delete this comment'),
            ('取消', 'Cancel'),
            ('回覆失敗', 'Reply failed'),
            ('討論區', 'Discussion'),
            ('剛剛', 'Just now'),
            (' 分鐘前', ' minutes ago'),
            (' 小時前', ' hours ago'),
            (' 天前', ' days ago'),
            (' 週前', ' weeks ago'),
            (' 月前', ' months ago'),
            (' 年前', ' years ago'),
            ('評論發表成功', 'Comment posted successfully'),
            ('評論刪除成功', 'Comment deleted successfully'),
            ('載入失敗', 'Load failed'),
        ]
    
    # Apply replacements
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
    else:
        return 0

# Files to translate
files = [
    'public/static/auth.js',
    'public/static/social-comments.js',
    'public/static/dashboard.js',
    'public/static/dashboard-real.js',
    'public/static/gamification.js',
    'public/static/leaderboard.js',
    'public/static/trading-panel.js',
    'public/static/profile-page.js',
    'public/static/landing.js',
    'public/static/realtime.js',
    'public/static/portfolio.js',
    'public/static/pwa-manager.js',
    'public/static/leaderboard-page.js',
    'public/static/social-page.js',
    'public/static/social-page-simple.js',
    'public/static/social.js',
]

print("="*80)
print("PRECISE TRANSLATION - EXACT STRING MATCHING")
print("="*80)
print()

total = 0
for filepath in files:
    count = translate_file(filepath)
    total += count

print()
print("="*80)
print(f"✅ TOTAL: {total} replacements")
print("="*80)
