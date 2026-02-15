/**
 * Market Events System
 * Handles special market events like Sniper Attack, Whale Buy, Rug Pull, etc.
 */

import { DestinyType } from './ai-trader-engine';

export type EventType = 
  | 'SNIPER_ATTACK' 
  | 'WHALE_BUY' 
  | 'RUG_PULL' 
  | 'PANIC_SELL' 
  | 'FOMO_BUY' 
  | 'VIRAL_MOMENT'
  | 'COIN_CREATED'
  | 'COIN_DEATH'
  | 'COIN_GRADUATION';

export interface MarketEvent {
  coin_id: number;
  event_type: EventType;
  event_data?: string;
  impact_percent: number;
}

/**
 * Event probabilities and schedules based on destiny
 */
export const EVENT_SCHEDULE: Record<DestinyType, {
  events: Array<{ type: EventType; probability: number; delayMin: number; delayMax: number }>
}> = {
  GRADUATED: {
    events: [
      { type: 'SNIPER_ATTACK', probability: 0.80, delayMin: 5, delayMax: 30 },
      { type: 'WHALE_BUY', probability: 0.90, delayMin: 300, delayMax: 1200 },
      { type: 'FOMO_BUY', probability: 0.70, delayMin: 600, delayMax: 1800 },
      { type: 'VIRAL_MOMENT', probability: 0.80, delayMin: 1800, delayMax: 3600 },
    ]
  },
  DEATH_5MIN: {
    events: [
      { type: 'SNIPER_ATTACK', probability: 0.95, delayMin: 5, delayMax: 30 },
      { type: 'PANIC_SELL', probability: 0.80, delayMin: 120, delayMax: 240 },
      { type: 'COIN_DEATH', probability: 1.0, delayMin: 240, delayMax: 300 },
    ]
  },
  DEATH_10MIN: {
    events: [
      { type: 'SNIPER_ATTACK', probability: 0.85, delayMin: 5, delayMax: 30 },
      { type: 'FOMO_BUY', probability: 0.40, delayMin: 120, delayMax: 300 },
      { type: 'PANIC_SELL', probability: 0.70, delayMin: 400, delayMax: 500 },
      { type: 'COIN_DEATH', probability: 1.0, delayMin: 540, delayMax: 600 },
    ]
  },
  RUG_PULL: {
    events: [
      { type: 'SNIPER_ATTACK', probability: 0.90, delayMin: 5, delayMax: 30 },
      { type: 'WHALE_BUY', probability: 0.60, delayMin: 180, delayMax: 360 },
      { type: 'FOMO_BUY', probability: 0.50, delayMin: 300, delayMax: 600 },
      { type: 'RUG_PULL', probability: 1.0, delayMin: 600, delayMax: 1200 },
      { type: 'COIN_DEATH', probability: 1.0, delayMin: 1200, delayMax: 1800 },
    ]
  },
  SURVIVAL: {
    events: [
      { type: 'SNIPER_ATTACK', probability: 0.70, delayMin: 5, delayMax: 30 },
      { type: 'WHALE_BUY', probability: 0.30, delayMin: 600, delayMax: 1800 },
      { type: 'FOMO_BUY', probability: 0.20, delayMin: 900, delayMax: 2400 },
      { type: 'VIRAL_MOMENT', probability: 0.10, delayMin: 1800, delayMax: 3600 },
    ]
  }
};

/**
 * Record market event in database
 */
export async function recordEvent(
  db: any,
  event: MarketEvent
): Promise<void> {
  await db.prepare(
    `INSERT INTO coin_events (coin_id, event_type, event_data, impact_percent)
     VALUES (?, ?, ?, ?)`
  ).bind(
    event.coin_id,
    event.event_type,
    event.event_data || null,
    event.impact_percent
  ).run();
  
  console.log(`📢 Event recorded: ${event.event_type} for coin ${event.coin_id} (impact: ${event.impact_percent}%)`);
}

/**
 * Trigger SNIPER_ATTACK event
 */
export async function triggerSniperAttack(
  db: any,
  coinId: number
): Promise<void> {
  // Mark coin as having sniper attack
  await db.prepare(
    `UPDATE coins SET has_sniper_attack = 1 WHERE id = ?`
  ).bind(coinId).run();
  
  await recordEvent(db, {
    coin_id: coinId,
    event_type: 'SNIPER_ATTACK',
    event_data: 'Sniper traders entered the market early',
    impact_percent: -15 // Negative impact on long-term holders
  });
  
  console.log(`🎯 SNIPER ATTACK triggered for coin ${coinId}`);
}

/**
 * Trigger WHALE_BUY event
 */
export async function triggerWhaleBuy(
  db: any,
  coinId: number
): Promise<void> {
  await db.prepare(
    `UPDATE coins SET has_whale_buy = 1 WHERE id = ?`
  ).bind(coinId).run();
  
  await recordEvent(db, {
    coin_id: coinId,
    event_type: 'WHALE_BUY',
    event_data: 'A whale entered and bought large amounts',
    impact_percent: 25 // Positive price impact
  });
  
  console.log(`🐋 WHALE BUY triggered for coin ${coinId}`);
}

/**
 * Trigger RUG_PULL event
 */
export async function triggerRugPull(
  db: any,
  coinId: number
): Promise<void> {
  await db.prepare(
    `UPDATE coins SET has_rug_pull = 1 WHERE id = ?`
  ).bind(coinId).run();
  
  await recordEvent(db, {
    coin_id: coinId,
    event_type: 'RUG_PULL',
    event_data: 'Creator or whale dumped all holdings',
    impact_percent: -80 // Massive negative impact
  });
  
  console.log(`🚨 RUG PULL triggered for coin ${coinId}`);
  
  // Deactivate all AI traders for this coin
  await db.prepare(
    `UPDATE ai_traders SET is_active = 0 WHERE coin_id = ? AND is_active = 1`
  ).bind(coinId).run();
}

/**
 * Trigger PANIC_SELL event
 */
export async function triggerPanicSell(
  db: any,
  coinId: number
): Promise<void> {
  await db.prepare(
    `UPDATE coins SET has_panic_sell = 1 WHERE id = ?`
  ).bind(coinId).run();
  
  await recordEvent(db, {
    coin_id: coinId,
    event_type: 'PANIC_SELL',
    event_data: 'Mass panic selling occurred',
    impact_percent: -40 // Major negative impact
  });
  
  console.log(`😱 PANIC SELL triggered for coin ${coinId}`);
}

/**
 * Trigger FOMO_BUY event
 */
export async function triggerFomoBuy(
  db: any,
  coinId: number
): Promise<void> {
  await db.prepare(
    `UPDATE coins SET has_fomo_buy = 1 WHERE id = ?`
  ).bind(coinId).run();
  
  await recordEvent(db, {
    coin_id: coinId,
    event_type: 'FOMO_BUY',
    event_data: 'FOMO wave - many traders buying in',
    impact_percent: 35 // Strong positive impact
  });
  
  console.log(`🔥 FOMO BUY triggered for coin ${coinId}`);
}

/**
 * Trigger VIRAL_MOMENT event
 */
export async function triggerViralMoment(
  db: any,
  coinId: number
): Promise<void> {
  await db.prepare(
    `UPDATE coins SET has_viral_moment = 1 WHERE id = ?`
  ).bind(coinId).run();
  
  await recordEvent(db, {
    coin_id: coinId,
    event_type: 'VIRAL_MOMENT',
    event_data: 'Coin went viral on social media',
    impact_percent: 100 // Huge positive impact
  });
  
  console.log(`🚀 VIRAL MOMENT triggered for coin ${coinId}`);
}

/**
 * Check if coin should die based on conditions
 */
export async function checkCoinDeath(
  db: any,
  coin: any
): Promise<boolean> {
  // Check if bonding curve progress dropped below 1%
  if (coin.bonding_curve_progress < 0.01 && coin.transaction_count > 10) {
    await handleCoinDeath(db, coin.id, 'Bonding curve progress dropped below 1%');
    return true;
  }
  
  // Check if no trades in last 24 hours (simulated - 10 minutes for testing)
  if (coin.last_ai_trade_time) {
    const lastTradeTime = new Date(coin.last_ai_trade_time).getTime();
    const now = Date.now();
    const inactiveTime = (now - lastTradeTime) / 1000 / 60; // minutes
    
    if (inactiveTime > 10 && coin.transaction_count > 5) {
      await handleCoinDeath(db, coin.id, 'No trading activity for 10 minutes');
      return true;
    }
  }
  
  // Check if rug pull occurred
  if (coin.has_rug_pull === 1) {
    await handleCoinDeath(db, coin.id, 'Rug pull event');
    return true;
  }
  
  return false;
}

/**
 * Handle coin death
 */
export async function handleCoinDeath(
  db: any,
  coinId: number,
  reason: string
): Promise<void> {
  // Update coin status
  await db.prepare(
    `UPDATE coins 
     SET status = 'dead',
         death_time = CURRENT_TIMESTAMP,
         is_ai_active = 0
     WHERE id = ?`
  ).bind(coinId).run();
  
  // Deactivate all AI traders
  await db.prepare(
    `UPDATE ai_traders SET is_active = 0 WHERE coin_id = ?`
  ).bind(coinId).run();
  
  // Record death event
  await recordEvent(db, {
    coin_id: coinId,
    event_type: 'COIN_DEATH',
    event_data: reason,
    impact_percent: -100
  });
  
  console.log(`💀 COIN DEATH: Coin ${coinId} has died. Reason: ${reason}`);
}

/**
 * Handle coin graduation (100% bonding curve)
 */
export async function handleCoinGraduation(
  db: any,
  coinId: number
): Promise<void> {
  // Update coin status
  await db.prepare(
    `UPDATE coins 
     SET status = 'graduated',
         graduation_time = CURRENT_TIMESTAMP,
         is_ai_active = 0
     WHERE id = ?`
  ).bind(coinId).run();
  
  // Deactivate all AI traders (graduated coins don't need AI anymore)
  await db.prepare(
    `UPDATE ai_traders SET is_active = 0 WHERE coin_id = ?`
  ).bind(coinId).run();
  
  // Record graduation event
  await recordEvent(db, {
    coin_id: coinId,
    event_type: 'COIN_GRADUATION',
    event_data: 'Coin reached 100% bonding curve and graduated',
    impact_percent: 200
  });
  
  console.log(`🎓 COIN GRADUATION: Coin ${coinId} has graduated!`);
}

/**
 * Schedule events for a coin based on its destiny
 */
export async function scheduleEventsForCoin(
  coinId: number,
  destinyType: DestinyType,
  createdAt: Date
): Promise<Array<{ eventType: EventType; triggerTime: Date }>> {
  const schedule = EVENT_SCHEDULE[destinyType];
  const scheduledEvents: Array<{ eventType: EventType; triggerTime: Date }> = [];
  
  for (const eventConfig of schedule.events) {
    // Check probability
    if (Math.random() > eventConfig.probability) {
      continue;
    }
    
    // Calculate trigger time
    const delaySeconds = eventConfig.delayMin + 
      Math.random() * (eventConfig.delayMax - eventConfig.delayMin);
    
    const triggerTime = new Date(createdAt.getTime() + delaySeconds * 1000);
    
    scheduledEvents.push({
      eventType: eventConfig.type,
      triggerTime
    });
  }
  
  // Sort by trigger time
  scheduledEvents.sort((a, b) => a.triggerTime.getTime() - b.triggerTime.getTime());
  
  console.log(`📅 Scheduled ${scheduledEvents.length} events for coin ${coinId} (Destiny: ${destinyType})`);
  
  return scheduledEvents;
}

/**
 * Execute scheduled event
 */
export async function executeScheduledEvent(
  db: any,
  coinId: number,
  eventType: EventType
): Promise<void> {
  switch (eventType) {
    case 'SNIPER_ATTACK':
      await triggerSniperAttack(db, coinId);
      break;
    case 'WHALE_BUY':
      await triggerWhaleBuy(db, coinId);
      break;
    case 'RUG_PULL':
      await triggerRugPull(db, coinId);
      break;
    case 'PANIC_SELL':
      await triggerPanicSell(db, coinId);
      break;
    case 'FOMO_BUY':
      await triggerFomoBuy(db, coinId);
      break;
    case 'VIRAL_MOMENT':
      await triggerViralMoment(db, coinId);
      break;
    case 'COIN_DEATH':
      await handleCoinDeath(db, coinId, 'Scheduled death event');
      break;
    case 'COIN_GRADUATION':
      await handleCoinGraduation(db, coinId);
      break;
    default:
      console.warn(`⚠️ Unknown event type: ${eventType}`);
  }
}
