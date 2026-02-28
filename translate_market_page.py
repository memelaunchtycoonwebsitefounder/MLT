#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Translate Market page - Replace all Chinese strings with data-i18n
"""

def translate_market():
    with open('src/index.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find Market section
    market_start = content.find("app.get('/market'")
    market_end = content.find("app.get('/create'", market_start)
    
    before = content[:market_start]
    market_section = content[market_start:market_end]
    after = content[market_end:]
    
    # All replacements
    replacements = [
        # Title
        ('<title>市場 - MemeLaunch Tycoon</title>',
         '<title data-i18n="market.title">Market</title> - MemeLaunch Tycoon'),
        
        # Navigation (reuse nav keys from Create page)
        ('<a href="/dashboard" class="hover:text-orange-500 transition">儀表板</a>',
         '<a href="/dashboard" class="hover:text-orange-500 transition" data-i18n="nav.dashboard">Dashboard</a>'),
        
        ('<a href="/market" class="text-orange-500 font-bold">市場</a>',
         '<a href="/market" class="text-orange-500 font-bold" data-i18n="nav.market">Market</a>'),
        
        ('<a href="/portfolio" class="hover:text-orange-500 transition">投資組合</a>',
         '<a href="/portfolio" class="hover:text-orange-500 transition" data-i18n="nav.portfolio">Portfolio</a>'),
        
        ('<a href="/achievements" class="hover:text-orange-500 transition">成就</a>',
         '<a href="/achievements" class="hover:text-orange-500 transition" data-i18n="nav.achievements">Achievements</a>'),
        
        ('<a href="/leaderboard" class="hover:text-orange-500 transition">排行榜</a>',
         '<a href="/leaderboard" class="hover:text-orange-500 transition" data-i18n="nav.leaderboard">Leaderboard</a>'),
        
        ('<a href="/social" class="hover:text-orange-500 transition">社交</a>',
         '<a href="/social" class="hover:text-orange-500 transition" data-i18n="nav.social">Social</a>'),
        
        # Balance
        ('<span id="user-balance">--</span> 金幣',
         '<span id="user-balance">--</span> <span data-i18n="common.coins">Coins</span>'),
        
        # Back button
        ('>返回儀表板<',
         '><span data-i18n="market.backToDashboard">Back to Dashboard</span><'),
        
        # Page header
        ('<i class="fas fa-store mr-3"></i>Meme 幣市場',
         '<i class="fas fa-store mr-3"></i>Meme <span data-i18n="market.marketTitle">Coin Market</span>'),
        
        ('<p class="text-gray-400">探索、交易數千種 Meme 幣</p>',
         '<p class="text-gray-400"><span data-i18n="market.subtitle">Explore and trade thousands of Meme coins</span></p>'),
        
        # Search
        ('<i class="fas fa-search mr-2"></i>搜索',
         '<i class="fas fa-search mr-2"></i><span data-i18n="market.search">Search</span>'),
        
        ('placeholder="搜索幣種名稱或符號..."',
         'placeholder="Search coin name or symbol..." data-i18n-placeholder="market.searchPlaceholder"'),
        
        # Sort
        ('<i class="fas fa-sort mr-2"></i>排序',
         '<i class="fas fa-sort mr-2"></i><span data-i18n="market.sort">Sort</span>'),
        
        ('<option value="created_at_desc">最新創建</option>',
         '<option value="created_at_desc" data-i18n="market.sortNewest">Newest Created</option>'),
        
        ('<option value="created_at_asc">最早創建</option>',
         '<option value="created_at_asc" data-i18n="market.sortOldest">Oldest Created</option>'),
        
        ('<option value="bonding_curve_progress_desc">🚀 進度最高</option>',
         '<option value="bonding_curve_progress_desc">🚀 <span data-i18n="market.sortProgressHigh">Progress Highest</span></option>'),
        
        ('<option value="bonding_curve_progress_asc">🐣 進度最低</option>',
         '<option value="bonding_curve_progress_asc">🐣 <span data-i18n="market.sortProgressLow">Progress Lowest</span></option>'),
        
        ('<option value="real_trade_count_desc">👤 真實交易最多</option>',
         '<option value="real_trade_count_desc">👤 <span data-i18n="market.sortRealTrades">Most Real Trades</span></option>'),
        
        ('<option value="current_price_desc">價格最高</option>',
         '<option value="current_price_desc" data-i18n="market.sortPriceHigh">Price Highest</option>'),
        
        ('<option value="current_price_asc">價格最低</option>',
         '<option value="current_price_asc" data-i18n="market.sortPriceLow">Price Lowest</option>'),
        
        ('<option value="market_cap_desc">市值最高</option>',
         '<option value="market_cap_desc" data-i18n="market.sortMarketCapHigh">Market Cap Highest</option>'),
        
        ('<option value="market_cap_asc">市值最低</option>',
         '<option value="market_cap_asc" data-i18n="market.sortMarketCapLow">Market Cap Lowest</option>'),
        
        ('<option value="hype_score_desc">最熱門</option>',
         '<option value="hype_score_desc" data-i18n="market.sortHottest">Hottest</option>'),
        
        ('<option value="transaction_count_desc">交易最多</option>',
         '<option value="transaction_count_desc" data-i18n="market.sortMostTrades">Most Trades</option>'),
        
        # Destiny filter
        ('<i class="fas fa-shield-alt mr-2"></i>命運',
         '<i class="fas fa-shield-alt mr-2"></i><span data-i18n="market.destiny">Destiny</span>'),
        
        ('<option value="">全部</option>',
         '<option value="" data-i18n="market.filterAll">All</option>'),
        
        ('<option value="SURVIVAL">🛡️ 生存</option>',
         '<option value="SURVIVAL">🛡️ <span data-i18n="market.filterSurvival">Survival</span></option>'),
        
        ('<option value="EARLY_DEATH">💀 高風險</option>',
         '<option value="EARLY_DEATH">💀 <span data-i18n="market.filterHighRisk">High Risk</span></option>'),
        
        ('<option value="LATE_DEATH">⏳ 中風險</option>',
         '<option value="LATE_DEATH">⏳ <span data-i18n="market.filterMediumRisk">Medium Risk</span></option>'),
        
        ('<option value="GRADUATION">🎓 畢業</option>',
         '<option value="GRADUATION">🎓 <span data-i18n="market.filterGraduated">Graduated</span></option>'),
        
        # Apply filter button
        ('<i class="fas fa-filter mr-2"></i>應用篩選',
         '<i class="fas fa-filter mr-2"></i><span data-i18n="market.applyFilter">Apply Filter</span>'),
        
        # Stats cards
        ('<p class="text-sm text-gray-400">總幣種數</p>',
         '<p class="text-sm text-gray-400"><span data-i18n="market.totalCoins">Total Coins</span></p>'),
        
        ('<p class="text-sm text-gray-400">24h 交易量</p>',
         '<p class="text-sm text-gray-400"><span data-i18n="market.volume24h">24h Volume</span></p>'),
        
        ('<p class="text-sm text-gray-400">持有人數</p>',
         '<p class="text-sm text-gray-400"><span data-i18n="market.holders">Holders</span></p>'),
        
        ('<p class="text-sm text-gray-400">熱門幣種</p>',
         '<p class="text-sm text-gray-400"><span data-i18n="market.trending">Trending</span></p>'),
        
        # Loading & empty states
        ('<p class="text-xl text-gray-400">載入中...</p>',
         '<p class="text-xl text-gray-400"><span data-i18n="market.loading">Loading...</span></p>'),
        
        # Pagination
        ('<i class="fas fa-chevron-left mr-2"></i>上一頁',
         '<i class="fas fa-chevron-left mr-2"></i><span data-i18n="market.prevPage">Previous</span>'),
        
        ('<span class="text-sm text-gray-400">第</span>',
         '<span class="text-sm text-gray-400"><span data-i18n="market.page">Page</span></span>'),
        
        ('<span class="text-sm text-gray-400">頁</span>',
         '<span class="text-sm text-gray-400"></span>'),
        
        ('下一頁<i class="fas fa-chevron-right ml-2"></i>',
         '<span data-i18n="market.nextPage">Next</span><i class="fas fa-chevron-right ml-2"></i>'),
        
        # Empty state
        ('<p class="text-xl text-gray-400 mb-2">找不到符合條件的幣種</p>',
         '<p class="text-xl text-gray-400 mb-2"><span data-i18n="market.noResults">No coins found matching criteria</span></p>'),
        
        ('<p class="text-gray-500">試試調整搜索或篩選條件</p>',
         '<p class="text-gray-500"><span data-i18n="market.tryAdjust">Try adjusting search or filter criteria</span></p>'),
    ]
    
    modified_section = market_section
    count = 0
    
    for old, new in replacements:
        if old in modified_section:
            modified_section = modified_section.replace(old, new)
            count += 1
            print(f"✓ {old[:60]}...")
        else:
            print(f"⚠ Not found: {old[:60]}...")
    
    # Write back
    new_content = before + modified_section + after
    with open('src/index.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"\n✅ Applied {count} replacements to Market page")

if __name__ == '__main__':
    translate_market()
