#!/usr/bin/env python3
import re
from datetime import datetime

print("🔧 Adding version meta tag to HTML responses...")

with open('src/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Get current timestamp for version
version = datetime.now().strftime("%Y%m%d%H%M")

# Pattern to find <meta name="viewport" ...> and add version after it
viewport_pattern = r'(<meta name="viewport"[^>]*>)'
version_meta = f'\\1\n        <meta name="version" content="{version}">'

# Replace in all HTML responses
content = re.sub(viewport_pattern, version_meta, content)

with open('src/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✅ Added version meta tag: {version}")
print("✅ This helps browsers recognize the new version")
