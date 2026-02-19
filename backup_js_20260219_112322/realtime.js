/**
 * Real-time Price Updates using Server-Sent Events (SSE)
 * Handles real-time price streaming and market events
 */

class RealtimeUpdates {
  constructor() {
    this.eventSources = {};
    this.callbacks = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  /**
   * Subscribe to real-time price updates
   */
  subscribeToPrices(callback) {
    if (this.eventSources.prices) {
      this.eventSources.prices.close();
    }

    console.log('Connecting to price stream...');
    const eventSource = new EventSource('/api/realtime/prices');

    eventSource.onopen = () => {
      console.log('✅ Price stream connected');
      this.reconnectAttempts = 0;
    };

    eventSource.addEventListener('connected', (e) => {
      const data = JSON.parse(e.data);
      console.log('Price stream:', data.message);
    });

    eventSource.addEventListener('price_update', (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log(`📊 Price update received: ${data.coins?.length || 0} coins`);
        if (callback) callback(data);
        
        // Update any coin cards on the page
        this.updateCoinCards(data.coins);
        
        // Show market events if any
        if (data.events && data.events.length > 0) {
          this.showMarketEvents(data.events);
        }
      } catch (error) {
        console.error('Error parsing price update:', error);
      }
    });

    eventSource.onerror = (error) => {
      console.error('❌ Price stream error:', error);
      eventSource.close();
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Reconnecting in ${this.reconnectDelay/1000}s (attempt ${this.reconnectAttempts})...`);
        setTimeout(() => {
          this.subscribeToPrices(callback);
        }, this.reconnectDelay);
      } else {
        console.error('Max reconnect attempts reached');
        this.showReconnectPrompt();
      }
    };

    this.eventSources.prices = eventSource;
    return eventSource;
  }

  /**
   * Subscribe to portfolio updates
   */
  subscribeToPortfolio(callback) {
    if (this.eventSources.portfolio) {
      this.eventSources.portfolio.close();
    }

    console.log('Connecting to portfolio stream...');
    const token = localStorage.getItem('auth_token');
    const eventSource = new EventSource(`/api/realtime/portfolio?token=${encodeURIComponent(token)}`);

    eventSource.onopen = () => {
      console.log('✅ Portfolio stream connected');
    };

    eventSource.addEventListener('portfolio_update', (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log('💼 Portfolio update received');
        if (callback) callback(data);
      } catch (error) {
        console.error('Error parsing portfolio update:', error);
      }
    });

    eventSource.onerror = (error) => {
      console.error('❌ Portfolio stream error:', error);
      eventSource.close();
    };

    this.eventSources.portfolio = eventSource;
    return eventSource;
  }

  /**
   * Subscribe to market events
   */
  subscribeToMarketEvents(callback) {
    if (this.eventSources.events) {
      this.eventSources.events.close();
    }

    console.log('Connecting to market events stream...');
    const eventSource = new EventSource('/api/realtime/events');

    eventSource.onopen = () => {
      console.log('✅ Market events stream connected');
    };

    eventSource.addEventListener('market_event', (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log(`🎲 Market event: ${data.event_type}`);
        if (callback) callback(data);
        this.showMarketEventNotification(data);
      } catch (error) {
        console.error('Error parsing market event:', error);
      }
    });

    eventSource.onerror = (error) => {
      console.error('❌ Market events stream error:', error);
      eventSource.close();
    };

    this.eventSources.events = eventSource;
    return eventSource;
  }

  /**
   * Update coin cards on the page with new prices
   */
  updateCoinCards(coins) {
    if (!coins || !Array.isArray(coins)) return;

    coins.forEach(coin => {
      // Update coin card price
      const priceElement = document.querySelector(`[data-coin-id="${coin.id}"] .coin-price`);
      if (priceElement) {
        priceElement.textContent = `$${coin.current_price.toFixed(8)}`;
        priceElement.classList.add('animate-pulse');
        setTimeout(() => priceElement.classList.remove('animate-pulse'), 500);
      }

      // Update coin card market cap
      const marketCapElement = document.querySelector(`[data-coin-id="${coin.id}"] .coin-market-cap`);
      if (marketCapElement) {
        marketCapElement.textContent = `$${coin.market_cap.toFixed(4)}`;
      }

      // Update coin detail page if viewing this coin
      if (window.location.pathname.includes(`/coin/${coin.id}`)) {
        this.updateCoinDetailPage(coin);
      }
    });
  }

  /**
   * Update coin detail page with new data
   */
  updateCoinDetailPage(coin) {
    // Update price
    const priceEl = document.getElementById('coin-price');
    if (priceEl) {
      priceEl.textContent = `$${coin.current_price.toFixed(8)}`;
      priceEl.classList.add('text-green-500');
      setTimeout(() => priceEl.classList.remove('text-green-500'), 1000);
    }

    // Update market cap
    const marketCapEl = document.getElementById('stat-market-cap');
    if (marketCapEl) {
      marketCapEl.textContent = `$${coin.market_cap.toFixed(4)}`;
    }

    // Update hype score
    const hypeScoreEl = document.getElementById('hype-score');
    if (hypeScoreEl) {
      hypeScoreEl.textContent = Math.floor(coin.hype_score || 0);
    }

    const hypeBarEl = document.getElementById('hype-bar');
    if (hypeBarEl) {
      const percentage = Math.min((coin.hype_score / 200) * 100, 100);
      hypeBarEl.style.width = `${percentage}%`;
    }

    // Update trading panel prices
    if (window.tradingPanel) {
      window.tradingPanel.updateCoinData(coin);
    }
  }

  /**
   * Show market events as floating banners
   */
  showMarketEvents(events) {
    const container = document.getElementById('market-events-container') || this.createMarketEventsContainer();

    events.forEach(event => {
      const existingEvent = container.querySelector(`[data-event-id="${event.id}"]`);
      if (existingEvent) return; // Already showing this event

      const eventBanner = this.createEventBanner(event);
      container.appendChild(eventBanner);

      // Remove after duration expires
      const durationMs = event.duration_minutes * 60 * 1000;
      setTimeout(() => {
        eventBanner.style.opacity = '0';
        setTimeout(() => eventBanner.remove(), 300);
      }, durationMs);
    });
  }

  createMarketEventsContainer() {
    const container = document.createElement('div');
    container.id = 'market-events-container';
    container.className = 'fixed top-20 right-4 z-40 space-y-2';
    document.body.appendChild(container);
    return container;
  }

  createEventBanner(event) {
    const banner = document.createElement('div');
    banner.className = 'glass-effect rounded-lg p-4 shadow-2xl animate-slide-in max-w-sm';
    banner.dataset.eventId = event.id;

    const eventIcons = {
      pump: '🚀',
      dump: '📉',
      whale: '🐋',
      news: '📰',
      viral: '🔥'
    };

    const eventColors = {
      pump: 'border-green-500 bg-green-500/10',
      dump: 'border-red-500 bg-red-500/10',
      whale: 'border-blue-500 bg-blue-500/10',
      news: 'border-yellow-500 bg-yellow-500/10',
      viral: 'border-orange-500 bg-orange-500/10'
    };

    banner.className += ` border-2 ${eventColors[event.event_type] || 'border-white/20'}`;

    banner.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="text-3xl">${eventIcons[event.event_type] || '📢'}</div>
        <div class="flex-1">
          <h4 class="font-bold mb-1">${event.title}</h4>
          <p class="text-sm text-gray-300 mb-2">${event.description}</p>
          <div class="flex items-center justify-between text-xs text-gray-400">
            <span>${event.coin_name} ($${event.coin_symbol})</span>
            <span>影響: ${(event.impact_multiplier * 100 - 100).toFixed(0)}%</span>
          </div>
        </div>
        <button onclick="this.closest('[data-event-id]').remove()" class="text-gray-400 hover:text-white">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    return banner;
  }

  showMarketEventNotification(event) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-4 rounded-full shadow-2xl animate-bounce-in font-bold';
    notification.innerHTML = `
      <i class="fas fa-bell mr-2"></i>
      ${event.title}
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  showReconnectPrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'fixed bottom-4 right-4 z-50 glass-effect rounded-lg p-4 shadow-2xl';
    prompt.innerHTML = `
      <div class="flex items-center space-x-3">
        <i class="fas fa-exclamation-triangle text-yellow-500 text-2xl"></i>
        <div>
          <p class="font-bold">連線已中斷</p>
          <p class="text-sm text-gray-400">實時更新已停止</p>
        </div>
        <button onclick="window.location.reload()" class="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-bold transition ml-4">
          重新連線
        </button>
      </div>
    `;

    document.body.appendChild(prompt);
  }

  /**
   * Clean up all connections
   */
  disconnect() {
    Object.values(this.eventSources).forEach(eventSource => {
      if (eventSource) {
        eventSource.close();
      }
    });
    this.eventSources = {};
    console.log('All real-time connections closed');
  }
}

// Create global instance
window.realtimeUpdates = new RealtimeUpdates();

// Auto-cleanup on page unload
window.addEventListener('beforeunload', () => {
  window.realtimeUpdates.disconnect();
});

// Add animation styles
if (!document.getElementById('realtime-styles')) {
  const style = document.createElement('style');
  style.id = 'realtime-styles';
  style.textContent = `
    @keyframes slide-in {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes bounce-in {
      0% {
        transform: translate(-50%, -100px);
        opacity: 0;
      }
      50% {
        transform: translate(-50%, 10px);
      }
      100% {
        transform: translate(-50%, 0);
        opacity: 1;
      }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
    .animate-bounce-in {
      animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
  `;
  document.head.appendChild(style);
}

// Export
window.RealtimeUpdates = RealtimeUpdates;
