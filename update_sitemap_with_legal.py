#!/usr/bin/env python3

print("🔧 Updating sitemap.xml with legal pages...")

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
  
  <!-- Legal Pages -->
  <url>
    <loc>https://memelaunchtycoon.com/about</loc>
    <lastmod>2026-03-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>https://memelaunchtycoon.com/contact</loc>
    <lastmod>2026-03-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>https://memelaunchtycoon.com/privacy-policy</loc>
    <lastmod>2026-03-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <url>
    <loc>https://memelaunchtycoon.com/terms-of-service</loc>
    <lastmod>2026-03-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
"""

with open('public/sitemap.xml', 'w', encoding='utf-8') as f:
    f.write(sitemap_content)

print("✅ Updated sitemap.xml with 4 legal pages!")
print("\nPages added:")
print("  - /about")
print("  - /contact")
print("  - /privacy-policy")
print("  - /terms-of-service")
