#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Add complete Create Coin page translations to i18n files
"""

import json

def add_translations():
    # Load English translations
    with open('public/locales/en.json', 'r', encoding='utf-8') as f:
        en = json.load(f)
    
    # Load Chinese translations
    with open('public/locales/zh.json', 'r', encoding='utf-8') as f:
        zh = json.load(f)
    
    # Ensure create namespace exists
    if 'create' not in en:
        en['create'] = {}
    if 'create' not in zh:
        zh['create'] = {}
    
    # Step 2 additional keys
    en['create']['step2'].update({
        'smallCommunity': 'For small communities',
        'largeProjects': 'For large projects',
        'megaSupply': 'Mega supply',
        'highQuality': 'For high-quality projects',
        'minPrice': 'Minimum 0.0001 MLT',
        'recommendedPrice': 'Recommended: 0.001-0.01',
        'initial': 'Initial',
        'minInvestment': 'Minimum pre-purchase: 100 MLT',
        'recommendedInvestment': 'Recommended: 500-2000 MLT',
        'investmentHelp': 'Higher investment ensures liquidity',
        'forcedPurchase': 'Forced purchase: 10% (',
        'nameMinLength': 'Requires at least 3 characters',
        'symbolFormat': 'Requires 2-8 uppercase letters',
        'rarityHelp': 'But the rarer the token, the higher the price growth potential',
        'valuationHelp': 'Higher investment, higher market valuation',
        'descriptionPlaceholder': 'Write an attractive description for your meme coin'
    })
    
    zh['create']['step2'].update({
        'smallCommunity': '適合小型社群',
        'largeProjects': '大型項目',
        'megaSupply': '超大供應',
        'highQuality': '適合高質量項目',
        'minPrice': '最低 0.0001 MLT',
        'recommendedPrice': '推薦: 0.001-0.01',
        'initial': '初始',
        'minInvestment': '最小預購: 100 MLT',
        'recommendedInvestment': '推薦: 500-2000 MLT',
        'investmentHelp': '投資越高，確保流動性',
        'forcedPurchase': '強制購買: 10% (',
        'nameMinLength': '需要至少 3 個字符',
        'symbolFormat': '需要 2-8 個大寫字母',
        'rarityHelp': '但代幣越稀有，價格增長潛力越高',
        'valuationHelp': '投資越高，市場估值越高',
        'descriptionPlaceholder': '為您的 meme 幣寫一個吸引人的描述'
    })
    
    # Step 3 complete keys
    en['create']['step3'] = {
        'title': 'Preview & Launch',
        'marketCap': 'Market Cap: ',
        'initialSupply': 'Initial Supply: ',
        'qualityScore': 'Quality Score',
        'imageQuality': 'Image Quality',
        'nameAppeal': 'Name Appeal',
        'completeness': 'Completeness',
        'qualityHelp': 'High quality score may boost initial ranking',
        'estimatedRank': 'Estimated Ranking',
        'realTimeCalc': 'Real-time calculation',
        'rankAfterLaunch': 'Rank After Launch: #',
        'costBreakdown': 'Cost Breakdown',
        'creationCost': 'Creation Cost',
        'prePurchaseCost': 'Pre-purchase Cost',
        'forcedPurchase': 'Forced Purchase (10%)',
        'totalCost': 'Total',
        'yourBalance': 'Your Balance: ',
        'balanceAfter': 'Balance After Creation: ',
        'afterCreation': 'Remaining After Creation',
        'insufficientBalance': 'Insufficient balance! At least ',
        'mltRequired': ' MLT required to create coin'
    }
    
    zh['create']['step3'] = {
        'title': '預覽發射',
        'marketCap': '市值: ',
        'initialSupply': '初始供應量: ',
        'qualityScore': '質量評分',
        'imageQuality': '圖片質量',
        'nameAppeal': '名稱吸引力',
        'completeness': '完整度',
        'qualityHelp': '高質量分數可能提升初始排名',
        'estimatedRank': '預估排名',
        'realTimeCalc': '實時計算',
        'rankAfterLaunch': '發射後排名: #',
        'costBreakdown': '成本明細',
        'creationCost': '創幣成本',
        'prePurchaseCost': '預購成本',
        'forcedPurchase': '強制購買 (10%)',
        'totalCost': '總計',
        'yourBalance': '您的餘額: ',
        'balanceAfter': '創幣後餘額: ',
        'afterCreation': '創建後餘額',
        'insufficientBalance': '餘額不足！至少需要 ',
        'mltRequired': ' MLT 才能創建幣種'
    }
    
    # Success modal
    en['create']['success'] = {
        'title': 'Launch Success!',
        'message1': 'Congratulations! Your ',
        'message2': ' coin has been successfully launched to market!',
        'description': 'Your coin will appear on the market for other players to trade',
        'viewCoin': 'View My Coin',
        'createAnother': 'Create Another Coin'
    }
    
    zh['create']['success'] = {
        'title': '發射成功！',
        'message1': '恭喜！您的 ',
        'message2': ' 幣已成功發射到市場！',
        'description': '您的幣將出現在市場上供其他玩家交易',
        'viewCoin': '查看我的幣',
        'createAnother': '創建另一枚幣'
    }
    
    # Actions
    en['create']['actions'] = {
        'prevStep': 'Previous Step',
        'nextStep': 'Next Step',
        'launch': 'Launch Coin',
        'backToDashboard': 'Back to Dashboard'
    }
    
    zh['create']['actions'] = {
        'prevStep': '上一步',
        'nextStep': '下一步',
        'launch': '發射幣種',
        'backToDashboard': '返回儀表板'
    }
    
    # Write back
    with open('public/locales/en.json', 'w', encoding='utf-8') as f:
        json.dump(en, f, ensure_ascii=False, indent=2)
    
    with open('public/locales/zh.json', 'w', encoding='utf-8') as f:
        json.dump(zh, f, ensure_ascii=False, indent=2)
    
    print("✅ Added complete Create Coin translations")
    print(f"   - Step 2: {len(en['create']['step2'])} keys")
    print(f"   - Step 3: {len(en['create']['step3'])} keys")
    print(f"   - Success: {len(en['create']['success'])} keys")
    print(f"   - Actions: {len(en['create']['actions'])} keys")

if __name__ == '__main__':
    add_translations()
