#!/usr/bin/env python3

print("🔧 Fixing syntax errors in profile-page.js...")

with open('public/static/profile-page.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix escaped quotes that shouldn't be escaped
# Replace \' with ' in the JavaScript
content = content.replace("\\'", "'")

# Write fixed content
with open('public/static/profile-page.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed syntax errors!")

# Verify
import subprocess
result = subprocess.run(['node', '-c', 'public/static/profile-page.js'], 
                       capture_output=True, text=True)
if result.returncode == 0:
    print("✅ JavaScript syntax is now valid!")
else:
    print("❌ Still has errors:")
    print(result.stderr)
