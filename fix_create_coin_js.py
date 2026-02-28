#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix all remaining Chinese in create-coin.js
Replace with i18n calls
"""

def fix_create_coin_js():
    with open('public/static/create-coin.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # All replacements
    replacements = [
        # Insufficient balance tooltip
        ("step2NextBtn.title = 'MLT 餘額不足';",
         "step2NextBtn.title = typeof i18n !== 'undefined' ? i18n.t('create.errors.insufficientMLT', 'Insufficient MLT balance') : 'Insufficient MLT balance';"),
        
        # File size alert
        ("alert('文件大小不能超過 5MB');",
         "alert(typeof i18n !== 'undefined' ? i18n.t('create.errors.fileSizeLimit', 'File size cannot exceed 5MB') : 'File size cannot exceed 5MB');"),
        
        # File type alert
        ("alert('請選擇圖片文件 (JPG, PNG, GIF)');",
         "alert(typeof i18n !== 'undefined' ? i18n.t('create.errors.fileTypeError', 'Please select an image file (JPG, PNG, GIF)') : 'Please select an image file (JPG, PNG, GIF)');"),
        
        # Symbol check - already taken
        ("symbolCheck.innerHTML = '<span class=\"text-red-400\"><i class=\"fas fa-times-circle mr-2\"></i>已被使用</span>';",
         "symbolCheck.innerHTML = '<span class=\"text-red-400\"><i class=\"fas fa-times-circle mr-2\"></i>' + (typeof i18n !== 'undefined' ? i18n.t('create.errors.symbolTaken', 'Already taken') : 'Already taken') + '</span>';"),
        
        # Symbol check - available
        ("symbolCheck.innerHTML = '<span class=\"text-green-400\"><i class=\"fas fa-check-circle mr-2\"></i>可用</span>';",
         "symbolCheck.innerHTML = '<span class=\"text-green-400\"><i class=\"fas fa-check-circle mr-2\"></i>' + (typeof i18n !== 'undefined' ? i18n.t('create.errors.symbolAvailable', 'Available') : 'Available') + '</span>';"),
        
        # Name validation error
        ("document.getElementById('coin-name-error').textContent = '名稱必須是 3-50 個字符';",
         "document.getElementById('coin-name-error').textContent = typeof i18n !== 'undefined' ? i18n.t('create.errors.nameLength', 'Name must be 3-50 characters') : 'Name must be 3-50 characters';"),
        
        # Symbol validation error
        ("document.getElementById('coin-symbol-error').textContent = '符號必須是 2-10 個字符';",
         "document.getElementById('coin-symbol-error').textContent = typeof i18n !== 'undefined' ? i18n.t('create.errors.symbolLength', 'Symbol must be 2-10 characters') : 'Symbol must be 2-10 characters';"),
        
        # No description fallback
        ("document.getElementById('preview-description').textContent = coinData.description || '沒有描述';",
         "document.getElementById('preview-description').textContent = coinData.description || (typeof i18n !== 'undefined' ? i18n.t('create.step3.noDescription', 'No description') : 'No description');"),
        
        # Check for '金幣' in total cost
        ("if (totalCostEl && totalCostEl.textContent.includes('金幣')) {",
         "if (totalCostEl && (totalCostEl.textContent.includes('金幣') || totalCostEl.textContent.includes('Coins'))) {"),
        
        # Remove Chinese keywords from name scoring
        ("if (name.includes('doge') || name.includes('狗')) nameScore += 10;",
         "if (name.includes('doge')) nameScore += 10;"),
        
        ("if (name.includes('rocket') || name.includes('火箭')) nameScore += 10;",
         "if (name.includes('rocket')) nameScore += 10;"),
        
        ("if (name.includes('diamond') || name.includes('鑽石')) nameScore += 10;",
         "if (name.includes('diamond')) nameScore += 10;"),
        
        # Pre-purchase amount error
        ("launchError.textContent = `預購數量不足！您輸入 ${safePrePurchaseTokens.toLocaleString()} 個幣，但最低需要 ${minTokens.toLocaleString()} 個幣（價值 ${minCost.toLocaleString()} MLT）`;",
         "launchError.textContent = typeof i18n !== 'undefined' ? i18n.t('create.errors.prePurchaseInsufficient', { tokens: safePrePurchaseTokens.toLocaleString(), minTokens: minTokens.toLocaleString(), minCost: minCost.toLocaleString() }, `Pre-purchase amount insufficient! You entered ${safePrePurchaseTokens.toLocaleString()} tokens, but minimum is ${minTokens.toLocaleString()} tokens (worth ${minCost.toLocaleString()} MLT)`) : `Pre-purchase amount insufficient! You entered ${safePrePurchaseTokens.toLocaleString()} tokens, but minimum is ${minTokens.toLocaleString()} tokens (worth ${minCost.toLocaleString()} MLT)`;"),
        
        # Launching text
        ("launchText.innerHTML = '<i class=\"fas fa-spinner fa-spin mr-2\"></i>發射中...';",
         "launchText.innerHTML = '<i class=\"fas fa-spinner fa-spin mr-2\"></i>' + (typeof i18n !== 'undefined' ? i18n.t('create.actions.launching', 'Launching...') : 'Launching...');"),
        
        # Uploading image text
        ("launchText.innerHTML = '<i class=\"fas fa-spinner fa-spin mr-2\"></i>上傳圖片...';",
         "launchText.innerHTML = '<i class=\"fas fa-spinner fa-spin mr-2\"></i>' + (typeof i18n !== 'undefined' ? i18n.t('create.actions.uploadingImage', 'Uploading image...') : 'Uploading image...');"),
        
        # Launch failed error
        ("let errorMsg = '發射失敗，請稍後再試';",
         "let errorMsg = typeof i18n !== 'undefined' ? i18n.t('create.errors.launchFailed', 'Launch failed, please try again later') : 'Launch failed, please try again later';"),
        
        # Reset launch button
        ("launchText.innerHTML = '<i class=\"fas fa-rocket mr-2\"></i>發射我的 Meme 幣！';",
         "launchText.innerHTML = '<i class=\"fas fa-rocket mr-2\"></i>' + (typeof i18n !== 'undefined' ? i18n.t('create.actions.launchCoin', 'Launch My Meme Coin!') : 'Launch My Meme Coin!');"),
        
        # Twitter share text
        ("const text = encodeURIComponent(`🚀 我剛在 MemeLaunch Tycoon 上發射了 ${coin.name} ($${coin.symbol})！\\n\\n加入我們的 Meme 幣革命：\\n\\n#MemeLaunch #${coin.symbol}`);",
         "const shareText = typeof i18n !== 'undefined' ? i18n.t('create.success.twitterShare', { name: coin.name, symbol: coin.symbol }, `🚀 I just launched ${coin.name} ($${coin.symbol}) on MemeLaunch Tycoon!\\n\\nJoin our Meme coin revolution:\\n\\n#MemeLaunch #${coin.symbol}`) : `🚀 I just launched ${coin.name} ($${coin.symbol}) on MemeLaunch Tycoon!\\n\\nJoin our Meme coin revolution:\\n\\n#MemeLaunch #${coin.symbol}`;\n    const text = encodeURIComponent(shareText);"),
    ]
    
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
            print(f"✓ Fixed: {old[:60]}...")
        else:
            print(f"⚠ Not found: {old[:60]}...")
    
    with open('public/static/create-coin.js', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n✅ Fixed all Chinese strings in create-coin.js")

if __name__ == '__main__':
    fix_create_coin_js()
