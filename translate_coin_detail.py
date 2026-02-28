#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Translate Coin Detail page - Replace all Chinese strings with data-i18n
"""

def translate_coin_detail():
    with open('src/index.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find Coin Detail section
    coin_start = content.find("app.get('/coin/:id'")
    coin_end = content.find("app.get('/market'", coin_start)
    
    before = content[:coin_start]
    coin_section = content[coin_start:coin_end]
    after = content[coin_end:]
    
    # All replacements
    replacements = [
        # Title
        ('<title>幣種詳情 - MemeLaunch Tycoon</title>',
         '<title data-i18n="coinDetail.title">Coin Detail</title> - MemeLaunch Tycoon'),
        
        # Navigation (reuse existing nav keys)
        ('<a href="/social" class="hover:text-orange-500 transition">社交</a>',
         '<a href="/social" class="hover:text-orange-500 transition" data-i18n="nav.social">Social</a>'),
        
        # Back to market
        ('<i class="fas fa-arrow-left mr-2"></i>返回市場',
         '<i class="fas fa-arrow-left mr-2"></i><span data-i18n="coinDetail.backToMarket">Back to Market</span>'),
        
        # Loading state
        ('<p class="text-xl text-gray-400">載入中...</p>',
         '<p class="text-xl text-gray-400"><span data-i18n="coinDetail.loading">Loading...</span></p>'),
        
        # Creator
        ('創建者: <span id="coin-creator">--</span>',
         '<span data-i18n="coinDetail.creator">Creator:</span> <span id="coin-creator">--</span>'),
        
        # Current price
        ('<p class="text-sm text-gray-400 mb-1">當前價格</p>',
         '<p class="text-sm text-gray-400 mb-1"><span data-i18n="coinDetail.currentPrice">Current Price</span></p>'),
        
        # Price chart
        ('<i class="fas fa-chart-line mr-2"></i>價格走勢',
         '<i class="fas fa-chart-line mr-2"></i><span data-i18n="coinDetail.priceChart">Price Chart</span>'),
        
        # Time frames - 5m
        ('<button class="timeframe-btn active bg-orange-500 px-4 py-2 rounded-lg transition hover:bg-orange-600" data-timeframe="5m">5 分鐘</button>',
         '<button class="timeframe-btn active bg-orange-500 px-4 py-2 rounded-lg transition hover:bg-orange-600" data-timeframe="5m">5 <span data-i18n="coinDetail.minutes">min</span></button>'),
        
        # 15m
        ('<button class="timeframe-btn px-4 py-2 rounded-lg transition bg-white/10 hover:bg-white/20" data-timeframe="15m">15 分鐘</button>',
         '<button class="timeframe-btn px-4 py-2 rounded-lg transition bg-white/10 hover:bg-white/20" data-timeframe="15m">15 <span data-i18n="coinDetail.minutes">min</span></button>'),
        
        # 1h
        ('<button class="timeframe-btn px-4 py-2 rounded-lg transition bg-white/10 hover:bg-white/20" data-timeframe="1h">1 小時</button>',
         '<button class="timeframe-btn px-4 py-2 rounded-lg transition bg-white/10 hover:bg-white/20" data-timeframe="1h">1 <span data-i18n="coinDetail.hour">hour</span></button>'),
        
        # 4h
        ('<button class="timeframe-btn px-4 py-2 rounded-lg transition bg-white/10 hover:bg-white/20" data-timeframe="4h">4 小時</button>',
         '<button class="timeframe-btn px-4 py-2 rounded-lg transition bg-white/10 hover:bg-white/20" data-timeframe="4h">4 <span data-i18n="coinDetail.hours">hours</span></button>'),
        
        # Refresh chart button
        ('<button id="refresh-chart-btn" class="px-4 py-2 rounded-lg transition bg-blue-500 hover:bg-blue-600 text-white"><i class="fas fa-sync-alt mr-2"></i>手動刷新圖表</button>',
         '<button id="refresh-chart-btn" class="px-4 py-2 rounded-lg transition bg-blue-500 hover:bg-blue-600 text-white"><i class="fas fa-sync-alt mr-2"></i><span data-i18n="coinDetail.refreshChart">Refresh Chart</span></button>'),
        
        # Stats - Market Cap
        ('<p class="text-sm text-gray-400 mb-1">市值</p>',
         '<p class="text-sm text-gray-400 mb-1"><span data-i18n="coinDetail.marketCap">Market Cap</span></p>'),
        
        # Supply
        ('<p class="text-sm text-gray-400 mb-1">供應量</p>',
         '<p class="text-sm text-gray-400 mb-1"><span data-i18n="coinDetail.supply">Supply</span></p>'),
        
        # Holders
        ('<p class="text-sm text-gray-400 mb-1">持有人</p>',
         '<p class="text-sm text-gray-400 mb-1"><span data-i18n="coinDetail.holders">Holders</span></p>'),
        
        # Trades
        ('<p class="text-sm text-gray-400 mb-1">交易數</p>',
         '<p class="text-sm text-gray-400 mb-1"><span data-i18n="coinDetail.trades">Trades</span></p>'),
        
        # About section
        ('<i class="fas fa-info-circle mr-2"></i>關於',
         '<i class="fas fa-info-circle mr-2"></i><span data-i18n="coinDetail.about">About</span>'),
        
        # Recent transactions
        ('<i class="fas fa-history mr-2"></i>最近交易',
         '<i class="fas fa-history mr-2"></i><span data-i18n="coinDetail.recentTransactions">Recent Transactions</span>'),
        
        # Bonding curve progress
        ('<i class="fas fa-chart-line mr-2 text-orange-500"></i>Bonding Curve 進度',
         '<i class="fas fa-chart-line mr-2 text-orange-500"></i>Bonding Curve <span data-i18n="coinDetail.progress">Progress</span>'),
        
        # Initial
        ('<div class="text-gray-400">初始</div>',
         '<div class="text-gray-400"><span data-i18n="coinDetail.initial">Initial</span></div>'),
        
        # Graduation
        ('<div class="text-gray-400">畢業</div>',
         '<div class="text-gray-400"><span data-i18n="coinDetail.graduation">Graduation</span></div>'),
        
        # Destiny unknown
        ('<span id="destiny-text" class="text-gray-300">命運未知...</span>',
         '<span id="destiny-text" class="text-gray-300"><span data-i18n="coinDetail.destinyUnknown">Destiny Unknown...</span></span>'),
        
        # AI Trading Activity
        ('<i class="fas fa-robot mr-2 text-purple-500"></i>AI 交易活動',
         '<i class="fas fa-robot mr-2 text-purple-500"></i>AI <span data-i18n="coinDetail.tradingActivity">Trading Activity</span>'),
        
        # AI Trades
        ('<i class="fas fa-robot mr-1"></i>AI 交易',
         '<i class="fas fa-robot mr-1"></i>AI <span data-i18n="coinDetail.trades">Trades</span>'),
        
        # Automated market maker
        ('<div class="text-xs text-gray-400">自動市場做市商</div>',
         '<div class="text-xs text-gray-400"><span data-i18n="coinDetail.automatedMM">Automated Market Maker</span></div>'),
        
        # Real trades
        ('<i class="fas fa-user mr-1"></i>真實交易',
         '<i class="fas fa-user mr-1"></i><span data-i18n="coinDetail.realTrades">Real Trades</span>'),
        
        # Unique traders
        ('<span id="unique-traders">0</span> 位獨立交易者',
         '<span id="unique-traders">0</span> <span data-i18n="coinDetail.uniqueTraders">unique traders</span>'),
        
        # AI system status
        ('<span class="text-sm text-gray-300">AI 系統狀態</span>',
         '<span class="text-sm text-gray-300">AI <span data-i18n="coinDetail.systemStatus">System Status</span></span>'),
        
        # Running
        ('<span class="text-sm text-green-400 font-bold">運行中</span>',
         '<span class="text-sm text-green-400 font-bold"><span data-i18n="coinDetail.running">Running</span></span>'),
        
        # Event timeline
        ('<i class="fas fa-history mr-2 text-blue-500"></i>事件時間線',
         '<i class="fas fa-history mr-2 text-blue-500"></i><span data-i18n="coinDetail.eventTimeline">Event Timeline</span>'),
        
        # Timeline loading
        ('<p class="text-gray-400 text-center py-4">載入中...</p>',
         '<p class="text-gray-400 text-center py-4"><span data-i18n="coinDetail.loading">Loading...</span></p>'),
        
        # Bonding progress (in aside)
        ('>Bonding Curve 進度<',
         '>Bonding Curve <span data-i18n="coinDetail.progress">Progress</span><'),
        
        # Remaining
        ('<span id="bonding-remaining">剩餘 0</span>',
         '<span id="bonding-remaining"><span data-i18n="coinDetail.remaining">Remaining</span> 0</span>'),
        
        # Trade section
        ('<i class="fas fa-exchange-alt mr-2"></i>交易',
         '<i class="fas fa-exchange-alt mr-2"></i><span data-i18n="coinDetail.trade">Trade</span>'),
        
        # Buy tab
        ('>買入<',
         '><span data-i18n="coinDetail.buy">Buy</span><'),
        
        # Sell tab
        ('>賣出<',
         '><span data-i18n="coinDetail.sell">Sell</span><'),
        
        # Buy amount
        ('<label class="block text-sm font-medium">購買數量</label>',
         '<label class="block text-sm font-medium"><span data-i18n="coinDetail.buyAmount">Buy Amount</span></label>'),
        
        # Amount placeholder
        ('placeholder="輸入數量..."',
         'placeholder="Enter amount..." data-i18n-placeholder="coinDetail.enterAmount"'),
        
        # Max button (in buy section)
        ('>最大<',
         '><span data-i18n="coinDetail.max">Max</span><'),
        
        # Unit price
        ('<span class="text-gray-400">單價:</span>',
         '<span class="text-gray-400"><span data-i18n="coinDetail.unitPrice">Unit Price:</span></span>'),
        
        # Subtotal
        ('<span class="text-gray-400">小計:</span>',
         '<span class="text-gray-400"><span data-i18n="coinDetail.subtotal">Subtotal:</span></span>'),
        
        # Fee
        ('<span class="text-gray-400">手續費 (1%):</span>',
         '<span class="text-gray-400"><span data-i18n="coinDetail.fee">Fee (1%):</span></span>'),
        
        # Total (buy)
        ('<span class="text-gray-300 font-bold">總計:</span>',
         '<span class="text-gray-300 font-bold"><span data-i18n="coinDetail.total">Total:</span></span>'),
        
        # Buy now button
        ('>立即買入<',
         '><span data-i18n="coinDetail.buyNow">Buy Now</span><'),
        
        # Sell amount
        ('<span class="text-sm font-medium">賣出數量</span>',
         '<span class="text-sm font-medium"><span data-i18n="coinDetail.sellAmount">Sell Amount</span></span>'),
        
        # Holdings
        ('<span class="text-sm text-gray-400">持有: <span id="holdings-amount">0</span>',
         '<span class="text-sm text-gray-400"><span data-i18n="coinDetail.holdings">Holdings:</span> <span id="holdings-amount">0</span>'),
        
        # All button (in sell section)
        ('>全部<',
         '><span data-i18n="coinDetail.all">All</span><'),
        
        # Proceeds
        ('<span class="text-gray-300 font-bold">收益:</span>',
         '<span class="text-gray-300 font-bold"><span data-i18n="coinDetail.proceeds">Proceeds:</span></span>'),
        
        # Holdings value
        ('<span class="text-gray-300">持倉價值:</span>',
         '<span class="text-gray-300"><span data-i18n="coinDetail.holdingsValue">Holdings Value:</span></span>'),
        
        # Sell now button
        ('>立即賣出<',
         '><span data-i18n="coinDetail.sellNow">Sell Now</span><'),
        
        # Hype score
        ('<i class="fas fa-fire text-orange-500 mr-2"></i>Hype 分數',
         '<i class="fas fa-fire text-orange-500 mr-2"></i>Hype <span data-i18n="coinDetail.score">Score</span>'),
        
        # Out of 200
        ('<p class="text-sm text-gray-400 mt-1">滿分 200</p>',
         '<p class="text-sm text-gray-400 mt-1"><span data-i18n="coinDetail.outOf200">Out of 200</span></p>'),
        
        # Share
        ('<i class="fas fa-share-alt mr-2"></i>分享',
         '<i class="fas fa-share-alt mr-2"></i><span data-i18n="coinDetail.share">Share</span>'),
        
        # Copy link
        ('<i class="fas fa-link mr-2"></i>複製連結',
         '<i class="fas fa-link mr-2"></i><span data-i18n="coinDetail.copyLink">Copy Link</span>'),
    ]
    
    modified_section = coin_section
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
    
    print(f"\n✅ Applied {count} replacements to Coin Detail page")

if __name__ == '__main__':
    translate_coin_detail()
