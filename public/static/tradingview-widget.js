/**
 * TradingView Widget Integration for MemeLaunch
 * Clean, professional chart solution without the complexity
 */

let tvWidget = null;

/**
 * Initialize TradingView Widget
 * @param {string} containerId - Container element ID
 * @param {Object} coinData - Coin information
 * @param {Array} priceHistory - Historical price data
 */
function initTradingViewWidget(containerId, coinData, priceHistory) {
  console.log('📊 Initializing TradingView Widget', {
    coin: coinData.symbol,
    dataPoints: priceHistory.length
  });

  // Clear existing widget
  if (tvWidget) {
    try {
      tvWidget.remove();
      tvWidget = null;
    } catch (e) {
      console.warn('Error removing widget:', e);
    }
  }

  const container = document.getElementById(containerId);
  if (!container) {
    console.error('Container not found:', containerId);
    return;
  }

  // Prepare data for TradingView
  const chartData = prepareChartData(priceHistory, coinData);
  
  // Create custom datafeed
  const datafeed = createDatafeed(chartData, coinData);

  // Initialize widget
  try {
    tvWidget = new TradingView.widget({
      container: container,
      library_path: 'https://unpkg.com/tradingview-charting-library@24.001/charting_library/',
      locale: 'zh_TW',
      disabled_features: [
        'use_localstorage_for_settings',
        'volume_force_overlay',
        'create_volume_indicator_by_default',
        'header_compare',
        'header_symbol_search',
        'symbol_search_hot_key',
        'header_screenshot',
        'header_undo_redo',
        'header_saveload',
        'go_to_date',
        'context_menus'
      ],
      enabled_features: [
        'study_templates',
        'hide_left_toolbar_by_default'
      ],
      charts_storage_url: 'https://saveload.tradingview.com',
      charts_storage_api_version: '1.1',
      client_id: 'memelaunch',
      user_id: 'public_user',
      fullscreen: false,
      autosize: true,
      symbol: coinData.symbol || 'MEME',
      interval: '5',
      datafeed: datafeed,
      theme: 'dark',
      style: '1', // Candlestick
      toolbar_bg: '#1a1a1a',
      overrides: {
        'mainSeriesProperties.candleStyle.upColor': '#10b981',
        'mainSeriesProperties.candleStyle.downColor': '#ef4444',
        'mainSeriesProperties.candleStyle.borderUpColor': '#10b981',
        'mainSeriesProperties.candleStyle.borderDownColor': '#ef4444',
        'mainSeriesProperties.candleStyle.wickUpColor': '#10b981',
        'mainSeriesProperties.candleStyle.wickDownColor': '#ef4444',
        'paneProperties.background': '#1a1a1a',
        'paneProperties.backgroundType': 'solid',
        'scalesProperties.textColor': '#9ca3af'
      },
      loading_screen: {
        backgroundColor: '#1a1a1a',
        foregroundColor: '#f97316'
      }
    });

    console.log('✅ TradingView Widget initialized');
  } catch (error) {
    console.error('❌ TradingView Widget error:', error);
    showChartError(container, '無法載入圖表');
  }
}

/**
 * Prepare chart data from price history
 */
function prepareChartData(priceHistory, coinData) {
  if (!priceHistory || priceHistory.length === 0) {
    // Fallback: use current price
    const now = Date.now();
    const price = coinData.current_price || 0.00000001;
    return [{
      time: Math.floor(now / 1000),
      open: price,
      high: price * 1.002,
      low: price * 0.998,
      close: price,
      volume: 1000
    }];
  }

  return priceHistory
    .filter(h => h && h.price && h.timestamp)
    .map(h => {
      const price = parseFloat(h.price);
      const variance = price * 0.002;
      return {
        time: Math.floor(new Date(h.timestamp).getTime() / 1000),
        open: price - variance,
        high: price + variance,
        low: price - variance * 1.5,
        close: price,
        volume: h.volume || Math.floor(Math.random() * 5000) + 500
      };
    })
    .sort((a, b) => a.time - b.time);
}

/**
 * Create custom datafeed for TradingView
 */
function createDatafeed(chartData, coinData) {
  return {
    onReady: (callback) => {
      setTimeout(() => {
        callback({
          supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D'],
          exchanges: [{
            value: 'MemeLaunch',
            name: 'MemeLaunch',
            desc: 'MemeLaunch Tycoon'
          }],
          symbols_types: [{
            name: 'crypto',
            value: 'crypto'
          }]
        });
      }, 0);
    },

    searchSymbols: (userInput, exchange, symbolType, onResultReadyCallback) => {
      onResultReadyCallback([{
        symbol: coinData.symbol,
        full_name: coinData.name,
        description: coinData.name,
        exchange: 'MemeLaunch',
        type: 'crypto'
      }]);
    },

    resolveSymbol: (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
      const symbolInfo = {
        name: coinData.symbol,
        description: coinData.name,
        type: 'crypto',
        session: '24x7',
        timezone: 'Asia/Taipei',
        exchange: 'MemeLaunch',
        minmov: 1,
        pricescale: 100000000,
        has_intraday: true,
        has_no_volume: false,
        has_weekly_and_monthly: false,
        supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D'],
        volume_precision: 2,
        data_status: 'streaming',
      };
      setTimeout(() => onSymbolResolvedCallback(symbolInfo), 0);
    },

    getBars: (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
      try {
        if (chartData.length === 0) {
          onHistoryCallback([], { noData: true });
          return;
        }

        const bars = chartData.filter(bar => {
          return bar.time >= periodParams.from && bar.time < periodParams.to;
        });

        if (bars.length === 0) {
          onHistoryCallback([], { noData: true });
        } else {
          onHistoryCallback(bars, { noData: false });
        }
      } catch (error) {
        console.error('getBars error:', error);
        onErrorCallback(error);
      }
    },

    subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) => {
      console.log('📡 TradingView: subscribeBars', subscriberUID);
      // Store callback for real-time updates
      window.tvRealtimeCallback = onRealtimeCallback;
    },

    unsubscribeBars: (subscriberUID) => {
      console.log('📡 TradingView: unsubscribeBars', subscriberUID);
      window.tvRealtimeCallback = null;
    }
  };
}

/**
 * Update chart with new real-time data
 */
function updateTradingViewWidget(newPrice) {
  if (!window.tvRealtimeCallback || !newPrice || newPrice <= 0) {
    return;
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const variance = newPrice * 0.002;
    
    const bar = {
      time: now,
      open: newPrice - variance,
      high: newPrice + variance,
      low: newPrice - variance * 1.5,
      close: newPrice,
      volume: Math.floor(Math.random() * 5000) + 500
    };

    window.tvRealtimeCallback(bar);
    console.log('📊 TradingView updated with new price:', newPrice);
  } catch (error) {
    console.error('❌ TradingView update error:', error);
  }
}

/**
 * Show error message in chart container
 */
function showChartError(container, message) {
  container.innerHTML = `
    <div class="flex items-center justify-center h-full">
      <div class="text-center text-gray-400">
        <i class="fas fa-exclamation-triangle text-4xl mb-2"></i>
        <p>${message}</p>
      </div>
    </div>
  `;
}

// Export for global use
window.initTradingViewWidget = initTradingViewWidget;
window.updateTradingViewWidget = updateTradingViewWidget;
