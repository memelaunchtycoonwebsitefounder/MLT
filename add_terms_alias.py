#!/usr/bin/env python3

print("🔧 Adding /terms alias route...")

with open('src/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the terms-of-service route
terms_route = """// Terms of Service page
app.get('/terms-of-service', (c) => {
  return c.redirect('/legal.html#terms');
});"""

# Add /terms alias right after
new_routes = """// Terms of Service page
app.get('/terms-of-service', (c) => {
  return c.redirect('/legal.html#terms');
});

// Alias for /terms (shorter URL)
app.get('/terms', (c) => {
  return c.redirect('/legal.html#terms');
});"""

content = content.replace(terms_route, new_routes)

with open('src/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Added /terms alias route")
print("   /terms → /legal.html#terms")
print("   /terms-of-service → /legal.html#terms")

