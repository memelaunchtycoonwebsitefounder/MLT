/**
 * Auto Event & Trade Generator
 * 自动事件和交易生成器
 * 
 * 这个服务会：
 * 1. 定期为活跃模拟生成新的AI交易
 * 2. 随机生成市场事件
 * 3. 触发用户决策点
 */

import type { D1Database } from '@cloudflare/workers-types';
import { AITradingSimulator } from './ai-trading-simulator';
import { DecisionPointGenerator } from './decision-generator';

export class AutoGenerator {
  private simulator: AITradingSimulator;
  private decisionGenerator: DecisionPointGenerator;

  constructor(private db: D1Database) {
    this.simulator = new AITradingSimulator(db);
    this.decisionGenerator = new DecisionPointGenerator(db);
  }

  /**
   * 主循环 - 每次调用处理一批模拟
   */
  async runCycle(): Promise<{ processed: number; trades: number; events: number; decisions: number }> {
    console.log('[AutoGenerator] Starting cycle...');
    
    // 获取所有活跃的模拟 (最近24小时创建的)
    const activeSimulations = await this.db.prepare(`
      SELECT * FROM coin_simulations 
      WHERE created_at >= datetime('now', '-24 hours')
      ORDER BY coin_id
    `).all();

    let tradesGenerated = 0;
    let eventsGenerated = 0;
    let decisionsGenerated = 0;

    for (const sim of activeSimulations.results || []) {
      const simulation = sim as any;
      
      try {
        // 1. 生成新交易 (30% 概率每个币)
        if (Math.random() < 0.3) {
          const trade = await this.simulator.getNextTrade(simulation.coin_id);
          if (trade) {
            tradesGenerated++;
            console.log(`[AutoGenerator] Generated trade for coin ${simulation.coin_id}`);
          }
        }

        // 2. 生成市场事件 (15% 概率)
        if (Math.random() < 0.15) {
          const event = await this.generateMarketEvent(simulation.coin_id, simulation.fate_outcome);
          if (event) {
            eventsGenerated++;
            console.log(`[AutoGenerator] Generated event for coin ${simulation.coin_id}`);
          }
        }

        // 3. 尝试触发用户决策 (检查条件后决定)
        const shouldTrigger = await this.decisionGenerator.shouldTriggerDecision(simulation.coin_id);
        if (shouldTrigger) {
          const decision = await this.decisionGenerator.generateDecision(simulation.coin_id);
          if (decision) {
            decisionsGenerated++;
            console.log(`[AutoGenerator] Generated decision for coin ${simulation.coin_id}`);
          }
        }

        // 4. 更新模拟进度 (模拟时间推进)
        await this.advanceSimulationTime(simulation.coin_id);

      } catch (error) {
        console.error(`[AutoGenerator] Error processing coin ${simulation.coin_id}:`, error);
      }
    }

    console.log(`[AutoGenerator] Cycle complete: ${activeSimulations.results?.length || 0} simulations, ${tradesGenerated} trades, ${eventsGenerated} events, ${decisionsGenerated} decisions`);

    return {
      processed: activeSimulations.results?.length || 0,
      trades: tradesGenerated,
      events: eventsGenerated,
      decisions: decisionsGenerated,
    };
  }

  /**
   * 生成市场事件
   */
  private async generateMarketEvent(coinId: number, fateOutcome: string): Promise<any> {
    const eventTypes = [
      { type: 'whale_buy', name: 'Whale Accumulation', desc: '🐋 Whale is buying! Price could pump soon', impact: 0.08 },
      { type: 'whale_sell', name: 'Whale Dump', desc: '🐋 Whale sold position! Price dropping', impact: -0.12 },
      { type: 'viral_tweet', name: 'Viral Tweet', desc: '🔥 Your coin is trending on Twitter!', impact: 0.15 },
      { type: 'influencer_pump', name: 'Influencer Mention', desc: '📢 Crypto influencer mentioned your coin', impact: 0.10 },
      { type: 'fomo_wave', name: 'FOMO Wave', desc: '🌊 Retail investors FOMOing in!', impact: 0.12 },
      { type: 'panic_sell', name: 'Panic Selling', desc: '😱 Holders are panic selling', impact: -0.10 },
      { type: 'listing_announcement', name: 'Exchange Listing Rumor', desc: '📰 Rumors of major exchange listing', impact: 0.20 },
      { type: 'market_crash', name: 'Market Correction', desc: '📉 Crypto market-wide correction', impact: -0.08 },
    ];

    // 根据命运调整事件概率
    let filteredEvents = eventTypes;
    if (fateOutcome === 'rug') {
      // rug 命运更多负面事件
      filteredEvents = eventTypes.filter(e => e.impact < 0);
    } else if (fateOutcome === 'moon') {
      // moon 命运更多正面事件
      filteredEvents = eventTypes.filter(e => e.impact > 0);
    }

    const event = filteredEvents[Math.floor(Math.random() * filteredEvents.length)];

    // 插入事件
    await this.db.prepare(`
      INSERT INTO simulation_events (coin_id, event_type, event_name, description, impact)
      VALUES (?, ?, ?, ?, ?)
    `).bind(coinId, event.type, event.name, event.desc, event.impact).run();

    // 更新价格
    const sim = await this.db.prepare('SELECT * FROM coin_simulations WHERE coin_id = ?').bind(coinId).first() as any;
    if (sim) {
      const currentPrice = sim.current_price || sim.initial_price;
      const newPrice = currentPrice * (1 + event.impact);
      
      await this.db.prepare('UPDATE coin_simulations SET current_price = ? WHERE coin_id = ?')
        .bind(newPrice, coinId).run();
      
      await this.db.prepare(`
        INSERT INTO price_history (coin_id, price, volume, market_cap)
        VALUES (?, ?, ?, ?)
      `).bind(coinId, newPrice, Math.random() * 1000, newPrice * 10000).run();
    }

    return event;
  }

  /**
   * 推进模拟时间
   */
  private async advanceSimulationTime(coinId: number): Promise<void> {
    // 每次循环推进 1 模拟天 (实际上这是快速模式，1秒 = 1分钟)
    await this.db.prepare(`
      UPDATE coin_simulations 
      SET current_day = current_day + 1 
      WHERE coin_id = ? AND current_day < total_days
    `).bind(coinId).run();
  }
}
