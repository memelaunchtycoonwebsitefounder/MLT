#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Final translation for coin-detail.js
All remaining Chinese strings
"""

def final_translate():
    file_path = 'public/static/coin-detail.js'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # All remaining translations
    translations = [
        # Status
        ("'命運未知...'", "'Fate Unknown...'"),
        ("'運行中'", "'Running'"),
        ("'已停止'", "'Stopped'"),
        
        # Event descriptions
        ("`幣種創建 - 初始投資 ${coinData.initial_mlt_investment || 2000} MLT`", 
         "`Coin Created - Initial Investment ${coinData.initial_mlt_investment || 2000} MLT`"),
        ("'狙擊手快速買入大量代幣'", "'Sniper quickly bought large amount of tokens'"),
        ("'鯨魚買入,大幅推高價格'", "'Whale buy, significantly pushed up price'"),
        ("'⚠️ Rug Pull 事件發生'", "'⚠️ Rug Pull event occurred'"),
        ("'恐慌拋售,價格下跌'", "'Panic sell, price dropping'"),
        ("'🔥 病毒式傳播,熱度爆表'", "'🔥 Viral spread, hype exploding'"),
        ("'💀 幣種死亡'", "'💀 Coin death'"),
        ("'🎓 成功畢業到 DEX'", "'🎓 Successfully graduated to DEX'"),
        
        # UI text
        ("'暫無事件'", "'No events yet'"),
        ("'無詳情'", "'No details'"),
        
        # Event labels
        ("'鯨魚買入'", "'Whale Buy'"),
        ("'恐慌拋售'", "'Panic Sell'"),
        ("'FOMO 買入'", "'FOMO Buy'"),
        ("'病毒式傳播'", "'Viral Moment'"),
        ("'幣種畢業'", "'Coin Graduation'"),
        
        # Trade type badge
        ("'真實'", "'Real'"),
        
        # Time ago
        ("`${diffMins} 分鐘前`", "`${diffMins} minutes ago`"),
        ("`${Math.floor(diffMins / 60)} 小時前`", "`${Math.floor(diffMins / 60)} hours ago`"),
    ]
    
    replaced = 0
    for old, new in translations:
        if old in content:
            content = content.replace(old, new)
            replaced += 1
            print(f"✓ {old[:40]}")
        else:
            print(f"✗ Not found: {old[:40]}")
    
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n✅ Final translation complete! {replaced}/{len(translations)} replaced")

if __name__ == '__main__':
    final_translate()
