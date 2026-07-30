/**
 * Live Chart & Trade Animations
 * 实时图表更新和交易动画
 */

(function() {
  'use strict';
  
  const COIN_ID = window.COIN_ID || (window.location.pathname.match(/\/coin\/(\d+)/) || [])[1];
  if (!COIN_ID) return;

  console.log(`[LiveChart] Initialized for coin ${COIN_ID}`);

  let lastTradeId = 0;
  let lastPriceUpdate = Date.now();
  let priceCache = [];

  /**
   * 实时更新价格和交易
   */
  async function updateLiveData() {
    try {
      // 获取最新交易
      const tradesResponse = await fetch(`/api/simulation/${COIN_ID}/trades?limit=10`);
      const tradesData = await tradesResponse.json();

      if (tradesData.success && tradesData.data && tradesData.data.length > 0) {
        const newTrades = tradesData.data.filter(t => t.id > lastTradeId);
        
        if (newTrades.length > 0) {
          // 更新最后ID
          lastTradeId = tradesData.data[0].id;
          
          // 显示新交易动画
          newTrades.forEach(trade => {
            showLiveTradeAnimation(trade);
          });

          // 刷新交易列表
          if (window.loadRecentTransactions) {
            window.loadRecentTransactions();
          }
        }
      }

      // 获取价格历史
      const priceResponse = await fetch(`/api/simulation/${COIN_ID}/price-history?hours=1`);
      const priceData = await priceResponse.json();

      if (priceData.success && priceData.data && priceData.data.length > 0) {
        const latestPrice = priceData.data[priceData.data.length - 1];
        updateLivePriceDisplay(latestPrice);
        
        // 如果图表函数存在，更新图表
        if (window.initPriceChart && Date.now() - lastPriceUpdate > 10000) {
          lastPriceUpdate = Date.now();
          window.initPriceChart();
        }
      }

    } catch (error) {
      console.error('[LiveChart] Error updating:', error);
    }
  }

  /**
   * 显示实时交易动画
   */
  function showLiveTradeAnimation(trade) {
    const container = document.getElementById('live-trades-container');
    if (!container) {
      createLiveTradesContainer();
      return showLiveTradeAnimation(trade);
    }

    const botIcon = trade.bot_name.includes('Whale') ? '🐋' :
                    trade.bot_name.includes('Trader') ? '📈' :
                    trade.bot_name.includes('Holder') ? '💎' : '⚡';

    const tradeEl = document.createElement('div');
    tradeEl.className = `trade-notification ${trade.type === 'buy' ? 'trade-buy' : 'trade-sell'} animate-slide-in-right`;
    tradeEl.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="text-2xl">${botIcon}</div>
        <div>
          <p class="font-bold text-white">${trade.bot_name}</p>
          <p class="text-sm ${trade.type === 'buy' ? 'text-green-400' : 'text-red-400'}">
            ${trade.type === 'buy' ? '▲' : '▼'} ${trade.type.toUpperCase()} ${trade.amount} tokens
          </p>
        </div>
        <div class="ml-auto text-right">
          <p class="font-mono text-white">$${trade.price.toFixed(8)}</p>
          <p class="text-xs text-gray-400">${new Date(trade.timestamp).toLocaleTimeString()}</p>
        </div>
      </div>
    `;

    container.insertBefore(tradeEl, container.firstChild);

    // 限制显示数量
    while (container.children.length > 5) {
      container.removeChild(container.lastChild);
    }

    // 5秒后淡出
    setTimeout(() => {
      tradeEl.style.opacity = '0';
      setTimeout(() => tradeEl.remove(), 300);
    }, 5000);
  }

  /**
   * 创建实时交易容器
   */
  function createLiveTradesContainer() {
    const existingContainer = document.getElementById('live-trades-container');
    if (existingContainer) return;

    const container = document.createElement('div');
    container.id = 'live-trades-container';
    container.className = 'fixed bottom-4 right-4 z-40 space-y-2 max-w-md';

    document.body.appendChild(container);

    // 添加样式
    if (!document.getElementById('live-trades-styles')) {
      const style = document.createElement('style');
      style.id = 'live-trades-styles';
      style.textContent = `
        .trade-notification {
          background: rgba(30, 30, 50, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 12px 16px;
          border: 2px solid;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease-out;
        }
        .trade-buy {
          border-color: rgba(34, 197, 94, 0.5);
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(30, 30, 50, 0.95) 100%);
        }
        .trade-sell {
          border-color: rgba(239, 68, 68, 0.5);
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(30, 30, 50, 0.95) 100%);
        }
        @keyframes slide-in-right {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * 更新实时价格显示
   */
  function updateLivePriceDisplay(priceData) {
    const priceEl = document.getElementById('coin-price');
    if (!priceEl) return;

    const oldPrice = parseFloat(priceEl.textContent.replace('$', '').replace(/,/g, ''));
    const newPrice = priceData.price;

    if (oldPrice && newPrice !== oldPrice) {
      // 价格变化动画
      priceEl.classList.add(newPrice > oldPrice ? 'price-up' : 'price-down');
      setTimeout(() => {
        priceEl.classList.remove('price-up', 'price-down');
      }, 1000);
    }

    priceEl.textContent = `$${newPrice.toFixed(8)}`;

    // 更新价格变化指示器
    const priceChangeEl = document.getElementById('coin-price-change');
    if (priceChangeEl && priceCache.length > 0) {
      const firstPrice = priceCache[0].price;
      const change = ((newPrice - firstPrice) / firstPrice) * 100;
      const isPositive = change >= 0;
      
      priceChangeEl.innerHTML = `
        <i class="fas fa-arrow-${isPositive ? 'up' : 'down'} mr-1"></i>
        ${isPositive ? '+' : ''}${change.toFixed(2)}%
      `;
      priceChangeEl.className = `${isPositive ? 'text-green-400' : 'text-red-400'} text-lg mt-2`;
    }

    // 添加价格到缓存
    priceCache.push(priceData);
    if (priceCache.length > 20) priceCache.shift();

    // 添加价格动画样式
    if (!document.getElementById('price-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'price-animation-styles';
      style.textContent = `
        @keyframes price-flash-up {
          0%, 100% { background-color: transparent; }
          50% { background-color: rgba(34, 197, 94, 0.3); }
        }
        @keyframes price-flash-down {
          0%, 100% { background-color: transparent; }
          50% { background-color: rgba(239, 68, 68, 0.3); }
        }
        .price-up {
          animation: price-flash-up 1s ease-out;
        }
        .price-down {
          animation: price-flash-down 1s ease-out;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * 主循环
   */
  function startLiveUpdates() {
    createLiveTradesContainer();
    
    // 初始加载
    updateLiveData();

    // 每5秒更新
    setInterval(updateLiveData, 5000);

    console.log('[LiveChart] Live updates started - polling every 5 seconds');
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startLiveUpdates);
  } else {
    startLiveUpdates();
  }

  console.log('[LiveChart] Live chart system active! 📈');
})();
