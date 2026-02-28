#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Translate remaining Chinese strings in coin-detail.js
Focus on event timeline and status messages
"""

def translate_events():
    file_path = 'public/static/coin-detail.js'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Event translations
    translations = [
        # Event descriptions
        ("'FOMO 買入潮,價格飆升'", "'FOMO buying surge, price soaring'"),
        ("'狙擊手攻擊'", "'Sniper Attack'"),
        ("'運行中'", "'Running'"),
        ("'熱度爆表'", "'Hype exploding'"),
        
        # Event types
        ("'買入'", "'Buy'"),
        ("'買入潮'", "'Buying Surge'"),
        ("'價格飆升'", "'Price Surging'"),
        ("'價格下跌'", "'Price Dropping'"),
        ("'真實'", "'Real'"),
        ("'幣種創建'", "'Coin Created'"),
        ("'幣種死亡'", "'Coin Death'"),
        ("'成功畢業到'", "'Successfully graduated to'"),
        ("'大幅推高價格'", "'Significantly pushed up the price'"),
        
        # Time labels
        ("'剛剛'", "'Just now'"),
        ("'分鐘前'", "' minutes ago'"),
        ("'事件發生'", "'Event occurred'"),
    ]
    
    replaced = 0
    for old, new in translations:
        if old in content:
            content = content.replace(old, new)
            replaced += 1
            print(f"✓ {old[:30]} → {new[:30]}")
    
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n✅ {replaced} event translations applied")

if __name__ == '__main__':
    translate_events()
