/**
 * Real-time Update Service
 * Handles polling for price updates, trade notifications, and live data sync
 */

class RealtimeService {
  constructor() {
    this.pollingInterval = 5000; // 5 seconds
    this.priceUpdateCallbacks = new Map();
    this.notificationCallbacks = [];
    this.isPolling = false;
    this.pollingTimer = null;
    this.lastUpdateTimestamp = Date.now();
  }

  /**
   * Start polling for updates
   */
  start() {
    if (this.isPolling) {
      console.log('[Realtime] Already polling');
      return;
    }

    console.log('[Realtime] Starting real-time updates...');
    this.isPolling = true;
    this.poll();
  }

  /**
   * Stop polling
   */
  stop() {
    console.log('[Realtime] Stopping real-time updates...');
    this.isPolling = false;
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  /**
   * Subscribe to price updates for a specific coin
   */
  subscribeToCoin(coinId, callback) {
    console.log(`[Realtime] Subscribed to coin ${coinId}`);
    this.priceUpdateCallbacks.set(coinId, callback);
  }

  /**
   * Unsubscribe from coin updates
   */
  unsubscribeFromCoin(coinId) {
    console.log(`[Realtime] Unsubscribed from coin ${coinId}`);
    this.priceUpdateCallbacks.delete(coinId);
  }

  /**
   * Subscribe to trade notifications
   */
  subscribeToNotifications(callback) {
    this.notificationCallbacks.push(callback);
  }

  /**
   * Main polling function
   */
  async poll() {
    if (!this.isPolling) return;

    try {
      // Get all subscribed coin IDs
      const coinIds = Array.from(this.priceUpdateCallbacks.keys());

      if (coinIds.length > 0) {
        await this.fetchCoinUpdates(coinIds);
      }

      // Check for new trades/notifications
      await this.fetchNotifications();

    } catch (error) {
      console.error('[Realtime] Polling error:', error);
    }

    // Schedule next poll
    this.pollingTimer = setTimeout(() => this.poll(), this.pollingInterval);
  }

  /**
   * Fetch coin price updates
   */
  async fetchCoinUpdates(coinIds) {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      // Fetch updates for each coin
      for (const coinId of coinIds) {
        const response = await fetchUtils.get(`/api/coins/${coinId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.data.success) {
          const coinData = response.data.data;
          const callback = this.priceUpdateCallbacks.get(coinId);
          if (callback) {
            callback(coinData);
          }
        }
      }

      this.lastUpdateTimestamp = Date.now();
    } catch (error) {
      console.error('[Realtime] Failed to fetch coin updates:', error);
    }
  }

  /**
   * Fetch new notifications
   */
  async fetchNotifications() {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      // Fetch recent trades (including AI traders)
      const response = await fetchUtils.get('/api/trades/recent?limit=10&includeAI=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success && response.data.data.length > 0) {
        const trades = response.data.data;
        
        // Track shown notifications to avoid duplicates
        if (!this.shownNotifications) {
          this.shownNotifications = new Set();
        }
        
        // Filter out old/duplicate trades
        const newTrades = trades.filter(trade => {
          const tradeKey = `${trade.id}-${trade.timestamp}`;
          if (this.shownNotifications.has(tradeKey)) {
            return false; // Skip already shown
          }
          
          // Check if trade is recent (within last 30 seconds)
          const tradeTime = new Date(trade.timestamp).getTime();
          const now = Date.now();
          const isRecent = (now - tradeTime) < 30000; // 30 seconds
          
          if (isRecent) {
            this.shownNotifications.add(tradeKey);
            return true;
          }
          return false;
        });
        
        // Show notifications for AI trades (user_id >= 10001)
        newTrades.forEach(trade => {
          // Check if this is an AI trader (user_id >= 10001 or username starts with 'ai_trader_')
          const isAITrader = trade.user_id >= 10001 || (trade.username && trade.username.startsWith('ai_trader_'));
          
          if (isAITrader) {
            // Extract trader type from username (e.g., "ai_trader_10001_sniper" -> "SNIPER")
            let traderType = 'AI';
            if (trade.username) {
              const parts = trade.username.split('_');
              if (parts.length >= 4) {
                traderType = parts[3].toUpperCase();
              }
            }
            
            // Show AI trade notification
            const action = trade.type === 'buy' ? 'Buy' : 'Sell';
            const icon = trade.type === 'buy' ? '📈' : '📉';
            const message = `${icon} AI Trader (${traderType}) ${action} ${Math.floor(trade.amount).toLocaleString()} ${trade.coin_symbol || 'tokens'}`;
            this.showNotification(message, trade.type === 'buy' ? 'info' : 'warning');
          }
          
          // Notify registered callbacks
          this.notificationCallbacks.forEach(callback => callback(trade));
        });
        
        // Clean up old notifications (keep only last 50)
        if (this.shownNotifications.size > 50) {
          const arr = Array.from(this.shownNotifications);
          this.shownNotifications = new Set(arr.slice(-50));
        }
      }
    } catch (error) {
      console.error('[Realtime] Failed to fetch notifications:', error);
    }
  }

  /**
   * Show toast notification
   */
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    
    // Set color based on type
    const colors = {
      'info': 'bg-blue-500',
      'success': 'bg-green-500',
      'warning': 'bg-yellow-500',
      'error': 'bg-red-500'
    };
    notification.classList.add(colors[type] || colors['info']);
    
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <i class="fas fa-bell text-white"></i>
        <p class="text-white font-medium">${message}</p>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  /**
   * Animate progress bar
   */
  animateProgressBar(element, targetPercent, duration = 1000) {
    if (!element) return;

    const startPercent = parseFloat(element.style.width) || 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentPercent = startPercent + (targetPercent - startPercent) * easeOut;
      element.style.width = `${currentPercent}%`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }
}

// Create global instance
window.realtimeService = new RealtimeService();

console.log('[Realtime] Service initialized');
