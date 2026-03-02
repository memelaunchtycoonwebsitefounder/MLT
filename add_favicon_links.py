#!/usr/bin/env python3
import re

print("🔧 Adding comprehensive favicon links to HTML responses...")

with open('src/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the comprehensive favicon meta tags and links
favicon_html = '''<link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="apple-touch-icon" sizes="180x180" href="/static/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/static/icon-192.png">
    <link rel="icon" type="image/png" sizes="512x512" href="/static/icon-512.png">
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#FF6B35">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">'''

# Pattern to find <meta name="viewport" ...> and add favicon links after it
# This ensures favicon links are placed early in the <head> section
viewport_pattern = r'(<meta name="viewport"[^>]*>)'

# Check if we already have comprehensive favicon links
if '/favicon.ico' in content and '/manifest.json' in content and 'theme-color' in content:
    print("✅ Comprehensive favicon links already exist")
else:
    # Replace viewport tag with viewport + favicon links
    replacement = f'\\1\n    {favicon_html}'
    content = re.sub(viewport_pattern, replacement, content)
    
    # Remove old/duplicate favicon references that might conflict
    # Keep only our new comprehensive setup
    old_patterns = [
        r'<link rel="icon"[^>]*href="/static/favicon\.svg"[^>]*>\n?',
        r'<link rel="icon"[^>]*href="/favicon-\d+x\d+\.png"[^>]*>\n?',
    ]
    
    for pattern in old_patterns:
        content = re.sub(pattern, '', content)
    
    with open('src/index.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Added comprehensive favicon links")
    print("   - favicon.ico (for all browsers)")
    print("   - favicon.svg (modern browsers)")
    print("   - apple-touch-icon.png (iOS)")
    print("   - icon-192.png and icon-512.png (PWA)")
    print("   - manifest.json (Web App)")
    print("   - theme-color meta (browser UI color)")

print("\n✅ Favicon setup complete!")
