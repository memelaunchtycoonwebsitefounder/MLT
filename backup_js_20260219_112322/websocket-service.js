/**
 * WebSocket Real-time Service
 * Handles WebSocket connections for real-time updates
 */

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.isConnecting = false;
    this.isConnected = false;
    
    // Callbacks
    this.priceUpdateCallbacks = new Map();
    this.notificationCallbacks = [];
    this.connectionCallbacks = [];
    
    // Tracking
    this.shownNotifications = new Set();
    this.lastUpdateTimestamp = Date.now();
    
    // Heartbeat
    this.heartbeatInterval = null;
    this.heartbeatTimeout = null;
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    if (this.isConnecting || this.isConnected) {
      console.log('[WS] Already connecting or connected');
      return;
    }

    this.isConnecting = true;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    console.log(`[WS] Connecting to ${wsUrl}...`);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WS] Connected successfully');
        this.isConnecting = false;
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        
        // Authenticate if token exists
        const token = localStorage.getItem('auth_token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            this.send({ type: 'auth', userId: payload.userId });
          } catch (error) {
            console.error('[WS] Failed to parse token:', error);
          }
        }
        
        // Start heartbeat
        this.startHeartbeat();
        
        // Notify connection callbacks
        this.connectionCallbacks.forEach(callback => callback(true));
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('[WS] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WS] WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('[WS] Connection closed');
        this.isConnecting = false;
        this.isConnected = false;
        this.stopHeartbeat();
        
        // Notify connection callbacks
        this.connectionCallbacks.forEach(callback => callback(false));
        
        // Attempt to reconnect
        this.reconnect();
      };

    } catch (error) {
      console.error('[WS] Failed to create WebSocket:', error);
      this.isConnecting = false;
      this.reconnect();
    }
  }

  /**
   * Reconnect with exponential backoff
   */
  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WS] Max reconnection attempts reached. Falling back to polling.');
      // Fall back to polling service
      if (window.realtimeService) {
        window.realtimeService.start();
      }
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    console.log('[WS] Disconnecting...');
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
  }

  /**
   * Send message to server
   */
  send(data) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('[WS] Cannot send message, not connected');
    }
  }

  /**
   * Handle incoming message
   */
  handleMessage(message) {
    switch (message.type) {
      case 'connected':
        console.log('[WS] Server says:', message.message);
        break;

      case 'auth_success':
        console.log('[WS] Authenticated as user', message.userId);
        break;

      case 'subscribed':
        console.log('[WS] Subscribed to coin', message.coinId);
        break;

      case 'unsubscribed':
        console.log('[WS] Unsubscribed from coin', message.coinId);
        break;

      case 'coin_update':
        this.handleCoinUpdate(message.coinId, message.data);
        break;

      case 'trade':
        this.handleTrade(message.data);
        break;

      case 'notification':
        this.handleNotification(message.data);
        break;

      case 'pong':
        // Reset heartbeat timeout
        if (this.heartbeatTimeout) {
          clearTimeout(this.heartbeatTimeout);
          this.heartbeatTimeout = null;
        }
        break;

      case 'error':
        console.error('[WS] Server error:', message.message);
        break;

      default:
        console.warn('[WS] Unknown message type:', message.type);
    }
  }

  /**
   * Handle coin update
   */
  handleCoinUpdate(coinId, data) {
    const callback = this.priceUpdateCallbacks.get(coinId);
    if (callback) {
      callback(data);
    }
    this.lastUpdateTimestamp = Date.now();
  }

  /**
   * Handle trade notification
   */
  handleTrade(trade) {
    const tradeKey = `${trade.id}-${trade.timestamp}`;
    
    // Avoid duplicates
    if (this.shownNotifications.has(tradeKey)) {
      return;
    }
    this.shownNotifications.add(tradeKey);
    
    // Check if this is an AI trader
    const isAITrader = trade.user_id >= 10001 || (trade.username && trade.username.startsWith('ai_trader_'));
    
    if (isAITrader) {
      // Extract trader type
      let traderType = 'AI';
      if (trade.username) {
        const parts = trade.username.split('_');
        if (parts.length >= 4) {
          traderType = parts[3].toUpperCase();
        }
      }
      
      // Show notification
      const action = trade.type === 'buy' ? '買入' : '賣出';
      const icon = trade.type === 'buy' ? '📈' : '📉';
      const message = `${icon} AI Trader (${traderType}) ${action} ${Math.floor(trade.amount).toLocaleString()} ${trade.coin_symbol || 'tokens'}`;
      this.showNotification(message, trade.type === 'buy' ? 'info' : 'warning');
    }
    
    // Notify registered callbacks
    this.notificationCallbacks.forEach(callback => callback(trade));
    
    // Clean up old notifications
    if (this.shownNotifications.size > 50) {
      const arr = Array.from(this.shownNotifications);
      this.shownNotifications = new Set(arr.slice(-50));
    }
  }

  /**
   * Handle notification
   */
  handleNotification(notification) {
    this.showNotification(notification.message, notification.type || 'info');
  }

  /**
   * Subscribe to coin updates
   */
  subscribeToCoin(coinId, callback) {
    console.log(`[WS] Subscribing to coin ${coinId}`);
    this.priceUpdateCallbacks.set(coinId, callback);
    this.send({ type: 'subscribe_coin', coinId });
  }

  /**
   * Unsubscribe from coin updates
   */
  unsubscribeFromCoin(coinId) {
    console.log(`[WS] Unsubscribing from coin ${coinId}`);
    this.priceUpdateCallbacks.delete(coinId);
    this.send({ type: 'unsubscribe_coin', coinId });
  }

  /**
   * Subscribe to trade notifications
   */
  subscribeToNotifications(callback) {
    this.notificationCallbacks.push(callback);
  }

  /**
   * Subscribe to connection status changes
   */
  subscribeToConnection(callback) {
    this.connectionCallbacks.push(callback);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: 'ping' });
        
        // Set timeout for pong response
        this.heartbeatTimeout = setTimeout(() => {
          console.warn('[WS] Heartbeat timeout, reconnecting...');
          this.disconnect();
          this.connect();
        }, 5000); // 5 seconds timeout
      }
    }, 30000); // Send ping every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
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
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  /**
   * Get connection status
   */
  isWebSocketConnected() {
    return this.isConnected;
  }
}

// Create global instance
window.websocketService = new WebSocketService();

// Auto-connect when token exists
if (localStorage.getItem('auth_token')) {
  window.websocketService.connect();
}

console.log('[WS] WebSocket service initialized');
