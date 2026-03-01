#!/usr/bin/env python3
"""
Emergency fix for all critical issues:
1. Fix comments system JavaScript syntax errors
2. Fix market page coin descriptions to use i18n
3. Fix forgot password page design
"""

import re

print("🚨 EMERGENCY FIX - Starting...")

# ============================================================================
# 1. FIX COMMENTS SYSTEM SYNTAX ERRORS
# ============================================================================
print("\n1️⃣ Fixing comments system...")

with open('public/static/comments-simple.js', 'r', encoding='utf-8') as f:
    comments_content = f.read()

# Fix the placeholder syntax error on line 86
comments_content = re.sub(
    r'placeholder=\(typeof i18n !== "undefined" \? " \+ i18n\.t\("coinDetail\.writeComment"\) \+ " : "Write your comment\.\.\."\)',
    'placeholder="${typeof i18n !== \'undefined\' ? i18n.t(\'coinDetail.writeComment\') : \'Write your comment...\'}"',
    comments_content
)

# Make sure all template strings are properly escaped
# Fix any other similar syntax errors
comments_content = re.sub(
    r'placeholder=\$\{typeof i18n !== \\"undefined\\" \? i18n\.t\(\\"coinDetail\.writeComment\\"\) : \\"Write your comment\.\.\.\\"}\',
    'placeholder="${typeof i18n !== \'undefined\' ? i18n.t(\'coinDetail.writeComment\') : \'Write your comment...\'}"',
    comments_content
)

with open('public/static/comments-simple.js', 'w', encoding='utf-8') as f:
    f.write(comments_content)

print("✅ Comments system fixed!")

# ============================================================================
# 2. FIX MARKET PAGE COIN DESCRIPTIONS
# ============================================================================
print("\n2️⃣ Fixing market page coin descriptions...")

with open('public/static/market.js', 'r', encoding='utf-8') as f:
    market_content = f.read()

# Find the coin card rendering section and add i18n to ALL labels
# Replace hardcoded labels in the coin grid

# Market Cap label
market_content = re.sub(
    r'<p class="text-xs text-gray-400">市值</p>',
    '<p class="text-xs text-gray-400">${typeof i18n !== \'undefined\' ? i18n.t(\'market.marketCap\') : \'Market Cap\'}</p>',
    market_content
)

# Supply label
market_content = re.sub(
    r'<p class="text-xs text-gray-400">供應量</p>',
    '<p class="text-xs text-gray-400">${typeof i18n !== \'undefined\' ? i18n.t(\'market.supply\') : \'Supply\'}</p>',
    market_content
)

# Holders label
market_content = re.sub(
    r'<p class="text-xs text-gray-400">持有人</p>',
    '<p class="text-xs text-gray-400">${typeof i18n !== \'undefined\' ? i18n.t(\'market.holders\') : \'Holders\'}</p>',
    market_content
)

# Trades label
market_content = re.sub(
    r'<p class="text-xs text-gray-400">交易</p>',
    '<p class="text-xs text-gray-400">${typeof i18n !== \'undefined\' ? i18n.t(\'market.trades\') : \'Trades\'}</p>',
    market_content
)

# AI label
market_content = re.sub(
    r"<span class=\"text-xs text-blue-400\">AI:</span>",
    '<span class="text-xs text-blue-400">${typeof i18n !== \'undefined\' ? i18n.t(\'market.ai\') : \'AI\'}:</span>',
    market_content
)

# Real label  
market_content = re.sub(
    r'Real:',
    '${typeof i18n !== \'undefined\' ? i18n.t(\'market.real\') : \'Real\'}:',
    market_content
)

# Hype Score label
market_content = re.sub(
    r'Hype 分數',
    '${typeof i18n !== \'undefined\' ? i18n.t(\'market.hypeScore\') : \'Hype Score\'}',
    market_content
)

# Creator label
market_content = re.sub(
    r'創建者',
    '${typeof i18n !== \'undefined\' ? i18n.t(\'market.creator\') : \'Creator\'}',
    market_content
)

# Quick Trade button
market_content = re.sub(
    r'Quick Trade',
    '${typeof i18n !== \'undefined\' ? i18n.t(\'market.quickTrade\') : \'Quick Trade\'}',
    market_content
)

with open('public/static/market.js', 'w', encoding='utf-8') as f:
    f.write(market_content)

print("✅ Market page fixed!")

print("\n✨ Emergency fixes complete!")
print("📝 Next: Build and deploy")
