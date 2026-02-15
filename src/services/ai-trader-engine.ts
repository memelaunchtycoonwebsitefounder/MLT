/**
 * AI Trader Engine
 * Manages AI traders and their behaviors for meme coins
 */

import { calculateBuyTrade, calculateSellTrade } from '../utils/bonding-curve';

export type TraderType = 'SNIPER' | 'WHALE' | 'RETAIL' | 'BOT' | 'MARKET_MAKER';
export type DestinyType = 'GRADUATED' | 'DEATH_5MIN' | 'DEATH_10MIN' | 'SURVIVAL' | 'RUG_PULL';

export interface AITrader {
  id?: number;
  coin_id: number;
  trader_type: TraderType;
  holdings: number;
  total_bought: number;
  total_sold: number;
  mlt_balance?: number;
  target_profit_percent: number;
  is_active: boolean;
  created_at?: string;
  last_trade_at?: string;
}

export interface TraderBehavior {
  entryDelayMin: number;      // Seconds before first trade
  entryDelayMax: number;
  buyAmountMin: number;        // Percentage of total supply
  buyAmountMax: number;
  targetProfitMin: number;     // Profit percentage
  targetProfitMax: number;
  sellDelayMin: number;        // Seconds before selling
  sellDelayMax: number;
  tradeFrequencyMin: number;   // Seconds between trades
  tradeFrequencyMax: number;
  maxHoldings: number;         // Max percentage of supply to hold
}

/**
 * Trader behavior configurations
 */
export const TRADER_BEHAVIORS: Record<TraderType, TraderBehavior> = {
  SNIPER: {
    entryDelayMin: 5,
    entryDelayMax: 30,
    buyAmountMin: 0.05,      // 5% of supply
    buyAmountMax: 0.15,      // 15% of supply
    targetProfitMin: 30,
    targetProfitMax: 100,
    sellDelayMin: 60,        // 1 minute
    sellDelayMax: 180,       // 3 minutes
    tradeFrequencyMin: 30,
    tradeFrequencyMax: 120,
    maxHoldings: 0.15
  },
  WHALE: {
    entryDelayMin: 300,      // 5 minutes
    entryDelayMax: 1200,     // 20 minutes
    buyAmountMin: 0.10,      // 10% of supply
    buyAmountMax: 0.30,      // 30% of supply
    targetProfitMin: 50,
    targetProfitMax: 200,
    sellDelayMin: 600,       // 10 minutes
    sellDelayMax: 1800,      // 30 minutes
    tradeFrequencyMin: 120,
    tradeFrequencyMax: 600,
    maxHoldings: 0.30
  },
  RETAIL: {
    entryDelayMin: 60,
    entryDelayMax: 600,
    buyAmountMin: 0.001,     // 0.1% of supply
    buyAmountMax: 0.02,      // 2% of supply
    targetProfitMin: 10,
    targetProfitMax: 50,
    sellDelayMin: 180,
    sellDelayMax: 900,
    tradeFrequencyMin: 30,
    tradeFrequencyMax: 300,
    maxHoldings: 0.05
  },
  BOT: {
    entryDelayMin: 10,
    entryDelayMax: 60,
    buyAmountMin: 0.0001,    // 0.01% of supply
    buyAmountMax: 0.005,     // 0.5% of supply
    targetProfitMin: 5,
    targetProfitMax: 15,
    sellDelayMin: 30,
    sellDelayMax: 180,
    tradeFrequencyMin: 5,
    tradeFrequencyMax: 30,
    maxHoldings: 0.02
  },
  MARKET_MAKER: {
    entryDelayMin: 30,
    entryDelayMax: 120,
    buyAmountMin: 0.01,      // 1% of supply
    buyAmountMax: 0.05,      // 5% of supply
    targetProfitMin: 20,
    targetProfitMax: 50,
    sellDelayMin: 300,
    sellDelayMax: 1200,
    tradeFrequencyMin: 60,
    tradeFrequencyMax: 300,
    maxHoldings: 0.10
  }
};

/**
 * Determine destiny for a new coin
 * Based on probabilities from design doc
 */
export function determineDestiny(): DestinyType {
  const rand = Math.random();
  
  // 5% reach 100% bonding curve (graduation)
  if (rand < 0.05) {
    return 'GRADUATED';
  }
  
  // 35% die within 5 minutes
  if (rand < 0.40) { // 0.05 + 0.35
    return 'DEATH_5MIN';
  }
  
  // 20% additional die within 10 minutes (total 55% dead by 10min)
  if (rand < 0.60) { // 0.40 + 0.20
    return 'DEATH_10MIN';
  }
  
  // 35% experience rug pull (overlaps with other destinies)
  if (rand < 0.75) {
    return 'RUG_PULL';
  }
  
  // 5% normal survival
  return 'SURVIVAL';
}

/**
 * Generate random number between min and max
 */
function random(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Create AI traders for a coin based on destiny
 */
export function createAITraders(
  coinId: number,
  destinyType: DestinyType,
  totalSupply: number
): AITrader[] {
  const traders: AITrader[] = [];
  
  // 80% of coins get sniper attack
  if (Math.random() < 0.80) {
    const behavior = TRADER_BEHAVIORS.SNIPER;
    const numSnipers = Math.floor(random(1, 3)); // 1-2 snipers
    
    for (let i = 0; i < numSnipers; i++) {
      traders.push({
        coin_id: coinId,
        trader_type: 'SNIPER',
        holdings: 0,
        total_bought: 0,
        total_sold: 0,
        target_profit_percent: random(behavior.targetProfitMin, behavior.targetProfitMax),
        is_active: true
      });
    }
  }
  
  // 20% get whale buy
  if (Math.random() < 0.20) {
    const behavior = TRADER_BEHAVIORS.WHALE;
    traders.push({
      coin_id: coinId,
      trader_type: 'WHALE',
      holdings: 0,
      total_bought: 0,
      total_sold: 0,
      target_profit_percent: random(behavior.targetProfitMin, behavior.targetProfitMax),
      is_active: true
    });
  }
  
  // Always add retail traders (2-5)
  const numRetail = Math.floor(random(2, 6));
  for (let i = 0; i < numRetail; i++) {
    const behavior = TRADER_BEHAVIORS.RETAIL;
    traders.push({
      coin_id: coinId,
      trader_type: 'RETAIL',
      holdings: 0,
      total_bought: 0,
      total_sold: 0,
      target_profit_percent: random(behavior.targetProfitMin, behavior.targetProfitMax),
      is_active: true
    });
  }
  
  // Always add bots (3-8)
  const numBots = Math.floor(random(3, 9));
  for (let i = 0; i < numBots; i++) {
    const behavior = TRADER_BEHAVIORS.BOT;
    traders.push({
      coin_id: coinId,
      trader_type: 'BOT',
      holdings: 0,
      total_bought: 0,
      total_sold: 0,
      target_profit_percent: random(behavior.targetProfitMin, behavior.targetProfitMax),
      is_active: true
    });
  }
  
  // Add market maker if survival or graduated destiny
  if (destinyType === 'SURVIVAL' || destinyType === 'GRADUATED') {
    const behavior = TRADER_BEHAVIORS.MARKET_MAKER;
    traders.push({
      coin_id: coinId,
      trader_type: 'MARKET_MAKER',
      holdings: 0,
      total_bought: 0,
      total_sold: 0,
      target_profit_percent: random(behavior.targetProfitMin, behavior.targetProfitMax),
      is_active: true
    });
  }
  
  return traders;
}

/**
 * Initialize AI traders for a new coin
 */
export async function initializeAITraders(
  db: any,
  coinId: number,
  totalSupply: number,
  destinyType: DestinyType
): Promise<void> {
  const traders = createAITraders(coinId, destinyType, totalSupply);
  
  for (const trader of traders) {
    await db.prepare(
      `INSERT INTO ai_traders 
       (coin_id, trader_type, holdings, total_bought, total_sold, target_profit_percent, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      trader.coin_id,
      trader.trader_type,
      trader.holdings,
      trader.total_bought,
      trader.total_sold,
      trader.target_profit_percent,
      trader.is_active ? 1 : 0
    ).run();
  }
  
  console.log(`✅ Initialized ${traders.length} AI traders for coin ${coinId}`);
}

/**
 * Execute AI buy trade
 */
export async function executeAIBuy(
  db: any,
  trader: AITrader,
  coin: any
): Promise<boolean> {
  try {
    const behavior = TRADER_BEHAVIORS[trader.trader_type];
    
    // Calculate buy amount
    const buyPercentage = random(behavior.buyAmountMin, behavior.buyAmountMax);
    const buyAmount = Math.floor(coin.total_supply * buyPercentage);
    
    // Check if enough supply available
    const availableSupply = coin.total_supply - coin.circulating_supply;
    if (buyAmount > availableSupply) {
      console.log(`⚠️ Not enough supply for ${trader.trader_type} buy`);
      return false;
    }
    
    // Calculate trade using bonding curve
    const tradeResult = calculateBuyTrade(
      coin.initial_mlt_investment || 2000,
      coin.total_supply,
      coin.circulating_supply,
      buyAmount,
      coin.bonding_curve_k || 4.0
    );
    
    // Update trader holdings and MLT balance
    await db.prepare(
      `UPDATE ai_traders 
       SET holdings = holdings + ?,
           total_bought = total_bought + ?,
           mlt_balance = mlt_balance - ?,
           total_trades = total_trades + 1,
           last_trade_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(
      buyAmount,
      buyAmount,
      tradeResult.mltAmount,
      trader.id
    ).run();
    
    // Update coin stats
    await db.prepare(
      `UPDATE coins
       SET circulating_supply = ?,
           current_price = ?,
           market_cap = ?,
           bonding_curve_progress = ?,
           transaction_count = transaction_count + 1
       WHERE id = ?`
    ).bind(
      tradeResult.newCirculatingSupply,
      tradeResult.newPrice,
      tradeResult.newMarketCap,
      tradeResult.newProgress,
      coin.id
    ).run();
    
    // Record price history
    await db.prepare(
      `INSERT INTO price_history 
       (coin_id, price, volume, market_cap, circulating_supply, trader_type)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      coin.id,
      tradeResult.newPrice,
      buyAmount,
      tradeResult.newMarketCap,
      tradeResult.newCirculatingSupply,
      trader.trader_type
    ).run();
    
    console.log(
      `💰 ${trader.trader_type} bought ${buyAmount.toLocaleString()} tokens ` +
      `at ${tradeResult.averagePrice.toFixed(6)} MLT (Progress: ${(tradeResult.newProgress * 100).toFixed(2)}%)`
    );
    
    return true;
  } catch (error) {
    console.error(`❌ AI buy error for ${trader.trader_type}:`, error);
    return false;
  }
}

/**
 * Execute AI sell trade
 */
export async function executeAISell(
  db: any,
  trader: AITrader,
  coin: any
): Promise<boolean> {
  try {
    if (trader.holdings <= 0) {
      return false;
    }
    
    const behavior = TRADER_BEHAVIORS[trader.trader_type];
    
    // Decide how much to sell (partial or all)
    const sellPercentage = Math.random() < 0.5 ? random(0.3, 0.7) : 1.0; // 50% chance full dump
    const sellAmount = Math.floor(trader.holdings * sellPercentage);
    
    if (sellAmount <= 0) {
      return false;
    }
    
    // Calculate trade using bonding curve
    const tradeResult = calculateSellTrade(
      coin.initial_mlt_investment || 2000,
      coin.total_supply,
      coin.circulating_supply,
      sellAmount,
      coin.bonding_curve_k || 4.0
    );
    
    // Calculate average entry price from holdings and total_bought
    // If trader has made multiple buys, estimate average cost
    const avgEntryPrice = trader.total_bought > 0 
      ? (coin.current_price * 0.9) // Estimate: assume bought at 10% lower than current
      : coin.current_price;
    const profitPercent = ((tradeResult.averagePrice - avgEntryPrice) / avgEntryPrice) * 100;
    
    // Update trader holdings and MLT balance
    await db.prepare(
      `UPDATE ai_traders 
       SET holdings = holdings - ?,
           total_sold = total_sold + ?,
           mlt_balance = mlt_balance + ?,
           total_trades = total_trades + 1,
           last_trade_at = CURRENT_TIMESTAMP,
           is_active = ?
       WHERE id = ?`
    ).bind(
      sellAmount,
      sellAmount,
      tradeResult.mltAmount,
      trader.holdings - sellAmount > 0 ? 1 : 0,
      trader.id
    ).run();
    
    // Update coin stats
    await db.prepare(
      `UPDATE coins
       SET circulating_supply = ?,
           current_price = ?,
           market_cap = ?,
           bonding_curve_progress = ?,
           transaction_count = transaction_count + 1
       WHERE id = ?`
    ).bind(
      tradeResult.newCirculatingSupply,
      tradeResult.newPrice,
      tradeResult.newMarketCap,
      tradeResult.newProgress,
      coin.id
    ).run();
    
    // Record price history
    await db.prepare(
      `INSERT INTO price_history 
       (coin_id, price, volume, market_cap, circulating_supply, trader_type)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      coin.id,
      tradeResult.newPrice,
      sellAmount,
      tradeResult.newMarketCap,
      tradeResult.newCirculatingSupply,
      trader.trader_type
    ).run();
    
    console.log(
      `📉 ${trader.trader_type} sold ${sellAmount.toLocaleString()} tokens ` +
      `at ${tradeResult.averagePrice.toFixed(6)} MLT (Profit: ${profitPercent.toFixed(2)}%, Progress: ${(tradeResult.newProgress * 100).toFixed(2)}%)`
    );
    
    return true;
  } catch (error) {
    console.error(`❌ AI sell error for ${trader.trader_type}:`, error);
    return false;
  }
}

/**
 * Decide if trader should buy or sell
 */
export function shouldTraderAct(
  trader: AITrader,
  coin: any,
  coinAgeSeconds: number
): 'buy' | 'sell' | 'wait' {
  const behavior = TRADER_BEHAVIORS[trader.trader_type];
  
  // Check if trader hasn't entered yet
  if (trader.holdings === 0) {
    // Check if entry delay has passed
    if (coinAgeSeconds >= random(behavior.entryDelayMin, behavior.entryDelayMax)) {
      return 'buy';
    }
    return 'wait';
  }
  
  // Trader has holdings - check if should sell
  const currentPrice = coin.current_price;
  // Estimate entry price (10% lower than current price as rough average)
  const estimatedEntryPrice = currentPrice * 0.9;
  const profitPercent = ((currentPrice - estimatedEntryPrice) / estimatedEntryPrice) * 100;
  
  // Check if target profit reached
  if (profitPercent >= trader.target_profit_percent) {
    return 'sell';
  }
  
  // Check if holding too long (forced sell)
  const maxHoldingTime = behavior.sellDelayMax;
  if (trader.last_trade_at) {
    const lastTradeTime = new Date(trader.last_trade_at).getTime();
    const now = Date.now();
    const holdingTime = (now - lastTradeTime) / 1000; // seconds
    
    if (holdingTime >= maxHoldingTime) {
      return 'sell';
    }
  }
  
  // Market maker behavior: buy on dips
  if (trader.trader_type === 'MARKET_MAKER') {
    const progress = coin.bonding_curve_progress || 0;
    // Buy if price dropped and not holding max
    const holdingsPercent = trader.holdings / coin.total_supply;
    if (progress < 0.5 && holdingsPercent < behavior.maxHoldings) {
      return Math.random() < 0.3 ? 'buy' : 'wait';
    }
  }
  
  return 'wait';
}
