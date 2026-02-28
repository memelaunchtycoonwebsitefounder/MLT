#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Final i18n pass for Create Coin page - Navigation and remaining strings
"""

import re

def final_translations():
    with open('src/index.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find Create Coin page section
    create_start = content.find("app.get('/create',")
    create_end = content.find("app.get('/coin/", create_start)
    
    before = content[:create_start]
    create_section = content[create_start:create_end]
    after = content[create_end:]
    
    # Navigation translations
    replacements = [
        # Navigation links
        ('<a href="/dashboard" class="hover:text-orange-500 transition">儀表板</a>',
         '<a href="/dashboard" class="hover:text-orange-500 transition" data-i18n="nav.dashboard">Dashboard</a>'),
        
        ('<a href="/market" class="hover:text-orange-500 transition">市場</a>',
         '<a href="/market" class="hover:text-orange-500 transition" data-i18n="nav.market">Market</a>'),
        
        ('<a href="/portfolio" class="hover:text-orange-500 transition">投資組合</a>',
         '<a href="/portfolio" class="hover:text-orange-500 transition" data-i18n="nav.portfolio">Portfolio</a>'),
        
        ('<a href="/achievements" class="hover:text-orange-500 transition">成就</a>',
         '<a href="/achievements" class="hover:text-orange-500 transition" data-i18n="nav.achievements">Achievements</a>'),
        
        ('<a href="/leaderboard" class="hover:text-orange-500 transition">排行榜</a>',
         '<a href="/leaderboard" class="hover:text-orange-500 transition" data-i18n="nav.leaderboard">Leaderboard</a>'),
        
        ('<a href="/social" class="hover:text-orange-500 transition">社交</a>',
         '<a href="/social" class="hover:text-orange-500 transition" data-i18n="nav.social">Social</a>'),
        
        # Balance display
        ('<span id="user-balance">--</span> 金幣',
         '<span id="user-balance">--</span> <span data-i18n="common.coins">Coins</span>'),
        
        # Logout button - careful with this one as it's inside a button
        ('>登出<', '><span data-i18n="nav.logout">Logout</span><'),
        
        # Step labels (not data-i18n wrapped yet)
        ('<div class="step-label">選擇圖片</div>',
         '<div class="step-label"><span data-i18n="create.steps.step1">Choose Image</span></div>'),
        
        ('<div class="step-label">設置幣種詳情</div>',
         '<div class="step-label"><span data-i18n="create.steps.step2">Set Details</span></div>'),
        
        # "Or" text between upload and template
        ('<p class="text-gray-400 mb-4">或</p>',
         '<p class="text-gray-400 mb-4"><span data-i18n="create.step1.or">Or</span></p>'),
        
        # "Your Balance" label
        ('<p class="text-sm text-gray-300">您的餘額</p>',
         '<p class="text-sm text-gray-300"><span data-i18n="create.step2.yourBalance">Your Balance</span></p>'),
        
        # Insufficient balance warning (partial - complete the pattern)
        ('MLT 餘額不足！需要至少',
         'MLT <span data-i18n="create.step3.insufficientBalance">Insufficient balance! At least </span>'),
        
        # Placeholders
        ('placeholder="例如: Doge to the Moon"',
         'placeholder="e.g., Doge to the Moon" data-i18n-placeholder="create.step2.namePlaceholder"'),
        
        ('placeholder="例如: MOON"',
         'placeholder="e.g., MOON" data-i18n-placeholder="create.step2.symbolPlaceholder"'),
        
        # Character hints
        ('<p class="text-sm text-gray-400 mt-1">3-50 個字符</p>',
         '<p class="text-sm text-gray-400 mt-1"><span data-i18n="create.step2.nameLength">3-50 characters</span></p>'),
        
        ('<p class="text-sm text-gray-400">2-10 個字符，大寫字母</p>',
         '<p class="text-sm text-gray-400"><span data-i18n="create.step2.symbolLength">2-10 characters, uppercase letters</span></p>'),
        
        # Icons with labels
        ('供應量</span>', '<span data-i18n="create.step2.supply">Supply</span></span>'),
        ('投資</span>', '<span data-i18n="create.step2.investment">Investment</span></span>'),
    ]
    
    modified_section = create_section
    count = 0
    
    for old_text, new_text in replacements:
        if old_text in modified_section:
            modified_section = modified_section.replace(old_text, new_text)
            count += 1
            # Show what was replaced (truncated)
            display_old = old_text.replace('\n', ' ')[:50]
            print(f"✓ {display_old}...")
    
    # Reconstruct
    new_content = before + modified_section + after
    
    # Write back
    with open('src/index.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"\n✅ Applied {count} final replacements")
    return True

if __name__ == '__main__':
    final_translations()
