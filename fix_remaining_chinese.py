#!/usr/bin/env python3
import os
import re

# Remaining Chinese strings to translate
replacements = [
    # create-coin.js
    ('金幣', 'Coins'),
    
    # leaderboard.js - context: "你" in leaderboard ranking
    (r'(\s+)你(\s+)', r'\1You\2'),
    
    # trading-panel.js - already fixed but verify
    ('需要', 'Need'),
    
    # social-page.js and social.js - "回覆" reply button
    (r'>回覆</', r'>Reply</'),
    (r'>\s*回覆\s*</', r'>Reply</'),
]

files_to_process = [
    'public/static/create-coin.js',
    'public/static/leaderboard.js',
    'public/static/trading-panel.js',
    'public/static/social-page.js',
    'public/static/social.js'
]

total_replaced = 0

for file_path in files_to_process:
    if not os.path.exists(file_path):
        print(f"⚠️  File not found: {file_path}")
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    file_replaced = 0
    
    for old, new in replacements:
        if re.search(old, content):
            content = re.sub(old, new, content)
            matches = len(re.findall(old, original_content))
            if matches > 0:
                file_replaced += matches
                print(f"  ✓ Replaced '{old}' -> '{new}' ({matches}x) in {file_path}")
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        total_replaced += file_replaced
        print(f"✅ {os.path.basename(file_path)}: {file_replaced} replacements")
    else:
        print(f"⏭️  {os.path.basename(file_path)}: No changes needed")

print(f"\n🎉 Final cleanup complete! Total: {total_replaced} replacements")
