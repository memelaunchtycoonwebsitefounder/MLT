import { Hono } from 'hono';
import { Env } from '../types';
import { runAITradingRound, triggerRandomMarketEvent } from '../services/ai-traders';
import { successResponse, errorResponse } from '../utils';

const cron = new Hono<{ Bindings: Env }>();

// AI Trading round (call this every 1-5 minutes)
cron.post('/ai-trade', async (c) => {
  try {
    const result = await runAITradingRound(c.env);
    
    return successResponse({
      message: `AI trading round completed`,
      tradesExecuted: result.tradesExecuted,
      errors: result.errors.length > 0 ? result.errors : undefined
    });
  } catch (error: any) {
    console.error('AI trading cron error:', error);
    return errorResponse('AI 交易執行失敗', 500);
  }
});

// Market events (call this every 10-30 minutes)
cron.post('/market-event', async (c) => {
  try {
    const shouldTrigger = Math.random() < 0.3; // 30% chance
    
    if (!shouldTrigger) {
      return successResponse({
        message: 'No market event triggered this round',
        triggered: false
      });
    }
    
    const result = await triggerRandomMarketEvent(c.env);
    
    return successResponse({
      message: result ? 'Market event triggered' : 'Failed to trigger market event',
      triggered: result
    });
  } catch (error: any) {
    console.error('Market event cron error:', error);
    return errorResponse('市場事件執行失敗', 500);
  }
});

// Clean up expired orders
cron.post('/cleanup-orders', async (c) => {
  try {
    // Cancel expired orders
    const result = await c.env.DB.prepare(
      `UPDATE orders 
       SET status = 'expired', updated_at = CURRENT_TIMESTAMP
       WHERE status = 'pending' 
         AND expires_at IS NOT NULL 
         AND expires_at < datetime('now')`
    ).run();
    
    return successResponse({
      message: 'Expired orders cleaned up',
      ordersExpired: result.meta.changes
    });
  } catch (error: any) {
    console.error('Order cleanup cron error:', error);
    return errorResponse('訂單清理失敗', 500);
  }
});

// Get cron status
cron.get('/status', (c) => {
  return successResponse({
    message: 'Cron service is running',
    timestamp: new Date().toISOString(),
    jobs: [
      { name: 'ai-trade', endpoint: '/api/cron/ai-trade', frequency: 'Every 1-5 minutes' },
      { name: 'market-event', endpoint: '/api/cron/market-event', frequency: 'Every 10-30 minutes' },
      { name: 'cleanup-orders', endpoint: '/api/cron/cleanup-orders', frequency: 'Every hour' }
    ]
  });
});

export default cron;
