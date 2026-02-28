#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Batch translate remaining Chinese strings in critical JavaScript files
"""

def translate_file(filepath, translations):
    """Apply translations to a file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        replaced = 0
        for old, new in translations:
            if old in content:
                content = content.replace(old, new)
                replaced += 1
        
        if replaced > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ {filepath}: {replaced} replacements")
        return replaced
    except FileNotFoundError:
        print(f"✗ {filepath}: File not found")
        return 0

# Translations for dashboard.js
dashboard_translations = [
    ("'創建'", "'Create'"),
    ("'金幣'", "'Coins'"),
    ("'暫無交易記錄'", "'No transactions yet'"),
    ("'買入'", "'Buy'"),
    ("'賣出'", "'Sell'"),
    ("'市值'", "'Market Cap'"),
    ("'持有'", "'Holdings'"),
    ("'創建第一個幣種'", "'Create your first coin'"),
]

# Translations for leaderboard.js and leaderboard-page.js
leaderboard_translations = [
    ("'暫無數據'", "'No data'"),
    ("'載入排行榜失敗'", "'Failed to load leaderboard'"),
    ("'暫無排行榜數據'", "'No leaderboard data'"),
    ("'請稍後再試'", "'Please try again later'"),
    ("'筆'", "' coins'"),
    ("'成就'", "'Achievements'"),
    ("'排名'", "'Rank'"),
    ("'等級'", "'Level'"),
]

# Translations for portfolio.js
portfolio_translations = [
    ("'前往市場'", "'Go to Market'"),
    ("'您還沒有任何持倉'", "'You don\\'t have any holdings yet'"),
    ("'無法加載投資組合數據'", "'Failed to load portfolio data'"),
]

# Translations for trading-panel.js
trading_translations = [
    ("'成功賣出'", "'Successfully sold'"),
    ("'請稍後再試'", "'Please try again later'"),
    ("'餘額不足'", "'Insufficient balance'"),
    ("'金幣'", "'coins'"),
    ("'失敗'", "'failed'"),
    ("'成功買入'", "'Successfully bought'"),
]

# Apply translations
print("Translating critical JavaScript files...")
print()

total = 0
total += translate_file('public/static/dashboard.js', dashboard_translations)
total += translate_file('public/static/leaderboard.js', leaderboard_translations)
total += translate_file('public/static/leaderboard-page.js', leaderboard_translations)
total += translate_file('public/static/portfolio.js', portfolio_translations)
total += translate_file('public/static/trading-panel.js', trading_translations)

print()
print(f"✅ Total: {total} replacements made across all files")
