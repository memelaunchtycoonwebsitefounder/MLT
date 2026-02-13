/**
 * Lightweight Charts Implementation - Pump.fun Style
 * 1-minute candles with proper time intervals
 */

let chart = null;
let candlestickSeries = null;
let volumeChart = null; // Volume chart instance
let volumeSeries = null;
let currentTimeframe = '1h'; // Default to 1 hour

/**
 * Initialize Lightweight Charts (Pump.fun style)
 * @param {Object} coinData - Coin information
 * @param {Array} priceHistory - Historical price data
 * @param {string} timeframe - '1m', '10m', '1h', '24h'
 */
async function initLightweightCharts(coinData, priceHistory, timeframe = '1h') {
  console.log('📊 Initializing Lightweight Charts (Pump.fun style)', {
    coin: coinData?.symbol,
    dataPoints: priceHistory?.length,
    timeframe
  });

  const container = document.getElementById('price-chart');
  const volumeContainer = document.getElementById('volume-chart');
  
  if (!container || !volumeContainer) {
    console.error('❌ Chart containers not found');
    return false;
  }

  try {
    // Destroy existing charts COMPLETELY
    if (chart) {
      chart.remove();
      chart = null;
      candlestickSeries = null;
    }
    if (volumeChart) {
      volumeChart.remove();
      volumeChart = null;
      volumeSeries = null;
    }
    
    // Clear containers to prevent duplicates
    container.innerHTML = '';
    volumeContainer.innerHTML = '';

    // Validate and prepare data
    if (!priceHistory || priceHistory.length === 0) {
      console.warn('⚠️ No price history, using fallback');
      priceHistory = createFallbackData(coinData);
    }

    // Aggregate data based on timeframe
    const aggregatedData = aggregateByTimeframe(priceHistory, timeframe);
    console.log(`📊 Aggregated to ${aggregatedData.length} ${timeframe} candles`);

    if (aggregatedData.length === 0) {
      console.error('❌ No data after aggregation');
      return false;
    }

    // Create main chart (Pump.fun style)
    chart = LightweightCharts.createChart(container, {
      width: container.clientWidth,
      height: 350,
      layout: {
        background: { color: '#0a0a0a' }, // Dark background like pump.fun
        textColor: '#999',
        fontSize: 12,
      },
      grid: {
        vertLines: { 
          color: 'rgba(255, 255, 255, 0.05)',
          style: 1,
        },
        horzLines: { 
          color: 'rgba(255, 255, 255, 0.05)',
          style: 1,
        },
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: 'rgba(249, 115, 22, 0.6)',
          style: 3,
        },
        horzLine: {
          width: 1,
          color: 'rgba(249, 115, 22, 0.6)',
          style: 3,
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        visible: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
        autoScale: true,
        mode: 0, // Normal mode - log mode causes visual issues
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: true, // Show seconds for real-time feeling
        rightOffset: 10,
        barSpacing: 3, // Reasonable spacing for visibility
        minBarSpacing: 1, // Minimum spacing
        fixLeftEdge: false,
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true,
      },
      watermark: {
        visible: true,
        fontSize: 64,
        horzAlign: 'center',
        vertAlign: 'center',
        color: 'rgba(255, 255, 255, 0.02)',
        text: coinData?.symbol || 'MEME',
      },
    });

    // Add candlestick series (green/red like pump.fun)
    candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981', // Even more green - emerald-500 (less blue)
      downColor: '#ef4444', // Brighter red (red-500)
      borderDownColor: '#ef4444',
      borderUpColor: '#10b981',
      wickDownColor: '#ef4444',
      wickUpColor: '#10b981',
      // Very thin candles like Pump.fun small rectangles
      priceLineVisible: true, // Show current price line
      lastValueVisible: true, // Show last price value
      priceFormat: {
        type: 'price',
        precision: 8,
        minMove: 0.00000001,
      },
    });

    // Convert to candlestick format
    const candleData = aggregatedData.map(item => ({
      time: item.time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));

    // Filter out invalid candles (NaN, undefined, null)
    const validCandles = candleData.filter(c => 
      c.time && 
      !isNaN(c.time) &&
      c.open && !isNaN(c.open) &&
      c.high && !isNaN(c.high) &&
      c.low && !isNaN(c.low) &&
      c.close && !isNaN(c.close)
    );

    console.log(`📊 Aggregated data: ${aggregatedData.length} items`);
    console.log(`📊 Candle data before filter: ${candleData.length} items`);
    console.log(`📊 Valid candles after filter: ${validCandles.length} items`);
    
    if (validCandles.length !== candleData.length) {
      console.warn(`⚠️ Filtered out ${candleData.length - validCandles.length} invalid candles`);
      console.log('Invalid candles:', candleData.filter(c => !validCandles.includes(c)));
    }

    candlestickSeries.setData(validCandles);
    console.log(`✅ Set ${validCandles.length} candles to chart`);
    console.log('Last 3 candles:', validCandles.slice(-3));

    // Setup crosshair for OHLC display
    chart.subscribeCrosshairMove((param) => {
      if (param.time) {
        const data = param.seriesData.get(candlestickSeries);
        if (data) {
          updateOHLCDisplay(data, aggregatedData.find(d => d.time === param.time));
        }
      }
    });

    // Fit content to show all data properly
    chart.timeScale().fitContent();
    
    // Auto-scale price with proper margins
    chart.priceScale('right').applyOptions({
      autoScale: true,
      scaleMargins: {
        top: 0.1,
        bottom: 0.2,
      },
    });

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      if (chart && container) {
        chart.applyOptions({ width: container.clientWidth });
      }
    });
    resizeObserver.observe(container);

    // Add volume chart
    initVolumeChart(volumeContainer, aggregatedData);

    console.log('✅ Lightweight Charts initialized successfully');
    return true;

  } catch (error) {
    console.error('❌ Chart initialization error:', error);
    showChartError(container, '無法載入圖表');
    return false;
  }
}

/**
 * Aggregate price history by timeframe
 * Converts raw transactions to OHLC candles
 */
function aggregateByTimeframe(priceHistory, timeframe) {
  
  // For 1-minute timeframe, use raw data without aggregation
  // Each price_history record is already 1 candle
  if (timeframe === '1m') {
    const sorted = priceHistory
      .filter(h => h && h.price && h.timestamp)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return sorted.map(item => {
      const timestamp = Math.floor(new Date(item.timestamp).getTime() / 1000);
      const price = parseFloat(item.price);
      const volume = Math.abs(parseFloat(item.volume) || 0);
      
      return {
        time: timestamp,
        open: price,
        high: price,
        low: price,
        close: price,
        volume: volume,
        count: 1
      };
    });
  }
  
  // For other timeframes, aggregate as before
  const intervals = {
    '10m': 10 * 60 * 1000,     // 10 minutes
    '1h': 60 * 60 * 1000,      // 1 hour
    '24h': 24 * 60 * 60 * 1000 // 24 hours
  };

  const interval = intervals[timeframe] || intervals['1h'];
  
  // Sort by timestamp
  const sorted = priceHistory
    .filter(h => h && h.price && h.timestamp)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (sorted.length === 0) return [];

  // Group by time intervals
  const candles = new Map();

  sorted.forEach(item => {
    const timestamp = new Date(item.timestamp).getTime();
    const price = parseFloat(item.price);
    // FIX: Always use absolute value for volume to prevent negative numbers
    const volume = Math.abs(parseFloat(item.volume) || 0);

    // Round down to interval
    const candleTime = Math.floor(timestamp / interval) * interval;
    const candleKey = Math.floor(candleTime / 1000); // Unix timestamp in seconds

    if (!candles.has(candleKey)) {
      candles.set(candleKey, {
        time: candleKey,
        open: price,
        high: price,
        low: price,
        close: price,
        volume: volume,
        count: 1
      });
    } else {
      const candle = candles.get(candleKey);
      candle.high = Math.max(candle.high, price);
      candle.low = Math.min(candle.low, price);
      candle.close = price;
      candle.volume += volume;
      candle.count++;
    }
  });

  // Convert map to array and sort
  return Array.from(candles.values()).sort((a, b) => a.time - b.time);
}

/**
 * Create fallback data when no history exists
 */
function createFallbackData(coinData) {
  const now = Date.now();
  const price = coinData?.current_price || 0.00000001;
  const data = [];
  
  // Create 60 1-minute candles
  for (let i = 60; i >= 0; i--) {
    const timestamp = new Date(now - i * 60000);
    const variance = price * (Math.random() * 0.04 - 0.02); // ±2% variation
    data.push({
      timestamp: timestamp.toISOString(),
      price: Math.max(0.00000001, price + variance),
      volume: Math.floor(Math.random() * 1000) + 100
    });
  }
  
  return data;
}

/**
 * Initialize volume chart
 */
function initVolumeChart(container, aggregatedData) {
  if (!container || !aggregatedData || aggregatedData.length === 0) return;

  // Destroy existing volume chart
  if (volumeChart) {
    volumeChart.remove();
    volumeChart = null;
  }
  if (volumeSeries) {
    volumeSeries = null;
  }

  volumeChart = LightweightCharts.createChart(container, {
    width: container.clientWidth,
    height: 100,
    layout: {
      background: { color: '#0a0a0a' },
      textColor: '#999',
    },
    grid: {
      vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
      horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
    },
    rightPriceScale: {
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    timeScale: {
      borderColor: 'rgba(255, 255, 255, 0.1)',
      visible: false,
    },
  });

  volumeSeries = volumeChart.addHistogramSeries({
    color: '#10b981', // Match even greener color (emerald-500)
    priceFormat: {
      type: 'volume',
    },
  });

  const volumeData = aggregatedData.map((candle, index) => {
    const prevClose = index > 0 ? aggregatedData[index - 1].close : candle.open;
    const isUp = candle.close >= prevClose;
    
    return {
      time: candle.time,
      value: candle.volume || 100,
      color: isUp ? '#10b981' : '#ef4444' // Greener (less blue)
    };
  });

  volumeSeries.setData(volumeData);

  // Sync with main chart
  if (chart) {
    chart.timeScale().subscribeVisibleTimeRangeChange(() => {
      const timeRange = chart.timeScale().getVisibleRange();
      if (timeRange) {
        volumeChart.timeScale().setVisibleRange(timeRange);
      }
    });
  }
}

/**
 * Update OHLC display
 */
function updateOHLCDisplay(candleData, aggregatedItem) {
  const elements = {
    'ohlc-open': candleData.open,
    'ohlc-high': candleData.high,
    'ohlc-low': candleData.low,
    'ohlc-close': candleData.close,
    'ohlc-volume': aggregatedItem?.volume || 0
  };

  Object.entries(elements).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) {
      if (id === 'ohlc-volume') {
        el.textContent = value.toLocaleString();
      } else {
        el.textContent = '$' + value.toFixed(8);
      }
    }
  });

  const panel = document.getElementById('ohlc-data');
  if (panel) {
    panel.classList.remove('hidden');
    panel.classList.add('flex');
  }
}

/**
 * Show error message
 */
function showChartError(container, message) {
  if (container) {
    container.innerHTML = `
      <div class="flex items-center justify-center h-full text-gray-400">
        <div class="text-center">
          <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
          <p>${message}</p>
        </div>
      </div>
    `;
  }
}

// Export for global use
window.initLightweightCharts = initLightweightCharts;
window.currentChartTimeframe = currentTimeframe;

/**
 * Refresh chart after trade
 * Called after buy/sell transactions
 */
window.refreshChartAfterTrade = async function(coinData) {
  console.log('🔄 Refreshing chart after trade...');
  
  try {
    // Get current timeframe from active button
    const activeBtn = document.querySelector('.timeframe-btn.active');
    console.log('🔍 Active button:', activeBtn, activeBtn?.dataset?.timeframe);
    const timeframe = activeBtn ? activeBtn.dataset.timeframe : '1m'; // Default to 1m for initial chart
    console.log('📊 Using timeframe:', timeframe);
    
    // Calculate limit based on timeframe
    let limit = 60;
    switch(timeframe) {
      case '1m': limit = 60; break;
      case '10m': limit = 144; break;
      case '1h': limit = 168; break;
      case '24h': limit = 720; break;
    }
    
    // Fetch updated price history
    const response = await axios.get(`/api/coins/${window.COIN_ID || coinData.id}/price-history?limit=${limit}`);
    
    if (response.data.success && response.data.data.data) {
      const history = response.data.data.data;
      console.log(`✅ Fetched ${history.length} updated records`);
      
      // Re-initialize charts with new data
      await initLightweightCharts(coinData, history, timeframe);
    }
  } catch (error) {
    console.error('❌ Error refreshing chart:', error);
  }
};
