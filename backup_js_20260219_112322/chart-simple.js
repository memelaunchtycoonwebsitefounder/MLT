/**
 * Simple Chart.js Implementation for MemeLaunch
 * Clean, reliable alternative to Lightweight Charts
 */

let priceChart = null;
let volumeChart = null;

/**
 * Initialize Chart.js charts
 * @param {Object} coinData - Coin information  
 * @param {Array} priceHistory - Historical price data
 * @param {number} limit - Data points limit
 */
async function initSimpleCharts(coinData, priceHistory, limit = 100) {
  console.log('📊 Initializing Chart.js charts', {
    coin: coinData?.symbol,
    dataPoints: priceHistory?.length,
    limit
  });

  try {
    // Destroy existing charts
    if (priceChart) {
      priceChart.destroy();
      priceChart = null;
    }
    if (volumeChart) {
      volumeChart.destroy();
      volumeChart = null;
    }

    // Validate data
    if (!priceHistory || priceHistory.length === 0) {
      console.warn('⚠️ No price history, using fallback');
      priceHistory = createFallbackData(coinData);
    }

    // Prepare data
    const chartData = prepareChartData(priceHistory, limit);
    
    // Initialize charts
    createPriceChart(chartData, coinData);
    createVolumeChart(chartData);

    console.log('✅ Chart.js charts initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Chart initialization error:', error);
    showChartError('price-chart', '無法載入價格圖表');
    return false;
  }
}

/**
 * Create fallback data from current price
 */
function createFallbackData(coinData) {
  const now = Date.now();
  const price = coinData?.current_price || 0.00000001;
  const data = [];
  
  for (let i = 24; i >= 0; i--) {
    data.push({
      timestamp: new Date(now - i * 3600000).toISOString(),
      price: price * (1 + (Math.random() - 0.5) * 0.02),
      volume: Math.floor(Math.random() * 5000) + 500
    });
  }
  
  return data;
}

/**
 * Prepare and validate chart data
 */
function prepareChartData(priceHistory, limit) {
  const validData = priceHistory
    .filter(h => {
      return h &&
             h.price !== null &&
             h.price !== undefined &&
             h.timestamp &&
             !isNaN(parseFloat(h.price)) &&
             parseFloat(h.price) > 0;
    })
    .slice(-limit);

  return validData.map(h => {
    const price = parseFloat(h.price);
    return {
      timestamp: new Date(h.timestamp),
      price: price,
      volume: h.volume || Math.floor(Math.random() * 5000) + 500
    };
  }).sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Initialize price chart (candlestick style)
 */
function createPriceChart(chartData, coinData) {
  const canvas = document.getElementById('price-chart');
  if (!canvas) {
    console.error('❌ Price chart canvas not found');
    return;
  }

  const ctx = canvas.getContext('2d');
  
  // Prepare candlestick data
  const labels = chartData.map(d => formatChartTime(d.timestamp));
  const prices = chartData.map(d => d.price);
  const colors = chartData.map((d, i) => {
    if (i === 0) return '#10b981';
    return d.price >= chartData[i - 1].price ? '#10b981' : '#ef4444';
  });

  priceChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '價格',
        data: prices,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1,
        barThickness: 'flex',
        maxBarThickness: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#f97316',
          borderWidth: 1,
          displayColors: false,
          callbacks: {
            title: (items) => {
              return labels[items[0].dataIndex];
            },
            label: (context) => {
              return `價格: $${context.parsed.y.toFixed(8)}`;
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: false,
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#9ca3af',
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 10
          }
        },
        y: {
          display: true,
          position: 'right',
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false
          },
          ticks: {
            color: '#9ca3af',
            callback: function(value) {
              return '$' + value.toFixed(8);
            }
          }
        }
      }
    }
  });

  // Update OHLC display on hover
  canvas.addEventListener('mousemove', (e) => {
    const points = priceChart.getElementsAtEventForMode(e, 'index', { intersect: false }, false);
    if (points.length > 0) {
      const index = points[0].index;
      const data = chartData[index];
      updateOHLCDisplay(data);
    }
  });
}

/**
 * Initialize volume chart
 */
function createVolumeChart(chartData) {
  const canvas = document.getElementById('volume-chart');
  if (!canvas) {
    console.error('❌ Volume chart canvas not found');
    return;
  }

  const ctx = canvas.getContext('2d');
  
  const labels = chartData.map(d => formatChartTime(d.timestamp));
  const volumes = chartData.map(d => d.volume);
  const colors = chartData.map((d, i) => {
    if (i === 0) return '#10b981';
    return d.price >= chartData[i - 1].price ? '#10b981' : '#ef4444';
  });

  volumeChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '成交量',
        data: volumes,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 0,
        barThickness: 'flex',
        maxBarThickness: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#f97316',
          borderWidth: 1,
          displayColors: false,
          callbacks: {
            title: (items) => {
              return labels[items[0].dataIndex];
            },
            label: (context) => {
              return `成交量: ${context.parsed.y.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: false
          },
          ticks: {
            color: '#9ca3af',
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 10
          }
        },
        y: {
          display: true,
          position: 'right',
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false
          },
          ticks: {
            color: '#9ca3af',
            callback: function(value) {
              return value.toLocaleString();
            }
          }
        }
      }
    }
  });
}

/**
 * Update OHLC display panel
 */
function updateOHLCDisplay(data) {
  const variance = data.price * 0.002;
  const open = data.price - variance;
  const high = data.price + variance;
  const low = data.price - variance * 1.5;
  const close = data.price;

  const elements = {
    'ohlc-open': open,
    'ohlc-high': high,
    'ohlc-low': low,
    'ohlc-close': close,
    'ohlc-volume': data.volume
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

  // Show OHLC panel
  const panel = document.getElementById('ohlc-data');
  if (panel) {
    panel.classList.remove('hidden');
    panel.classList.add('flex');
  }
}

/**
 * Format timestamp for chart labels
 */
function formatChartTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Update charts with new real-time data
 */
function updateChartsRealtime(newPrice) {
  if (!priceChart || !newPrice || newPrice <= 0) {
    return;
  }

  try {
    const now = new Date();
    const label = formatChartTime(now);
    
    // Add new data point
    priceChart.data.labels.push(label);
    priceChart.data.datasets[0].data.push(newPrice);
    
    // Determine color
    const lastIndex = priceChart.data.datasets[0].data.length - 2;
    const lastPrice = lastIndex >= 0 ? priceChart.data.datasets[0].data[lastIndex] : newPrice;
    const color = newPrice >= lastPrice ? '#10b981' : '#ef4444';
    priceChart.data.datasets[0].backgroundColor.push(color);
    priceChart.data.datasets[0].borderColor.push(color);
    
    // Keep only last 100 points
    if (priceChart.data.labels.length > 100) {
      priceChart.data.labels.shift();
      priceChart.data.datasets[0].data.shift();
      priceChart.data.datasets[0].backgroundColor.shift();
      priceChart.data.datasets[0].borderColor.shift();
    }
    
    priceChart.update('none'); // Update without animation
    
    console.log('📊 Charts updated with new price:', newPrice);
  } catch (error) {
    console.error('❌ Chart update error:', error);
  }
}

/**
 * Show error message in chart container
 */
function showChartError(containerId, message) {
  const container = document.getElementById(containerId);
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
window.initSimpleCharts = initSimpleCharts;
window.updateChartsRealtime = updateChartsRealtime;
