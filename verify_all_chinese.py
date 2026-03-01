#!/usr/bin/env python3
import os
import re

# Scan all JS files for remaining Chinese
js_files = []
for root, dirs, files in os.walk('public/static'):
    for file in files:
        if file.endswith('.js'):
            js_files.append(os.path.join(root, file))

chinese_pattern = re.compile(r'[\u4e00-\u9fff]+')
files_with_chinese = {}

for file_path in js_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    chinese_lines = []
    for i, line in enumerate(lines, 1):
        if chinese_pattern.search(line):
            chinese_text = chinese_pattern.findall(line)
            # Skip language-switcher.js '中文' label
            if 'language-switcher.js' in file_path and '中文' in line:
                continue
            chinese_lines.append((i, chinese_text, line.strip()))
    
    if chinese_lines:
        files_with_chinese[file_path] = chinese_lines

if files_with_chinese:
    print(f"⚠️  Found Chinese text in {len(files_with_chinese)} files:\n")
    for file_path, lines in files_with_chinese.items():
        print(f"📄 {file_path} ({len(lines)} lines):")
        for line_num, chinese_texts, line_content in lines[:3]:
            print(f"  Line {line_num}: {chinese_texts}")
            print(f"    {line_content[:100]}")
        if len(lines) > 3:
            print(f"  ... and {len(lines) - 3} more lines")
        print()
else:
    print("✅ SUCCESS! No Chinese strings found in JS files!")
    print("(language-switcher.js '中文' label is intentional)")

print(f"\n📊 Scanned {len(js_files)} JavaScript files")
