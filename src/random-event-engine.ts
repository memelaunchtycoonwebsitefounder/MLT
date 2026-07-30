/**
 * Random Event Engine
 * 隨機事件系統 - 模擬真實市場中的隨機事件
 */

import type { RandomEvent, FateOutcome, RandomEventType } from './fate-types';

/**
 * 隨機事件引擎
 */
export class RandomEventEngine {
  // 事件庫 - 預定義的所有可能事件
  private readonly EVENT_LIBRARY: Omit<RandomEvent, 'id' | 'triggered_at'>[] = [
    // 正面事件 (提升成功率)
    {
      event_type: 'whale_buy',
      event_name: '巨鯨買入',
      description: '一個大戶突然買入大量代幣,價格暴漲',
      impact_on_outcome: 0.3,
      probability: 0.05,
    },
    {
      event_type: 'exchange_listing',
      event_name: '主流交易所上架',
      description: 'Binance 或 Coinbase 宣布上架該代幣',
      impact_on_outcome: 0.5,
      probability: 0.02,
    },
    {
      event_type: 'viral_tweet',
      event_name: '推文爆紅',
      description: '社群發布的一條推文意外爆紅,引發病毒式傳播',
      impact_on_outcome: 0.25,
      probability: 0.08,
    },
    {
      event_type: 'celebrity_mention',
      event_name: '名人提及',
      description: '知名 KOL 或名人在社交媒體提及該代幣',
      impact_on_outcome: 0.4,
      probability: 0.03,
    },
    {
      event_type: 'tech_breakthrough',
      event_name: '技術突破',
      description: '團隊宣布重大技術進展或產品發布',
      impact_on_outcome: 0.2,
      probability: 0.1,
    },

    // 負面事件 (降低成功率)
    {
      event_type: 'whale_sell',
      event_name: '巨鯨拋售',
      description: '大戶突然拋售大量代幣,引發恐慌性拋售',
      impact_on_outcome: -0.4,
      probability: 0.08,
    },
    {
      event_type: 'hack',
      event_name: '黑客攻擊',
      description: '智能合約漏洞被利用或資金被盜',
      impact_on_outcome: -0.7,
      probability: 0.02,
    },
    {
      event_type: 'regulation',
      event_name: '監管政策',
      description: '政府出台不利於加密貨幣的新監管政策',
      impact_on_outcome: -0.3,
      probability: 0.05,
    },
    {
      event_type: 'competitor_launch',
      event_name: '競爭對手推出',
      description: '強大的競爭對手推出類似但更優質的項目',
      impact_on_outcome: -0.25,
      probability: 0.12,
    },
    {
      event_type: 'scandal',
      event_name: '團隊醜聞',
      description: '創始人或團隊成員爆出醜聞,信譽受損',
      impact_on_outcome: -0.5,
      probability: 0.04,
    },
  ];

  /**
   * 為特定幣種生成隨機事件
   */
  generateEvents(
    coinCategory: string,
    currentDay: number,
    totalDays: number,
    qualityScore: number
  ): RandomEvent[] {
    const events: RandomEvent[] = [];

    // 根據時間階段調整事件概率
    const timePhase = this.getTimePhase(currentDay, totalDays);

    for (const eventTemplate of this.EVENT_LIBRARY) {
      // 計算調整後的概率
      const adjustedProb = this.adjustProbability(
        eventTemplate.probability,
        coinCategory,
        timePhase,
        qualityScore,
        eventTemplate.event_type
      );

      // 根據概率決定是否觸發
      if (Math.random() < adjustedProb) {
        events.push({
          ...eventTemplate,
          triggered_at: new Date().toISOString(),
        });
      }
    }

    return events;
  }

  /**
   * 計算事件對命運結果的總影響
   */
  calculateEventImpact(events: RandomEvent[]): {
    outcome_shift: number; // -1 到 1, 對結果的總影響
    moon_boost: number; // moon 概率提升
    rug_risk: number; // rug 風險提升
  } {
    let totalImpact = 0;
    let moonBoost = 0;
    let rugRisk = 0;

    for (const event of events) {
      totalImpact += event.impact_on_outcome;

      // 特定事件類型的特殊效果
      if (event.event_type === 'exchange_listing' || event.event_type === 'celebrity_mention') {
        moonBoost += 0.15; // 大幅提升 moon 概率
      }

      if (event.event_type === 'hack' || event.event_type === 'scandal') {
        rugRisk += 0.3; // 大幅提升 rug 風險
      }
    }

    // 限制總影響在合理範圍內
    totalImpact = Math.max(-0.8, Math.min(0.8, totalImpact));
    moonBoost = Math.min(0.3, moonBoost);
    rugRisk = Math.min(0.4, rugRisk);

    return {
      outcome_shift: totalImpact,
      moon_boost: moonBoost,
      rug_risk: rugRisk,
    };
  }

  /**
   * 根據事件調整命運概率
   */
  applyEventsToOutcome(
    baseProbs: Record<FateOutcome, number>,
    events: RandomEvent[]
  ): Record<FateOutcome, number> {
    if (events.length === 0) {
      return baseProbs;
    }

    const impact = this.calculateEventImpact(events);

    // 應用影響
    const adjustedProbs = {
      moon: baseProbs.moon * (1 + impact.outcome_shift * 0.8 + impact.moon_boost),
      stable: baseProbs.stable * (1 + impact.outcome_shift * 0.4),
      rug: baseProbs.rug * (1 - impact.outcome_shift * 0.5 + impact.rug_risk),
      slow_death: baseProbs.slow_death * (1 - impact.outcome_shift * 0.3),
    };

    // 確保所有概率為正
    for (const key in adjustedProbs) {
      adjustedProbs[key as FateOutcome] = Math.max(0.01, adjustedProbs[key as FateOutcome]);
    }

    // 歸一化
    const total = Object.values(adjustedProbs).reduce((sum, val) => sum + val, 0);
    for (const key in adjustedProbs) {
      adjustedProbs[key as FateOutcome] /= total;
    }

    return adjustedProbs;
  }

  /**
   * 獲取當前時間階段
   */
  private getTimePhase(currentDay: number, totalDays: number): 'early' | 'mid' | 'late' {
    const progress = currentDay / totalDays;
    if (progress < 0.3) return 'early';
    if (progress < 0.7) return 'mid';
    return 'late';
  }

  /**
   * 根據多種因素調整事件概率
   */
  private adjustProbability(
    baseProbability: number,
    coinCategory: string,
    timePhase: 'early' | 'mid' | 'late',
    qualityScore: number,
    eventType: RandomEventType
  ): number {
    let adjusted = baseProbability;

    // 類別調整
    if (coinCategory === 'celebrity') {
      // 名人幣更容易出現病毒傳播和名人提及
      if (eventType === 'viral_tweet' || eventType === 'celebrity_mention') {
        adjusted *= 2.0;
      }
    } else if (coinCategory === 'tech') {
      // 技術幣更容易出現技術突破和黑客攻擊
      if (eventType === 'tech_breakthrough') adjusted *= 1.5;
      if (eventType === 'hack') adjusted *= 1.8;
    } else if (coinCategory === 'meme') {
      // Meme 幣更容易病毒傳播但也更容易被競爭對手超越
      if (eventType === 'viral_tweet') adjusted *= 2.5;
      if (eventType === 'competitor_launch') adjusted *= 1.5;
    }

    // 時間階段調整
    if (timePhase === 'early') {
      // 早期: 更多正面事件機會
      if (eventType === 'exchange_listing' || eventType === 'whale_buy') {
        adjusted *= 1.3;
      }
    } else if (timePhase === 'late') {
      // 後期: 更多風險事件
      if (eventType === 'whale_sell' || eventType === 'scandal') {
        adjusted *= 1.5;
      }
    }

    // 質量分數調整
    if (qualityScore > 0.7) {
      // 高質量項目: 更容易獲得正面事件
      if (
        eventType === 'exchange_listing' ||
        eventType === 'celebrity_mention' ||
        eventType === 'tech_breakthrough'
      ) {
        adjusted *= 1.5;
      }
      // 更不容易出現負面事件
      if (eventType === 'hack' || eventType === 'scandal') {
        adjusted *= 0.5;
      }
    } else if (qualityScore < 0.3) {
      // 低質量項目: 更容易出現負面事件
      if (eventType === 'hack' || eventType === 'scandal' || eventType === 'whale_sell') {
        adjusted *= 2.0;
      }
      // 不太可能獲得正面事件
      if (eventType === 'exchange_listing' || eventType === 'celebrity_mention') {
        adjusted *= 0.3;
      }
    }

    return adjusted;
  }

  /**
   * 根據用戶決策生成觸發事件
   */
  generateDecisionTriggeredEvents(
    decisionType: string,
    investmentAmount: number
  ): RandomEvent[] {
    const events: RandomEvent[] = [];

    switch (decisionType) {
      case 'increase_marketing':
        if (investmentAmount > 10000) {
          // 大額營銷投入可能觸發病毒傳播
          if (Math.random() < 0.3) {
            events.push({
              event_type: 'viral_tweet',
              event_name: '營銷活動爆紅',
              description: '大額營銷投入帶來病毒式傳播效果',
              impact_on_outcome: 0.25,
              probability: 1.0, // 已觸發
              triggered_at: new Date().toISOString(),
            });
          }
        }
        break;

      case 'celebrity_endorsement':
        // 尋求名人背書可能成功也可能失敗
        if (Math.random() < 0.4) {
          events.push({
            event_type: 'celebrity_mention',
            event_name: '成功獲得名人背書',
            description: '知名 KOL 公開支持該項目',
            impact_on_outcome: 0.4,
            probability: 1.0,
            triggered_at: new Date().toISOString(),
          });
        } else if (Math.random() < 0.2) {
          events.push({
            event_type: 'scandal',
            event_name: '名人背書失敗',
            description: '聯繫的名人拒絕並公開批評項目',
            impact_on_outcome: -0.3,
            probability: 1.0,
            triggered_at: new Date().toISOString(),
          });
        }
        break;

      case 'add_features':
        // 添加新功能可能帶來技術突破或漏洞
        if (Math.random() < 0.5) {
          events.push({
            event_type: 'tech_breakthrough',
            event_name: '新功能發布成功',
            description: '新功能受到社群熱烈歡迎',
            impact_on_outcome: 0.2,
            probability: 1.0,
            triggered_at: new Date().toISOString(),
          });
        } else if (Math.random() < 0.15) {
          events.push({
            event_type: 'hack',
            event_name: '新功能出現漏洞',
            description: '倉促推出的新功能存在安全漏洞',
            impact_on_outcome: -0.5,
            probability: 1.0,
            triggered_at: new Date().toISOString(),
          });
        }
        break;
    }

    return events;
  }

  /**
   * 獲取所有事件的描述性文本
   */
  getEventDescriptions(events: RandomEvent[]): string[] {
    return events.map(
      (event) =>
        `🎲 ${event.event_name}: ${event.description} (影響: ${event.impact_on_outcome > 0 ? '+' : ''}${(event.impact_on_outcome * 100).toFixed(0)}%)`
    );
  }
}
