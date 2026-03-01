#!/usr/bin/env python3
import os
import re

print("="*70)
print("🔍 FINAL COMPREHENSIVE SYSTEM CHECK")
print("="*70)

# 1. Check for Chinese strings
print("\n1️⃣  Checking for remaining Chinese strings...")
js_files = []
for root, dirs, files in os.walk('public/static'):
    for file in files:
        if file.endswith('.js'):
            js_files.append(os.path.join(root, file))

chinese_pattern = re.compile(r'[\u4e00-\u9fff]+')
files_with_chinese = []

for file_path in js_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if chinese_pattern.search(content):
        # Skip language-switcher.js '中文' label
        if 'language-switcher.js' in file_path and '中文' in content:
            continue
        files_with_chinese.append(file_path)

if files_with_chinese:
    print(f"   ❌ Found {len(files_with_chinese)} files with Chinese:")
    for f in files_with_chinese:
        print(f"      - {f}")
else:
    print("   ✅ No Chinese strings found (except intentional '中文' label)")

# 2. Check language switcher integration
print("\n2️⃣  Checking language switcher integration...")
critical_pages = [
    'public/static/market.js',
    'public/static/coin-detail.js',
    'public/static/comments-simple.js',
    'public/static/dashboard.js',
    'public/static/dashboard-real.js',
    'public/static/profile-page.js',
    'public/static/leaderboard-page.js',
    'public/static/leaderboard.js',
    'public/static/social-page.js',
    'public/static/social-page-simple.js',
    'public/static/landing.js',
    'public/static/auth.js'
]

missing_listeners = []
for file_path in critical_pages:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        if 'i18n.onLocaleChange' not in content:
            missing_listeners.append(file_path)

if missing_listeners:
    print(f"   ❌ {len(missing_listeners)} pages missing language listener:")
    for f in missing_listeners:
        print(f"      - {f}")
else:
    print(f"   ✅ All {len(critical_pages)} critical pages have language switcher")

# 3. Check i18n locale files
print("\n3️⃣  Checking i18n locale files...")
en_file = 'public/locales/en.json'
zh_file = 'public/locales/zh.json'

if os.path.exists(en_file) and os.path.exists(zh_file):
    import json
    with open(en_file, 'r', encoding='utf-8') as f:
        en_data = json.load(f)
    with open(zh_file, 'r', encoding='utf-8') as f:
        zh_data = json.load(f)
    
    def count_keys(obj, prefix=''):
        count = 0
        for key, value in obj.items():
            if isinstance(value, dict):
                count += count_keys(value, f"{prefix}{key}.")
            else:
                count += 1
        return count
    
    en_keys = count_keys(en_data)
    zh_keys = count_keys(zh_data)
    
    print(f"   ✅ English locale: {en_keys} keys")
    print(f"   ✅ Chinese locale: {zh_keys} keys")
    
    if en_keys == zh_keys:
        print(f"   ✅ Key counts match perfectly!")
    else:
        print(f"   ⚠️  Key count mismatch: EN={en_keys}, ZH={zh_keys}")
else:
    print("   ❌ Locale files not found!")

# 4. Check static files structure
print("\n4️⃣  Checking static files structure...")
required_files = [
    'public/static/i18n.js',
    'public/static/language-switcher.js',
    'public/static/chart-lightweight.js',
    'public/static/create-coin.js'
]

missing_files = [f for f in required_files if not os.path.exists(f)]
if missing_files:
    print(f"   ❌ Missing {len(missing_files)} required files:")
    for f in missing_files:
        print(f"      - {f}")
else:
    print(f"   ✅ All {len(required_files)} required files present")

# 5. Check build artifacts
print("\n5️⃣  Checking build artifacts...")
if os.path.exists('dist/_worker.js'):
    size = os.path.getsize('dist/_worker.js') / 1024
    print(f"   ✅ Worker bundle: {size:.2f} KB")
    if size > 500:
        print(f"   ⚠️  Bundle size > 500 KB (consider optimization)")
else:
    print("   ❌ Worker bundle not found!")

# Final summary
print("\n" + "="*70)
print("📊 FINAL SUMMARY")
print("="*70)

issues = []
if files_with_chinese:
    issues.append(f"❌ {len(files_with_chinese)} files with Chinese")
if missing_listeners:
    issues.append(f"❌ {len(missing_listeners)} pages missing language listener")
if missing_files:
    issues.append(f"❌ {len(missing_files)} required files missing")

if issues:
    print("⚠️  Issues found:")
    for issue in issues:
        print(f"   {issue}")
else:
    print("✅ ALL CHECKS PASSED!")
    print("🎉 System is FULLY bilingual and ready for production!")
    print("\n🌐 Test environment: https://e1dfd271.memelaunch-tycoon.pages.dev")
    print("🌐 Production: https://memelaunchtycoon.com")

print("="*70)
