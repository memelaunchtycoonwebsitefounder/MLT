#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix all remaining Chinese strings in Create Coin page
"""

import re

def fix_remaining_chinese():
    with open('src/index.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find Create Coin page section
    create_start = content.find("app.get('/create',")
    create_end = content.find("app.get('/coin/", create_start)
    
    before = content[:create_start]
    create_section = content[create_start:create_end]
    after = content[create_end:]
    
    # All replacements - be very specific to avoid breaking existing translations
    replacements = [
        # Logout button (careful - might be in nav)
        ('>登出<', '><span data-i18n="nav.logout">Logout</span><'),
        
        # Step 2 header (already translated but check)
        ('<i class="fas fa-edit mr-2"></i>設置幣種詳情',
         '<i class="fas fa-edit mr-2"></i><span data-i18n="create.step2.title">Set Coin Details</span>'),
        
        # Investment range labels
        ('<span>最低: 1,800 MLT</span>',
         '<span><span data-i18n="create.step2.minInvest">Minimum: 1,800 MLT</span></span>'),
        
        ('<span>推薦: 2,000-5,000 MLT</span>',
         '<span><span data-i18n="create.step2.recommendInvest">Recommended: 2,000-5,000 MLT</span></span>'),
        
        ('<span>最高: 10,000 MLT</span>',
         '<span><span data-i18n="create.step2.maxInvest">Maximum: 10,000 MLT</span></span>'),
        
        # Forced purchase label
        ('<span class="text-gray-400 text-sm ml-2">(強制購買,確保流動性)</span>',
         '<span class="text-gray-400 text-sm ml-2">(<span data-i18n="create.step2.forcedPurchaseNote">Forced purchase, ensures liquidity</span>)</span>'),
        
        # Token label (right side of input)
        ('<span class="absolute right-4 top-3 text-gray-400 font-bold">代幣</span>',
         '<span class="absolute right-4 top-3 text-gray-400 font-bold"><span data-i18n="create.step2.tokens">Tokens</span></span>'),
        
        # Min pre-purchase
        ('最小預購: <span id="min-pre-purchase" class="text-orange-400 font-bold">45,618</span> 代幣',
         '<span data-i18n="create.step2.minPrePurchase">Minimum pre-purchase:</span> <span id="min-pre-purchase" class="text-orange-400 font-bold">45,618</span> <span data-i18n="create.step2.tokens">Tokens</span>'),
        
        # Cost label
        ('<span class="text-gray-500">(成本 100 MLT)</span>',
         '<span class="text-gray-500">(<span data-i18n="create.step2.cost">Cost</span> 100 MLT)</span>'),
        
        # Use minimum button
        ('>使用最小值<',
         '><span data-i18n="create.step2.useMinimum">Use Minimum</span><'),
        
        # After pre-purchase label
        ('<span class="text-xs text-gray-500">(預購後)</span>',
         '<span class="text-xs text-gray-500">(<span data-i18n="create.step3.afterPrePurchase">After pre-purchase</span>)</span>'),
        
        # Balance after creation
        ('<i class="fas fa-wallet mr-1"></i>創幣後餘額',
         '<i class="fas fa-wallet mr-1"></i><span data-i18n="create.step3.balanceAfterCreation">Balance After Creation</span>'),
        
        # Price growth potential
        ('<strong>價格增長潛力:</strong>',
         '<strong><span data-i18n="create.step3.priceGrowthPotential">Price Growth Potential:</span></strong>'),
        
        # Virtual coin unit
        ('<span class="font-bold">0.01 虛擬幣</span>',
         '<span class="font-bold">0.01 <span data-i18n="create.step3.virtualCoin">Virtual Coins</span></span>'),
        
        # Balance after launch
        ('<span>發射後餘額:</span>',
         '<span><span data-i18n="create.step3.balanceAfterLaunch">Balance After Launch:</span></span>'),
        
        # Market valuation
        ('<i class="fas fa-chart-line mr-2 text-green-500"></i>市場估值',
         '<i class="fas fa-chart-line mr-2 text-green-500"></i><span data-i18n="create.step3.marketValuation">Market Valuation</span>'),
        
        # Market cap label in preview
        ('<p class="text-gray-400">市值</p>',
         '<p class="text-gray-400"><span data-i18n="create.step3.marketCapLabel">Market Cap</span></p>'),
        
        # Ranking label
        ('<p class="text-gray-400">排名</p>',
         '<p class="text-gray-400"><span data-i18n="create.step3.rankingLabel">Ranking</span></p>'),
        
        # Share to Twitter
        ('<i class="fab fa-twitter mr-2"></i>分享到 Twitter',
         '<i class="fab fa-twitter mr-2"></i><span data-i18n="create.success.shareToTwitter">Share to Twitter</span>'),
    ]
    
    modified_section = create_section
    count = 0
    
    for old_text, new_text in replacements:
        if old_text in modified_section:
            modified_section = modified_section.replace(old_text, new_text)
            count += 1
            print(f"✓ Fixed: {old_text[:50]}...")
        else:
            print(f"⚠ Not found: {old_text[:50]}...")
    
    # Reconstruct
    new_content = before + modified_section + after
    
    # Write back
    with open('src/index.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"\n✅ Fixed {count} remaining Chinese strings")
    return True

if __name__ == '__main__':
    fix_remaining_chinese()
