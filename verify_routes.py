#!/usr/bin/env python3
import re

print("🔍 Verifying all legal page routes in index.tsx...\n")

with open('src/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

routes_to_check = [
    ('/about', 'About page'),
    ('/contact', 'Contact page'),
    ('/privacy-policy', 'Privacy Policy page'),
    ('/privacy', 'Privacy alias'),
    ('/terms-of-service', 'Terms of Service page'),
    ('/terms', 'Terms alias'),
]

for route, description in routes_to_check:
    pattern = rf"app\.get\('{route}'"
    if re.search(pattern, content):
        print(f"✅ {route:<20} → {description}")
    else:
        print(f"❌ {route:<20} → {description} (MISSING!)")

print("\n" + "="*60)
print("Route verification complete!")
