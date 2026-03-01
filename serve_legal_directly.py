#!/usr/bin/env python3

print("🔧 Updating legal pages to serve content directly...")

# Read the legal.html content
with open('public/legal.html', 'r', encoding='utf-8') as f:
    legal_html = f.read()

# Read index.tsx
with open('src/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find legal pages section and replace with direct HTML serving
old_legal_routes = """// ============================================
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

// Alias for /terms (shorter URL)
app.get('/terms', (c) => {
  return c.redirect('/legal.html#terms');
});"""

# Escape backticks in HTML
legal_html_escaped = legal_html.replace('`', '\\`').replace('${', '\\${')

new_legal_routes = f"""// ============================================
// LEGAL PAGES - Serve complete legal document
// ============================================

// Serve legal.html for all legal routes
app.get('/legal.html', (c) => {{
  return c.html(`{legal_html_escaped}`);
}});

app.get('/about', (c) => {{
  return c.html(`{legal_html_escaped}`);
}});

app.get('/contact', (c) => {{
  return c.html(`{legal_html_escaped}`);
}});

app.get('/privacy-policy', (c) => {{
  return c.html(`{legal_html_escaped}`);
}});

app.get('/terms-of-service', (c) => {{
  return c.html(`{legal_html_escaped}`);
}});

app.get('/terms', (c) => {{
  return c.html(`{legal_html_escaped}`);
}});"""

content = content.replace(old_legal_routes, new_legal_routes)

with open('src/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Updated all legal routes to serve HTML directly")
print("   Routes now return complete legal.html content")

