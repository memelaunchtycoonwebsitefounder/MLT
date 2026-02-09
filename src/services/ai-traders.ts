import { Env } from '../types';

/**
 * AI Trader System
 * Simulates automated trading behavior
 */

interface AITrader {
  id: number;
  name: string;
  personality: 'conservative' | 'moderate' | 'aggressive' | 'random';
  virtual_balance: number;
  active: boolean;
}

interface Coin {
  id: number;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  circulating_supply: number;
  hype_score: number;
}

/**
 * Determine if AI trader should make a trade
 */
export function shouldTrade(trader: AITrader, coin: Coin): { action: 'buy' | 'sell' | 'hold', amount: number } {
  const random = Math.random();
  
  switch (trader.personality) {
    case 'conservative':
      // Only trades when hype is low (undervalued) or very high (sell)
      if (coin.hype_score < 30 && random < 0.1) {
        return { action: 'buy', amount: Math.floor(trader.virtual_balance * 0.05 / coin.current_price) };
      } else if (coin.hype_score > 80 && random < 0.15) {
        return { action: 'sell', amount: Math.floor(Math.random() * 100) };
      }
      return { action: 'hold', amount: 0 };
      
    case 'moderate':
      // Balanced trading strategy
      if (coin.hype_score < 40 && random < 0.15) {
        return { action: 'buy', amount: Math.floor(trader.virtual_balance * 0.1 / coin.current_price) };
      } else if (coin.hype_score > 70 && random < 0.2) {
        return { action: 'sell', amount: Math.floor(Math.random() * 200) };
      }
      return { action: 'hold', amount: 0 };
      
    case 'aggressive':
      // High frequency trading
      if (random < 0.25) {
        if (coin.hype_score > 60 || random < 0.5) {
          return { action: 'buy', amount: Math.floor(trader.virtual_balance * 0.15 / coin.current_price) };
        } else {
          return { action: 'sell', amount: Math.floor(Math.random() * 300) };
        }
      }
      return { action: 'hold', amount: 0 };
      
    case 'random':
      // Completely random
      if (random < 0.2) {
        const isBuy = Math.random() > 0.5;
        return {
          action: isBuy ? 'buy' : 'sell',
          amount: Math.floor(Math.random() * 500) + 50
        };
      }
      return { action: 'hold', amount: 0 };
      
    default:
      return { action: 'hold', amount: 0 };
  }
}

/**
 * Execute AI trading round
 * This would be called periodically (e.g., every minute)
 */
export async function runAITradingRound(env: Env): Promise<{ tradesExecuted: number, errors: string[] }> {
  const errors: string[] = [];
  let tradesExecuted = 0;
  
  try {
    // Get active AI traders
    const traders = await env.DB.prepare(
      'SELECT * FROM ai_traders WHERE active = 1'
    ).all();
    
    if (!traders.results || traders.results.length === 0) {
      return { tradesExecuted: 0, errors: ['No active AI traders'] };
    }
    
    // Get random active coins
    const coins = await env.DB.prepare(
      'SELECT * FROM coins WHERE status = ? ORDER BY RANDOM() LIMIT 5'
    ).bind('active').all();
    
    if (!coins.results || coins.results.length === 0) {
      return { tradesExecuted: 0, errors: ['No active coins'] };
    }
    
    // Each trader considers each coin
    for (const traderRow of traders.results) {
      const trader = traderRow as any as AITrader;
      
      for (const coinRow of coins.results) {
        const coin = coinRow as any as Coin;
        
        try {
          const decision = shouldTrade(trader, coin);
          
          if (decision.action === 'hold' || decision.amount <= 0) {
            continue;
          }
          
          // Record AI trade in trade_history (use 'direct' as trade_type for compatibility)
          if (decision.action === 'buy' && trader.virtual_balance >= coin.current_price * decision.amount) {
            await env.DB.prepare(
              `INSERT INTO trade_history 
               (buyer_id, coin_id, amount, price, total_value, trade_type)
               VALUES (?, ?, ?, ?, ?, 'direct')`
            ).bind(
              trader.id,
              coin.id,
              decision.amount,
              coin.current_price,
              coin.current_price * decision.amount
            ).run();
            
            // Update trader balance
            await env.DB.prepare(
              `UPDATE ai_traders 
               SET virtual_balance = virtual_balance - ?,
                   total_trades = total_trades + 1,
                   last_trade_at = CURRENT_TIMESTAMP
               WHERE id = ?`
            ).bind(coin.current_price * decision.amount, trader.id).run();
            
            // Update coin stats
            await env.DB.prepare(
              `UPDATE coins 
               SET circulating_supply = circulating_supply + ?,
                   hype_score = hype_score + ?,
                   transaction_count = transaction_count + 1
               WHERE id = ?`
            ).bind(decision.amount, decision.amount * 0.01, coin.id).run();
            
            tradesExecuted++;
          }
        } catch (error) {
          errors.push(`Trader ${trader.name} coin ${coin.symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }
    
    return { tradesExecuted, errors };
    
  } catch (error) {
    errors.push(`AI Trading Round Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { tradesExecuted, errors };
  }
}

/**
 * Trigger a market event
 */
export async function triggerRandomMarketEvent(env: Env): Promise<boolean> {
  try {
    const eventTypes = ['pump', 'dump', 'news', 'whale', 'viral'];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    // Get a random active coin
    const coin = await env.DB.prepare(
      'SELECT * FROM coins WHERE status = ? ORDER BY RANDOM() LIMIT 1'
    ).bind('active').first() as any;
    
    if (!coin) {
      return false;
    }
    
    // Determine impact based on event type
    let impactMultiplier = 1.0;
    let title = '';
    let description = '';
    
    switch (eventType) {
      case 'pump':
        impactMultiplier = 1.2 + Math.random() * 0.3; // 1.2x - 1.5x
        title = `🚀 ${coin.name} 正在暴漲！`;
        description = '大量買單湧入，價格持續上漲！';
        break;
      case 'dump':
        impactMultiplier = 0.7 - Math.random() * 0.2; // 0.5x - 0.7x
        title = `📉 ${coin.name} 遭遇拋售！`;
        description = '持有者恐慌性拋售，價格快速下跌！';
        break;
      case 'news':
        impactMultiplier = Math.random() > 0.5 ? 1.1 + Math.random() * 0.2 : 0.9 - Math.random() * 0.1;
        title = `📰 ${coin.name} 有新消息！`;
        description = '重大新聞發布，市場反應強烈！';
        break;
      case 'whale':
        impactMultiplier = 1.15 + Math.random() * 0.25;
        title = `🐋 巨鯨買入 ${coin.name}！`;
        description = '大戶進場，價格被拉升！';
        break;
      case 'viral':
        impactMultiplier = 1.3 + Math.random() * 0.4;
        title = `🔥 ${coin.name} 爆紅！`;
        description = '社交媒體瘋傳，熱度暴增！';
        break;
    }
    
    // Create market event
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes duration
    
    await env.DB.prepare(
      `INSERT INTO market_events_enhanced 
       (event_type, coin_id, title, description, impact_multiplier, duration_minutes, expires_at)
       VALUES (?, ?, ?, ?, ?, 30, ?)`
    ).bind(eventType, coin.id, title, description, impactMultiplier, expiresAt.toISOString()).run();
    
    // Apply impact to coin
    const newPrice = coin.current_price * impactMultiplier;
    const newHype = Math.min(100, Math.max(0, coin.hype_score + (impactMultiplier - 1) * 100));
    
    await env.DB.prepare(
      `UPDATE coins 
       SET current_price = ?,
           hype_score = ?
       WHERE id = ?`
    ).bind(newPrice, newHype, coin.id).run();
    
    return true;
  } catch (error) {
    console.error('Market event error:', error);
    return false;
  }
}
