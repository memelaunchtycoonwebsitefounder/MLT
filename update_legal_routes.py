#!/usr/bin/env python3

print("🔧 Updating legal page routes to use static HTML file...")

# Read index.tsx
with open('src/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Simple redirect routes for all legal pages
legal_routes = '''
// ============================================
// LEGAL PAGES - Redirect to static legal.html with anchors
// ============================================

// About Us page
app.get('/about', (c) => {
  return c.redirect('/legal.html#about');
});

// Contact page
app.get('/contact', (c) => {
  return c.redirect('/legal.html#contact');
});

// Privacy Policy page
app.get('/privacy-policy', (c) => {
  return c.redirect('/legal.html#privacy');
});

// Terms of Service page
app.get('/terms-of-service', (c) => {
  return c.redirect('/legal.html#terms');
});
'''

# Find the legal pages section
legal_start = content.find("// ============================================\n// LEGAL PAGES")
if legal_start == -1:
    legal_start = content.find("// About Us page\napp.get('/about',")

# Find the end (look for the next major section or export)
legal_end = content.find("\n\nexport", legal_start)
if legal_end == -1:
    legal_end = content.find("\n\napp.get('/ws'", legal_start)
if legal_end == -1:
    # Try to find WebSocket endpoint
    legal_end = content.find("// WebSocket endpoint", legal_start)

if legal_start != -1 and legal_end != -1:
    # Replace the entire legal pages section
    content = content[:legal_start] + legal_routes + "\n" + content[legal_end:]
    print("✅ Replaced all legal page routes with redirects")
else:
    print("❌ Could not find legal pages section")
    print(f"Start: {legal_start}, End: {legal_end}")

# Write updated content
with open('src/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Legal pages now redirect to /legal.html with anchor links")
print("📄 Routes updated:")
print("  /about → /legal.html#about")
print("  /contact → /legal.html#contact")
print("  /privacy-policy → /legal.html#privacy")
print("  /terms-of-service → /legal.html#terms")

