/**
 * Market Data API Routes
 * 即時市場數據 API 端點
 */

import { Hono } from 'hono';
import { MarketDataService } from '../services/market-data';
import type { Env } from '../types';

const market = new Hono<{ Bindings: Env }>();

// 獲取市場服務單例
const getMarketService = () => MarketDataService.getInstance();

// ============================================================================
// GET /api/market/snapshot - 獲取市場快照
// ============================================================================
market.get('/snapshot', (c) => {
  try {
    const service = getMarketService();
    const snapshot = service.getMarketSnapshot();

    return c.json({
      success: true,
      data: snapshot,
    });
  } catch (error) {
    console.error('Error fetching market snapshot:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// ============================================================================
// GET /api/market/coin/:symbol - 獲取特定幣種市場數據
// ============================================================================
market.get('/coin/:symbol', (c) => {
  try {
    const symbol = c.req.param('symbol');
    const category = c.req.query('category') || 'meme';

    const service = getMarketService();
    const coinData = service.getCoinMarketData(symbol, category);

    return c.json({
      success: true,
      data: coinData,
    });
  } catch (error) {
    console.error('Error fetching coin market data:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// ============================================================================
// GET /api/market/trend - 獲取市場趨勢分析
// ============================================================================
market.get('/trend', (c) => {
  try {
    const service = getMarketService();
    const trendAnalysis = service.analyzeTrend();

    return c.json({
      success: true,
      data: trendAnalysis,
    });
  } catch (error) {
    console.error('Error analyzing market trend:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// ============================================================================
// GET /api/market/categories - 獲取各類別趨勢
// ============================================================================
market.get('/categories', (c) => {
  try {
    const service = getMarketService();
    const categoryTrends = service.getCategoryTrends();

    return c.json({
      success: true,
      data: categoryTrends,
    });
  } catch (error) {
    console.error('Error fetching category trends:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// ============================================================================
// GET /api/market/realtime/:symbol - 模擬實時價格推送
// ============================================================================
market.get('/realtime/:symbol', (c) => {
  try {
    const symbol = c.req.param('symbol');
    const category = c.req.query('category') || 'meme';
    const interval = parseInt(c.req.query('interval') || '5000'); // 默認 5 秒

    const service = getMarketService();
    
    // 獲取多個時間點的數據（模擬歷史）
    const dataPoints = [];
    for (let i = 0; i < 10; i++) {
      const coinData = service.getCoinMarketData(symbol, category);
      dataPoints.push({
        timestamp: new Date(Date.now() - (9 - i) * interval).toISOString(),
        price: coinData.current_price * (1 + Math.random() * 0.1 - 0.05), // ±5% 波動
        volume: coinData.volume_24h / 24, // 小時交易量估算
      });
    }

    return c.json({
      success: true,
      data: {
        symbol,
        interval,
        dataPoints,
      },
    });
  } catch (error) {
    console.error('Error fetching realtime data:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default market;
