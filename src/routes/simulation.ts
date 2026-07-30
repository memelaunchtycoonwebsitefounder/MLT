/**
 * AI Trading Simulation API Routes
 * 模擬交易數據 API
 */

import { Hono } from 'hono';
import { AITradingSimulator } from '../services/ai-trading-simulator';
import type { Env } from '../types';

const simulation = new Hono<{ Bindings: Env }>();

// GET /api/simulation/:coinId/state - 獲取模擬狀態
simulation.get('/:coinId/state', async (c) => {
  try {
    const coinId = parseInt(c.req.param('coinId'));
    
    // 查詢數據庫中的模擬狀態
    const state = await c.env.DB.prepare(
      'SELECT * FROM coin_simulations WHERE coin_id = ?'
    )
      .bind(coinId)
      .first() as any;

    if (!state) {
      return c.json({ success: false, error: 'Simulation not found' }, 404);
    }

    // 獲取交易總數
    const tradeCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM simulated_trades WHERE coin_id = ?'
    )
      .bind(coinId)
      .first() as any;

    // 獲取活躍機器人列表
    const activeBots = await c.env.DB.prepare(
      'SELECT DISTINCT bot_id, bot_name FROM simulated_trades WHERE coin_id = ?'
    )
      .bind(coinId)
      .all();

    return c.json({
      success: true,
      data: {
        ...state,
        total_trades: tradeCount?.total || 0,
        active_bots: activeBots?.results || [],
      },
    });
  } catch (error) {
    console.error('Error fetching simulation state:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

// GET /api/simulation/:coinId/trades - 獲取最近交易
simulation.get('/:coinId/trades', async (c) => {
  try {
    const coinId = parseInt(c.req.param('coinId'));
    const limit = parseInt(c.req.query('limit') || '50');

    const trades = await c.env.DB.prepare(
      `SELECT * FROM simulated_trades 
       WHERE coin_id = ? 
       ORDER BY timestamp DESC 
       LIMIT ?`
    )
      .bind(coinId, limit)
      .all();

    return c.json({
      success: true,
      data: trades.results,
    });
  } catch (error) {
    console.error('Error fetching trades:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

// GET /api/simulation/:coinId/price-history - 獲取價格歷史
simulation.get('/:coinId/price-history', async (c) => {
  try {
    const coinId = parseInt(c.req.param('coinId'));
    const hours = parseInt(c.req.query('hours') || '24');

    const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();

    const priceHistory = await c.env.DB.prepare(
      `SELECT * FROM price_history 
       WHERE coin_id = ? AND timestamp >= ?
       ORDER BY timestamp ASC`
    )
      .bind(coinId, since)
      .all();

    return c.json({
      success: true,
      data: priceHistory.results,
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

// GET /api/simulation/:coinId/events - 獲取事件記錄
simulation.get('/:coinId/events', async (c) => {
  try {
    const coinId = parseInt(c.req.param('coinId'));
    const limit = parseInt(c.req.query('limit') || '20');

    const events = await c.env.DB.prepare(
      `SELECT * FROM simulation_events 
       WHERE coin_id = ? 
       ORDER BY timestamp DESC 
       LIMIT ?`
    )
      .bind(coinId, limit)
      .all();

    return c.json({
      success: true,
      data: events.results,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

// POST /api/simulation/:coinId/next-trade - 生成下一筆交易
simulation.post('/:coinId/next-trade', async (c) => {
  try {
    const coinId = parseInt(c.req.param('coinId'));
    
    const simulator = new AITradingSimulator(c.env.DB);
    const trade = await simulator.getNextTrade(coinId);

    if (!trade) {
      return c.json({ success: false, error: 'No more trades available' }, 404);
    }

    return c.json({
      success: true,
      data: trade,
    });
  } catch (error) {
    console.error('Error generating next trade:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

export default simulation;
