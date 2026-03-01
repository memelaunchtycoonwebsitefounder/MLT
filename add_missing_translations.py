#!/usr/bin/env python3
import json

# Load English translations
with open('public/locales/en.json', 'r', encoding='utf-8') as f:
    en = json.load(f)

# Load Chinese translations  
with open('public/locales/zh.json', 'r', encoding='utf-8') as f:
    zh = json.load(f)

# Add missing market translations if not exists
if 'market' not in en or isinstance(en.get('market'), str):
    en['market'] = {}
if 'market' not in zh or isinstance(zh.get('market'), str):
    zh['market'] = {}

# Add all missing keys
market_translations = {
    'marketCap': ('Market Cap', '市值'),
    'supply': ('Supply', '供應量'),
    'holders': ('Holders', '持有人'),
    'trades': ('Trades', '交易'),
    'hypeScore': ('Hype Score', 'Hype 分數'),
    'creator': ('Creator', '創建者'),
    'ai': ('AI', 'AI'),
    'real': ('Real', '真實'),
    'quickTrade': ('Quick Trade', '快速交易')
}

for key, (en_text, zh_text) in market_translations.items():
    en['market'][key] = en_text
    zh['market'][key] = zh_text

# Save back
with open('public/locales/en.json', 'w', encoding='utf-8') as f:
    json.dump(en, f, ensure_ascii=False, indent=2)

with open('public/locales/zh.json', 'w', encoding='utf-8') as f:
    json.dump(zh, f, ensure_ascii=False, indent=2)

print("✅ Added missing market translations!")
print(f"   EN market keys: {len(en.get('market', {}))}")
print(f"   ZH market keys: {len(zh.get('market', {}))}")
