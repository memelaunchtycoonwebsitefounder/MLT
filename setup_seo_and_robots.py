#!/usr/bin/env python3
import os

print("🔧 Setting up SEO configuration for Google indexing...")

# 1. Create robots.txt
print("\n1️⃣ Creating robots.txt...")
robots_content = """# Allow all search engines to crawl the site
User-agent: *
Allow: /

# Disallow admin/auth endpoints
Disallow: /api/
Disallow: /login
Disallow: /signup
Disallow: /reset-password
Disallow: /forgot-password

# Allow Googlebot specifically
User-agent: Googlebot
Allow: /

# Sitemap location
Sitemap: https://memelaunchtycoon.com/sitemap.xml
"""

with open('public/robots.txt', 'w', encoding='utf-8') as f:
    f.write(robots_content)
print("✅ Created public/robots.txt")

# 2. Create sitemap.xml
print("\n2️⃣ Creating sitemap.xml...")
sitemap_content = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main Pages -->
  <url>
    <loc>https://memelaunchtycoon.com/</loc>
    <lastmod>2026-03-01</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <url>
    <loc>https://memelaunchtycoon.com/market</loc>
    <lastmod>2026-03-01</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>https://memelaunchtycoon.com/dashboard</loc>
    <lastmod>2026-03-01</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://memelaunchtycoon.com/leaderboard</loc>
    <lastmod>2026-03-01</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://memelaunchtycoon.com/social</loc>
    <lastmod>2026-03-01</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>https://memelaunchtycoon.com/achievements</loc>
    <lastmod>2026-03-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
"""

with open('public/sitemap.xml', 'w', encoding='utf-8') as f:
    f.write(sitemap_content)
print("✅ Created public/sitemap.xml")

# 3. Create _headers file for proper serving
print("\n3️⃣ Creating _headers for Cloudflare Pages...")
headers_content = """# Security Headers
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  
# robots.txt headers
/robots.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=3600
  
# sitemap.xml headers
/sitemap.xml
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=3600
"""

with open('public/_headers', 'w', encoding='utf-8') as f:
    f.write(headers_content)
print("✅ Created public/_headers")

print("\n✅ All SEO files created!")
print("\nFiles created:")
print("  - public/robots.txt")
print("  - public/sitemap.xml")
print("  - public/_headers")
