#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Translate all Chinese strings in market.js
"""

def translate_market_js():
    file_path = 'public/static/market.js'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    translations = [
        # Loading/Error messages
        ('<p class="text-xl text-gray-400">載入中...</p>', '<p class="text-xl text-gray-400">Loading...</p>'),
        ('<p class="text-xl text-gray-400">載入失敗</p>', '<p class="text-xl text-gray-400">Load Failed</p>'),
        ('重試</button>', 'Retry</button>'),
        
        # Coin card labels
        ('<span class="text-gray-400">真實:', '<span class="text-gray-400">Real:'),
        ('<p class="text-gray-400">市值</p>', '<p class="text-gray-400">Market Cap</p>'),
        ('<p class="text-gray-400">供應量</p>', '<p class="text-gray-400">Supply</p>'),
        ('<p class="text-gray-400">持有人</p>', '<p class="text-gray-400">Holders</p>'),
        ('<p class="text-gray-400">交易</p>', '<p class="text-gray-400">Trades</p>'),
        ('Hype 分數', 'Hype Score'),
        ('創建者:', 'Creator:'),
        
        # Quick trade button
        ('<i class="fas fa-bolt mr-2"></i>快速交易', '<i class="fas fa-bolt mr-2"></i>Quick Trade'),
        
        # Time formatting
        ('`${minutes}分鐘前`', '`${minutes} min ago`'),
        ('`${hours}小時前`', '`${hours} hours ago`'),
        ('`${days}天前`', '`${days} days ago`'),
        
        # Quick trade alert
        ('`快速交易功能即將推出！幣種 ID: ${coinId}`', '`Quick trade feature coming soon! Coin ID: ${coinId}`'),
        
        # Destiny badges
        ("'SURVIVAL': '<span class=\"px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs\">🛡️ 生存</span>',",
         "'SURVIVAL': '<span class=\"px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs\">🛡️ Survival</span>',"),
        ("'EARLY_DEATH': '<span class=\"px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs\">💀 高風險</span>',",
         "'EARLY_DEATH': '<span class=\"px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs\">💀 High Risk</span>',"),
        ("'LATE_DEATH': '<span class=\"px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs\">⏳ 中風險</span>',",
         "'LATE_DEATH': '<span class=\"px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs\">⏳ Medium Risk</span>',"),
        ("'GRADUATION': '<span class=\"px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs\">🎓 畢業</span>'",
         "'GRADUATION': '<span class=\"px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs\">🎓 Graduated</span>'"),
    ]
    
    replaced = 0
    for old, new in translations:
        if old in content:
            content = content.replace(old, new)
            replaced += 1
            print(f"✓ Replaced: {old[:50]}")
        else:
            print(f"✗ Not found: {old[:50]}")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n✅ Translation complete! {replaced}/{len(translations)} replaced")

if __name__ == '__main__':
    translate_market_js()
