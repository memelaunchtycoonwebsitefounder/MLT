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
        SUM(transaction_count) as total_trades,
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

/**
 * Get user registration statistics
 */
admin.get('/stats/users', async (c) => {
  try {
    // Total users (all)
    const totalUsers = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM users'
    ).first() as any;

    // Real users (exclude AI traders)
    const realUsers = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM users 
       WHERE email NOT LIKE '%@ai.memelaunch.system'`
    ).first() as any;

    // AI traders
    const aiTraders = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM users 
       WHERE email LIKE '%@ai.memelaunch.system'`
    ).first() as any;

    // Real users registered today
    const todayUsers = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM users 
       WHERE DATE(created_at) = DATE('now')
       AND email NOT LIKE '%@ai.memelaunch.system'`
    ).first() as any;

    // Real users registered this week
    const weekUsers = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM users 
       WHERE DATE(created_at) >= DATE('now', '-7 days')
       AND email NOT LIKE '%@ai.memelaunch.system'`
    ).first() as any;

    // Real users registered this month
    const monthUsers = await c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM users 
       WHERE DATE(created_at) >= DATE('now', 'start of month')
       AND email NOT LIKE '%@ai.memelaunch.system'`
    ).first() as any;

    // Recent registrations (last 10 real users only)
    const recentUsers = await c.env.DB.prepare(
      `SELECT id, username, email, created_at 
       FROM users 
       WHERE email NOT LIKE '%@ai.memelaunch.system'
       ORDER BY created_at DESC 
       LIMIT 10`
    ).all();

    // Registration trend (last 7 days, real users only)
    const trend = await c.env.DB.prepare(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM users 
       WHERE DATE(created_at) >= DATE('now', '-7 days')
       AND email NOT LIKE '%@ai.memelaunch.system'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    ).all();

    return successResponse({
      total: totalUsers?.count || 0,
      realUsers: realUsers?.count || 0,
      aiTraders: aiTraders?.count || 0,
      today: todayUsers?.count || 0,
      week: weekUsers?.count || 0,
      month: monthUsers?.count || 0,
      recent: recentUsers.results || [],
      trend: trend.results || []
    });
  } catch (error: any) {
    console.error('Get user stats error:', error);
    return errorResponse('獲取用戶統計時發生錯誤', 500);
  }
});

/**
 * Get all users list (paginated)
 */
admin.get('/users', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

    // Get total count
    const totalCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM users'
    ).first() as any;

    // Get users
    const users = await c.env.DB.prepare(
      `SELECT id, username, email, virtual_balance, mlt_balance, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`
    ).bind(limit, offset).all();

    return successResponse({
      users: users.results || [],
      pagination: {
        page,
        limit,
        total: totalCount?.count || 0,
        totalPages: Math.ceil((totalCount?.count || 0) / limit)
      }
    });
  } catch (error: any) {
    console.error('Get users list error:', error);
    return errorResponse('獲取用戶列表時發生錯誤', 500);
  }
});

export default admin;
