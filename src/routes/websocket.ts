import { Hono } from 'hono';
import { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

/**
 * WebSocket price broadcast endpoint
 * Pushes price updates every 0.5 seconds to all connected clients
 */
app.get('/broadcast/:coinId', async (c) => {
  const coinId = parseInt(c.req.param('coinId'));
  
  try {
    // Get latest coin data
    const coin = await c.env.DB.prepare(`
      SELECT id, name, symbol, current_price, market_cap, circulating_supply,
             bonding_curve_progress, ai_trade_count, real_trade_count
      FROM coins
      WHERE id = ? AND status = 'active'
    `).bind(coinId).first();

    if (!coin) {
      return c.json({ success: false, error: 'Coin not found' }, 404);
    }

    // Get Durable Object stub
    const id = c.env.REALTIME.idFromName('global');
    const stub = c.env.REALTIME.get(id);
    
    // Broadcast to all subscribers
    await stub.fetch(new Request('https://internal/broadcast/coin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coinId,
        data: coin
      })
    }));

    return c.json({ success: true, broadcasted: true });
  } catch (error) {
    console.error('[WS_BROADCAST] Error:', error);
    return c.json({ success: false, error: 'Broadcast failed' }, 500);
  }
});

/**
 * Get tick data for chart (OHLC format)
 * Returns data in format suitable for TradingView Lightweight Charts
 */
app.get('/ticks/:coinId', async (c) => {
  const coinId = parseInt(c.req.param('coinId'));
  const limit = parseInt(c.req.query('limit') || '100');
  const timeframe = c.req.query('timeframe') || '1m'; // 1m, 5m, 15m, 1h, 1d
  
  try {
    // Calculate time window based on timeframe
    let timeWindow = '1 minute';
    let groupInterval = 60; // seconds
    
    switch (timeframe) {
      case '5m':
        timeWindow = '5 minutes';
        groupInterval = 300;
        break;
      case '15m':
        timeWindow = '15 minutes';
        groupInterval = 900;
        break;
      case '1h':
        timeWindow = '1 hour';
        groupInterval = 3600;
        break;
      case '1d':
        timeWindow = '1 day';
        groupInterval = 86400;
        break;
      default:
        timeWindow = '1 minute';
        groupInterval = 60;
    }

    // Get OHLC data from price_history
    const ticks = await c.env.DB.prepare(`
      SELECT 
        strftime('%s', timestamp) - (strftime('%s', timestamp) % ?) as time_bucket,
        MIN(price) as low,
        MAX(price) as high,
        (SELECT price FROM price_history WHERE coin_id = ? 
         AND strftime('%s', timestamp) / ? = time_bucket / ? 
         ORDER BY timestamp ASC LIMIT 1) as open,
        (SELECT price FROM price_history WHERE coin_id = ? 
         AND strftime('%s', timestamp) / ? = time_bucket / ? 
         ORDER BY timestamp DESC LIMIT 1) as close,
        SUM(volume) as volume
      FROM price_history
      WHERE coin_id = ?
        AND timestamp > datetime('now', '-' || ? || ' minutes')
      GROUP BY time_bucket
      ORDER BY time_bucket DESC
      LIMIT ?
    `).bind(
      groupInterval,
      coinId, groupInterval, groupInterval,
      coinId, groupInterval, groupInterval,
      coinId,
      limit * groupInterval / 60,
      limit
    ).all();

    return c.json({
      success: true,
      data: {
        timeframe,
        ticks: ticks.results || []
      }
    });
  } catch (error) {
    console.error('[TICKS] Error:', error);
    return c.json({ success: false, error: 'Failed to fetch tick data' }, 500);
  }
});

export default app;
