#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Complete i18n translation for Create Coin page
Handles Step 1, Step 2, Step 3, and all navigation elements
"""

import re
import sys

def translate_create_page():
    with open('src/index.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find Create Coin page section
    create_start = content.find("app.get('/create',")
    if create_start == -1:
        print("❌ Could not find create route")
        return False
    
    create_end = content.find("app.get('/coin/", create_start)
    if create_end == -1:
        create_end = len(content)
    
    before = content[:create_start]
    create_section = content[create_start:create_end]
    after = content[create_end:]
    
    # Define all translation replacements
    replacements = [
        # Step 2 - Supply Options
        ('適合小型社群', '<span data-i18n="create.step2.smallCommunity">For small communities</span>'),
        ('大型項目', '<span data-i18n="create.step2.largeProjects">For large projects</span>'),
        ('超大供應', '<span data-i18n="create.step2.megaSupply">Mega supply</span>'),
        ('適合高質量項目', '<span data-i18n="create.step2.highQuality">For high-quality projects</span>'),
        
        # Step 2 - Initial Price
        ('最低 0.0001 MLT', '<span data-i18n="create.step2.minPrice">Minimum 0.0001 MLT</span>'),
        ('推薦: 0.001-0.01', '<span data-i18n="create.step2.recommendedPrice">Recommended: 0.001-0.01</span>'),
        ('初始', '<span data-i18n="create.step2.initial">Initial</span>'),
        
        # Step 2 - Investment
        ('最小預購: 100 MLT', '<span data-i18n="create.step2.minInvestment">Minimum pre-purchase: 100 MLT</span>'),
        ('推薦: 500-2000 MLT', '<span data-i18n="create.step2.recommendedInvestment">Recommended: 500-2000 MLT</span>'),
        ('投資越高，確保流動性', '<span data-i18n="create.step2.investmentHelp">Higher investment ensures liquidity</span>'),
        ('強制購買: 10% (', '<span data-i18n="create.step2.forcedPurchase">Forced purchase: 10% (</span>'),
        
        # Step 2 - Validation messages
        ('需要至少 3 個字符', '<span data-i18n="create.step2.nameMinLength">Requires at least 3 characters</span>'),
        ('需要 2-8 個大寫字母', '<span data-i18n="create.step2.symbolFormat">Requires 2-8 uppercase letters</span>'),
        
        # Step 3 - Preview Card
        ('市值: ', '<span data-i18n="create.step3.marketCap">Market Cap: </span>'),
        ('初始供應量: ', '<span data-i18n="create.step3.initialSupply">Initial Supply: </span>'),
        
        # Step 3 - Quality Score
        ('質量評分', '<span data-i18n="create.step3.qualityScore">Quality Score</span>'),
        ('圖片質量', '<span data-i18n="create.step3.imageQuality">Image Quality</span>'),
        ('名稱吸引力', '<span data-i18n="create.step3.nameAppeal">Name Appeal</span>'),
        ('完整度', '<span data-i18n="create.step3.completeness">Completeness</span>'),
        ('高質量分數可能提升初始排名', '<span data-i18n="create.step3.qualityHelp">High quality score may boost initial ranking</span>'),
        
        # Step 3 - Estimated Ranking
        ('預估排名', '<span data-i18n="create.step3.estimatedRank">Estimated Ranking</span>'),
        ('實時計算', '<span data-i18n="create.step3.realTimeCalc">Real-time calculation</span>'),
        
        # Step 3 - Cost Summary
        ('成本明細', '<span data-i18n="create.step3.costBreakdown">Cost Breakdown</span>'),
        ('創幣成本', '<span data-i18n="create.step3.creationCost">Creation Cost</span>'),
        ('預購成本', '<span data-i18n="create.step3.prePurchaseCost">Pre-purchase Cost</span>'),
        ('強制購買 (10%)', '<span data-i18n="create.step3.forcedPurchase">Forced Purchase (10%)</span>'),
        ('總計', '<span data-i18n="create.step3.totalCost">Total</span>'),
        
        # Step 3 - Balance
        ('您的餘額: ', '<span data-i18n="create.step3.yourBalance">Your Balance: </span>'),
        ('創幣後餘額: ', '<span data-i18n="create.step3.balanceAfter">Balance After Creation: </span>'),
        
        # Step 3 - Warnings
        ('餘額不足！至少需要 ', '<span data-i18n="create.step3.insufficientBalance">Insufficient balance! At least </span>'),
        (' MLT 才能創建幣種', '<span data-i18n="create.step3.mltRequired"> MLT required to create coin</span>'),
        
        # Navigation buttons
        ('上一步', '<span data-i18n="create.actions.prevStep">Previous Step</span>'),
        ('返回儀表板', '<span data-i18n="create.actions.backToDashboard">Back to Dashboard</span>'),
        
        # Success Modal
        ('發射成功！', '<span data-i18n="create.success.title">Launch Success!</span>'),
        ('恭喜！您的 ', '<span data-i18n="create.success.message1">Congratulations! Your </span>'),
        (' 幣已成功發射到市場！', '<span data-i18n="create.success.message2"> coin has been successfully launched to market!</span>'),
        ('您的幣將出現在市場上供其他玩家交易', '<span data-i18n="create.success.description">Your coin will appear on the market for other players to trade</span>'),
        ('查看我的幣', '<span data-i18n="create.success.viewCoin">View My Coin</span>'),
        ('創建另一枚幣', '<span data-i18n="create.success.createAnother">Create Another Coin</span>'),
        
        # Other mixed phrases - more careful replacements
        ('但代幣越稀有，價格增長潛力越高', '<span data-i18n="create.step2.rarityHelp">But the rarer the token, the higher the price growth potential</span>'),
        ('投資越高，市場估值越高', '<span data-i18n="create.step2.valuationHelp">Higher investment, higher market valuation</span>'),
        ('發射後排名: #', '<span data-i18n="create.step3.rankAfterLaunch">Rank After Launch: #</span>'),
        
        # Remaining isolated words in context
        ('為您的 meme 幣寫一個吸引人的描述', '<span data-i18n="create.step2.descriptionPlaceholder">Write an attractive description for your meme coin</span>'),
        
    ]
    
    # Apply all replacements
    modified_section = create_section
    count = 0
    
    for old_text, new_text in replacements:
        if old_text in modified_section:
            modified_section = modified_section.replace(old_text, new_text)
            count += 1
            print(f"✓ Replaced: {old_text[:30]}...")
    
    # Reconstruct file
    new_content = before + modified_section + after
    
    # Write back
    with open('src/index.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"\n✅ Applied {count} replacements to Create Coin page")
    return True

if __name__ == '__main__':
    success = translate_create_page()
    sys.exit(0 if success else 1)
