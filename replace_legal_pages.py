#!/usr/bin/env python3
import json
import re

print("🔧 Replacing legal pages with full content...")

# Load the extracted legal pages content
with open('legal_pages_extracted.json', 'r', encoding='utf-8') as f:
    legal_data = json.load(f)

# Read index.tsx
with open('src/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the styles
styles = legal_data['styles']

# Create full HTML template function
def create_legal_page(title, section_html, description):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - MemeLaunch Tycoon</title>
    <meta name="description" content="{description}">
    <link href="https://cdn.tailwindcss.com/2.2.19/tailwind.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="/static/styles.css?v=20260221151619" rel="stylesheet">
    <style>
{styles}
    </style>
</head>
<body style="background: linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%); min-height: 100vh; color: white;">
    <div id="language-switcher-container"></div>
    
    <!-- Sticky Navigation -->
    <nav class="nav-sticky">
        <div class="container mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <a href="/" class="text-2xl font-bold" style="color: #FF6B35;">
                    <i class="fas fa-rocket mr-2"></i>MemeLaunch Tycoon
                </a>
                <div class="flex gap-6">
                    <a href="/about" class="text-white hover:text-orange-400 transition">About</a>
                    <a href="/contact" class="text-white hover:text-orange-400 transition">Contact</a>
                    <a href="/privacy-policy" class="text-white hover:text-orange-400 transition">Privacy</a>
                    <a href="/terms-of-service" class="text-white hover:text-orange-400 transition">Terms</a>
                    <a href="/" class="text-gray-300 hover:text-white transition">
                        <i class="fas fa-home mr-2"></i>Home
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Content -->
    <div class="container mx-auto px-6 py-12 max-w-5xl">
{section_html}
    </div>

    <!-- Footer -->
    <footer class="mt-16 py-8 border-t border-white/10">
        <div class="container mx-auto px-6 text-center text-gray-400">
            <p>&copy; 2026 MemeLaunch Tycoon Ltd. All rights reserved.</p>
            <div class="mt-4 space-x-4">
                <a href="/about" class="hover:text-white">About</a>
                <a href="/contact" class="hover:text-white">Contact</a>
                <a href="/privacy-policy" class="hover:text-white">Privacy Policy</a>
                <a href="/terms-of-service" class="hover:text-white">Terms of Service</a>
            </div>
        </div>
    </footer>

    <script src="/static/i18n.js?v=20260221151619"></script>
    <script src="/static/language-switcher.js?v=20260221151619"></script>
    <!-- Cookie Consent & Compliance -->
    <link rel="stylesheet" href="/static/cookie-styles.css">
    <script src="/static/cookie-consent.js"></script>
</body>
</html>'''

# Find and replace About page
about_start = content.find("// About Us page\napp.get('/about',")
about_end = content.find("// Contact page\napp.get('/contact',")
if about_start != -1 and about_end != -1:
    about_replacement = f"""// About Us page
app.get('/about', (c) => {{
  return c.html(`
{create_legal_page('About Us', legal_data['sections']['about'], 'Learn about MemeLaunch Tycoon')}
  `);
}});

"""
    content = content[:about_start] + about_replacement + content[about_end:]
    print("✅ Replaced About page")

# Find and replace Contact page
contact_start = content.find("// Contact page\napp.get('/contact',")
contact_end = content.find("// Privacy Policy page\napp.get('/privacy-policy',")
if contact_start != -1 and contact_end != -1:
    contact_replacement = f"""// Contact page
app.get('/contact', (c) => {{
  return c.html(`
{create_legal_page('Contact Us', legal_data['sections']['contact'], 'Contact MemeLaunch Tycoon')}
  `);
}});

"""
    content = content[:contact_start] + contact_replacement + content[contact_end:]
    print("✅ Replaced Contact page")

# Find and replace Privacy Policy page
privacy_start = content.find("// Privacy Policy page\napp.get('/privacy-policy',")
privacy_end = content.find("// Terms of Service page\napp.get('/terms-of-service',")
if privacy_start != -1 and privacy_end != -1:
    privacy_replacement = f"""// Privacy Policy page
app.get('/privacy-policy', (c) => {{
  return c.html(`
{create_legal_page('Privacy Policy', legal_data['sections']['privacy'], 'MemeLaunch Tycoon Privacy Policy')}
  `);
}});

"""
    content = content[:privacy_start] + privacy_replacement + content[privacy_end:]
    print("✅ Replaced Privacy Policy page")

# Find and replace Terms of Service page
terms_start = content.find("// Terms of Service page\napp.get('/terms-of-service',")
# Find the next route or export statement
terms_end = content.find("\n\nexport", terms_start)
if terms_end == -1:
    terms_end = content.find("\n\napp.get('", terms_start + 100)
if terms_start != -1 and terms_end != -1:
    terms_replacement = f"""// Terms of Service page
app.get('/terms-of-service', (c) => {{
  return c.html(`
{create_legal_page('Terms of Service', legal_data['sections']['terms'], 'MemeLaunch Tycoon Terms of Service')}
  `);
}});
"""
    content = content[:terms_start] + terms_replacement + content[terms_end:]
    print("✅ Replaced Terms of Service page")

# Write updated content
with open('src/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ All legal pages replaced with full content!")
print("📄 Pages updated: About, Contact, Privacy Policy, Terms of Service")
