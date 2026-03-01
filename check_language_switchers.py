#!/usr/bin/env python3
import os
import re

# Files that should have language switcher and i18n.onLocaleChange
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

print("🔍 Checking language switcher integration...\n")

for file_path in critical_pages:
    if not os.path.exists(file_path):
        print(f"⚠️  {file_path} - NOT FOUND")
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    has_locale_change = 'i18n.onLocaleChange' in content or 'i18n.onChange' in content
    has_reload = 'location.reload()' in content or 'window.location.reload()' in content
    
    status = "✅" if has_locale_change else "❌"
    reload_status = "✅" if has_reload else "⚠️"
    
    print(f"{status} {os.path.basename(file_path)}")
    if has_locale_change:
        print(f"   Locale change listener: ✅")
        print(f"   Page reload on change: {reload_status}")
    else:
        print(f"   ❌ Missing i18n.onLocaleChange listener!")
    print()

print("\n" + "="*60)
print("📋 SUMMARY:")
print("="*60)
print("Files with proper language switcher support:")
print("✅ = Has i18n.onLocaleChange listener")
print("❌ = Missing language switcher integration")
print("⚠️  = Has listener but no reload (may cause issues)")
