/**
 * Admin routes for AI Trading System
 * Control scheduler, view stats, manual triggers
 */

import { Hono } from 'hono';
import { Env } from '../types';
import { errorResponse, successResponse } from '../utils';
import {
  initializeGlobalScheduler,
  stopGlobalScheduler,
  getSchedulerStatus,
  manualTradingCycle,
  startCoinScheduler
} from '../services/scheduler';
import {
  determineDestiny,
  initializeAITraders
} from '../services/ai-trader-engine';
import {
  scheduleEventsForCoin,
  recordEvent
} from '../services/market-events';

const admin = new Hono<{ Bindings: Env }>();

/**
 * Initialize or restart the global scheduler
 */
admin.post('/scheduler/start', async (c) => {
  try {
    await initializeGlobalScheduler(c.env.DB);
    
    return successResponse({
      message: 'Global scheduler started',
      status: getSchedulerStatus()
    });
  } catch (error: any) {
    console.error('Start scheduler error:', error);
    return errorResponse('啟動排程器時發生錯誤', 500);
  }
});

/**
 * Stop the global scheduler
 */
admin.post('/scheduler/stop', async (c) => {
  try {
    stopGlobalScheduler();
    
    return successResponse({
      message: 'Global scheduler stopped',
      status: getSchedulerStatus()
    });
  } catch (error: any) {
    console.error('Stop scheduler error:', error);
    return errorResponse('停止排程器時發生錯誤', 500);
  }
});

/**
 * Get scheduler status
 */
admin.get('/scheduler/status', async (c) => {
  try {
    const status = getSchedulerStatus();
    
    return successResponse(status);
  } catch (error: any) {
    console.error('Get scheduler status error:', error);
    return errorResponse('獲取排程器狀態時發生錯誤', 500);
  }
});

/**
 * Manually trigger AI trading cycle for a coin
 */
admin.post('/coins/:id/trade-cycle', async (c) => {
  try {
    const coinId = parseInt(c.req.param('id'));
    
    if (!coinId) {
      return errorResponse('無效的幣種 ID');
    }
    
    await manualTradingCycle(c.env.DB, coinId);
    
    return successResponse({
      message: `Trading cycle executed for coin ${coinId}`
    });
  } catch (error: any) {
    console.error('Manual trading cycle error:', error);
    return errorResponse('執行交易循環時發生錯誤', 500);
  }
});

/**
 * Initialize AI system for an existing coin
 */
admin.post('/coins/:id/init-ai', async (c) => {
  try {
    const coinId = parseInt(c.req.param('id'));
    
    if (!coinId) {
      return errorResponse('無效的幣種 ID');
    }
    
    // Get coin
    const coin = await c.env.DB.prepare(
      'SELECT * FROM coins WHERE id = ?'
    ).bind(coinId).first();
    
    if (!coin) {
      return errorResponse('幣種未找到', 404);
    }
    
    // Determine destiny
    const destinyType = determineDestiny();
    
    // Initialize AI traders
    await initializeAITraders(c.env.DB, coinId, coin.total_supply, destinyType);
    
    // Schedule events
    const scheduledEvents = await scheduleEventsForCoin(
      coinId,
      destinyType,
      new Date(coin.created_at)
    );
    
    // Start scheduler
    startCoinScheduler(coinId, new Date(coin.created_at), scheduledEvents);
    
    // Update coin
    await c.env.DB.prepare(
      `UPDATE coins 
       SET destiny_type = ?,
           is_ai_active = 1
       WHERE id = ?`
    ).bind(destinyType, coinId).run();
    
    // Record creation event
    await recordEvent(c.env.DB, {
      coin_id: coinId,
      event_type: 'COIN_CREATED',
      event_data: `Destiny: ${destinyType}`,
      impact_percent: 0
    });
    
    return successResponse({
      message: 'AI system initialized',
      destinyType,
      tradersCreated: scheduledEvents.length,
      eventsScheduled: scheduledEvents.length
    });
  } catch (error: any) {
    console.error('Init AI error:', error);
    return errorResponse('初始化 AI 系統時發生錯誤', 500);
  }
});

/**
 * Get AI trading stats
 */
admin.get('/stats', async (c) => {
  try {
    // Get overall stats
    const coinStats = await c.env.DB.prepare(
      `SELECT 
        COUNT(*) as total_coins,
        SUM(CASE WHEN is_ai_active = 1 THEN 1 ELSE 0 END) as active_coins,
        SUM(CASE WHEN status = 'dead' THEN 1 ELSE 0 END) as dead_coins,
        SUM(CASE WHEN status = 'graduated' THEN 1 ELSE 0 END) as graduated_coins,
        AVG(bonding_curve_progress) as avg_progress,
        SUM(ai_trade_count) as total_ai_trades,
        SUM(real_trade_count) as total_real_trades
      FROM coins`
    ).first();
    
    const traderStats = await c.env.DB.prepare(
      `SELECT 
        COUNT(*) as total_traders,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_traders,
        trader_type,
        COUNT(*) as count
      FROM ai_traders
      GROUP BY trader_type`
    ).all();
    
    const eventStats = await c.env.DB.prepare(
      `SELECT 
        event_type,
        COUNT(*) as count
      FROM coin_events
      GROUP BY event_type
      ORDER BY count DESC`
    ).all();
    
    return successResponse({
      coins: coinStats,
      traders: traderStats.results,
      events: eventStats.results,
      scheduler: getSchedulerStatus()
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    return errorResponse('獲取統計資料時發生錯誤', 500);
  }
});

export default admin;
