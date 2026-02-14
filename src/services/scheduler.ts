/**
 * Background Scheduler for AI Trading System
 * Manages continuous AI trading and event execution
 * 
 * Note: This is a simplified in-memory scheduler for demonstration.
 * In production, you would use Cloudflare Durable Objects or a proper job queue.
 */

import {
  AITrader,
  executeAIBuy,
  executeAISell,
  shouldTraderAct
} from './ai-trader-engine';
import {
  checkCoinDeath,
  handleCoinGraduation,
  executeScheduledEvent,
  EventType
} from './market-events';

export interface ScheduledEvent {
  coinId: number;
  eventType: EventType;
  triggerTime: Date;
  executed: boolean;
}

export interface CoinScheduler {
  coinId: number;
  isActive: boolean;
  createdAt: Date;
  lastTradeCheck: Date;
  scheduledEvents: ScheduledEvent[];
}

// In-memory storage for active coin schedulers
const activeSchedulers = new Map<number, CoinScheduler>();

/**
 * Start scheduler for a coin
 */
export function startCoinScheduler(
  coinId: number,
  createdAt: Date,
  scheduledEvents: Array<{ eventType: EventType; triggerTime: Date }>
): void {
  if (activeSchedulers.has(coinId)) {
    console.log(`⚠️ Scheduler already running for coin ${coinId}`);
    return;
  }
  
  const scheduler: CoinScheduler = {
    coinId,
    isActive: true,
    createdAt,
    lastTradeCheck: new Date(),
    scheduledEvents: scheduledEvents.map(e => ({
      ...e,
      executed: false
    }))
  };
  
  activeSchedulers.set(coinId, scheduler);
  
  console.log(`✅ Started scheduler for coin ${coinId} with ${scheduledEvents.length} events`);
}

/**
 * Stop scheduler for a coin
 */
export function stopCoinScheduler(coinId: number): void {
  const scheduler = activeSchedulers.get(coinId);
  if (scheduler) {
    scheduler.isActive = false;
    activeSchedulers.delete(coinId);
    console.log(`🛑 Stopped scheduler for coin ${coinId}`);
  }
}

/**
 * Execute one AI trading cycle for a coin
 */
export async function executeAITradingCycle(
  db: any,
  coinId: number
): Promise<void> {
  try {
    // Get coin data
    const coin = await db.prepare(
      'SELECT * FROM coins WHERE id = ? AND is_ai_active = 1'
    ).bind(coinId).first();
    
    if (!coin) {
      stopCoinScheduler(coinId);
      return;
    }
    
    // Check if coin should die
    const isDead = await checkCoinDeath(db, coin);
    if (isDead) {
      stopCoinScheduler(coinId);
      return;
    }
    
    // Check if coin graduated
    if (coin.bonding_curve_progress >= 1.0 && coin.status === 'active') {
      await handleCoinGraduation(db, coinId);
      stopCoinScheduler(coinId);
      return;
    }
    
    // Get active AI traders
    const traders = await db.prepare(
      'SELECT * FROM ai_traders WHERE coin_id = ? AND is_active = 1'
    ).bind(coinId).all();
    
    if (!traders.results || traders.results.length === 0) {
      console.log(`⚠️ No active traders for coin ${coinId}`);
      return;
    }
    
    // Calculate coin age
    const coinCreatedTime = new Date(coin.created_at).getTime();
    const now = Date.now();
    const coinAgeSeconds = (now - coinCreatedTime) / 1000;
    
    // Execute trades for each trader
    for (const trader of traders.results) {
      const action = shouldTraderAct(trader as AITrader, coin, coinAgeSeconds);
      
      if (action === 'buy') {
        await executeAIBuy(db, trader as AITrader, coin);
      } else if (action === 'sell') {
        await executeAISell(db, trader as AITrader, coin);
      }
      
      // Small delay between traders to avoid race conditions
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (error) {
    console.error(`❌ Error in AI trading cycle for coin ${coinId}:`, error);
  }
}

/**
 * Check and execute scheduled events
 */
export async function checkScheduledEvents(db: any): Promise<void> {
  const now = new Date();
  
  for (const [coinId, scheduler] of activeSchedulers.entries()) {
    if (!scheduler.isActive) {
      continue;
    }
    
    // Check each scheduled event
    for (const event of scheduler.scheduledEvents) {
      if (event.executed) {
        continue;
      }
      
      // Check if it's time to execute
      if (now >= event.triggerTime) {
        try {
          await executeScheduledEvent(db, coinId, event.eventType);
          event.executed = true;
          
          // If coin died or graduated, stop scheduler
          if (event.eventType === 'COIN_DEATH' || event.eventType === 'COIN_GRADUATION') {
            stopCoinScheduler(coinId);
          }
        } catch (error) {
          console.error(`❌ Error executing event ${event.eventType} for coin ${coinId}:`, error);
        }
      }
    }
  }
}

/**
 * Main scheduler loop
 * Runs continuously to execute AI trades and events
 */
let schedulerInterval: NodeJS.Timeout | null = null;

export async function initializeGlobalScheduler(db: any): Promise<void> {
  if (schedulerInterval) {
    console.log('⚠️ Global scheduler already running');
    return;
  }
  
  console.log('🚀 Starting global AI trading scheduler...');
  
  // Main loop: runs every 10 seconds
  schedulerInterval = setInterval(async () => {
    try {
      // 1. Check and execute scheduled events
      await checkScheduledEvents(db);
      
      // 2. Execute AI trading cycles for all active coins
      const activeCoins = await db.prepare(
        'SELECT id FROM coins WHERE is_ai_active = 1 AND status = ?'
      ).bind('active').all();
      
      if (activeCoins.results && activeCoins.results.length > 0) {
        for (const coin of activeCoins.results) {
          // Only execute if scheduler exists
          if (activeSchedulers.has(coin.id)) {
            await executeAITradingCycle(db, coin.id);
            
            // Small delay between coins
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      }
    } catch (error) {
      console.error('❌ Error in global scheduler:', error);
    }
  }, 10000); // Run every 10 seconds
  
  console.log('✅ Global AI trading scheduler started (10s interval)');
}

/**
 * Stop global scheduler
 */
export function stopGlobalScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    activeSchedulers.clear();
    console.log('🛑 Global scheduler stopped');
  }
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus(): {
  isRunning: boolean;
  activeCoins: number;
  schedulers: Array<{
    coinId: number;
    isActive: boolean;
    age: number;
    pendingEvents: number;
  }>;
} {
  const schedulers = Array.from(activeSchedulers.values()).map(s => ({
    coinId: s.coinId,
    isActive: s.isActive,
    age: Math.floor((Date.now() - s.createdAt.getTime()) / 1000),
    pendingEvents: s.scheduledEvents.filter(e => !e.executed).length
  }));
  
  return {
    isRunning: schedulerInterval !== null,
    activeCoins: activeSchedulers.size,
    schedulers
  };
}

/**
 * Manually trigger a trading cycle (for testing)
 */
export async function manualTradingCycle(db: any, coinId: number): Promise<void> {
  console.log(`🔧 Manual trading cycle triggered for coin ${coinId}`);
  await executeAITradingCycle(db, coinId);
}
