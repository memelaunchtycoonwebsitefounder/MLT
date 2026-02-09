import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { Env } from '../types';

const realtime = new Hono<{ Bindings: Env }>();

/**
 * SSE endpoint for real-time price updates
 * Client connects and receives price updates every 2 seconds
 */
realtime.get('/prices', async (c) => {
  return streamSSE(c, async (stream) => {
    let id = 0;
    
    // Send initial connection message
    await stream.writeSSE({
      data: JSON.stringify({ type: 'connected', message: 'Real-time price stream connected' }),
      event: 'connected',
      id: String(id++)
    });
    
    // Update interval - every 2 seconds
    const intervalId = setInterval(async () => {
      try {
        // Get top coins with current prices
        const coins = await c.env.DB.prepare(
          `SELECT id, name, symbol, current_price, market_cap, hype_score, 
                  circulating_supply, transaction_count
           FROM coins 
           WHERE status = 'active'
           ORDER BY market_cap DESC
           LIMIT 20`
        ).all();
        
        // Get active market events
        const events = await c.env.DB.prepare(
          `SELECT e.*, c.name as coin_name, c.symbol as coin_symbol
           FROM market_events_enhanced e
           LEFT JOIN coins c ON e.coin_id = c.id
           WHERE e.active = 1 AND e.expires_at > datetime('now')
           ORDER BY e.created_at DESC
           LIMIT 5`
        ).all();
        
        // Send price update
        await stream.writeSSE({
          data: JSON.stringify({
            type: 'price_update',
            timestamp: new Date().toISOString(),
            coins: coins.results,
            events: events.results
          }),
          event: 'price_update',
          id: String(id++)
        });
        
      } catch (error) {
        console.error('SSE price update error:', error);
      }
    }, 2000);
    
    // Cleanup on disconnect
    stream.onAbort(() => {
      clearInterval(intervalId);
      console.log('SSE client disconnected');
    });
    
    // Keep connection alive
    await stream.sleep(300000); // 5 minutes max
  });
});

/**
 * SSE endpoint for portfolio updates
 * Requires authentication via query parameter
 */
realtime.get('/portfolio/:userId', async (c) => {
  const userId = parseInt(c.req.param('userId'));
  
  return streamSSE(c, async (stream) => {
    let id = 0;
    
    await stream.writeSSE({
      data: JSON.stringify({ type: 'connected', message: 'Portfolio stream connected' }),
      event: 'connected',
      id: String(id++)
    });
    
    const intervalId = setInterval(async () => {
      try {
        // Get user's holdings
        const holdings = await c.env.DB.prepare(
          `SELECT h.*, c.name, c.symbol, c.current_price
           FROM holdings h
           JOIN coins c ON h.coin_id = c.id
           WHERE h.user_id = ?`
        ).bind(userId).all();
        
        // Calculate portfolio value
        let totalValue = 0;
        const enrichedHoldings = (holdings.results as any[]).map((h: any) => {
          const currentValue = h.current_price * h.amount;
          totalValue += currentValue;
          return {
            ...h,
            current_value: currentValue,
            profit_loss: currentValue - (h.avg_buy_price * h.amount)
          };
        });
        
        await stream.writeSSE({
          data: JSON.stringify({
            type: 'portfolio_update',
            timestamp: new Date().toISOString(),
            holdings: enrichedHoldings,
            totalValue
          }),
          event: 'portfolio_update',
          id: String(id++)
        });
        
      } catch (error) {
        console.error('SSE portfolio update error:', error);
      }
    }, 3000);
    
    stream.onAbort(() => {
      clearInterval(intervalId);
    });
    
    await stream.sleep(300000);
  });
});

/**
 * SSE endpoint for market events stream
 */
realtime.get('/events', async (c) => {
  return streamSSE(c, async (stream) => {
    let id = 0;
    
    await stream.writeSSE({
      data: JSON.stringify({ type: 'connected', message: 'Events stream connected' }),
      event: 'connected',
      id: String(id++)
    });
    
    const intervalId = setInterval(async () => {
      try {
        // Get recent events (last 10 minutes)
        const events = await c.env.DB.prepare(
          `SELECT e.*, c.name as coin_name, c.symbol as coin_symbol, c.image_url
           FROM market_events_enhanced e
           LEFT JOIN coins c ON e.coin_id = c.id
           WHERE e.created_at > datetime('now', '-10 minutes')
           ORDER BY e.created_at DESC
           LIMIT 10`
        ).all();
        
        // Get AI trading activity
        const recentTrades = await c.env.DB.prepare(
          `SELECT t.*, c.name as coin_name, c.symbol as coin_symbol,
                  a.name as trader_name
           FROM trade_history t
           LEFT JOIN coins c ON t.coin_id = c.id
           LEFT JOIN ai_traders a ON t.buyer_id = a.id
           WHERE t.timestamp > datetime('now', '-5 minutes')
           ORDER BY t.timestamp DESC
           LIMIT 5`
        ).all();
        
        await stream.writeSSE({
          data: JSON.stringify({
            type: 'events_update',
            timestamp: new Date().toISOString(),
            events: events.results,
            recentTrades: recentTrades.results
          }),
          event: 'events_update',
          id: String(id++)
        });
        
      } catch (error) {
        console.error('SSE events update error:', error);
      }
    }, 5000);
    
    stream.onAbort(() => {
      clearInterval(intervalId);
    });
    
    await stream.sleep(600000); // 10 minutes
  });
});

export default realtime;
