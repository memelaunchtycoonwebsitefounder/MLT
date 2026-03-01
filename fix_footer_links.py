#!/usr/bin/env python3
import re

print("🔧 Fixing footer links in index.tsx...")

with open('src/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix footer links - replace all occurrences
replacements = [
    # Fix About link (currently points to /dashboard)
    (r'<a href="/dashboard" data-i18n="footer\.about">About</a>', 
     r'<a href="/about" data-i18n="footer.about">About</a>'),
    
    # Fix Privacy Policy link (currently href="#")
    (r'<a href="#" data-i18n="footer\.privacy">Privacy Policy</a>', 
     r'<a href="/privacy-policy" data-i18n="footer.privacy">Privacy Policy</a>'),
    
    # Fix Terms of Service link (currently href="#")
    (r'<a href="#" data-i18n="footer\.terms">Terms of Service</a>', 
     r'<a href="/terms-of-service" data-i18n="footer.terms">Terms of Service</a>'),
    
    # Fix Contact link (currently href="#")
    (r'<a href="#" data-i18n="footer\.contact">Contact</a>', 
     r'<a href="/contact" data-i18n="footer.contact">Contact</a>'),
]

for old, new in replacements:
    count = len(re.findall(old, content))
    if count > 0:
        content = re.sub(old, new, content)
        print(f"  ✅ Replaced {count} occurrence(s): {old[:50]}...")

with open('src/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ All footer links fixed!")
print("\nFixed links:")
print("  • About:          /about")
print("  • Privacy Policy: /privacy-policy")
print("  • Terms:          /terms-of-service")
print("  • Contact:        /contact")
