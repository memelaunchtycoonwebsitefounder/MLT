#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Translate Coin Detail JavaScript file
Replaces all Chinese strings with English
"""

def translate_file():
    file_path = 'public/static/coin-detail.js'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Translation replacements
    translations = [
        # Error messages
        ("'載入幣種資料失敗: '", "'Failed to load coin data: '"),
        ("'無法載入價格圖表'", "'Failed to load price chart'"),
        ("'請輸入購買數量'", "'Please enter purchase amount'"),
        ("'請輸入出售數量'", "'Please enter sell amount'"),
        ("'請輸入有效數量'", "'Please enter valid amount'"),
        ("'餘額不足！需要", "'Insufficient balance! Need"),
        ("金幣，您只有", " coins, you only have"),
        ("金幣'", " coins'"),
        ("'可用供應量不足'", "'Insufficient available supply'"),
        ("'持有量不足！您只有", "'Insufficient holdings! You only have"),
        ("'持有量不足'", "'Insufficient holdings'"),
        
        # Success messages
        ("'✅ 成功買入", "'✅ Successfully bought"),
        ("'✅ 成功賣出", "'✅ Successfully sold"),
        ("'✅ 連結已複製！'", "'✅ Link copied!'"),
        ("'圖表已刷新'", "'Chart refreshed'"),
        
        # Failure messages
        ("'買入失敗，請稍後再試'", "'Purchase failed, please try again later'"),
        ("'賣出失敗，請稍後再試'", "'Sale failed, please try again later'"),
        ("'刷新失敗'", "'Refresh failed'"),
        
        # UI text
        ("'沒有描述'", "'No description'"),
        ("`剩餘 ${", "`Remaining ${"),
        ("<p>暫無交易記錄</p>", "<p>No transaction records</p>"),
        ("'買入'", "'Buy'"),
        ("'賣出'", "'Sell'"),
        ("'總計: $", "'Total: $"),
        ("'處理中...'", "'Processing...'"),
        
        # Twitter share text
        ("`🚀 查看 ${coinData.name} ($${coinData.symbol}) 在 MemeLaunch Tycoon！`", "`🚀 Check out ${coinData.name} ($${coinData.symbol}) on MemeLaunch Tycoon!`"),
        
        # Status messages
        ("'生存模式 - 穩定發展中'", "'Survival Mode - Growing Steadily'"),
        ("'早期死亡 - 5 分鐘內面臨風險'", "'Early Death - Risk within 5 minutes'"),
        ("'後期死亡 - 10 分鐘內面臨風險'", "'Late Death - Risk within 10 minutes'"),
        ("'已畢業 - 達到 100% 進度! 🎉'", "'Graduated - Reached 100% Progress! 🎉'"),
        ("'Rug Pull 風險 - 小心詐騙!'", "'Rug Pull Risk - Beware of scam!'"),
    ]
    
    # Apply translations
    replaced = 0
    for old, new in translations:
        if old in content:
            content = content.replace(old, new)
            replaced += 1
            print(f"✓ Replaced: {old[:50]}... → {new[:50]}...")
        else:
            print(f"✗ Not found: {old[:50]}...")
    
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n✅ Translation complete! {replaced} replacements made.")

if __name__ == '__main__':
    translate_file()
