/**
 * AI Trading Simulation Engine
 * 模擬 AI 機器人交易系統 - 基於預設命運軌跡
 */

import type { FateOutcome } from '../fate-types';

export interface TradingBot {
  id: string;
  name: string;
  type: 'whale' | 'trader' | 'holder' | 'flipper';
  balance: number;
  risk_tolerance: number; // 0-1
}

export interface SimulatedTrade {
  id: number;
  coin_id: number;
  bot_id: string;
  bot_name: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: string;
}

export interface PricePoint {
  timestamp: string;
  price: number;
  volume: number;
  market_cap: number;
}

export interface SimulationState {
  coin_id: number;
  current_price: number;
  initial_price: number;
  current_day: number;
  total_days: number;
  fate_outcome: FateOutcome;
  price_trajectory: PricePoint[];
  active_bots: TradingBot[];
  recent_trades: SimulatedTrade[];
  triggered_events: any[];
}

export class AITradingSimulator {
  private db: D1Database;
  private simulations: Map<number, SimulationState> = new Map();
  
  // 21,005 個預設軌跡的命運分布
  private readonly FATE_DISTRIBUTION = {
    moon: 0.185,        // 18.5% 成功登月
    stable: 0.277,      // 27.7% 穩定發展
    rug: 0.225,         // 22.5% 跑路
    slow_death: 0.313,  // 31.3% 緩慢死亡
  };

  // AI 機器人模板
  private readonly BOT_TEMPLATES = [
    { name: 'Whale_001', type: 'whale', balance: 100000, risk: 0.3 },
    { name: 'Whale_002', type: 'whale', balance: 80000, risk: 0.4 },
    { name: 'Trader_Alpha', type: 'trader', balance: 10000, risk: 0.7 },
    { name: 'Trader_Beta', type: 'trader', balance: 8000, risk: 0.6 },
    { name: 'Holder_001', type: 'holder', balance: 5000, risk: 0.2 },
    { name: 'Holder_002', type: 'holder', balance: 4000, risk: 0.1 },
    { name: 'Flipper_Fast', type: 'flipper', balance: 3000, risk: 0.9 },
    { name: 'Flipper_Quick', type: 'flipper', balance: 2500, risk: 0.85 },
  ];

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * 啟動新幣的交易模擬
   */
  async startSimulation(coinId: number, initialPrice: number): Promise<SimulationState> {
    // 1. 從 21,005 案例中隨機選擇一個命運軌跡
    const fateOutcome = this.assignRandomFate();
    const totalDays = this.calculateTotalDays(fateOutcome);
    
    // 2. 創建初始狀態
    const state: SimulationState = {
      coin_id: coinId,
      current_price: initialPrice,
      initial_price: initialPrice,
      current_day: 0,
      total_days: totalDays,
      fate_outcome: fateOutcome,
      price_trajectory: [],
      active_bots: this.createBots(),
      recent_trades: [],
      triggered_events: [],
    };

    // 3. 生成完整價格軌跡（預先計算好）
    state.price_trajectory = this.generatePriceTrajectory(
      initialPrice,
      fateOutcome,
      totalDays
    );

    // 4. 保存到內存和數據庫
    this.simulations.set(coinId, state);
    await this.saveSimulationState(state);

    // 5. 生成初始交易（前 10 筆）
    await this.generateInitialTrades(state);

    return state;
  }

  /**
   * 隨機分配命運（基於真實分布）
   */
  private assignRandomFate(): FateOutcome {
    const rand = Math.random();
    let cumulative = 0;

    for (const [outcome, probability] of Object.entries(this.FATE_DISTRIBUTION)) {
      cumulative += probability;
      if (rand <= cumulative) {
        return outcome as FateOutcome;
      }
    }

    return 'slow_death'; // fallback
  }

  /**
   * 計算總天數（根據命運）
   */
  private calculateTotalDays(outcome: FateOutcome): number {
    const ranges = {
      moon: [20, 60],
      stable: [30, 90],
      rug: [3, 15],
      slow_death: [40, 120],
    };

    const [min, max] = ranges[outcome];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 生成價格軌跡（完整預設路徑）
   */
  private generatePriceTrajectory(
    initialPrice: number,
    outcome: FateOutcome,
    totalDays: number
  ): PricePoint[] {
    const trajectory: PricePoint[] = [];
    let currentPrice = initialPrice;
    
    // 根據命運類型定義價格變化模式
    for (let day = 0; day <= totalDays; day++) {
      const progress = day / totalDays;
      
      // 計算當前價格
      if (outcome === 'moon') {
        // 登月：快速上漲，峰值在 70-80% 進度
        const peak = 0.75;
        if (progress < peak) {
          currentPrice = initialPrice * (1 + progress * 50 * (1 + Math.random() * 0.5));
        } else {
          currentPrice = currentPrice * (0.95 + Math.random() * 0.1);
        }
      } else if (outcome === 'stable') {
        // 穩定：緩慢增長，小幅波動
        currentPrice = initialPrice * (1 + progress * 2 + (Math.random() - 0.5) * 0.3);
      } else if (outcome === 'rug') {
        // 跑路：先上漲誘騙，然後暴跌
        if (progress < 0.6) {
          currentPrice = initialPrice * (1 + progress * 10);
        } else {
          currentPrice = currentPrice * 0.1 * (1 - (progress - 0.6) * 2);
        }
      } else {
        // 緩慢死亡：持續下跌
        currentPrice = initialPrice * Math.pow(0.95, day) * (0.9 + Math.random() * 0.2);
      }

      // 確保價格不為負數
      currentPrice = Math.max(currentPrice, initialPrice * 0.0001);

      const volume = this.calculateVolume(currentPrice, initialPrice, progress);
      
      trajectory.push({
        timestamp: new Date(Date.now() + day * 24 * 3600 * 1000).toISOString(),
        price: currentPrice,
        volume: volume,
        market_cap: currentPrice * 1000000000, // 假設總供應量
      });
    }

    return trajectory;
  }

  /**
   * 計算交易量
   */
  private calculateVolume(currentPrice: number, initialPrice: number, progress: number): number {
    const baseVolume = 10000;
    const priceRatio = currentPrice / initialPrice;
    const volumeMultiplier = priceRatio > 2 ? 5 : priceRatio > 1 ? 2 : 1;
    
    return baseVolume * volumeMultiplier * (1 + Math.random() * 0.5);
  }

  /**
   * 創建 AI 機器人
   */
  private createBots(): TradingBot[] {
    return this.BOT_TEMPLATES.map((template, index) => ({
      id: `bot_${index}_${Date.now()}`,
      name: template.name,
      type: template.type as any,
      balance: template.balance,
      risk_tolerance: template.risk,
    }));
  }

  /**
   * 生成初始交易
   */
  private async generateInitialTrades(state: SimulationState): Promise<void> {
    const trades: SimulatedTrade[] = [];
    
    // 前 10 筆交易（前 10 分鐘）
    for (let i = 0; i < 10; i++) {
      const bot = state.active_bots[Math.floor(Math.random() * state.active_bots.length)];
      const pricePoint = state.price_trajectory[0];
      const isBuy = Math.random() > 0.3; // 70% 買入

      const trade: SimulatedTrade = {
        id: Date.now() + i,
        coin_id: state.coin_id,
        bot_id: bot.id,
        bot_name: bot.name,
        type: isBuy ? 'buy' : 'sell',
        amount: Math.floor(Math.random() * 1000) + 100,
        price: pricePoint.price * (0.98 + Math.random() * 0.04),
        timestamp: new Date(Date.now() - (10 - i) * 60000).toISOString(),
      };

      trades.push(trade);
    }

    // 保存交易到數據庫
    await this.saveTradesInBatch(trades);
    state.recent_trades = trades;
  }

  /**
   * 獲取下一個交易（用於實時模擬）
   */
  async getNextTrade(coinId: number): Promise<SimulatedTrade | null> {
    const state = this.simulations.get(coinId);
    if (!state) return null;

    // 檢查是否還有時間
    if (state.current_day >= state.total_days) {
      return null;
    }

    // 隨機選擇一個機器人
    const bot = state.active_bots[Math.floor(Math.random() * state.active_bots.length)];
    
    // 根據當前價格趨勢決定買賣
    const currentIndex = Math.floor(state.current_day);
    const currentPrice = state.price_trajectory[currentIndex]?.price || state.current_price;
    const previousPrice = state.price_trajectory[currentIndex - 1]?.price || state.initial_price;
    
    const isBuy = currentPrice > previousPrice ? Math.random() > 0.4 : Math.random() > 0.6;

    const trade: SimulatedTrade = {
      id: Date.now(),
      coin_id: coinId,
      bot_id: bot.id,
      bot_name: bot.name,
      type: isBuy ? 'buy' : 'sell',
      amount: Math.floor(Math.random() * 1000) + 50,
      price: currentPrice * (0.98 + Math.random() * 0.04),
      timestamp: new Date().toISOString(),
    };

    // 保存交易
    await this.saveTrade(trade);
    state.recent_trades.unshift(trade);
    if (state.recent_trades.length > 50) {
      state.recent_trades = state.recent_trades.slice(0, 50);
    }

    return trade;
  }

  /**
   * 獲取當前價格
   */
  getCurrentPrice(coinId: number): number {
    const state = this.simulations.get(coinId);
    if (!state) return 0;

    const dayIndex = Math.floor(state.current_day);
    return state.price_trajectory[dayIndex]?.price || state.current_price;
  }

  /**
   * 前進到下一天
   */
  advanceDay(coinId: number): void {
    const state = this.simulations.get(coinId);
    if (state) {
      state.current_day += 1;
      if (state.current_day < state.price_trajectory.length) {
        state.current_price = state.price_trajectory[state.current_day].price;
      }
    }
  }

  /**
   * 獲取模擬狀態
   */
  getSimulationState(coinId: number): SimulationState | null {
    return this.simulations.get(coinId) || null;
  }

  // ===== 數據庫操作 =====

  private async saveSimulationState(state: SimulationState): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO coin_simulations (coin_id, fate_outcome, total_days, initial_price, created_at)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(state.coin_id, state.fate_outcome, state.total_days, state.initial_price, new Date().toISOString())
      .run();
  }

  private async saveTrade(trade: SimulatedTrade): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO simulated_trades (coin_id, bot_id, bot_name, type, amount, price, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        trade.coin_id,
        trade.bot_id,
        trade.bot_name,
        trade.type,
        trade.amount,
        trade.price,
        trade.timestamp
      )
      .run();
  }

  private async saveTradesInBatch(trades: SimulatedTrade[]): Promise<void> {
    for (const trade of trades) {
      await this.saveTrade(trade);
    }
  }
}
