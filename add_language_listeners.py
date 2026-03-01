#!/usr/bin/env python3
import os
import re

files_to_fix = [
    'public/static/dashboard.js',
    'public/static/dashboard-real.js',
    'public/static/profile-page.js',
    'public/static/leaderboard-page.js',
    'public/static/leaderboard.js',
    'public/static/social-page.js',
    'public/static/landing.js',
    'public/static/auth.js'
]

listener_code = '''
// Language switcher support
if (typeof i18n !== 'undefined' && i18n.onLocaleChange) {
    i18n.onLocaleChange(() => {
        location.reload();
    });
}
'''

for file_path in files_to_fix:
    if not os.path.exists(file_path):
        print(f"⚠️  {file_path} not found")
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already has listener
    if 'i18n.onLocaleChange' in content:
        print(f"⏭️  {os.path.basename(file_path)} - Already has listener")
        continue
    
    # Find a good place to insert - after DOMContentLoaded or at end of init function
    if "document.addEventListener('DOMContentLoaded'" in content:
        # Add after DOMContentLoaded
        pattern = r"(document\.addEventListener\('DOMContentLoaded'[^}]+\}\);)"
        if re.search(pattern, content, re.DOTALL):
            content = re.sub(
                pattern,
                r"\1" + listener_code,
                content,
                count=1
            )
            print(f"✅ {os.path.basename(file_path)} - Added listener after DOMContentLoaded")
        else:
            # Just append at end
            content += listener_code
            print(f"✅ {os.path.basename(file_path)} - Added listener at end")
    else:
        # Append at end of file
        content += listener_code
        print(f"✅ {os.path.basename(file_path)} - Added listener at end")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("\n✅ Language listeners added to all pages!")
