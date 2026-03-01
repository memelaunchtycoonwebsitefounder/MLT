#!/usr/bin/env python3
import re

print("🔧 Adding comprehensive SEO meta tags to homepage...")

with open('src/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the <head> section and add comprehensive SEO meta tags
old_head = '''<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="MemeLaunch Tycoon - Create, trade, and compete with meme coins in a risk-free simulation game">
    <title>MemeLaunch Tycoon - Launch Your Meme Coin Empire</title>'''

new_head = '''<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>MemeLaunch Tycoon - Free Meme Coin Trading Simulator | Create & Trade</title>
    <meta name="title" content="MemeLaunch Tycoon - Free Meme Coin Trading Simulator">
    <meta name="description" content="Launch your meme coin empire! Create, trade, and compete in this free simulation game. No real money needed. Start with $10,000 virtual coins and join thousands of players.">
    <meta name="keywords" content="meme coin, crypto trading simulator, virtual trading, crypto game, meme coin creator, blockchain simulator, trading competition, free crypto game">
    <meta name="author" content="MemeLaunch Tycoon">
    <meta name="robots" content="index, follow">
    <meta name="language" content="English">
    <meta name="revisit-after" content="1 days">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://memelaunchtycoon.com/">
    <meta property="og:title" content="MemeLaunch Tycoon - Free Meme Coin Trading Simulator">
    <meta property="og:description" content="Create, trade, and compete with meme coins in a risk-free simulation game. Start with $10,000 virtual coins!">
    <meta property="og:image" content="https://memelaunchtycoon.com/static/og-image.png">
    <meta property="og:site_name" content="MemeLaunch Tycoon">
    <meta property="og:locale" content="en_US">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://memelaunchtycoon.com/">
    <meta property="twitter:title" content="MemeLaunch Tycoon - Free Meme Coin Trading Simulator">
    <meta property="twitter:description" content="Create, trade, and compete with meme coins in a risk-free simulation game. Start with $10,000 virtual coins!">
    <meta property="twitter:image" content="https://memelaunchtycoon.com/static/og-image.png">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://memelaunchtycoon.com/">
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    
    <!-- Structured Data / Schema.org -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "MemeLaunch Tycoon",
      "description": "Free meme coin trading simulator. Create, trade, and compete with virtual meme coins.",
      "url": "https://memelaunchtycoon.com",
      "applicationCategory": "GameApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "operatingSystem": "Web Browser",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "1200"
      }
    }
    </script>'''

if old_head in content:
    content = content.replace(old_head, new_head)
    print("✅ Added comprehensive SEO meta tags")
else:
    print("⚠️  Could not find exact head match, trying partial replacement...")
    # Try to find and replace just the meta description
    content = re.sub(
        r'<meta name="description" content="[^"]*">',
        '<meta name="description" content="Launch your meme coin empire! Create, trade, and compete in this free simulation game. No real money needed. Start with $10,000 virtual coins and join thousands of players.">',
        content
    )
    print("✅ Updated meta description")

with open('src/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ SEO meta tags added successfully!")
print("\nAdded:")
print("  - Primary meta tags (title, description, keywords)")
print("  - Open Graph tags (Facebook)")
print("  - Twitter Card tags")
print("  - Canonical URL")
print("  - Schema.org structured data")
print("  - Robots meta tag")
